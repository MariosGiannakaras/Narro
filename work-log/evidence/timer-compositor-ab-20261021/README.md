# Timer compositor A/B — frozen native evidence, 2026-10-21

Same verified unchanged PR388 EXE `fc27f73098036e657f9559087435617ca7832d227278e5ac2064c54716687e45`, source9d2e897d/source-equivalent main4786bbea. Actual Windows WebView2 155.0.4283.62, paused Weekly recurring parent, fixed340x700 Focus HWND at2220,0; same owned profile across paired launches. No domain/task edits. A default; B process-local `--disable-gpu-compositing` positively present in actual browser/renderer command lines. No global GPU setting changed. Original personal profiles restored with identical DB hash.

## Results and exact stream times

| Claim | A default | B software compositing | Disposition |
|---|---|---|---|
| Panel→compact | old Panel pixels below incoming Timer at12.383–12.450s | same mixed hierarchy12.183–12.233s | FAIL in both |
| compact→expanded incoming freshness | old orange live Panel card below Timer at103.200–103.233s | same old Panel card57.700–57.717s | FAIL in both; GPU flag is not a demonstrated remedy |
| expanded→compact | command succeeded after recording deadline; no continuous evidence | old Panel card at76.500s before compact state76.583s | A EVIDENCE_LIMIT; B FAIL transient |
| compact→Panel | command succeeded after recording deadline | Panel returns79.733–79.783s, settled shape observed | A EVIDENCE_LIMIT; B observation only, not whole parity PASS |
| expand hit target | Return-to-Focus tooltip intercepts CDP pointer click twice; Escape insufficient | same pointer interception | confirmed interaction FAIL; keyboard recovery enabled remaining capture |

`transition-pts.png` contact sheets and `transition-frames/` retain actual decoded frames. `changed-frames.json` uses decoded frame POS_MSEC/stream PTS; **ordinal/nominal60fps is invalid timing** under input frame drops. Nominal60fps container does not establish continuous60distinct native observations: A6089decoded frames/120.000s; B4074/81.067s. Small/intermediate changes below the mean-delta3 selection threshold are not exhaustively classified. Stable PNG endpoints do not negate observed transient failures.

Original A watchdog ended before the two last commands; `actions.txt` contains an explicit correction of an early incorrectly labeled expanded-settled entry after a timed-out click. B completes all four transitions. A planned supplemental restart was rejected before CreateProcess with only "blocked by policy"; no supplemental recording exists. Preserve that gap, no hidden retry or PASS.

CDP supplies actual production WebView2 input, not OS mouse/global shortcut/drag/hardware acceptance. Window crops include exposed Codex desktop below the native110/300px region; this is background, not Narro overflow. HWND identities/visibility were measured. Full `Narro-M7-Logs` includes both process sessions; any C5 INCONCLUSIVE is expected because no qualifying drag/tray Quit test was performed. No OS drag/position/restart acceptance, no HDMI test, no milestone advancement. The old forced-quit owned fixture is retained privately, not personal data.

## Main package verification

Resulting-main CI39553189123 exact4786bbea3/3SUCCESS. Actual required artifact downloads checked: physical EXE and validation EXE equalSHA256`08f289a556cc21065eb76ceee1fc0c27c61d626033e316f01b4017b86e55735c`; MSI`edc95e65f772cf9ffb4a912259a64105d5e46dbae07a21d50a6b023b1d8c1bd7`; NSIS`ef6c169b8c5cdaf334ece7d122481a0fa57a887f7287ee96899d3d01896ac0d9`. EXEs PE headers validated (app x64; NSIS32-bit bootstrap is expected); MSI OLE signature validated. No installer executed/reaccepted. This recording uses the PR EXE, not the resulting-main binary.

Canonical staged-blob hashes in SHA256SUMS.json; original-text-receipts.zip preserves exact local text newlines. No original video/log alteration. Prototype609e0b65 is separate and untested natively; this diagnostic does not validate its arithmetic change.
