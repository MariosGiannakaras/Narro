//! Durable recurrence metadata shared by persistence and the Milestone 4 materializer.

use super::ids::{RecurrenceRuleId, TaskId};
use super::model::RecurrenceUnit;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RecurrenceRuleRecord {
    pub id: RecurrenceRuleId,
    pub parent_task_id: TaskId,
    pub interval_count: u32,
    pub unit: RecurrenceUnit,
    pub weekday_mask: u8,
    pub month_day: Option<u8>,
    pub starts_local_date: String,
    pub local_time: Option<String>,
    pub timezone: Option<String>,
    pub replace_existing: bool,
    pub is_active: bool,
    pub last_materialized_local_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NewRecurrenceRuleInput {
    pub parent_task_id: TaskId,
    pub interval_count: u32,
    pub unit: RecurrenceUnit,
    pub weekday_mask: u8,
    pub month_day: Option<u8>,
    pub starts_local_date: String,
    pub local_time: Option<String>,
    pub timezone: Option<String>,
    pub replace_existing: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UpdateRecurrenceRuleInput {
    pub interval_count: u32,
    pub unit: RecurrenceUnit,
    pub weekday_mask: u8,
    pub month_day: Option<u8>,
    pub starts_local_date: String,
    pub local_time: Option<String>,
    pub timezone: Option<String>,
    pub replace_existing: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recurrence_rule_input_serde_keeps_durable_unit_token() {
        let input = NewRecurrenceRuleInput {
            parent_task_id: TaskId::generate(),
            interval_count: 2,
            unit: RecurrenceUnit::Week,
            weekday_mask: 0b0000101,
            month_day: None,
            starts_local_date: "2026-09-07".into(),
            local_time: Some("09:30".into()),
            timezone: Some("Europe/Athens".into()),
            replace_existing: false,
        };

        let encoded = serde_json::to_value(&input).expect("serialize recurrence input");
        assert_eq!(encoded["unit"], "week");
        assert_eq!(encoded["weekday_mask"], 5);

        let decoded: NewRecurrenceRuleInput =
            serde_json::from_value(encoded).expect("deserialize recurrence input");
        assert_eq!(decoded, input);
    }
}
