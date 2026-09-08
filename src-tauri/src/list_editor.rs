use crate::domain::ids::ListId;
use crate::domain::lists::{ListRecord, NewListInput, UpdateListInput};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::{create_list, get_list, update_list, ListStoreError};
use serde::Deserialize;
use std::fmt::{Display, Formatter};
use std::path::{Component, Path, PathBuf};
use tauri::Manager;

const ICON_DIRECTORY: &str = "list-icons";
const MAX_ICON_BYTES: usize = 1_048_576;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListIconUpload {
    pub filename: String,
    pub bytes: Vec<u8>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListEditorRequest {
    pub title: String,
    pub color: Option<String>,
    pub icon_upload: Option<ListIconUpload>,
}

#[derive(Debug)]
pub enum ListEditorError {
    OpenDatabase(rusqlite::Error),
    ConfigureDatabase(persistence::PersistenceError),
    Store(ListStoreError),
    Io(std::io::Error),
    InvalidColor,
    EmptyIcon,
    IconTooLarge,
    UnsupportedIconType,
    InvalidSvg,
}

impl Display for ListEditorError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::OpenDatabase(error) => {
                write!(formatter, "failed to open Narro database: {error}")
            }
            Self::ConfigureDatabase(error) => {
                write!(formatter, "failed to configure Narro database: {error}")
            }
            Self::Store(error) => write!(formatter, "list mutation failed: {error}"),
            Self::Io(error) => write!(formatter, "list icon storage failed: {error}"),
            Self::InvalidColor => formatter.write_str("list color must be a six-digit hex color"),
            Self::EmptyIcon => formatter.write_str("imported list icon is empty"),
            Self::IconTooLarge => formatter.write_str("imported list icon exceeds the 1 MiB limit"),
            Self::UnsupportedIconType => {
                formatter.write_str("list icon must be jpg, jpeg, png, or svg")
            }
            Self::InvalidSvg => {
                formatter.write_str("imported SVG is not a safe standalone SVG image")
            }
        }
    }
}

impl std::error::Error for ListEditorError {}

impl From<ListStoreError> for ListEditorError {
    fn from(value: ListStoreError) -> Self {
        Self::Store(value)
    }
}

impl From<std::io::Error> for ListEditorError {
    fn from(value: std::io::Error) -> Self {
        Self::Io(value)
    }
}

fn validate_color(color: Option<&str>) -> Result<(), ListEditorError> {
    let Some(color) = color else {
        return Ok(());
    };
    if color.len() != 7
        || !color.starts_with('#')
        || !color[1..].bytes().all(|byte| byte.is_ascii_hexdigit())
    {
        return Err(ListEditorError::InvalidColor);
    }
    Ok(())
}

fn normalized_extension(filename: &str) -> Result<&'static str, ListEditorError> {
    let extension = Path::new(filename)
        .extension()
        .and_then(|value| value.to_str())
        .map(str::to_ascii_lowercase)
        .ok_or(ListEditorError::UnsupportedIconType)?;
    match extension.as_str() {
        "jpg" | "jpeg" => Ok("jpg"),
        "png" => Ok("png"),
        "svg" => Ok("svg"),
        _ => Err(ListEditorError::UnsupportedIconType),
    }
}

fn validate_icon_bytes(extension: &str, bytes: &[u8]) -> Result<(), ListEditorError> {
    if bytes.is_empty() {
        return Err(ListEditorError::EmptyIcon);
    }
    if bytes.len() > MAX_ICON_BYTES {
        return Err(ListEditorError::IconTooLarge);
    }

    match extension {
        "png" if bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]) => Ok(()),
        "jpg" if bytes.starts_with(&[0xff, 0xd8, 0xff]) => Ok(()),
        "svg" => {
            let text = std::str::from_utf8(bytes).map_err(|_| ListEditorError::InvalidSvg)?;
            let lower = text
                .trim_start_matches('\u{feff}')
                .trim_start()
                .to_ascii_lowercase();
            let has_svg_root =
                lower.starts_with("<svg") || (lower.starts_with("<?xml") && lower.contains("<svg"));
            let contains_unsafe_markup = lower.contains("<script")
                || lower.contains("javascript:")
                || lower.contains("<!doctype");
            if !has_svg_root || contains_unsafe_markup {
                return Err(ListEditorError::InvalidSvg);
            }
            Ok(())
        }
        _ => Err(ListEditorError::UnsupportedIconType),
    }
}

fn resolve_owned_icon(app_dir: &Path, relative: &str) -> Option<PathBuf> {
    let path = Path::new(relative);
    let mut components = path.components();
    match (components.next(), components.next(), components.next()) {
        (Some(Component::Normal(directory)), Some(Component::Normal(filename)), None)
            if directory == ICON_DIRECTORY && !filename.is_empty() =>
        {
            Some(app_dir.join(ICON_DIRECTORY).join(filename))
        }
        _ => None,
    }
}

fn write_imported_icon(app_dir: &Path, upload: &ListIconUpload) -> Result<String, ListEditorError> {
    let extension = normalized_extension(&upload.filename)?;
    validate_icon_bytes(extension, &upload.bytes)?;

    let directory = app_dir.join(ICON_DIRECTORY);
    std::fs::create_dir_all(&directory)?;
    let filename = format!("{}.{}", uuid::Uuid::new_v4(), extension);
    let final_path = directory.join(&filename);
    let temporary_path = directory.join(format!(".{filename}.tmp"));

    std::fs::write(&temporary_path, &upload.bytes)?;
    if let Err(error) = std::fs::rename(&temporary_path, &final_path) {
        let _ = std::fs::remove_file(&temporary_path);
        return Err(ListEditorError::Io(error));
    }

    Ok(format!("{ICON_DIRECTORY}/{filename}"))
}

fn cleanup_icon(app_dir: &Path, relative: &str) {
    let Some(path) = resolve_owned_icon(app_dir, relative) else {
        eprintln!("Warning: refusing to remove non-owned list icon path: {relative}");
        return;
    };
    match std::fs::remove_file(&path) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => {
            eprintln!("Warning: list mutation committed but old icon cleanup failed: {error}")
        }
    }
}

fn open_database(app_dir: &Path) -> Result<rusqlite::Connection, ListEditorError> {
    let connection = rusqlite::Connection::open(app_dir.join("narro.db"))
        .map_err(ListEditorError::OpenDatabase)?;
    persistence::configure_connection(&connection).map_err(ListEditorError::ConfigureDatabase)?;
    Ok(connection)
}

pub fn create(
    app_dir: &Path,
    request: ListEditorRequest,
    now: &str,
) -> Result<ListRecord, ListEditorError> {
    validate_color(request.color.as_deref())?;
    let mut connection = open_database(app_dir)?;
    let imported = request
        .icon_upload
        .as_ref()
        .map(|upload| write_imported_icon(app_dir, upload))
        .transpose()?;

    let result = create_list(
        &mut connection,
        NewListInput {
            title: request.title,
            color: request.color,
            icon_asset: imported.clone(),
        },
        now,
    );

    match result {
        Ok(created) => Ok(created),
        Err(error) => {
            if let Some(relative) = imported.as_deref() {
                cleanup_icon(app_dir, relative);
            }
            Err(ListEditorError::Store(error))
        }
    }
}

pub fn update(
    app_dir: &Path,
    id: ListId,
    request: ListEditorRequest,
    now: &str,
) -> Result<ListRecord, ListEditorError> {
    validate_color(request.color.as_deref())?;
    let mut connection = open_database(app_dir)?;
    let existing = get_list(&connection, id)?;
    let imported = request
        .icon_upload
        .as_ref()
        .map(|upload| write_imported_icon(app_dir, upload))
        .transpose()?;
    let next_icon = imported.clone().or_else(|| existing.icon_asset.clone());

    let result = update_list(
        &mut connection,
        id,
        UpdateListInput {
            title: request.title,
            color: request.color,
            icon_asset: next_icon,
        },
        now,
    );

    match result {
        Ok(updated) => {
            if imported.is_some() {
                if let Some(previous) = existing.icon_asset.as_deref() {
                    cleanup_icon(app_dir, previous);
                }
            }
            Ok(updated)
        }
        Err(error) => {
            if let Some(relative) = imported.as_deref() {
                cleanup_icon(app_dir, relative);
            }
            Err(ListEditorError::Store(error))
        }
    }
}

fn command_error(error: ListEditorError) -> CommandError {
    let code = match &error {
        ListEditorError::InvalidColor
        | ListEditorError::EmptyIcon
        | ListEditorError::IconTooLarge
        | ListEditorError::UnsupportedIconType
        | ListEditorError::InvalidSvg => "LIST_EDITOR_INVALID_INPUT",
        ListEditorError::Store(ListStoreError::NotFound(_)) => "LIST_EDITOR_NOT_FOUND",
        _ => "LIST_EDITOR_FAILED",
    };
    CommandError::new(code, error.to_string())
}

fn app_data_dir(app_handle: &tauri::AppHandle) -> CommandResult<PathBuf> {
    app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "LIST_EDITOR_FAILED",
            format!("failed to resolve Narro app-data directory: {error}"),
        )
    })
}

#[tauri::command]
pub fn create_list_from_editor(
    app_handle: tauri::AppHandle,
    request: ListEditorRequest,
) -> CommandResult<()> {
    let app_dir = app_data_dir(&app_handle)?;
    let now = chrono::Utc::now().to_rfc3339();
    create(&app_dir, request, &now)
        .map(|_| ())
        .map_err(command_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_list_from_editor(
    app_handle: tauri::AppHandle,
    list_id: String,
    request: ListEditorRequest,
) -> CommandResult<()> {
    let id = ListId::parse_str(&list_id)
        .map_err(|_| CommandError::invalid_argument("listId", "must be a valid UUID"))?;
    let app_dir = app_data_dir(&app_handle)?;
    let now = chrono::Utc::now().to_rfc3339();
    update(&app_dir, id, request, &now)
        .map(|_| ())
        .map_err(command_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::run_migrations;

    fn test_app_dir() -> PathBuf {
        std::env::temp_dir().join(format!("narro-list-editor-{}", uuid::Uuid::new_v4()))
    }

    fn setup(app_dir: &Path) {
        std::fs::create_dir_all(app_dir).expect("create test app dir");
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open test db");
        run_migrations(&mut connection).expect("run migrations");
    }

    #[test]
    fn create_and_update_are_persistence_first_and_keep_owned_icon_path() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let png = vec![0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
        let created = create(
            &app_dir,
            ListEditorRequest {
                title: " Work ".into(),
                color: Some("#48d6c5".into()),
                icon_upload: Some(ListIconUpload {
                    filename: "work.png".into(),
                    bytes: png,
                }),
            },
            "2026-09-08T00:00:00Z",
        )
        .expect("create list");
        assert_eq!(created.title, "Work");
        let icon = created.icon_asset.clone().expect("stored icon path");
        assert!(icon.starts_with("list-icons/"));
        assert!(resolve_owned_icon(&app_dir, &icon)
            .expect("owned path")
            .exists());

        let updated = update(
            &app_dir,
            created.id,
            ListEditorRequest {
                title: "Deep Work".into(),
                color: Some("#b7d96d".into()),
                icon_upload: None,
            },
            "2026-09-08T00:01:00Z",
        )
        .expect("update list");
        assert_eq!(updated.title, "Deep Work");
        assert_eq!(updated.icon_asset.as_deref(), Some(icon.as_str()));
        std::fs::remove_dir_all(app_dir).expect("remove test app dir");
    }

    #[test]
    fn create_database_open_failure_does_not_leave_imported_icon() {
        let app_dir = test_app_dir();
        std::fs::create_dir_all(&app_dir).expect("create test app dir");
        std::fs::create_dir_all(app_dir.join("narro.db")).expect("block database file path");

        let error = create(
            &app_dir,
            ListEditorRequest {
                title: "Work".into(),
                color: Some("#48d6c5".into()),
                icon_upload: Some(ListIconUpload {
                    filename: "work.png".into(),
                    bytes: vec![0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0],
                }),
            },
            "2026-09-08T00:00:00Z",
        )
        .expect_err("database open must fail");

        assert!(matches!(error, ListEditorError::OpenDatabase(_)));
        assert!(
            !app_dir.join(ICON_DIRECTORY).exists(),
            "failed create must not write an imported icon before the database is available"
        );
        std::fs::remove_dir_all(app_dir).expect("remove test app dir");
    }

    #[test]
    fn rejects_invalid_color_and_spoofed_icon_content_before_database_mutation() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let invalid_color = create(
            &app_dir,
            ListEditorRequest {
                title: "List".into(),
                color: Some("red".into()),
                icon_upload: None,
            },
            "2026-09-08T00:00:00Z",
        )
        .expect_err("invalid color must fail");
        assert!(matches!(invalid_color, ListEditorError::InvalidColor));

        let spoofed = create(
            &app_dir,
            ListEditorRequest {
                title: "List".into(),
                color: None,
                icon_upload: Some(ListIconUpload {
                    filename: "fake.png".into(),
                    bytes: b"not a png".to_vec(),
                }),
            },
            "2026-09-08T00:00:00Z",
        )
        .expect_err("spoofed icon must fail");
        assert!(matches!(spoofed, ListEditorError::UnsupportedIconType));
        let connection = rusqlite::Connection::open(app_dir.join("narro.db")).expect("open db");
        assert!(crate::persistence::lists::active_lists(&connection)
            .expect("read lists")
            .is_empty());
        drop(connection);
        std::fs::remove_dir_all(app_dir).expect("remove test app dir");
    }

    #[test]
    fn rejects_scripted_svg() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let error = create(
            &app_dir,
            ListEditorRequest {
                title: "Unsafe".into(),
                color: None,
                icon_upload: Some(ListIconUpload {
                    filename: "unsafe.svg".into(),
                    bytes: br#"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"#.to_vec(),
                }),
            },
            "2026-09-08T00:00:00Z",
        )
        .expect_err("scripted svg must fail");
        assert!(matches!(error, ListEditorError::InvalidSvg));
        std::fs::remove_dir_all(app_dir).expect("remove test app dir");
    }
}
