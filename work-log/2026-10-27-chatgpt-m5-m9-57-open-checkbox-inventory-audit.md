# Source-count audit: 57 unchecked entries across M5–M9 (2026-10-27)

**What was independently verified:** current GitHub `main` `TODO.md` blob SHA `11a0d9119bf4c631da05ef1f8259742187eee9d5`, 1009 physical lines at review. Sections are delimited by exact headings `## Milestone 5` through `## Milestone 10`; count each literal checkbox line matching `^\\s*-\\s*\\[ \\]` once, including nested items. Counts **M5 6, M6 13, M7 18, M8 9, M9 11, total 57**. Of these **17 are top-level items and 40 are indented child checklist items**. This is a verified **document-structure count**, NOT an audit proving 57 independent bugs, source-code changes, physical tests or mandatory blockers.

**Important limitations:** The short descriptions below are editorial translations of the names in TODO, not a fresh line-by-line source-code/Blitzit/natively executed functional judgment for each cell. Historical checkpoints within a cell can be stale. Implementation status, exact original source parity, automated rendering and real native acceptance must be independently graded for each *actual* requirement before it is closed. Existing evidence is reused; no extra M11 audit or M10 activation is implied.

## M5 — 6 open checkboxes (0 broad/top-level, 6 nested)

Οι 6 εγγραφές αφορούν αναλυτικές διαφορές εμφάνισης ή αποδοχής. Το TODO καταγράφει ήδη ενσωματωμένο κώδικα σε όλες. Η στενότερη σύνθεση καρτών Archived παραμένει πιθανό πραγματικό design delta, αλλά δεν είναι τεκμηριωμένο νέο bug λειτουργικότητας.

1. **Προεπισκοπή εργασιών στις κάρτες Home** — `TODO.md:L346` · A6/B23, SS-C03/C16 Home task-preview grammar — CURRENT CODE INTEGRATED / WI
2. **Διάλογος Create/Edit List, χρώματα, εικόνες και εικονίδια** — `TODO.md:L350` · SS-C01 Create/Edit List — approved Narro design preservation / remaining re
3. **Ομάδες προγραμματισμένων εργασιών** — `TODO.md:L355` · A15/B40, SS-H01 + VE-008/017 scheduled occurrences group — PRESENT IN CURRE
4. **Ομαδοποίηση Done ανά ημερομηνία** — `TODO.md:L357` · A15/B43 Done date grouping — CURRENT CODE + PR365 WINDOWS FIXTURE VISIBLE:
5. **Μενού επαναλαμβανόμενης εργασίας και αφαίρεση επανάληψης** — `TODO.md:L373` · A16/B45, VE-017 ~00:34–00:40 parent recurring overflow and VE-008 ~02:22 — 
6. **Προεπισκοπή εργασιών σε αρχειοθετημένες λίστες** — `TODO.md:L394` · Evidence-to-code audit A2 / SS-H14 + VE-006 archived list preview — IMPLEME

## M6 — 13 open checkboxes (1 broad/top-level, 12 nested)

12 αναλυτικές εγγραφές περιγράφουν ήδη υλοποιημένες λειτουργίες με ανεπίλυτη σύγκριση/αποδοχή· η 13η είναι μία ευρεία end-to-end δοκιμή. Η πραγματική πρόσθετη ανάγκη ελέγχου δεν μπορεί να συναχθεί απλώς από το μήκος της λίστας.

1. **Επιλογέας λίστας μέσα στο Focus Panel** — `TODO.md:L448` · A3 / SS-H04 + VE-003 Focus list selector parity — CURRENT CODE INTEGRATED:
2. **Εικονίδια και ετικέτες ενεργειών της ενεργής κάρτας** — `TODO.md:L451` · A18/B49, VE-010 00:21–00:25 and VE-003 live-card hover grammar — CURRENT CO
3. **Ένδειξη Pomodoro (POMO)** — `TODO.md:L452` · A14/B37, VE-016 ~01:32–01:44 Pomodoro timer badge:
4. **Ιστορικό ολοκληρωμένων Breaks μέσα στο Focus** — `TODO.md:L454` · A14/B36, VE-016 ~01:36–01:40 + VE-018 ~02:24–02:40 Break Done history — CUR
5. **Εμφάνιση επιτυχίας Done μέσα στην κάρτα** — `TODO.md:L456` · Video-to-code V01/B63, VE-003 repeated Done→success + VE-005 ~02:45–03:20 —
6. **Animation/illustration επιβράβευσης Done** — `TODO.md:L457` · Video-to-code V01/B64, VE-003 multiple success transitions + VE-005 ~02:45–
7. **Αριθμητική πληροφορία πόσο νωρίς/αργά ολοκληρώθηκε εργασία** — `TODO.md:L458` · Video-to-code V01/B65, VE-005 ~02:45–02:51 numeric completion feedback:
8. **Εμφάνιση κατάλληλης κάρτας κατά το Break** — `TODO.md:L459` · A14/B35, VE-016 ~01:35 + VE-018 ~02:24 Break active-card identity — CURRENT
9. **Προσωρινή εκτίμηση EST στο Break** — `TODO.md:L460` · A14/B38, VE-018 ~02:24–02:40 Break temporary header EST — CURRENT CODE + RE
10. **Ρολόι αρνητικού χρόνου μετά από Extend/Time's Up** — `TODO.md:L471` · Video-to-code V05/B67, VE-016 post-Extend overdue clock — CURRENT CODE INTE
11. **Σωστές ενέργειες όταν λήγει ο χρόνος** — `TODO.md:L472` · A18/B50, VE-016 00:42–00:53 Time's Up action disclosure — IMPLEMENTED / REA
12. **Σχετική ένδειξη ηλικίας ληξιπρόθεσμης εργασίας** — `TODO.md:L473` · A10/B31, SS-C19 Focus overdue relative-age metadata:
13. **Συνολική επανεξέταση Focus end-to-end στο κοινό παράθυρο** — `TODO.md:L502` · general acceptance

## M7 — 18 open checkboxes (16 broad/top-level, 2 nested)

Τα 18 κουτάκια περιλαμβάνουν κυρίως ιστορικές ομπρέλες implementation και overlapping physical/motion acceptance, όχι 18 ανεξάρτητες βλάβες. Το ενεργό αρχιτεκτονικό/οπτικό ρίσκο αφορά την ομαλή συνέχεια Panel↔Timer, ghost/blank frames και διαφορετικές θέσεις/οθόνες.

1. **Ένα κοινό παράθυρο Panel/Timer, χωρίς τρίτο WebView** — `TODO.md:L539` · general acceptance
2. **Μετακίνηση, always-on-top και παρουσία στη γραμμή εργασιών** — `TODO.md:L540` · general acceptance
3. **Compact Timer: τίτλος, χρόνος, subtasks, ενέργειες** — `TODO.md:L543` · general acceptance
4. **Expanded Timer: μπάρα ενεργειών και επιστροφή** — `TODO.md:L544` · general acceptance
5. **Επεξεργασία subtasks στον Expanded Timer** — `TODO.md:L545` · general acceptance
6. **Σταθερά hit targets και tooltips χωρίς αναπροσαρμογή πλάτους** — `TODO.md:L548` · general acceptance
7. **Μετάβαση Panel↔Timer χωρίς οπτικές ασυνέχειες** — `TODO.md:L549` · Implemented replacement direction:
8. **Επαλήθευση πραγματικών συνεχόμενων καρέ Panel/Timer και Expand/Collapse** — `TODO.md:L580` · general acceptance
9. **Ειδικός φυσικός έλεγχος flash/scrollbars/διπλών pixels** — `TODO.md:L581` · general acceptance
10. **Shortcut εναλλαγής Panel και Timer** — `TODO.md:L582` · general acceptance
11. **Shortcut εντοπισμού Timer με πεπερασμένο pulse** — `TODO.md:L589` · general acceptance
12. **Πολιτική θέσης Timer και ασφαλής ανάκαμψη οθόνης** — `TODO.md:L596` · general acceptance
13. **Always-on-top έναντι maximized/borderless εφαρμογών** — `TODO.md:L601` · general acceptance
14. **Εμφάνιση Expanded Timer κοντά σε taskbar/κάτω άκρο** — `TODO.md:L605` · general acceptance
15. **Απουσία συνεχούς animation σε idle** — `TODO.md:L612` · general acceptance
16. **Ανοιχτή λεπτομερής αποτίμηση συνεχούς motion από ιστορικά captures** — `TODO.md:L631` · general acceptance
17. **Ανοιχτή αποτίμηση labels/χρονισμού/hit targets** — `TODO.md:L632` · general acceptance
18. **Συνολική συμφιλίωση των παλαιών και νέων M7 αποδείξεων** — `TODO.md:L633` · general acceptance

## M8 — 9 open checkboxes (0 broad/top-level, 9 nested)

Και οι 9 εγγραφές αναφέρουν προηγούμενη εργασία/merges ή βελτιώσεις και εκκρεμή native/source-rendered acceptance, όχι εξ ορισμού απουσία λειτουργίας. Το νέο Preferences loading/Timer policy ανήκει σε επιπλέον ενεργό PR431 scope και δεν μετρά ως νέο κουτάκι σε αυτό το ιστορικό snapshot.

1. **Ξεχωριστός διάλογος Windows Shortcuts** — `TODO.md:L682` · A9/B29, SS-C17 dedicated Windows Shortcuts dialog:
2. **Εικονίδια πληροφοριών δίπλα σε Settings labels** — `TODO.md:L687` · A23/B57, SS-C07 General/Blitz Panel label info icons:
3. **Ενιαία σύνθεση/γεωμετρία Preferences modal** — `TODO.md:L689` · A13/B34, SS-C07/C08/C09 + VE-014 Preferences overlay and continuous section
4. **Επιλογέας monitor με thumbnail** — `TODO.md:L690` · A5/B21, SS-C07+VE-014 full Preferences monitor thumbnail selection:
5. **Επιλογέας ζώνης ώρας** — `TODO.md:L691` · A5/B22, SS-C07 Timezone selector — CURRENT CODE + EXACT-HEAD CI 3/3 OBSERVE
6. **Εξαρτώμενες ρυθμίσεις που εμφανίζονται μόνο όταν ενεργοποιηθούν** — `TODO.md:L692` · A4/B17 VE-014 parent child disclosure:
7. **Popover έντασης ήχου με κουμπί ηχείου** — `TODO.md:L693` · A4/B18, VE-014 anchored volume speaker popover — CURRENT CODE + EXACT-HEAD 
8. **Εμφάνιση flash προειδοποίησης στην ενεργή Focus κάρτα** — `TODO.md:L694` · Video-to-code V10/B69, VE-014 ~01:32–01:56 timed-alert flash composition — 
9. **Ξεχωριστός ήχος επιτυχίας Done** — `TODO.md:L695` · A2/B9 independent Success sound effect:

## M9 — 11 open checkboxes (0 broad/top-level, 11 nested)

Οι 11 εγγραφές είναι αναλυτικά reports visual/source evidence items. Η εγγραφή Done rows δηλώνει συγκεκριμένα αναγνωρισμένη απόκλιση χρονολογικής σειράς (παλαιότερα πρώτα έναντι νεότερα πρώτα) ως READY_FOR_FIX, χωρίς νεότερη διόρθωση καταγεγραμμένη στο ίδιο TODO. Οι άλλες κυρίως καταγράφουν κώδικα ενσωματωμένο με ελλιπή τελική σύγκριση.

1. **Φίλτρο λιστών στις αναφορές** — `TODO.md:L726` · A6/B25 SS-C15 + VE-015 Reports filter trigger:
2. **Πλήρεις ημέρες/κλίμακες στο Reports chart** — `TODO.md:L729` · A10/B30 VE-011/VE-012 Reports date completeness:
3. **Χρωματική ζώνη hover σε ημέρα γραφήματος** — `TODO.md:L730` · A7/B28, VE-011 chart hover category band:
4. **Μενού επιλογών γραφήματος** — `TODO.md:L731` · A3 / SS-C12 Reports Chart options — IMPLEMENTED / ORIGINAL MENU PARITY OPEN
5. **Γραμμές ολοκληρωμένων εργασιών, σειρά/χρονικότητα** — `TODO.md:L734` · A7/B27, VE-011 populated Reports Done rows:
6. **Μετακίνηση ημερομηνιών μήνα/έτους στις αναφορές** — `TODO.md:L736` · A2 / SS-C02 Reports date navigation — IMPLEMENTED / EXACT ORIGINAL EFFECT O
7. **Μετρική Total Tasks στη σελίδα Sessions** — `TODO.md:L738` · B56 / SS-C14 + VE-015 Sessions Total Tasks:
8. **Εικονίδιο Break στα Sessions** — `TODO.md:L739` · A19/B51 VE-015 Sessions Break icon:
9. **Άνοιγμα/κλείσιμο επιλογέα εργασίας για Add Session** — `TODO.md:L741` · Video-to-code V06/B68, VE-015 02:05–02:20 + SS-H17 Add Session task-selecto
10. **Έγχρωμα badges λίστας στις πρόσφατες εργασίες** — `TODO.md:L742` · A28/B59, SS-H17 Add Session Recent Tasks badges:
11. **Εστίαση/keyboard lifecycle στο Sessions detail modal** — `TODO.md:L743` · A11/B32 Sessions detail modal focus/lifecycle:

## Not part of the 57

- M1 still contains **one** unchecked nested, explicitly **optional/deferred** standalone interactive harness invocation, even though M1–M4 are formally accepted in the milestone summary. Therefore counting every `[ ]` repo-wide as a mandatory incomplete bug is demonstrably wrong.
- M10 has **18** unchecked entries but remains **NOT ACTIVATED** pending separate user approval after M1–M9. M11 (**32**) and M12 (**47**) are independently optional and inactive; none belong to M5–M9's 57.
- A user-reported current PR431 issue may be absent from or covered by an existing historical checkbox; conversely a checkbox may describe an implementation that was already merged. Do not infer exhaustive issue coverage or the remaining implementation workload from checkbox count.

## Correct next interpretation

Treat 57 as a **review inventory of documentary acceptance cells**. For a genuine all-open-issues readiness decision, reconcile into nonduplicated user-visible requirements and mark each `IMPLEMENTED / FIX_REQUIRED / EVIDENCE_ONLY / DEFERRED_WITH_REASON`, and independently record `AUTOMATED PASS/FAIL/NOT_RUN` and `PHYSICAL PASS/FAIL/NOT_RUN`. Group shared-surface checks and respect current owner/branch/PR, and use *new evidence* only where an earlier accepted claim is invalidated. Never use the 57 count as a count of outstanding bugs or physical tests.
