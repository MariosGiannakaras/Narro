use crate::domain::ids::ListId;
use crate::domain::lists::{ListRecord, NewListInput, UpdateListInput};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, Row, Transaction};
use std::collections::HashSet;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum ListStoreError {
    Sqlite(rusqlite::Error),
    InvalidTitle,
    InvalidTimestamp,
    InvalidStoredId,
    InvalidStoredRank(i64),
    RankOverflow,
    NotFound(ListId),
    DuplicateReorderId,
    ReorderSetMismatch,
    MustArchiveBeforePermanentDelete(ListId),
}

impl Display for ListStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "list persistence failed: {error}"),
            Self::InvalidTitle => formatter.write_str("list title must not be empty"),
            Self::InvalidTimestamp => formatter.write_str("list mutation timestamp must be RFC 3339"),
            Self::InvalidStoredId => formatter.write_str("stored list id is not a valid UUID"),
            Self::InvalidStoredRank(rank) => write!(formatter, "stored list rank is invalid: {rank}"),
            Self::RankOverflow => formatter.write_str("list ordering rank overflow"),
            Self::NotFound(id) => write!(formatter, "list not found: {id}"),
            Self::DuplicateReorderId => {
                formatter.write_str("list reorder contains a duplicate identity")
            }
            Self::ReorderSetMismatch => formatter.write_str(
                "list reorder must contain every active list identity exactly once",
            ),
            Self::MustArchiveBeforePermanentDelete(id) => write!(
                formatter,
                "list must be archived before permanent deletion: {id}"
            ),
        }
    }
}

impl std::error::Error for ListStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for ListStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

#[derive(Debug)]
struct RawList {
    id: String,
    title: String,
    color: Option<String>,
    icon_asset: Option<String>,
    sort_rank: i64,
    archived_at: Option<String>,
    created_at: String,
    updated_at: String,
}

fn raw_list_from_row(row: &Row<'_>) -> rusqlite::Result<RawList> {
    Ok(RawList {
        id: row.get(0)?,
        title: row.get(1)?,
        color: row.get(2)?,
        icon_asset: row.get(3)?,
        sort_rank: row.get(4)?,
        archived_at: row.get(5)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}

fn decode_list(raw: RawList) -> Result<ListRecord, ListStoreError> {
    let id = ListId::parse_str(&raw.id).map_err(|_| ListStoreError::InvalidStoredId)?;
    let sort_rank =
        u32::try_from(raw.sort_rank).map_err(|_| ListStoreError::InvalidStoredRank(raw.sort_rank))?;

    Ok(ListRecord {
        id,
        title: raw.title,
        color: raw.color,
        icon_asset: raw.icon_asset,
        sort_rank,
        archived_at: raw.archived_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    })
}

fn normalize_title(value: &str) -> Result<String, ListStoreError> {
    let title = value.trim();
    if title.is_empty() {
        return Err(ListStoreError::InvalidTitle);
    }
    Ok(title.to_owned())
}

fn validate_timestamp(value: &str) -> Result<(), ListStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| ListStoreError::InvalidTimestamp)
}

fn get_raw_list(conn: &Connection, id: ListId) -> Result<Option<RawList>, ListStoreError> {
    conn.query_row(
        "SELECT id, title, color, icon_asset, sort_rank, archived_at, created_at, updated_at
         FROM lists
         WHERE id = ?1",
        [id.to_string()],
        raw_list_from_row,
    )
    .optional()
    .map_err(ListStoreError::from)
}

fn list_rows(conn: &Connection, archived: bool) -> Result<Vec<ListRecord>, ListStoreError> {
    let (predicate, order) = if archived {
        ("archived_at IS NOT NULL", "archived_at DESC, id")
    } else {
        ("archived_at IS NULL", "sort_rank, id")
    };
    let sql = format!(
        "SELECT id, title, color, icon_asset, sort_rank, archived_at, created_at, updated_at
         FROM lists
         WHERE {predicate}
         ORDER BY {order}"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement.query_map([], raw_list_from_row)?;
    let mut result = Vec::new();
    for row in rows {
        result.push(decode_list(row?)?);
    }
    Ok(result)
}

fn active_ids(conn: &Connection) -> Result<Vec<ListId>, ListStoreError> {
    let mut statement = conn.prepare(
        "SELECT id
         FROM lists
         WHERE archived_at IS NULL
         ORDER BY sort_rank, id",
    )?;
    let rows = statement.query_map([], |row| row.get::<_, String>(0))?;
    let mut ids = Vec::new();
    for row in rows {
        ids.push(ListId::parse_str(&row?).map_err(|_| ListStoreError::InvalidStoredId)?);
    }
    Ok(ids)
}

fn next_active_rank(conn: &Connection) -> Result<i64, ListStoreError> {
    let current: Option<i64> = conn.query_row(
        "SELECT MAX(sort_rank) FROM lists WHERE archived_at IS NULL",
        [],
        |row| row.get(0),
    )?;
    match current {
        Some(rank) if rank >= i64::from(u32::MAX) => Err(ListStoreError::RankOverflow),
        Some(rank) => Ok(rank + 1),
        None => Ok(0),
    }
}

fn compact_active_ranks(tx: &Transaction<'_>, now: &str) -> Result<(), ListStoreError> {
    let ids = active_ids(tx)?;
    for (index, id) in ids.iter().enumerate() {
        let rank = i64::try_from(index).map_err(|_| ListStoreError::RankOverflow)?;
        let changed = tx.execute(
            "UPDATE lists
             SET sort_rank = ?1, updated_at = ?2
             WHERE id = ?3 AND archived_at IS NULL",
            params![rank, now, id.to_string()],
        )?;
        if changed != 1 {
            return Err(ListStoreError::ReorderSetMismatch);
        }
    }
    Ok(())
}

pub fn get_list(conn: &Connection, id: ListId) -> Result<ListRecord, ListStoreError> {
    decode_list(get_raw_list(conn, id)?.ok_or(ListStoreError::NotFound(id))?)
}

pub fn active_lists(conn: &Connection) -> Result<Vec<ListRecord>, ListStoreError> {
    list_rows(conn, false)
}

pub fn archived_lists(conn: &Connection) -> Result<Vec<ListRecord>, ListStoreError> {
    list_rows(conn, true)
}

pub fn create_list(
    conn: &mut Connection,
    input: NewListInput,
    now: &str,
) -> Result<ListRecord, ListStoreError> {
    validate_timestamp(now)?;
    let title = normalize_title(&input.title)?;
    let id = ListId::new();
    let tx = conn.transaction()?;
    let rank = next_active_rank(&tx)?;
    tx.execute(
        "INSERT INTO lists (
            id, title, color, icon_asset, sort_rank, archived_at, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, NULL, ?6, ?6)",
        params![
            id.to_string(),
            title,
            input.color,
            input.icon_asset,
            rank,
            now
        ],
    )?;
    let created = get_raw_list(&tx, id)?.ok_or(ListStoreError::NotFound(id))?;
    tx.commit()?;
    decode_list(created)
}

pub fn update_list(
    conn: &mut Connection,
    id: ListId,
    input: UpdateListInput,
    now: &str,
) -> Result<ListRecord, ListStoreError> {
    validate_timestamp(now)?;
    let title = normalize_title(&input.title)?;
    let tx = conn.transaction()?;
    let changed = tx.execute(
        "UPDATE lists
         SET title = ?1, color = ?2, icon_asset = ?3, updated_at = ?4
         WHERE id = ?5",
        params![title, input.color, input.icon_asset, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(ListStoreError::NotFound(id));
    }
    let updated = get_raw_list(&tx, id)?.ok_or(ListStoreError::NotFound(id))?;
    tx.commit()?;
    decode_list(updated)
}

pub fn reorder_active_lists(
    conn: &mut Connection,
    ordered_ids: &[ListId],
    now: &str,
) -> Result<Vec<ListRecord>, ListStoreError> {
    validate_timestamp(now)?;
    let requested: HashSet<ListId> = ordered_ids.iter().copied().collect();
    if requested.len() != ordered_ids.len() {
        return Err(ListStoreError::DuplicateReorderId);
    }

    let tx = conn.transaction()?;
    let current = active_ids(&tx)?;
    let current_set: HashSet<ListId> = current.iter().copied().collect();
    if current.len() != ordered_ids.len() || current_set != requested {
        return Err(ListStoreError::ReorderSetMismatch);
    }

    for (index, id) in ordered_ids.iter().enumerate() {
        let rank = i64::try_from(index).map_err(|_| ListStoreError::RankOverflow)?;
        let changed = tx.execute(
            "UPDATE lists
             SET sort_rank = ?1, updated_at = ?2
             WHERE id = ?3 AND archived_at IS NULL",
            params![rank, now, id.to_string()],
        )?;
        if changed != 1 {
            return Err(ListStoreError::ReorderSetMismatch);
        }
    }
    tx.commit()?;
    active_lists(conn)
}

pub fn archive_list(
    conn: &mut Connection,
    id: ListId,
    now: &str,
) -> Result<ListRecord, ListStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_raw_list(&tx, id)?.ok_or(ListStoreError::NotFound(id))?;
    if current.archived_at.is_some() {
        let unchanged = decode_list(current)?;
        drop(tx);
        return Ok(unchanged);
    }

    let changed = tx.execute(
        "UPDATE lists
         SET archived_at = ?1, updated_at = ?1
         WHERE id = ?2 AND archived_at IS NULL",
        params![now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(ListStoreError::NotFound(id));
    }
    compact_active_ranks(&tx, now)?;
    let archived = get_raw_list(&tx, id)?.ok_or(ListStoreError::NotFound(id))?;
    tx.commit()?;
    decode_list(archived)
}

pub fn restore_list(
    conn: &mut Connection,
    id: ListId,
    now: &str,
) -> Result<ListRecord, ListStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_raw_list(&tx, id)?.ok_or(ListStoreError::NotFound(id))?;
    if current.archived_at.is_none() {
        let unchanged = decode_list(current)?;
        drop(tx);
        return Ok(unchanged);
    }

    let rank = next_active_rank(&tx)?;
    let changed = tx.execute(
        "UPDATE lists
         SET archived_at = NULL, sort_rank = ?1, updated_at = ?2
         WHERE id = ?3 AND archived_at IS NOT NULL",
        params![rank, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(ListStoreError::NotFound(id));
    }
    let restored = get_raw_list(&tx, id)?.ok_or(ListStoreError::NotFound(id))?;
    tx.commit()?;
    decode_list(restored)
}

pub fn permanently_delete_list(
    conn: &mut Connection,
    id: ListId,
) -> Result<(), ListStoreError> {
    let tx = conn.transaction()?;
    let current = get_raw_list(&tx, id)?.ok_or(ListStoreError::NotFound(id))?;
    if current.archived_at.is_none() {
        return Err(ListStoreError::MustArchiveBeforePermanentDelete(id));
    }

    let changed = tx.execute("DELETE FROM lists WHERE id = ?1", [id.to_string()])?;
    if changed != 1 {
        return Err(ListStoreError::NotFound(id));
    }
    tx.commit()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ids::TaskId;
    use crate::persistence::run_migrations;
    use rusqlite::params;
    use std::fs;
    use uuid::Uuid;

    const T1: &str = "2026-09-03T10:00:00Z";
    const T2: &str = "2026-09-03T10:01:00Z";
    const T3: &str = "2026-09-03T10:02:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        conn
    }

    fn input(title: &str) -> NewListInput {
        NewListInput {
            title: title.to_owned(),
            color: None,
            icon_asset: None,
        }
    }

    fn ids(records: &[ListRecord]) -> Vec<ListId> {
        records.iter().map(|record| record.id).collect()
    }

    fn insert_task(conn: &Connection, task_id: TaskId, list_id: ListId) {
        conn.execute(
            "INSERT INTO tasks (
                id, list_id, title, manual_lane, sort_rank, created_at, updated_at
             ) VALUES (?1, ?2, 'Task', 'backlog', 0, ?3, ?3)",
            params![task_id.to_string(), list_id.to_string(), T1],
        )
        .expect("insert task fixture");
    }

    #[test]
    fn create_and_update_survive_database_reopen_with_stable_identity() {
        let path = std::env::temp_dir().join(format!("narro-list-store-{}.db", Uuid::new_v4()));
        let list_id;
        {
            let mut conn = Connection::open(&path).expect("open temporary database");
            run_migrations(&mut conn).expect("migrate temporary database");
            let created = create_list(&mut conn, input("  Inbox  "), T1).expect("create list");
            list_id = created.id;
            assert_eq!(created.title, "Inbox");
            assert_eq!(created.sort_rank, 0);

            let updated = update_list(
                &mut conn,
                list_id,
                UpdateListInput {
                    title: "Work".into(),
                    color: Some("#123456".into()),
                    icon_asset: Some("icons/work.png".into()),
                },
                T2,
            )
            .expect("update list");
            assert_eq!(updated.id, list_id);
            assert_eq!(updated.title, "Work");
            assert_eq!(updated.updated_at, T2);
        }
        {
            let mut reopened = Connection::open(&path).expect("reopen temporary database");
            run_migrations(&mut reopened).expect("re-run migrations after reopen");
            let persisted = get_list(&reopened, list_id).expect("load persisted list");
            assert_eq!(persisted.id, list_id);
            assert_eq!(persisted.title, "Work");
            assert_eq!(persisted.color.as_deref(), Some("#123456"));
            assert_eq!(persisted.icon_asset.as_deref(), Some("icons/work.png"));
        }
        fs::remove_file(path).expect("remove temporary database");
    }

    #[test]
    fn repeated_reorder_preserves_count_and_identities() {
        let mut conn = migrated();
        let first = create_list(&mut conn, input("First"), T1).expect("create first");
        let second = create_list(&mut conn, input("Second"), T1).expect("create second");
        let third = create_list(&mut conn, input("Third"), T1).expect("create third");
        let expected: HashSet<ListId> = [first.id, second.id, third.id].into_iter().collect();

        let reordered = reorder_active_lists(&mut conn, &[third.id, first.id, second.id], T2)
            .expect("first reorder");
        assert_eq!(ids(&reordered), vec![third.id, first.id, second.id]);

        let reordered = reorder_active_lists(&mut conn, &[second.id, third.id, first.id], T3)
            .expect("second reorder");
        assert_eq!(ids(&reordered), vec![second.id, third.id, first.id]);
        assert_eq!(reordered.len(), 3);
        assert_eq!(
            reordered.iter().map(|record| record.id).collect::<HashSet<_>>(),
            expected
        );
        assert_eq!(
            reordered.iter().map(|record| record.sort_rank).collect::<Vec<_>>(),
            vec![0, 1, 2]
        );
    }

    #[test]
    fn stale_or_duplicate_reorder_is_rejected_without_partial_write() {
        let mut conn = migrated();
        let first = create_list(&mut conn, input("First"), T1).expect("create first");
        let second = create_list(&mut conn, input("Second"), T1).expect("create second");
        let third = create_list(&mut conn, input("Third"), T1).expect("create third");
        let original = ids(&active_lists(&conn).expect("load original order"));

        let duplicate = reorder_active_lists(&mut conn, &[first.id, first.id, third.id], T2);
        assert!(matches!(duplicate, Err(ListStoreError::DuplicateReorderId)));
        assert_eq!(ids(&active_lists(&conn).expect("order after duplicate")), original);

        let incomplete = reorder_active_lists(&mut conn, &[third.id, second.id], T2);
        assert!(matches!(incomplete, Err(ListStoreError::ReorderSetMismatch)));
        assert_eq!(ids(&active_lists(&conn).expect("order after stale set")), original);
    }

    #[test]
    fn archive_and_restore_preserve_identity_history_and_compact_active_order() {
        let mut conn = migrated();
        let first = create_list(&mut conn, input("First"), T1).expect("create first");
        let second = create_list(&mut conn, input("Second"), T1).expect("create second");
        let third = create_list(&mut conn, input("Third"), T1).expect("create third");
        let task_id = TaskId::new();
        insert_task(&conn, task_id, second.id);

        let archived = archive_list(&mut conn, second.id, T2).expect("archive second");
        assert_eq!(archived.id, second.id);
        assert_eq!(archived.archived_at.as_deref(), Some(T2));
        let active = active_lists(&conn).expect("active after archive");
        assert_eq!(ids(&active), vec![first.id, third.id]);
        assert_eq!(active.iter().map(|record| record.sort_rank).collect::<Vec<_>>(), vec![0, 1]);
        assert_eq!(archived_lists(&conn).expect("archived lists").len(), 1);

        let task_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE id = ?1 AND list_id = ?2",
                params![task_id.to_string(), second.id.to_string()],
                |row| row.get(0),
            )
            .expect("count preserved task");
        assert_eq!(task_count, 1);

        let restored = restore_list(&mut conn, second.id, T3).expect("restore second");
        assert_eq!(restored.id, second.id);
        assert!(restored.archived_at.is_none());
        assert_eq!(
            ids(&active_lists(&conn).expect("active after restore")),
            vec![first.id, third.id, second.id]
        );
    }

    #[test]
    fn permanent_delete_requires_archive_and_cascades_list_owned_tasks() {
        let mut conn = migrated();
        let list = create_list(&mut conn, input("Delete me"), T1).expect("create list");
        let task_id = TaskId::new();
        insert_task(&conn, task_id, list.id);

        let active_delete = permanently_delete_list(&mut conn, list.id);
        assert!(matches!(
            active_delete,
            Err(ListStoreError::MustArchiveBeforePermanentDelete(id)) if id == list.id
        ));
        assert_eq!(active_lists(&conn).expect("list still active").len(), 1);

        archive_list(&mut conn, list.id, T2).expect("archive before delete");
        permanently_delete_list(&mut conn, list.id).expect("permanent delete archived list");

        let list_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM lists", [], |row| row.get(0))
            .expect("count lists");
        let task_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks");
        assert_eq!(list_count, 0);
        assert_eq!(task_count, 0, "foreign-key cascade must remove owned tasks");
    }

    #[test]
    fn blank_title_is_rejected_before_write() {
        let mut conn = migrated();
        let result = create_list(&mut conn, input("   "), T1);
        assert!(matches!(result, Err(ListStoreError::InvalidTitle)));
        assert!(active_lists(&conn).expect("active lists").is_empty());
    }
}
