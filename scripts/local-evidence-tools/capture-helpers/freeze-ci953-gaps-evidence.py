import csv
import hashlib
import json
import pathlib
import shutil
import zipfile
from datetime import datetime

ROOT = pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload')
MAIN = pathlib.Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
P = ROOT / 'artifacts/m7-ci953-gaps-20261005'
ARCHIVE = MAIN / 'work-log/evidence/m7-ci953-gaps-20261005'
PREVIOUS = MAIN / 'work-log/evidence/m7-ci953-interfaces-20261005'
SOURCE = '38219e200fe3bec7309f8e03e72003184ca86d08'
EXE_SHA = 'bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8'
ANCHOR = datetime.fromisoformat('2026-10-05T09:45:15.096479+00:00')
DURATION = 1088.7

def read(p):
    return json.loads(p.read_text(encoding='utf-8-sig'))

def write(p, value):
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

def sha(p):
    return hashlib.file_digest(p.open('rb'), 'sha256').hexdigest()

def offset(utc):
    return round((datetime.fromisoformat(utc.replace('Z', '+00:00')) - ANCHOR).total_seconds(), 3)

assert sha(ROOT / 'artifacts/m7-pr235-ci953/candidate/narro-m7-validation.exe') == EXE_SHA
assert sha(P / 'video/2026-10-05 12-45-14.mkv') == '738178d1e1d60ad03bb60fb0e3d34e4d9c5e2dab1d524dd01d9d43538d53892d'
assert sha(P / 'video/2026-10-05 12-45-14.mkv') == sha(ROOT / 'artifacts/m7-pr234-native-20261005/video/2026-10-05 12-45-14.mkv')
assert sha(P / 'video/2026-10-05-gaps-full.mp4') == '70f64fceff1a7a9f71f213c1c84434570a9a215b4551b5bfd0f564b5801605fc'
logs = {p.relative_to(P).as_posix(): sha(p) for p in (P / 'Narro-M7-Logs').rglob('*') if p.is_file()}
with zipfile.ZipFile(P / 'Narro-M7-Logs.zip') as z:
    assert z.testzip() is None
    assert set(z.namelist()) == set(logs)
    assert all(hashlib.sha256(z.read(n)).hexdigest() == h for n, h in logs.items())
assert len(logs) == 11
write(P / 'inventory/logs-integrity.json', {'files': len(logs), 'zipAllFilesByteIdentical': True, 'sha256': logs, 'liveSessionIsBoundedSnapshot': True})

# Preserve both raw inputs; curate only parseable timestamped native records.
rows = []
seen = set()
for name in ['actions.jsonl', 'raw-actions.log']:
    for line_no, line in enumerate((P / name).read_text(encoding='utf-8-sig').splitlines(), 1):
        try:
            row = json.loads(line)
        except ValueError:
            continue
        if not isinstance(row, dict) or 'utc' not in row:
            continue
        key = json.dumps(row, sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        row = dict(row, evidenceInput=f'{name}:{line_no}', originalApproxSeconds=offset(row['utc']))
        rows.append(row)
rows.sort(key=lambda r: r['utc'])
(P / 'chronological-actions.jsonl').write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8', newline='\n')
with (P / 'chronological-actions.csv').open('w', encoding='utf-8', newline='') as f:
    w = csv.writer(f)
    w.writerow(['utc', 'original_approx_seconds', 'action', 'target_or_note', 'mode', 'raw_input'])
    for r in rows:
        target = r.get('button', r.get('name', r.get('chord', r.get('field', r.get('observation', r.get('request', ''))))))
        w.writerow([r['utc'], r['originalApproxSeconds'], r['action'], target, r.get('mode', ''), r['evidenceInput']])

specs = [
    ('M7-A08', '09:47:10.9536328', '09:47:28.2261179', 'Six populated Timer action slots: normal/reduced pointer hover; locate already captured in previous packet.', ['observations/hover-normal-start-break.json', 'observations/hover-reduced-start-break.json', 'chronological-actions.jsonl']),
    ('M5-A02', '09:47:31.3146330', '09:48:50.3737064', 'Actual long unbroken subtask title editor, Save edited text, restore original Save, reopen and Cancel.', ['observations/02-main-long-subtask-edit.json', 'inventory/ledger-verification.json', 'chronological-actions.jsonl']),
    ('M5-A06', '09:49:43.7909528', '09:50:57.8327689', 'Planning title focus and actual Tab/Shift+Tab, pointer title hover, all five action slots normal/reduced.', ['observations/rail-normal-keyboard-return.json', 'observations/rail-reduced-keyboard-return.json', 'observations/rail-normal-full-sweep.json', 'observations/rail-reduced-full-sweep.json']),
    ('M9-A02', '09:50:58.8253109', '09:52:59.8606560', 'This week Apply gives Oct05-Oct05 (today Monday); Last30days Apply restores Sep05-Oct05.', ['observations/04-date-this-week-preview.json', 'observations/05-date-this-week-applied.json', 'observations/06-date-restored-and-tabs.json']),
    ('M9-A04', '09:53:01.4051292', '09:53:59.8753038', 'Sessions Break filter actually toggled Off->On->Off with no Add/Edit modal present.', ['observations/filter-before.json', 'observations/filter-hidden.json', 'observations/filter-restored.json', 'chronological-actions.jsonl']),
    ('M9-A05', '09:53:59.9172852', '10:03:20.2364905', 'Owned manual Add120s, displayed end-time inline Edit180s, Save restore120s; Escape leaves inline editor open, draft restored and detail explicitly closed. Add Cancel was captured in previous packet. No separate Edit Session modal claim.', ['observations/08-owned-add-manual-modal.json', 'observations/15-manual-time-edit-affordance.json', 'observations/16-manual-edited-3min.json', 'observations/17-manual-inline-edit-escape.json', 'inventory/ledger-verification.json']),
]
old_matrix = read(PREVIOUS / 'acquisition-matrix.json')
partial_ids = {r['id'] for r in old_matrix if r['acquisition'] == 'PARTIAL'}
assert partial_ids == {r[0] for r in specs}
closure = []
for cell_id, start, end, description, evidence in specs:
    s, e = f'2026-10-05T{start}Z', f'2026-10-05T{end}Z'
    for item in evidence:
        assert (P / item).is_file(), item
    closure.append({'id': cell_id, 'previousAcquisition': 'PARTIAL', 'acquisition': 'CAPTURED', 'review': 'OPEN', 'description': description, 'utcStart': s, 'utcEnd': e, 'originalApproxSeconds': [offset(s), offset(e)], 'evidence': evidence, 'limits': 'Acquisition closure only. Continuous/static/canonical requirement review remains OPEN; no new visual PASS.'})
write(P / 'acquisition-closure-matrix.json', closure)
merged = []
for row in old_matrix:
    row = dict(row, originalPacket='m7-ci953-interfaces-20261005')
    if row['id'] in partial_ids:
        row.update(acquisition='CAPTURED', closurePacket='m7-ci953-gaps-20261005', closureMatrix='acquisition-closure-matrix.json', limits='Original partial scope completed by closure packet. Visual/source/motion review OPEN.')
    merged.append(row)
write(P / 'current-acquisition-matrix.json', merged)
progress = read(PREVIOUS / 'visual-progress.json')
progress['explicitAddendum'].update(captureReady=30, partial=0)
progress['acquisitionClosureOnly'] = {'cells': 6, 'newReviewCells': 0, 'visualReviewedDelta': 0, 'sourcePacket': 'm7-ci953-gaps-20261005'}
write(P / 'visual-progress.json', progress)

bookmarks = [r for r in rows if r['action'] == 'bookmark']
write(P / 'observations/bookmarks.json', bookmarks)
matrix = [
    {'milestone': 'M1', 'disposition': 'OPEN / reused FAIL27', 'evidence': 'inventory/displays-before.json; inventory/displays-after.json', 'limits': 'One LG125% only; no new dual/topology/sleep/cable/quiet performance validation. Explicit selected-monitor DPI recovery remains failed.'},
    {'milestone': 'M2', 'disposition': 'Existing acceptance unchanged; narrow identity corroboration', 'evidence': 'inventory/ledger-verification.json', 'limits': 'No new milestone acceptance claim or implementation counter.'},
    {'milestone': 'M3', 'disposition': 'Existing acceptance unchanged; paused ledger corroboration', 'evidence': 'inventory/ledger-before.json; inventory/ledger-after.json', 'limits': 'Active846s/801308ms checkpoint unchanged; new owned manual session+120s explicitly retained.'},
    {'milestone': 'M4', 'disposition': 'No sufficient new exercise', 'evidence': 'chronological-actions.jsonl', 'limits': 'No scheduling acceptance inferred.'},
    {'milestone': 'M5', 'disposition': 'CAPTURED / visual OPEN', 'evidence': 'M5-A02; M5-A06 in acquisition-closure-matrix.json', 'limits': 'Source/continuous comparison pending; no-drag focus does not resolve post-drag observation28.'},
    {'milestone': 'M6', 'disposition': 'Reuse previous populated packet / visual OPEN', 'evidence': '../m7-ci953-interfaces-20261005/acquisition-matrix.json', 'limits': 'No broad Focus/source acceptance claim; selected-monitor dependency27 still open.'},
    {'milestone': 'M7', 'disposition': 'M7-A08 CAPTURED / C4 OPEN', 'evidence': 'acquisition-closure-matrix.json; observations/18-final-paused-compact.json', 'limits': 'Same Focus HWND7471826; historical953 C5 PASS reused, no new tray/relaunch test. No full motion acceptance.'},
    {'milestone': 'M8', 'disposition': 'No new acceptance; preferences unchanged', 'evidence': 'inventory/ledger-verification.json', 'limits': 'Prior Preferences/shortcut capture reusable; selection27 and source gates remain open.'},
    {'milestone': 'M9', 'disposition': 'Date/filter/manual writes functionally corroborated; visual OPEN', 'evidence': 'M9-A02/M9-A04/M9-A05 in acquisition-closure-matrix.json', 'limits': 'Bookmarks30/31 REVIEW_PENDING. Add uses modal; end-time Edit is inline. No canonical/whole Reports acceptance.'},
]
write(P / 'session-m1-m9-matrix.json', matrix)
write(P / 'provenance.json', {'source': SOURCE, 'ci': 953, 'runId': 37258629373, 'artifactId': 11324640580, 'exeSha256': EXE_SHA, 'runtimePid': 141908, 'focusHwnd': 7471826, 'mainHwnd': 3213706, 'canvas': '4480x1080', 'fps': 60, 'activeDisplay': 'LG1920x1080/125%', 'ultragearActive': False, 'obsStartUtc': '2026-10-05T09:45:14.549Z', 'firstFileCreationUtcApprox': '2026-10-05T09:45:15.0964794Z', 'obsStopFlushUtc': '2026-10-05T10:03:23.780Z', 'durationSeconds': DURATION, 'actionRows': len(rows), 'offsetUncertaintySeconds': 1, 'obsFramesOutput': 65321, 'obsFramesDrawn': 65354, 'lastRecordingLagCount': 'Not reported; no zero-lag inference', 'obsStopped': True, 'noSourceBuildTestCiChanges': True})

readme = f'''# CI953 acquisition gap closure — whole evidence

This packet completes capture of the **six existing partial cells** in [the earlier populated-interface packet](../m7-ci953-interfaces-20261005/README.md). It adds no review denominator. Current registered visual review is **44/100 reviewed, 56 OPEN**; the appended30 cells are now30/30 capture-ready and0/30 visually reviewed. M1 1/1 examined FAIL27; M5 12/25; M6 16/31; M7 13/29; M8 2/8; M9 0/6. These are campaign review counts, not whole-product UI or milestone implementation completion.

## Whole media and navigation

- [Whole original OBS MKV — 18m08.7s](video/2026-10-05%2012-45-14.mkv)
- [Whole playable H264/AAC MP4 — stream-copy remux](video/2026-10-05-gaps-full.mp4)
- [Chronological CSV](chronological-actions.csv) and [{len(rows)} curated native actions](chronological-actions.jsonl); original [raw actions](actions.jsonl) and [mixed tool output](raw-actions.log) remain intact.
- [Six-cell capture closure](acquisition-closure-matrix.json), [current30-cell acquisition matrix](current-acquisition-matrix.json), [unchanged review counts](visual-progress.json), [M1–M9 session dispositions](session-m1-m9-matrix.json).
- [Whole11-file Narro-M7-Logs](Narro-M7-Logs) and [byte-verified ZIP](Narro-M7-Logs.zip).
- [Before/after data verification](inventory/ledger-verification.json), [capture provenance](provenance.json), [media probe](inventory/recording-ffprobe.json), [whole OBS log](inventory/obs-recording-log.txt).

The4480x1080/60fps canvas retains the original dual layout, but only LG1920x1080/125% was active. Do not infer two-display validation from canvas width. Offsets use original file creation09:45:15.096Z as an approximate anchor (±1s); exact native UTC actions are authoritative. There are adaptive UIA/state-inspection waits; blank/idle spans do not prove acceptance. Original audio is retained. The original-derived600s health frame was inspected only to confirm capture/surface health, not to advance a review cell.

## Captured behavior, not visual PASS

| Existing cell | Approximate original seconds | Exercise |
| --- | --- | --- |
| M7-A08 |116–133|All six populated Timer action-hover slots, normal/reduced; prior packet has actual locate.|
| M5-A02 |136–215|Actual long subtask title edit/Save/restore/Cancel.|
| M5-A06 |269–343|Planning title keyboard focus, Tab/Shift+Tab, hover and all five action slots normal/reduced.|
| M9-A02 |344–465|This week Apply then Last30days Apply restoration.|
| M9-A04 |466–525|Actual Break filter Off→On→Off with no Add/Edit modal.|
| M9-A05 |525–1085|Owned manual Add120s; actual end-time inline Edit180s→120s; Escape/recovery/detail close.|

Normal/reduced fresh planning-title focus exposes one Task actions button. This path had no preceding drag, so it does not resolve observation28 (post-drag keyboard rail). Reports date Apply produces Oct05–Oct05 (today is Monday), then restores Sep05–Oct05. Filter native caption/toggle state is Hide/Off→Show/On→Hide/Off. Do not infer hidden Break-row content beyond the captured owned table.

## Bookmarks for later requirement/source review

**30 / REVIEW_PENDING:** Add Session Recent Tasks picker has a visibly present horizontal scrollbar with the supplied long fixtures. Bookmark686.9s, navigation image below, and original600s frame preserve it. This is a distinct surface from provider inconsistency23; no reconciliation or source fix was performed.

**31 / REVIEW_PENDING:** actual manual Edit is reached through the displayed end-time button, not the Delete-only session menu. Native inline spinner/Save controls are present at~919.8s. Actual Save changes120→180→120 on the same session ID. Escape at~1009.9s leaves the inline editor open (probe~1010.9s); draft is restored/Save and task detail closed~1084–1085s. The raw bookmark notes an unsaved minute increment; the standalone increment lacks its own curated action row, so review the continuous interval before a stronger unsaved-value claim. A missing Edit Session modal is not a demonstrated defect. Older Add-modal Escape29 remains separate and pending.

![Original-derived capture-health frame at600s; Add Session picker](inventory/recording-health-frame.png)

[Native navigation image](observations/navigation-manual-add.png) is a navigation aid, not a canonical/source-parity comparison. No new gallery/whole-video visual review is claimed in this acquisition-only phase.

## Exact build, data and continuation

Exact source `{SOURCE}`, full Windows [CI953](https://github.com/MariosGiannakaras/Narro/actions/runs/37258629373), artifact11324640580, EXE SHA256 `{EXE_SHA}`. Runtime141908 / persistent Focus7471826 / Main3213706. No app source/test/build/CI changes. Pre/post TODO/HANDOFF/crosswalk snapshots are retained in inventory. Historical953 C5 PASS is preserved in the whole logs; no tray Quit/relaunch test was rerun here. Live-session logs are a bounded snapshot, not a normal-exit proof.

Checkpoint payload and timestamp, preferences, existing task identities/list/lane/notes and existing sessions are unchanged. Four subtasks restore the same semantic data/order/incomplete state; only long-row2 updated_at changed legitimately. Active task stays paused846s/801308ms. A new owned manual-origin work session `e5487664-fcae-439a-86eb-e712bc873eb4` remains on owned English companion task `32fd4eee-8543-4cc1-9f63-39b44ba89178`, start09:54Z/end09:56Z/duration120s. Editing changes its source tag manual→edit without changing identity. Total closed work on that task27→147s; do not claim all Reports/time data unchanged or delete the fixture to conceal test state. No whole user database is exported.

OBS is stopped; final paused compact Timer is(660,494),0/4subtasks,16:39. LG125%, automatic/null monitor, Windowsdark/Narrolight, normal animation restored. UltraGear inactive. No new dual/topology/cable/sleep/quiet-performance claim. Gates07/23/27/28, C4 and source/motion acceptance remain OPEN; bookmarks29/30/31 need analysis. M10 entry remains blocked; M11 dormant.

**Next:** review26 frozen original pending cells plus30 appended cells using whole originals/canonical fixtures in another analysis chat. All six acquisition gaps are closed; do not repeat them just because visual review is open. Further physical sessions require a named uncovered acceptance path (dual topology only when the display is available; quiet performance uses its separate protocol). Continue physical acquisition only, preserve separate uncompiled read-worker WIP. Announce each actual milestone completion and all required M1–M9 completion before M10.

The requested Antigravity Desktop shortcut launched before capture, independently of Narro acceptance. During post-capture export the user requested closure: Antigravity closed, Chrome was absent, AnyDesk user windows/processes closed; its system service could not be stopped with current rights. No service startup setting was changed.

Integrity inventory: [SHA256 manifest](sha256-manifest.json), raw archive attributes preserve original bytes. ZIP integrity and original-copy equality were checked before freezing; staged Git blobs are checked before commit.
'''
(P / 'README.md').write_text(readme, encoding='utf-8', newline='\n')
(P / '.gitattributes').write_text('* -text\n** -text\n', encoding='utf-8', newline='\n')
manifest = [{'path': f.relative_to(P).as_posix(), 'bytes': f.stat().st_size, 'sha256': sha(f)} for f in sorted(P.rglob('*')) if f.is_file() and f.name != 'sha256-manifest.json']
write(P / 'sha256-manifest.json', manifest)
assert not ARCHIVE.exists(), 'Archive already exists; do not overwrite frozen packet'
shutil.copytree(P, ARCHIVE)
for entry in manifest:
    assert sha(ARCHIVE / entry['path']) == entry['sha256']

report = MAIN / 'work-log/2026-10-05-codex-m7-ci953-gaps-capture.md'
report.write_text('''# CI953 existing physical acquisition gaps captured

The [whole evidence packet](evidence/m7-ci953-gaps-20261005/README.md) completes the six existing partial acquisition cells M5-A02/A06, M7-A08 and M9-A02/A04/A05. One whole18m08.7s original and a full playable remux, chronological native actions, the whole11-file logs folder/verified ZIP, read-only ledgers and exact provenance are published. No source/tests/builds/CI were changed or run.

Capture-ready appended cells are now30/30; visual review remains0/30 appended and44/100 combined (56OPEN). M1 1/1 examined FAIL27; M5 12/25; M6 16/31; M7 13/29; M8 2/8; M9 0/6. Acquisition does not establish source/motion PASS or milestone completion.

Actual long-row Save/restore/Cancel, planning normal/reduced keyboard/hover rail, six populated Timer hover slots, date Apply/restore, real modal-free Break filter, and owned manual Add/Edit were exercised. Edit uses displayed end-time inline controls. Durable manual session120→180→120 retains identity; the new120s fixture is intentionally retained (owned task total27→147s). Existing identities/sessions/notes/preferences and active846s/801308ms paused checkpoint remain unchanged; only edited subtask updated_at changes legitimately.

New30 (visibly present horizontal scrollbar in Recent Tasks picker) and31 (Escape leaves inline end-time editor open) are REVIEW_PENDING bookmarks; requirement/canonical reconciliation is deferred. Fresh no-drag title focus does not resolve post-drag28. Historical C5 PASS is preserved, not rerun. One LG125% only; no dual/topology/sleep/cable/quiet-performance claim. M10 blocked, M11 dormant.

Continuation: analyze the56 registered pending review cells from whole media/canonical fixtures; do not repeat the six completed acquisition paths. Next physical session must name a truly uncovered path and inspect current M1–M9 gates before/after. Preserve separate uncompiled async-worker WIP; no source implementation in this user-prioritized capture phase.
''', encoding='utf-8', newline='\n')
current = '''## Current — CI953 six capture gaps closed; visual review44/100

[Whole18m08.7s OBS recording, full playable MP4,11-file logs/ZIP and timestamps](work-log/evidence/m7-ci953-gaps-20261005/README.md); [report](work-log/2026-10-05-codex-m7-ci953-gaps-capture.md). Exact38219e20 / CI953 / artifact11324640580 / EXE bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8. Existing six partial acquisition cells M5-A02/A06, M7-A08, M9-A02/A04/A05 are now captured: actual long-row edit/Save/restore/Cancel; planning keyboard and full normal/reduced hover rail; populated Timer hover sweep; real date Apply/restore; modal-free Break filter; owned manual Add and displayed end-time inline Edit. App source/tests/builds/CI were not changed or run.

**Visual review only:44/100 reviewed,56OPEN.** M1 **1/1 examined FAIL27**; M5 **12/25**; M6 **16/31**; M7 **13/29**; M8 **2/8**; M9 **0/6**. Frozen base44/70 plus appended0/30. Appended acquisition is now30/30 ready,0partial; no new denominator/review PASS/implementation counter. Current acquisition matrix is in the new packet; previous frozen packet remains immutable. Whole media awaits continuous/static/canonical analysis.

New30: visible horizontal scrollbar in Add Session Recent Tasks picker (~687s), REVIEW_PENDING; distinct from provider-only23. New31: actual session Edit via end-time button; Save120→180→120 sameID works, Escape leaves inline editor open (~1010s), explicit draft restoration/Save/detail close recovers, REVIEW_PENDING. No missing Edit-modal defect inferred. Older29 Add-modal Escape and28 post-drag rail remain pending; this session's fresh no-drag focus exposes Task actions in normal/reduced but does not close28.

Read-only verification: checkpoint including timestamp, preferences, existing identities/list/lanes/notes/sessions unchanged; active846s/801308ms paused unchanged. Long-row subtask semantics/order/incomplete states restored, only its updated_at changed. New owned manual-origin session e5487664-fcae-439a-86eb-e712bc873eb4 on English companion32fd4eee remains120s, total27→147s; source tag manual→edit after end-time Save. Fixture retained deliberately; do not claim all report/time data unchanged. Whole11 logs include historical953C5 PASS, not rerun; current live-session snapshot is not exit proof.

OBS stopped. Exact953 PID141908 / Focus7471826 / Main3213706; compact(660,494), paused16:39,0/4subtasks; automatic/null monitor, LG125%, Windowsdark/Narrolight/normal motion restored. UltraGear inactive, no dual/topology/sleep/cable/performance claim. Requested Antigravity was opened, then closed at the user's later request; Chrome absent; AnyDesk frontend closed, service-stop denied by Windows privileges. Gates07/23/27, C4/source acceptance OPEN;28/29/30/31 pending. M10 hard entry blocked, M11 dormant.

**Continuation:** analysis chat can review26 original pending cells plus30 appended cells from whole recordings/canonical fixtures. All six listed acquisition gaps are closed; do not repeat covered empty/theme/DPI/C5/populated setups. Additional physical work must name uncovered acceptance: dual topology only when available, quiet performance as a separate protocol. Continue capture-only priority, preserve uncompiled async-worker WIP. Explicitly announce each actual milestone completion and all required M1–M9 complete before M10.

'''
for relative in ['STATUS.md', 'TODO.md', 'HANDOFF.md', 'docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
    path = MAIN / relative
    text = path.read_text(encoding='utf-8-sig')
    old_start = text.index('## Current — grouped CI953 interface capture; visual review 44/100')
    old_end = text.index('## Current — CI953 theme/', old_start)
    body = current
    if relative.startswith('docs/'):
        body = body.replace('(work-log/', '(../work-log/')
    path.write_text(text[:old_start] + body + text[old_end:], encoding='utf-8', newline='\n')
print(json.dumps({'archive': str(ARCHIVE), 'files': len(manifest)+1, 'nativeActions': len(rows), 'logs': len(logs), 'acquisitionClosed': len(closure), 'reviewed': '44/100', 'noSourceChanges': True}))
