use crate::error::{CommandError, CommandResult};

// SQLite may wait for another connection. Never keep the native input loop or
// an async executor worker occupied while an authoritative read is waiting.
pub(crate) async fn read<T, F>(error_code: &'static str, operation: F) -> CommandResult<T>
where
    T: Send + 'static,
    F: FnOnce() -> CommandResult<T> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(operation)
        .await
        .map_err(|error| {
            CommandError::new(
                error_code,
                format!("background read worker failed: {error}"),
            )
        })?
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::future::Future;
    use std::sync::{mpsc, Arc};
    use std::task::{Context, Poll, Wake, Waker};
    use std::time::Duration;

    struct NoopWake;

    impl Wake for NoopWake {
        fn wake(self: Arc<Self>) {}
    }

    #[test]
    fn locked_sqlite_read_yields_to_caller_and_preserves_result() {
        let path =
            std::env::temp_dir().join(format!("narro-read-worker-{}.db", uuid::Uuid::new_v4()));
        let connection = rusqlite::Connection::open(&path).expect("open writer database");
        connection
            .execute_batch(
                "PRAGMA journal_mode=DELETE;
                 CREATE TABLE ledger(id TEXT PRIMARY KEY, seconds INTEGER NOT NULL);
                 INSERT INTO ledger VALUES('stable-task',846);
                 BEGIN EXCLUSIVE;",
            )
            .expect("hold exclusive SQLite lock");

        let (started_tx, started_rx) = mpsc::channel();
        let (finished_tx, finished_rx) = mpsc::channel();
        let worker_path = path.clone();
        let caller_thread = std::thread::current().id();
        let mut pending = Box::pin(read("LIST_BOARD_FAILED", move || {
            let sqlite_error =
                |error: rusqlite::Error| CommandError::new("LIST_BOARD_FAILED", error.to_string());
            let reader = rusqlite::Connection::open(worker_path).map_err(sqlite_error)?;
            reader
                .busy_timeout(Duration::from_secs(3))
                .map_err(sqlite_error)?;
            started_tx
                .send(std::thread::current().id())
                .expect("publish blocking worker thread");
            let result = reader
                .query_row("SELECT id,seconds FROM ledger", [], |row| {
                    Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
                })
                .map_err(sqlite_error);
            finished_tx.send(()).expect("publish read completion");
            result
        }));

        let waker = Waker::from(Arc::new(NoopWake));
        let mut context = Context::from_waker(&waker);
        assert!(matches!(pending.as_mut().poll(&mut context), Poll::Pending));
        let worker_thread = started_rx
            .recv_timeout(Duration::from_secs(2))
            .expect("blocking worker should start");
        assert_ne!(worker_thread, caller_thread);
        assert!(matches!(pending.as_mut().poll(&mut context), Poll::Pending));
        assert_eq!(finished_rx.try_recv(), Err(mpsc::TryRecvError::Empty));

        // The caller can continue processing actions before the read is ready.
        connection
            .execute_batch("ROLLBACK")
            .expect("release SQLite lock");
        let result = tauri::async_runtime::block_on(pending).expect("read should complete");
        assert_eq!(result, ("stable-task".to_owned(), 846));
        let retained: i64 = connection
            .query_row("SELECT seconds FROM ledger", [], |row| row.get(0))
            .expect("read retained authoritative value");
        assert_eq!(retained, 846);

        drop(connection);
        std::fs::remove_file(path).expect("remove temporary database");
    }

    #[test]
    fn worker_preserves_authoritative_command_errors() {
        let expected = CommandError::invalid_argument("listId", "must be a valid UUID");
        let returned = expected.clone();
        let result: CommandResult<u64> =
            tauri::async_runtime::block_on(read("HOME_SNAPSHOT_FAILED", move || Err(returned)));
        assert_eq!(result, Err(expected));
    }
}
