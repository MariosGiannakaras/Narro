mod support;

use narro_lib::domain::ids::TaskId;
use narro_lib::domain::model::{PlanningLane, ScheduleKind};
use narro_lib::domain::tasks::TaskDestination;
use narro_lib::persistence::task_identity::reorder_active_bucket;
use narro_lib::persistence::tasks::{active_tasks_in_bucket, get_task, move_task};
use std::collections::HashSet;
use support::{migrated, ListFixture, TaskFixture, MUTATED_AGAIN_AT, MUTATED_AT};

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
