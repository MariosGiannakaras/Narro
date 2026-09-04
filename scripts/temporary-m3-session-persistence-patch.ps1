$ErrorActionPreference = 'Stop'

function Replace-Exact([string]$Path, [string]$Old, [string]$New) {
  $content = Get-Content $Path -Raw
  if (-not $content.Contains($Old)) {
    throw "Expected patch target missing in $Path"
  }
  $content = $content.Replace($Old, $New)
  Set-Content $Path $content -Encoding utf8
}

Replace-Exact 'src-tauri/src/persistence/mod.rs' @'
pub mod recurrence;
pub mod subtasks;
'@ @'
pub mod recurrence;
pub mod sessions;
pub mod subtasks;
'@

Replace-Exact 'src-tauri/src/persistence/mod.rs' @'
        M::up(include_str!("../../migrations/0002_domain_foundation.sql")),
    ])
'@ @'
        M::up(include_str!("../../migrations/0002_domain_foundation.sql")),
        M::up(include_str!("../../migrations/0003_session_runtime.sql")),
    ])
'@

Replace-Exact 'src-tauri/src/persistence/sessions.rs' @'
    DurationOverflow,
    EndBeforeStart,
    CorruptIdentity {
'@ @'
    DurationOverflow,
    EndBeforeStart,
    TimestampBeforePreviousUpdate,
    CorruptIdentity {
'@

Replace-Exact 'src-tauri/src/persistence/sessions.rs' @'
            Self::EndBeforeStart => {
                formatter.write_str("session end/checkpoint timestamp cannot precede start")
            }
            Self::CorruptIdentity { field, value } => {
'@ @'
            Self::EndBeforeStart => {
                formatter.write_str("session end/checkpoint timestamp cannot precede start")
            }
            Self::TimestampBeforePreviousUpdate => formatter.write_str(
                "session mutation timestamp cannot precede the previous persisted update",
            ),
            Self::CorruptIdentity { field, value } => {
'@

Replace-Exact 'src-tauri/src/persistence/sessions.rs' @'
fn duration_for_sql(value: u64) -> Result<i64, SessionStoreError> {
'@ @'
fn ensure_not_before_previous_update(
    updated_at: &str,
    now: &str,
) -> Result<(), SessionStoreError> {
    let previous = parsed_stored_timestamp(updated_at)?;
    let now = DateTime::parse_from_rfc3339(now)
        .map_err(|_| SessionStoreError::InvalidMutationTimestamp)?;
    if now < previous {
        return Err(SessionStoreError::TimestampBeforePreviousUpdate);
    }
    Ok(())
}

fn duration_for_sql(value: u64) -> Result<i64, SessionStoreError> {
'@

Replace-Exact 'src-tauri/src/persistence/sessions.rs' @'
    ensure_not_before_start(&current.started_at, now)?;
    if duration_seconds < current.duration_seconds {
'@ @'
    ensure_not_before_start(&current.started_at, now)?;
    ensure_not_before_previous_update(&current.updated_at, now)?;
    if duration_seconds < current.duration_seconds {
'@

Replace-Exact 'src-tauri/src/persistence/sessions.rs' @'
    ensure_not_before_start(&current.started_at, ended_at)?;
    if duration_seconds < current.duration_seconds {
'@ @'
    ensure_not_before_start(&current.started_at, ended_at)?;
    ensure_not_before_previous_update(&current.updated_at, ended_at)?;
    if duration_seconds < current.duration_seconds {
'@

Replace-Exact 'src-tauri/src/persistence/sessions.rs' @'
        let (mut conn, task_id) = fixture();
        let list_id: TaskId = task_id;
        let owning_list = conn
'@ @'
        let (mut conn, task_id) = fixture();
        let owning_list = conn
'@

Replace-Exact 'src-tauri/src/persistence/sessions.rs' @'
            .unwrap();
        let _ = list_id;
        archive_list(&mut conn, owning_list, T1).unwrap();
'@ @'
            .unwrap();
        archive_list(&mut conn, owning_list, T1).unwrap();
'@

cargo fmt --manifest-path src-tauri/Cargo.toml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
