# Capture-only continuation, 2026-10-20

Ten unchanged original MKVs (46,325,880 bytes), 24 screenshots, 103 observations, chronological actions, synthetic database facts and profile/motion restoration receipts. This supplements [the earlier frozen packet](../capture57-20261020/README.md); it does not replace it. No source corrections, acceptance analysis, tests, builds or CI were performed.

## Identity and evidence navigation

Source `9e631952158c5c6b9763e0e0d79e33b79e8c7ca3`; resulting-main CI `39389033088`, artifact `12249543153`; executable SHA-256 `bced8a9f533fedb726bedc7fa2d90eec98324b2f9b15db77b8f1ad1c79b5f909`. Tracking-only parent `a4548d9f` does not change executable identity. See [session identity](session-meta.json), [action chronology](ACTION_MANIFEST.md), [machine-readable actions](actions.jsonl), [clip start anchors](clips.jsonl), [media metadata and original hashes](media-index.json), [screenshots](screenshots), and [native/UIA and owned-state observations](observations).

The original files are small enough for direct publication. Download each `video/*-original.mkv` using its raw file link; no concatenation or transcoding is needed. Compare SHA-256 against `media-index.json`. The integrity manifest covers canonical Git blob bytes for the rest of the packet.

## Acquired groups — not acceptance verdicts

- Reports Overview: one/multiple list filters; populated daily category pointer/focus; Chart options and series selection; 30/60/90-day ranges, horizontal chart scrolling, previous/next year/month, Done rows and their internal scrolling. Screenshots R01–R12; clips 001–004 and the action manifest.
- Sessions: Break hide/show, one-list filter and counters, custom Oct13–20 range; Add Session collapsed/open selector, Recent Tasks badges, task selection and expanded time fields; a committed session. R13–R17, clips 004–007.
- Task-session detail: first-row actions -> Edit opens detail; nested Add Session -> Cancel -> restored focus; Enter reopens nested Add; commit -> detail with four sessions; Escape closes detail. R19 and clip007. Earlier exploratory title clicks and inline time editing are included truthfully, not claimed as detail activation.
- Timer/Focus: Skip on the overdue task, return to Panel, compact/expand/collapse, paired explicitly established normal and reduced OS motion settings, five-minute POMO work reaching automatic Break. F01–F04, clips008–010. Final synthetic DB/UIA observations retain the boundary state. No manual Break action substituted for the automatic boundary.

## Capture limitations to retain during later analysis

1. Acquisition only: no source comparison, whole-film analysis or new PASS. The current matrix contains material for53/57 lines, including partial coverage; that is not53 completed acceptance gates.
2. DXGI captured actual physical frames with a60fps ceiling and `dup_frames=0`. Original PTS are authoritative. The advertised stream rate does not prove60 distinct frames per second. Clips are bounded180s; continuous coverage applies only within actual recorded intervals. Process-start UTC is an approximate offset, not frame-exact synchronization. The action log can extend beyond a clip boundary; consult the next clip and metadata rather than assume continuous wall-clock video.
3. Clip005 overlaps a Computer Use/native Start-time popup timeout and JavaScript kernel reset. Its exact original bytes are retained; ffprobe returns metadata without warnings, but this is not proof of a clean finalized tail or full decode. The popup was observed in R15 and closed with Escape after fresh window selection. No product defect verdict follows from tool failure.
4. Original OS motion was reduced (`0/false`). Only the journaled explicit normal/reduced blocks and their receipts establish those modes; do not relabel earlier footage normal from old narrative. Original settings restored.
5. A120px Timer drag was issued, but before/after HWND bounds remained `[2220,0,2560,700]`. Actual movement, bottom-edge expansion, saved-position restart and topology acceptance are not established. No unsupported alternative input helper was used.
6. Runtime timed-alert flash was not exercised. Preparatory POMO disable was followed by user stop. Reliable continuous sound recording remains missing. There is no audio stream in these new videos. Borderless browser and second physical display were not exercised.
7. Reports coverage limits: Overview custom8-day/PDF export not newly acquired; Sessions multi-select and month/year navigation not newly acquired. Earlier accepted evidence may be reused only after requirement-specific reconciliation. TotalTasks counters were captured, not a proof of unknown Blitzit semantics.
8. All fixture data is disposable synthetic data. Personal backups, private profile ledger, dependencies and executable were excluded. The original Roaming/Local profiles were restored with identical original database hash; see [restoration proof](original-profile-restoration-proof.json). No owned Narro/ffmpeg process remained at the recovery checkpoint.

## Exact continuation

Reuse these originals and the prior packet. If capture-only scope continues, prepare one NEW protected session for the genuinely missing states listed in the current matrix, starting with actual timed-alert runtime; do not replay either completed profile ledger or repeat the acquired Reports/Skip/motion/POMO paths. Preserve movement/topology/audio limits when tooling or hardware cannot exercise them. Substantive analysis and corrections remain a separate phase; acceptance boxes and M10 entry do not advance from capture labels.
