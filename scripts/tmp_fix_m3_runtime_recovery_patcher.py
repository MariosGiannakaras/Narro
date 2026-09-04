from pathlib import Path

path = Path("scripts/tmp_m3_runtime_recovery_patch.py")
text = path.read_text(encoding="utf-8")

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

old_open_binding = '''replace_region(
    runtime_path,
    "fn open_binding(",
    "}",
    """fn encoded_checkpoint(\n    engine: &TimerEngine,\n    now_ms: u64,\n) -> Result<String, TimerRuntimeError> {\n    let checkpoint = engine.recovery_checkpoint(now_ms)?;\n    serde_json::to_string(&checkpoint).map_err(TimerRuntimeError::from)\n}\n\nfn open_binding(\n    conn: &mut Connection,\n    binding: &SessionBinding,\n    wall_time: &str,\n    runtime_checkpoint_json: &str,\n) -> Result<SessionRecord, TimerRuntimeError> {\n    match binding.kind {\n        SessionKind::Work => open_focus_work_session_with_runtime_checkpoint(\n            conn,\n            binding.task_id.ok_or(TimerRuntimeError::BindingMismatch)?,\n            wall_time,\n            runtime_checkpoint_json,\n        )\n        .map_err(TimerRuntimeError::from),\n        SessionKind::Break => open_focus_break_session_with_runtime_checkpoint(\n            conn,\n            binding.task_id,\n            wall_time,\n            runtime_checkpoint_json,\n        )\n        .map_err(TimerRuntimeError::from),\n    }\n}""",
)
'''
new_open_binding = '''p = Path(runtime_path)
text = p.read_text(encoding="utf-8")
start = text.find("fn open_binding(")
if start < 0:
    raise SystemExit(f"{runtime_path}: open_binding anchor not found")
text = text[:start] + """fn encoded_checkpoint(\n    engine: &TimerEngine,\n    now_ms: u64,\n) -> Result<String, TimerRuntimeError> {\n    let checkpoint = engine.recovery_checkpoint(now_ms)?;\n    serde_json::to_string(&checkpoint).map_err(TimerRuntimeError::from)\n}\n\nfn open_binding(\n    conn: &mut Connection,\n    binding: &SessionBinding,\n    wall_time: &str,\n    runtime_checkpoint_json: &str,\n) -> Result<SessionRecord, TimerRuntimeError> {\n    match binding.kind {\n        SessionKind::Work => open_focus_work_session_with_runtime_checkpoint(\n            conn,\n            binding.task_id.ok_or(TimerRuntimeError::BindingMismatch)?,\n            wall_time,\n            runtime_checkpoint_json,\n        )\n        .map_err(TimerRuntimeError::from),\n        SessionKind::Break => open_focus_break_session_with_runtime_checkpoint(\n            conn,\n            binding.task_id,\n            wall_time,\n            runtime_checkpoint_json,\n        )\n        .map_err(TimerRuntimeError::from),\n    }\n}\n"""
p.write_text(text, encoding="utf-8")
'''
if text.count(old_open_binding) != 1:
    raise SystemExit(f"expected one open-binding replacement block, found {text.count(old_open_binding)}")
text = text.replace(old_open_binding, new_open_binding)

old_import = "use narro_lib::domain::ids::{ListId, TaskId};"
if text.count(old_import) != 1:
    raise SystemExit(f"expected one recovery-test ID import, found {text.count(old_import)}")
text = text.replace(old_import, "use narro_lib::domain::ids::TaskId;")

path.write_text(text, encoding="utf-8")
print("Temporary M3 recovery patcher hardened")
