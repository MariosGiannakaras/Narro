// Real two-connection regressions for CI944's task read-to-write lock upgrade.
// Keep this scoped to the task mutation boundary; all databases are isolated.
use super::lists::create_list;
use super::task_identity::{duplicate_task, reorder_active_bucket};
use super::task_metadata::set_task_schedule;
use super::task_title_edit::update_task_title_if_expected;
use super::tasks::*;
use super::{configure_connection, run_migrations};
use crate::domain::ids::{ListId, TaskId};
use crate::domain::lists::NewListInput;
use crate::domain::model::PlanningLane;
use crate::domain::tasks::{NewTaskInput, TaskDestination, TaskSchedule, UpdateTaskInput};
use rusqlite::{Connection, ErrorCode, TransactionBehavior};
use std::sync::mpsc;
use std::time::Duration;

const NOW: &str = "2026-10-04T15:00:00Z";

#[derive(Clone, Copy, Debug)]
enum Mutation {
    Create,
    CreateAtTop,
    Update,
    Title,
    Move,
    Reorder,
    Duplicate,
    Complete,
    Reopen,
    Archive,
    Restore,
    DeleteArchived,
    DeleteConfirmed,
    Schedule,
}

fn mutate(
    mutation: Mutation,
    conn: &mut Connection,
    list: ListId,
    first: TaskId,
    second: TaskId,
) -> Result<(), String> {
    macro_rules! done {
        ($result:expr) => {
            $result.map(|_| ()).map_err(|error| error.to_string())
        };
    }
    let new_task = || NewTaskInput {
        list_id: list,
        title: "Created once".into(),
        manual_lane: PlanningLane::Today,
        est_seconds: None,
    };
    match mutation {
        Mutation::Create => done!(create_task(conn, new_task(), NOW)),
        Mutation::CreateAtTop => done!(create_task_at_top(conn, new_task(), NOW)),
        Mutation::Update => done!(update_task(
            conn,
            first,
            UpdateTaskInput {
                title: "Updated".into(),
                est_seconds: Some(900)
            },
            NOW
        )),
        Mutation::Title => done!(update_task_title_if_expected(
            conn,
            first,
            list,
            "Seed",
            "Edited".into(),
            NOW
        )),
        Mutation::Move => done!(move_task(
            conn,
            first,
            TaskDestination {
                list_id: list,
                manual_lane: PlanningLane::ThisWeek
            },
            NOW
        )),
        Mutation::Reorder => done!(reorder_active_bucket(
            conn,
            list,
            PlanningLane::Today,
            &[second, first],
            NOW
        )),
        Mutation::Duplicate => done!(duplicate_task(conn, first, NOW)),
        Mutation::Complete => done!(complete_task(conn, first, NOW)),
        Mutation::Reopen => done!(reopen_task(conn, first, NOW)),
        Mutation::Archive => done!(archive_task(conn, first, NOW)),
        Mutation::Restore => done!(restore_task(conn, first, NOW)),
        Mutation::DeleteArchived => done!(permanently_delete_task(conn, first)),
        Mutation::DeleteConfirmed => {
            done!(permanently_delete_task_confirmed(conn, first, list, NOW))
        }
        Mutation::Schedule => done!(set_task_schedule(
            conn,
            first,
            TaskSchedule::DateOnly {
                local_date: "2026-10-05".into()
            },
            NOW
        )),
    }
}

#[test]
fn task_mutations_wait_for_competing_writer_and_preserve_latest_state_and_identity() {
    for mutation in [
        Mutation::Create,
        Mutation::CreateAtTop,
        Mutation::Update,
        Mutation::Title,
        Mutation::Move,
        Mutation::Reorder,
        Mutation::Duplicate,
        Mutation::Complete,
        Mutation::Reopen,
        Mutation::Archive,
        Mutation::Restore,
        Mutation::DeleteArchived,
        Mutation::DeleteConfirmed,
        Mutation::Schedule,
    ] {
        let path = std::env::temp_dir().join(format!(
            "narro-task-contention-{}.sqlite",
            uuid::Uuid::new_v4()
        ));
        let mut writer = Connection::open(&path).expect("open isolated writer");
        run_migrations(&mut writer).expect("migrate isolated database");
        let list = create_list(
            &mut writer,
            NewListInput {
                title: "Contention".into(),
                color: None,
                icon_asset: None,
            },
            NOW,
        )
        .unwrap()
        .id;
        let mut seed = |title: &str| {
            create_task(
                &mut writer,
                NewTaskInput {
                    list_id: list,
                    title: title.into(),
                    manual_lane: PlanningLane::Today,
                    est_seconds: Some(600),
                },
                NOW,
            )
            .unwrap()
            .id
        };
        let first = seed("Seed");
        let second = seed("Companion");
        if matches!(mutation, Mutation::Reopen) {
            complete_task(&mut writer, first, NOW).unwrap();
        }
        if matches!(mutation, Mutation::Restore | Mutation::DeleteArchived) {
            archive_task(&mut writer, first, NOW).unwrap();
        }

        let tx = writer
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .expect("hold competing writer");
        tx.execute(
            "UPDATE tasks SET est_seconds = 1800 WHERE id = ?1",
            [first.to_string()],
        )
        .unwrap();
        let (started_tx, started_rx) = mpsc::channel();
        let (finished_tx, finished_rx) = mpsc::channel();
        let worker_path = path.clone();
        let worker = std::thread::spawn(move || {
            let mut conn = Connection::open(worker_path).expect("open task mutation connection");
            configure_connection(&conn).unwrap();
            conn.busy_timeout(Duration::from_secs(2)).unwrap();
            started_tx.send(()).unwrap();
            finished_tx
                .send(mutate(mutation, &mut conn, list, first, second))
                .unwrap();
        });
        started_rx
            .recv_timeout(Duration::from_secs(2))
            .expect("mutation worker started");
        let early = finished_rx.recv_timeout(Duration::from_millis(100));
        let waited = matches!(early, Err(mpsc::RecvTimeoutError::Timeout));
        tx.commit()
            .expect("release competing writer before assertions");
        let result = match early {
            Ok(result) => result,
            Err(mpsc::RecvTimeoutError::Timeout) => finished_rx
                .recv_timeout(Duration::from_secs(2))
                .expect("mutation completes after writer release"),
            Err(error) => panic!("mutation worker disconnected: {error}"),
        };
        worker.join().expect("mutation worker finished");
        let count: i64 = writer
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .unwrap();
        let other = get_task(&writer, second).unwrap();
        let target = get_task(&writer, first);
        let active = active_tasks_in_bucket(&writer, list, PlanningLane::Today).unwrap();
        drop(writer);
        std::fs::remove_file(path).expect("remove isolated database");

        assert!(
            waited,
            "{mutation:?} completed while the competing writer was held: {result:?}"
        );
        result.unwrap_or_else(|error| panic!("{mutation:?} failed after writer release: {error}"));
        let expected_count = match mutation {
            Mutation::Create | Mutation::CreateAtTop | Mutation::Duplicate => 3,
            Mutation::DeleteArchived | Mutation::DeleteConfirmed => 1,
            _ => 2,
        };
        assert_eq!(
            count, expected_count,
            "{mutation:?} changed task count incorrectly"
        );
        assert_eq!(other.id, second);
        assert_eq!(other.title, "Companion");
        assert_eq!(other.est_seconds, Some(600));
        if !matches!(
            mutation,
            Mutation::DeleteArchived | Mutation::DeleteConfirmed
        ) {
            let target = target.expect("original identity survives non-delete mutation");
            assert_eq!(target.id, first);
            assert_eq!(
                target.est_seconds,
                Some(if matches!(mutation, Mutation::Update) {
                    900
                } else {
                    1800
                }),
                "{mutation:?} overwrote the committed writer field"
            );
        }
        let ids: std::collections::HashSet<_> = active.iter().map(|task| task.id).collect();
        let ranks: std::collections::HashSet<_> =
            active.iter().map(|task| task.sort_rank).collect();
        assert_eq!(ids.len(), active.len(), "{mutation:?} aliased identities");
        assert_eq!(
            ranks.len(),
            active.len(),
            "{mutation:?} aliased active bucket ranks"
        );
    }
}

#[test]
fn deferred_read_upgrade_reproduces_busy_without_waiting_for_reserved_writer() {
    let path = std::env::temp_dir().join(format!(
        "narro-deferred-control-{}.sqlite",
        uuid::Uuid::new_v4()
    ));
    let mut writer = Connection::open(&path).unwrap();
    run_migrations(&mut writer).unwrap();
    let tx = writer
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .unwrap();
    tx.execute("UPDATE preferences SET updated_at = ?1", [NOW])
        .unwrap();
    let mut reader = Connection::open(&path).unwrap();
    reader.busy_timeout(Duration::from_secs(2)).unwrap();
    let reader_tx = reader.transaction().unwrap();
    let _: i64 = reader_tx
        .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
        .unwrap();
    let error = reader_tx
        .execute("DELETE FROM tasks", [])
        .expect_err("deferred read-to-write upgrade must reproduce contention");
    drop(reader_tx);
    tx.commit().unwrap();
    drop(reader);
    drop(writer);
    std::fs::remove_file(path).unwrap();
    assert!(
        matches!(error, rusqlite::Error::SqliteFailure(code, _) if code.code == ErrorCode::DatabaseBusy)
    );
}
