use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DomainValueError {
    type_name: &'static str,
    value: String,
}

impl DomainValueError {
    fn new(type_name: &'static str, value: &str) -> Self {
        Self {
            type_name,
            value: value.to_owned(),
        }
    }
}

impl Display for DomainValueError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        write!(
            formatter,
            "unsupported {} value: {}",
            self.type_name, self.value
        )
    }
}

impl std::error::Error for DomainValueError {}

macro_rules! string_enum {
    (
        $(#[$meta:meta])*
        pub enum $name:ident {
            $($variant:ident => $value:literal),+ $(,)?
        }
    ) => {
        $(#[$meta])*
        pub enum $name {
            $($variant),+
        }

        impl $name {
            pub const fn as_str(&self) -> &'static str {
                match self {
                    $(Self::$variant => $value),+
                }
            }
        }

        impl Display for $name {
            fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
                formatter.write_str(self.as_str())
            }
        }

        impl TryFrom<&str> for $name {
            type Error = DomainValueError;

            fn try_from(value: &str) -> Result<Self, Self::Error> {
                match value {
                    $($value => Ok(Self::$variant)),+,
                    _ => Err(DomainValueError::new(stringify!($name), value)),
                }
            }
        }

        impl Serialize for $name {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: Serializer,
            {
                serializer.serialize_str(self.as_str())
            }
        }

        impl<'de> Deserialize<'de> for $name {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: Deserializer<'de>,
            {
                let value = String::deserialize(deserializer)?;
                Self::try_from(value.as_str()).map_err(serde::de::Error::custom)
            }
        }
    };
}

string_enum! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
    pub enum PlanningLane {
        Backlog => "backlog",
        ThisWeek => "this_week",
        Today => "today",
    }
}

string_enum! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
    pub enum ScheduleKind {
        None => "none",
        DateOnly => "date_only",
        LocalDateTime => "local_datetime",
    }
}

string_enum! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
    pub enum RecurrenceUnit {
        Day => "day",
        Week => "week",
        Month => "month",
        Year => "year",
    }
}

string_enum! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
    pub enum SessionKind {
        Work => "work",
        Break => "break",
    }
}

string_enum! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
    pub enum SessionSource {
        Focus => "focus",
        Manual => "manual",
        Edit => "edit",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn db_string_contract_round_trips() {
        assert_eq!(
            PlanningLane::try_from("this_week"),
            Ok(PlanningLane::ThisWeek)
        );
        assert_eq!(ScheduleKind::LocalDateTime.as_str(), "local_datetime");
        assert_eq!(RecurrenceUnit::Month.to_string(), "month");
        assert_eq!(SessionKind::try_from("break"), Ok(SessionKind::Break));
        assert_eq!(SessionSource::try_from("manual"), Ok(SessionSource::Manual));
    }

    #[test]
    fn unknown_db_value_is_rejected() {
        let error = PlanningLane::try_from("later").expect_err("unsupported lane must fail");
        assert_eq!(error.type_name, "PlanningLane");
        assert_eq!(error.value, "later");
    }

    #[test]
    fn serde_matches_database_strings() {
        for (value, expected) in [
            (ScheduleKind::None, "none"),
            (ScheduleKind::DateOnly, "date_only"),
            (ScheduleKind::LocalDateTime, "local_datetime"),
        ] {
            let encoded = serde_json::to_string(&value).expect("serialize schedule kind");
            assert_eq!(encoded, format!("\"{expected}\""));

            let decoded: ScheduleKind =
                serde_json::from_str(&encoded).expect("deserialize schedule kind");
            assert_eq!(decoded, value);
        }
    }
}
