use crate::windows::{PhysicalPoint, PhysicalRect, PhysicalSize};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SavedFloatingPlacement {
    pub version: u8,
    pub position: PhysicalPoint,
    pub outer_size: PhysicalSize,
    pub work_area: PhysicalRect,
    pub monitor_name: Option<String>,
}

impl SavedFloatingPlacement {
    pub const VERSION: u8 = 1;

    pub fn is_valid(&self) -> bool {
        self.version == Self::VERSION
            && self.outer_size.width > 0
            && self.outer_size.height > 0
            && self.work_area.size.width > 0
            && self.work_area.size.height > 0
    }
}

#[derive(Debug)]
pub enum FloatingPlacementStoreError {
    Sqlite(rusqlite::Error),
    Json(serde_json::Error),
    InvalidSavedPlacement,
}

impl Display for FloatingPlacementStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "floating placement database: {error}"),
            Self::Json(error) => write!(formatter, "floating placement JSON: {error}"),
            Self::InvalidSavedPlacement => formatter.write_str("floating placement is invalid"),
        }
    }
}

impl std::error::Error for FloatingPlacementStoreError {}

impl From<rusqlite::Error> for FloatingPlacementStoreError {
    fn from(error: rusqlite::Error) -> Self {
        Self::Sqlite(error)
    }
}

impl From<serde_json::Error> for FloatingPlacementStoreError {
    fn from(error: serde_json::Error) -> Self {
        Self::Json(error)
    }
}

pub fn save(
    connection: &Connection,
    placement: &SavedFloatingPlacement,
    updated_at: &str,
) -> Result<(), FloatingPlacementStoreError> {
    if !placement.is_valid() {
        return Err(FloatingPlacementStoreError::InvalidSavedPlacement);
    }
    let payload_json = serde_json::to_string(placement)?;
    connection.execute(
        "INSERT INTO floating_timer_placement (id, payload_json, updated_at)
         VALUES (1, ?1, ?2)
         ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json,
                                       updated_at = excluded.updated_at",
        params![payload_json, updated_at],
    )?;
    Ok(())
}

pub fn load(
    connection: &Connection,
) -> Result<Option<SavedFloatingPlacement>, FloatingPlacementStoreError> {
    let payload_json: Option<String> = connection
        .query_row(
            "SELECT payload_json FROM floating_timer_placement WHERE id = 1",
            [],
            |row| row.get(0),
        )
        .optional()?;
    let Some(payload_json) = payload_json else {
        return Ok(None);
    };
    let placement: SavedFloatingPlacement = serde_json::from_str(&payload_json)?;
    if !placement.is_valid() {
        return Err(FloatingPlacementStoreError::InvalidSavedPlacement);
    }
    Ok(Some(placement))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::run_migrations;

    fn fixture() -> SavedFloatingPlacement {
        SavedFloatingPlacement {
            version: SavedFloatingPlacement::VERSION,
            position: PhysicalPoint { x: 1520, y: 720 },
            outer_size: PhysicalSize {
                width: 340,
                height: 110,
            },
            work_area: PhysicalRect {
                position: PhysicalPoint { x: 0, y: 0 },
                size: PhysicalSize {
                    width: 1920,
                    height: 1040,
                },
            },
            monitor_name: Some("primary".into()),
        }
    }

    #[test]
    fn placement_round_trips_and_replaces_one_row() {
        let mut connection = Connection::open_in_memory().expect("open database");
        run_migrations(&mut connection).expect("migrate");
        assert_eq!(load(&connection).expect("initial load"), None);

        let first = fixture();
        save(&connection, &first, "2026-09-24T00:00:00Z").expect("save first");
        assert_eq!(load(&connection).expect("load first"), Some(first.clone()));

        let mut second = first;
        second.position.x = 900;
        save(&connection, &second, "2026-09-24T00:01:00Z").expect("save second");
        assert_eq!(load(&connection).expect("load second"), Some(second));
        let count: i64 = connection
            .query_row("SELECT COUNT(*) FROM floating_timer_placement", [], |row| {
                row.get(0)
            })
            .expect("count placement rows");
        assert_eq!(count, 1);
    }

    #[test]
    fn invalid_saved_placement_is_rejected() {
        let mut connection = Connection::open_in_memory().expect("open database");
        run_migrations(&mut connection).expect("migrate");
        let mut invalid = fixture();
        invalid.work_area.size.width = 0;
        assert!(matches!(
            save(&connection, &invalid, "2026-09-24T00:00:00Z"),
            Err(FloatingPlacementStoreError::InvalidSavedPlacement)
        ));
    }
}
