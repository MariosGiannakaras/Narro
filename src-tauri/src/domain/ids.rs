use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};
use std::str::FromStr;
use uuid::Uuid;

macro_rules! durable_id {
    ($name:ident) => {
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
        #[serde(transparent)]
        pub struct $name(Uuid);

        impl $name {
            pub fn generate() -> Self {
                Self(Uuid::new_v4())
            }

            pub const fn from_uuid(value: Uuid) -> Self {
                Self(value)
            }

            pub const fn as_uuid(&self) -> &Uuid {
                &self.0
            }

            pub fn parse_str(value: &str) -> Result<Self, uuid::Error> {
                Uuid::parse_str(value).map(Self)
            }
        }

        impl Display for $name {
            fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
                Display::fmt(&self.0, formatter)
            }
        }

        impl FromStr for $name {
            type Err = uuid::Error;

            fn from_str(value: &str) -> Result<Self, Self::Err> {
                Self::parse_str(value)
            }
        }

        impl From<Uuid> for $name {
            fn from(value: Uuid) -> Self {
                Self::from_uuid(value)
            }
        }

        impl From<$name> for Uuid {
            fn from(value: $name) -> Self {
                value.0
            }
        }
    };
}

durable_id!(ListId);
durable_id!(TaskId);
durable_id!(SubtaskId);
durable_id!(RecurrenceRuleId);
durable_id!(ReminderId);
durable_id!(SessionId);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generated_ids_are_unique_and_round_trip() {
        let first = TaskId::generate();
        let second = TaskId::generate();
        assert_ne!(first, second);

        let encoded = first.to_string();
        assert_eq!(TaskId::parse_str(&encoded).expect("parse generated task id"), first);
    }

    #[test]
    fn serde_uses_uuid_string_representation() {
        let id = ListId::from_uuid(
            Uuid::parse_str("d9428888-122b-11e1-b85c-61cd3cbb3210").expect("fixture uuid"),
        );

        let encoded = serde_json::to_string(&id).expect("serialize list id");
        assert_eq!(encoded, "\"d9428888-122b-11e1-b85c-61cd3cbb3210\"");
        let decoded: ListId = serde_json::from_str(&encoded).expect("deserialize list id");
        assert_eq!(decoded, id);
    }

    #[test]
    fn invalid_id_is_rejected() {
        assert!(ReminderId::parse_str("not-a-uuid").is_err());
    }
}
