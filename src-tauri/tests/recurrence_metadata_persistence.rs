use narro_lib::domain::ids::ListId;
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::{PlanningLane, RecurrenceUnit};
use narro_lib::domain::recurrence::{NewRecurrenceRuleInput, UpdateRecurrenceRuleInput};
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::recurrence::{
    create_recurrence_rule, get_recurrence_rule, update_recurrence_rule,
};
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::{create_task, get_task};
use rusqlite::Connection;
use std::fs;
use uuid::Uuid;

const T1: &str = "2026-09-03T16:00:00Z";
const T2: &str = "2026-09-03T16:01:00Z";
const T3: &str = "2026-09-03T16:02:00Z";

fn create_test_list(conn: &mut Connection) -> ListId {
    create_list(
        conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T1,
    )
    .expect("create list")
    .id
}

#[test]
fn recurrence_rule_and_parent_link_survive_database_reopen() {
    let path = std::env::temp_dir().join(format!("narro-recurrence-{}.db", Uuid::new_v4()));
    let parent_id;
    let rule_id;

    {
        let mut conn = Connection::open(&path).expect("open temporary database");
        run_migrations(&mut conn).expect("migrate temporary database");
        let list_id = create_test_list(&mut conn);
        let parent = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "Recurring parent".into(),
                manual_lane: PlanningLane::Backlog,
                est_seconds: Some(1800),
            },
            T1,
        )
        .expect("create parent task");
        parent_id = parent.id;

        let created = create_recurrence_rule(
            &mut conn,
            NewRecurrenceRuleInput {
                parent_task_id: parent.id,
                interval_count: 1,
                unit: RecurrenceUnit::Week,
                weekday_mask: 0b0010100,
                month_day: None,
                starts_local_date: "2026-09-07".into(),
                local_time: Some("08:45".into()),
                timezone: Some("Europe/Athens".into()),
                replace_existing: false,
            },
            T2,
        )
        .expect("create recurrence rule");
        rule_id = created.id;

        let updated = update_recurrence_rule(
            &mut conn,
            created.id,
            UpdateRecurrenceRuleInput {
                interval_count: 3,
                unit: RecurrenceUnit::Month,
                weekday_mask: 0,
                month_day: Some(20),
                starts_local_date: "2026-09-20".into(),
                local_time: None,
                timezone: None,
                replace_existing: true,
            },
            T3,
        )
        .expect("update recurrence rule");
        assert_eq!(updated.interval_count, 3);
        assert_eq!(updated.month_day, Some(20));
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen temporary database");
        run_migrations(&mut reopened).expect("re-run migrations after reopen");

        let persisted = get_recurrence_rule(&reopened, rule_id).expect("load persisted rule");
        assert_eq!(persisted.parent_task_id, parent_id);
        assert_eq!(persisted.interval_count, 3);
        assert_eq!(persisted.unit, RecurrenceUnit::Month);
        assert_eq!(persisted.weekday_mask, 0);
        assert_eq!(persisted.month_day, Some(20));
        assert_eq!(persisted.starts_local_date, "2026-09-20");
        assert!(persisted.local_time.is_none());
        assert!(persisted.timezone.is_none());
        assert!(persisted.replace_existing);
        assert!(persisted.is_active);

        let parent = get_task(&reopened, parent_id).expect("load linked parent task");
        assert_eq!(parent.recurrence_rule_id, Some(rule_id));
    }

    fs::remove_file(path).expect("remove temporary database");
}
