use super::ids::{SubtaskId, TaskId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SubtaskRecord {
    pub id: SubtaskId,
    pub task_id: TaskId,
    pub title: String,
    pub sort_rank: u32,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NewSubtaskInput {
    pub task_id: TaskId,
    pub title: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UpdateSubtaskInput {
    pub title: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_subtask_input_round_trips_with_stable_parent_identity() {
        let input = NewSubtaskInput {
            task_id: TaskId::generate(),
            title: "Prepare outline".into(),
        };

        let encoded = serde_json::to_string(&input).expect("serialize subtask input");
        let decoded: NewSubtaskInput =
            serde_json::from_str(&encoded).expect("deserialize subtask input");

        assert_eq!(decoded, input);
    }
}
