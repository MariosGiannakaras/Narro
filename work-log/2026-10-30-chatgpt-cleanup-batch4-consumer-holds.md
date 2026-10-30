# Narro fixed evidence cohort — fourth grouped consumer retention audit (2026-10-30)

**Owner** ChatGPT evidence cleanup. **Target** exact post-PR460 `main` `982ab012131cabc141ffc0aeb395ac65426f462b`; this is classification-only and authorizes **NO new deletions**. Source evidence: the frozen 700-item ledger and 20 named evidence-family READMEs/source/native reports, plus exact untruncated Git tree entries/size/paths. The original frozen table's REVIEW label is superseded only for the 20 exact groups below; no cross-group glob deletion allowed.

## Retention analysis — 20 folders, 223 paths, 402,270,623 logical bytes

**Decision:** HOLD conservatively because original native evidence, unique outcome/failure, pending analysis or original acquisition missing from tracked Git; metadata names alone were not deletion evidence. Scoped grouped checks are not video frame-by-frame re-review and do not close any physical claim.

| Relative family under `work-log/evidence/` | Paths | Exact logical bytes | Preserved consumer / provenance |
| --- | ---: | ---: | --- |
| `pr362-native-20261016` | 2 | 68389193 | Original 519.617s OBS MKV and byte-faithful source logs; accepted cross-window native source |
| `pr360-native-20261016` | 2 | 52081181 | Original 445.6s MKV and raw observations document native focus/subtask mismatch |
| `m5-remaining-native-20261017` | 3 | 52383850 | Original continuation and derived first segment; aggregate verdicts pending |
| `m7-ci942-20261004` | 5 | 45368226 | Review clips and original logs; 422MB MKV split parts referenced in README absent from tracked main tree; native C5 PASS/modal isolation FAIL consumer |
| `pointer-retry-20261024` | 4 | 37277158 | Original native pointer films with pending movement/Escape/tray subcases |
| `pr390-ui-capture-20261021` | 9 | 32389369 | Seven original native UI films with analysis NOT RUN; original logs/helpers |
| `m7-ci932-20261004` | 123 | 4346952 | 123 native motion review derivatives of 8100 frames tied to CI932 compositor FAIL; original source parts not verified in Git |
| `batch-main-20261023` | 2 | 15297495 | Original 66s film of partially acquired B1/B8; no source-acceptance verdict |
| `pr364-native-20261017` | 3 | 16658159 | Original full continuation + only uploaded first-segment excerpt; grading NOT RUN |
| `pa353-nsis-native-20261014` | 2 | 16353690 | Original native NSIS installation film and raw observation bytes |
| `m6-quick-native-20261017` | 2 | 14976151 | Original 284s Focus acquisition film and raw receipt; grading NOT RUN |
| `pa353-msi-native-20261014` | 2 | 14530804 | Original native MSI installation film and raw observation bytes |
| `pa350-native` | 1 | 12191523 | Raw original native/screens/UIA/HWND/DB evidence archive; no verified replacement |
| `pr387-native-20261020` | 2 | 5559258 | Two original Success ON acceptance films with scoped 3/3 observed |
| `pr386-native-20261020` | 3 | 4857045 | Three original ROI films supporting 7 PASS / 2 visual FAIL |
| `pr388-review-20261021` | 3 | 3203524 | Native capture originals and raw receipts; bounded original evidence |
| `m7-ci893-20261003` | 10 | 2803123 | Native motion clips and source log archive from early CI893; original/replacement not independently verified |
| `2026-10-03-m7-ci873-c5-completed` | 4 | 1838565 | Physical C5 motion evidence and log archive; original/replacement not independently verified |
| `m7-ci884-20261003` | 7 | 1010731 | Physical motion clips; original MKV retained locally, not verified remotely |
| `m7-ci911-20261004` | 34 | 754626 | Original recorded failure motion sequences; reported multipart MKVs not independently verified in tree |

**Specific integrity risk:** `m7-ci942-20261004/video-provenance.json` documents eleven raw `raw-video/recording-1/*.mkv.partNNN` objects and an original 422,038,429 B MKV. All 11 referenced raw part paths were **absent from the complete current Git tree**. Its four `review-clips/*.mp4` paths thus cannot be assumed recoverable from an original published to this repository, despite the README's historical local acquisition account. Preserve the clips and review motion frames until a separately verified original and consumer retirement decision. Do not infer that the locally held original was destroyed or never existed.

**20-group counts validated:** Every selected family matched the frozen baseline video/ZIP count exactly (**223/223**), sum **402,270,623 B**. The other previously reclassified HOLD groups (10 files) and the three PR460 remuxes (now actually deleted) are disjoint. New baseline classification: **31/700 actually deleted**, **669 intact =644 HOLD /8,156,054,545 B +25 REVIEW_REQUIRED /58,405,678 B**. Fixed 700 denominator unchanged; no byte reduction from HOLD reclassification. The 25 REVIEW entries are listed in the fixed ledger's remaining eligible-source analysis scope and cannot be bulk-deleted merely because small or old.

**Restrictions:** Preserve original Blitzit sources, CI944/950/953/capture57 originals, PR389/419/437 current native acceptance, original PA films, pending ROI and unique raw-byte archives. No source/test/CI/native execution, no new merge, no history rewrite. Previously validated PR460 closed 3-remux removal still at `982ab012...` before these docs-only commits. Historical immutable receipts untouched.

**ONE NEXT:** Audit the 25 still REVIEW_REQUIRED (including PR357/RA01/RA02 original MKVs/raw archives, old Timer compositor original/diagnostic ZIPs, other raw-capture receipts) for source/consumer necessity. Only if exact original/copy proof supports deletion prepare a new finite allowlist PR. Otherwise retain; progress meter remains 31/700.
