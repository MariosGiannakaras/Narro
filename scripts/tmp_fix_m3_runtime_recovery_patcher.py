from pathlib import Path
import re

path = Path("scripts/tmp_m3_runtime_recovery_patch.py")
text = path.read_text(encoding="utf-8")

migration_replacement = '''Path("src-tauri/migrations/0004_timer_runtime_checkpoint.sql").write_text(
    """-- Migration 04: Durable timer-runtime recovery checkpoint
-- The authoritative runtime checkpoint is stored only on the currently open session row.
-- Closed historical sessions may retain their last checkpoint for diagnostics, but recovery
-- always reads the single unfinished session selected by sessions_single_open_idx.

ALTER TABLE sessions ADD COLUMN runtime_checkpoint_json TEXT;
""",
    encoding="utf-8",
)
'''
migration_pattern = re.compile(
    r'Path\("src-tauri/migrations/0004_timer_runtime_checkpoint\.sql"\)\.write_text\(.*?\n\)\n',
    re.DOTALL,
)
text, count = migration_pattern.subn(migration_replacement, text, count=1)
if count != 1:
    raise SystemExit(f"expected one migration generator block, found {count}")

old_loop = '''for method in ["advance", "pause", "resume", "extend"]:
    old = "self.commit_candidate(conn, engine, snapshot, wall_time, " + ("checkpoint_same" if method == "advance" else "true") + ")"
    new = "self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, " + ("checkpoint_same" if method == "advance" else "true") + ")"
    replace_once(runtime_path, old, new)
'''
new_loop = '''replace_once(
    runtime_path,
    "self.commit_candidate(conn, engine, snapshot, wall_time, checkpoint_same)",
    "self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, checkpoint_same)",
)
p = Path(runtime_path)
text = p.read_text(encoding="utf-8")
old_true = "self.commit_candidate(conn, engine, snapshot, wall_time, true)"
if text.count(old_true) != 3:
    raise SystemExit(f"{runtime_path}: expected 3 true commit anchors, found {text.count(old_true)}")
p.write_text(
    text.replace(
        old_true,
        "self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, true)",
    ),
    encoding="utf-8",
)
'''
if text.count(old_loop) != 1:
    raise SystemExit(f"expected one commit-candidate loop block, found {text.count(old_loop)}")
text = text.replace(old_loop, new_loop)

replacement = '''p = Path(runtime_path)
text = p.read_text(encoding="utf-8")
start = text.find("fn open_binding(")
if start < 0:
    raise SystemExit(f"{runtime_path}: open_binding anchor not found")
text = text[:start] + """fn encoded_checkpoint(\\n    engine: &TimerEngine,\\n    now_ms: u64,\\n) -> Result<String, TimerRuntimeError> {\\n    let checkpoint = engine.recovery_checkpoint(now_ms)?;\\n    serde_json::to_string(&checkpoint).map_err(TimerRuntimeError::from)\\n}\\n\\nfn open_binding(\\n    conn: &mut Connection,\\n    binding: &SessionBinding,\\n    wall_time: &str,\\n    runtime_checkpoint_json: &str,\\n) -> Result<SessionRecord, TimerRuntimeError> {\\n    match binding.kind {\\n        SessionKind::Work => open_focus_work_session_with_runtime_checkpoint(\\n            conn,\\n            binding.task_id.ok_or(TimerRuntimeError::BindingMismatch)?,\\n            wall_time,\\n            runtime_checkpoint_json,\\n        )\\n        .map_err(TimerRuntimeError::from),\\n        SessionKind::Break => open_focus_break_session_with_runtime_checkpoint(\\n            conn,\\n            binding.task_id,\\n            wall_time,\\n            runtime_checkpoint_json,\\n        )\\n        .map_err(TimerRuntimeError::from),\\n    }\\n}\\n"""
p.write_text(text, encoding="utf-8")
'''
pattern = re.compile(
    r'replace_region\(\n\s*runtime_path,\n\s*"fn open_binding\(",.*?\n\)\n\n(?=Path\("src-tauri/tests/timer_runtime_recovery\.rs"\))',
    re.DOTALL,
)
text, count = pattern.subn(replacement + "\n", text, count=1)
if count != 1:
    raise SystemExit(f"expected one structural open-binding replacement block, found {count}")

old_import = "use narro_lib::domain::ids::{ListId, TaskId};"
if text.count(old_import) != 1:
    raise SystemExit(f"expected one recovery-test ID import, found {text.count(old_import)}")
text = text.replace(old_import, "use narro_lib::domain::ids::TaskId;")

old_drop = "    drop(runtime);\n"
if text.count(old_drop) != 4:
    raise SystemExit(f"expected four non-Drop runtime test drops, found {text.count(old_drop)}")
text = text.replace(old_drop, "")

path.write_text(text, encoding="utf-8")
print("Temporary M3 recovery patcher hardened")
