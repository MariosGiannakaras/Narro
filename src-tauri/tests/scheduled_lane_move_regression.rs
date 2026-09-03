mod support;

use narro_lib::domain::ids::TaskId;
use narro_lib::domain::model::{PlanningLane, ScheduleKind};
use narro_lib::domain::tasks::TaskDestination;
use narro_lib::persistence::task_identity::reorder_active_bucket;
use narro_lib::persistence::tasks::{active_tasks_in_bucket, get_task, move_task};
use std::collections::HashSet;
use support::{
    insert_work_session, migrated, session_id, ListFixture, TaskFixture, MUTATED_AGAIN_AT,
    MUTATED_AT,
};

fn ids_in_bucket(
    conn: &rusqlite::Connection,
    list_id: narro_lib::domain::ids::ListId,
    lane: PlanningLane,
) -> Vec<TaskId> {
    active_tasks_in_bucket(conn, list_id, lane)
        .expect("load task bucket")
        .into_iter()
        .map(|task| task.id)
        .collect()
}

#[test]
fn deterministic_fixture_builders_emit_fixed_ids_and_common_persisted_shapes() {
    let conn = migrated();
    let list = ListFixture::new(7, "Fixture list").insert(&conn);
    assert_eq!(
        list.id.to_string(),
        "10000000-0000-0000-0000-000000000007"
    );

    let archived_list = ListFixture::new(8, "Archived fixture list")
        .archived(MUTATED_AT)
        .insert(&conn);
    assert_eq!(archived_list.archived_at.as_deref(), Some(MUTATED_AT));

    let task = TaskFixture::new(11, list.id, "Fixture task", PlanningLane::ThisWeek)
        .rank(4)
        .date_only("2026-09-05")
        .completed(MUTATED_AT)
        .archived(MUTATED_AGAIN_AT)
        .insert(&conn);
    assert_eq!(
        task.id.to_string(),
        "20000000-0000-0000-0000-00000000000b"
    );
    assert_eq!(task.manual_lane, PlanningLane::ThisWeek);
    assert_eq!(task.sort_rank, 4);
    assert_eq!(task.schedule_kind, ScheduleKind::DateOnly);
    assert_eq!(task.scheduled_local_date.as_deref(), Some("2026-09-05"));
    assert_eq!(task.completed_at.as_deref(), Some(MUTATED_AT));
    assert_eq!(task.archived_at.as_deref(), Some(MUTATED_AGAIN_AT));

    insert_work_session(&conn, 9, task.id, 600);
    let session: (String, i64) = conn
        .query_row(
            "SELECT id, duration_seconds FROM sessions WHERE task_id = ?1",
            [task.id.to_string()],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("load deterministic work-session fixture");
    assert_eq!(session.0, session_id(9).to_string());
    assert_eq!(session.1, 600);
}

#[test]
fn repeated_scheduled_lane_moves_and_reorders_preserve_identity_count_and_schedule() {
    let mut conn = migrated();
    let list = ListFixture::new(1, "Inbox").insert(&conn);
    let scheduled = TaskFixture::new(1, list.id, "Scheduled", PlanningLane::Backlog)
        .rank(0)
        .local_datetime("2026-09-04", "09:30", "Europe/Athens")
        .insert(&conn);
    let second = TaskFixture::new(2, list.id, "Second", PlanningLane::Backlog)
        .rank(1)
        .insert(&conn);
    let third = TaskFixture::new(3, list.id, "Third", PlanningLane::Backlog)
        .rank(2)
        .insert(&conn);

    let expected_ids: HashSet<TaskId> = [scheduled.id, second.id, third.id].into_iter().collect();

    for cycle in 0..32 {
        let backlog_order = if cycle % 2 == 0 {
            [third.id, scheduled.id, second.id]
        } else {
            [second.id, third.id, scheduled.id]
        };
        reorder_active_bucket(
            &mut conn,
            list.id,
            PlanningLane::Backlog,
            &backlog_order,
            MUTATED_AT,
        )
        .expect("reorder backlog before scheduled move");

        let moved_today = move_task(
            &mut conn,
            scheduled.id,
            TaskDestination {
                list_id: list.id,
                manual_lane: PlanningLane::Today,
            },
            MUTATED_AT,
        )
        .expect("move scheduled task to Today");
        assert_eq!(moved_today.id, scheduled.id);
        assert_eq!(moved_today.schedule_kind, ScheduleKind::LocalDateTime);
        assert_eq!(
            moved_today.scheduled_local_date.as_deref(),
            Some("2026-09-04")
        );
        assert_eq!(moved_today.scheduled_local_time.as_deref(), Some("09:30"));
        assert_eq!(
            moved_today.schedule_timezone.as_deref(),
            Some("Europe/Athens")
        );
        assert_eq!(
            ids_in_bucket(&conn, list.id, PlanningLane::Today),
            vec![scheduled.id]
        );

        let remaining_backlog = ids_in_bucket(&conn, list.id, PlanningLane::Backlog);
        assert_eq!(remaining_backlog.len(), 2);
        assert!(!remaining_backlog.contains(&scheduled.id));

        let moved_back = move_task(
            &mut conn,
            scheduled.id,
            TaskDestination {
                list_id: list.id,
                manual_lane: PlanningLane::Backlog,
            },
            MUTATED_AGAIN_AT,
        )
        .expect("move scheduled task back to Backlog");
        assert_eq!(moved_back.id, scheduled.id);
        assert_eq!(moved_back.schedule_kind, ScheduleKind::LocalDateTime);

        let all_backlog = active_tasks_in_bucket(&conn, list.id, PlanningLane::Backlog)
            .expect("load backlog after move cycle");
        assert_eq!(all_backlog.len(), 3);
        assert_eq!(
            all_backlog
                .iter()
                .map(|task| task.id)
                .collect::<HashSet<_>>(),
            expected_ids
        );
        assert_eq!(
            all_backlog
                .iter()
                .map(|task| task.sort_rank)
                .collect::<Vec<_>>(),
            vec![0, 1, 2]
        );

        let row_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count task rows during move stress");
        assert_eq!(row_count, 3);
        let scheduled_row_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks
                 WHERE id = ?1
                   AND schedule_kind = 'local_datetime'
                   AND scheduled_local_date = '2026-09-04'
                   AND scheduled_local_time = '09:30'
                   AND schedule_timezone = 'Europe/Athens'",
                [scheduled.id.to_string()],
                |row| row.get(0),
            )
            .expect("count scheduled identity rows");
        assert_eq!(scheduled_row_count, 1);
    }

    let persisted = get_task(&conn, scheduled.id).expect("reload scheduled task after stress");
    assert_eq!(persisted.id, scheduled.id);
    assert_eq!(persisted.manual_lane, PlanningLane::Backlog);
    assert_eq!(persisted.schedule_kind, ScheduleKind::LocalDateTime);
    assert_eq!(
        persisted.scheduled_local_date.as_deref(),
        Some("2026-09-04")
    );
    assert_eq!(persisted.scheduled_local_time.as_deref(), Some("09:30"));
    assert_eq!(
        persisted.schedule_timezone.as_deref(),
        Some("Europe/Athens")
    );
}
