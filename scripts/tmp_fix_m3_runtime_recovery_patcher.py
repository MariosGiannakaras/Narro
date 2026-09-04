from pathlib import Path

path = Path("scripts/tmp_m3_runtime_recovery_patch.py")
text = path.read_text(encoding="utf-8")
old = '''for method in ["advance", "pause", "resume", "extend"]:
    old = "self.commit_candidate(conn, engine, snapshot, wall_time, " + ("checkpoint_same" if method == "advance" else "true") + ")"
    new = "self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, " + ("checkpoint_same" if method == "advance" else "true") + ")"
    replace_once(runtime_path, old, new)
'''
new = '''replace_once(
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
if text.count(old) != 1:
    raise SystemExit(f"expected one loop block, found {text.count(old)}")
path.write_text(text.replace(old, new), encoding="utf-8")
