# M11 — Αναλυτικός οδηγός προσωπικής καταγραφής της πραγματικής Blitzit

**Κατάσταση:** ΟΔΗΓΟΣ ΓΙΑ ΜΕΛΛΟΝΤΙΚΗ ΧΡΗΣΗ / M11 DORMANT — καμία ενεργοποίηση, ζωντανή εξέταση, αλλαγή εφαρμογής ή επανέναρξη των παυμένων native ελέγχων δεν προκύπτει από αυτό το έγγραφο.

**Πρωταρχικός στόχος:** Να αποτυπωθεί εξαντλητικά **πώς φαίνεται, κινείται και λειτουργεί** η πραγματική Blitzit, ώστε μετά το πλήρες, συγχρονισμένο evidence review το Codex να ανακατασκευάσει στο Narro την παρατηρήσιμη εμπειρία με τη μεγαλύτερη δυνατή οπτική, κινησιολογική και λειτουργική πιστότητα. Η τεχνική εξέταση client/network/state είναι υποστηρικτικό τεκμήριο, όχι προϋπόθεση να γνωρίζουμε τον αυθεντικό κώδικα.

**Κύριο πρωτόκολλο:** [BLITZIT_LIVE_REFERENCE_AUDIT.md](BLITZIT_LIVE_REFERENCE_AUDIT.md). Οι κανόνες φάσεων, ασφάλειας, αυθεντικής παλέτας και υλοποίησης εκεί υπερισχύουν. Το παρόν είναι το *πρακτικό, αναλυτικό σενάριο για τον άνθρωπο που χειρίζεται την εφαρμογή*, όχι νέο milestone ή νέα εργασία Codex.

## 1. Ποιος κάνει τι και πότε

| Ρόλος | Πράξη |
| --- | --- |
| **Codex πριν από το βίντεο** | Επαληθεύει πραγματικά διαθέσιμα read-only τεχνικά κανάλια, ρυθμίζει καταγραφή και παρακολούθηση υγείας logs, καταγράφει version/clock/display/profile, δίνει μοναδικό session ID και **σαφές σήμα READY**. Ελέγχει ότι τα events γράφονται σε αρχείο, όχι απλώς ότι άνοιξε κάποιο εργαλείο. |
| **Εσύ κατά τη λήψη** | Ακολουθείς **σειριακά** τις ενότητες 5–24, χειρίζεσαι την πραγματική Blitzit, κρατάς το βίντεο συνεχές, δείχνεις όλα τα πραγματικά states/παραλλαγές και δεν χρειάζεται να καταχωρίζεις ένα-ένα τα κλικ. |
| **Codex όταν τελειώσει το βίντεο** | Τερματίζει/επαληθεύει το log **μετά** τη λήξη του βίντεο, διατηρεί raw αρχεία και hashes, ελέγχει κενά/ακεραιότητα, παγώνει το corpus και **μόνο μετά** αναλύει frame-by-frame και συσχετίζει με client/network/state. |
| **Codex μετά την ανάλυση** | Συγκρίνει κάθε κατάσταση με το Narro, τεκμηριώνει αποκλίσεις και υλοποιεί μετά το freeze/reconciliation όσα απαιτούνται, με τεστ και πραγματική επαλήθευση. |

**Όριο:** Δεν ξεκινάς επειδή απλώς υπάρχει αυτός ο οδηγός. Χρειάζονται ρητή ενεργοποίηση του M11 σε μεταγενέστερο χρόνο, διαθέσιμη αυθεντική Blitzit και επιβεβαιωμένο READY από το Codex. Δεν χρειάζεται ενεργοποίηση των παυμένων φυσικών δοκιμών Narro.

## 2. Πριν από την καταγραφή — γρήγορη προετοιμασία

- [ ] Χρησιμοποίησε **μόνο δικό σου νόμιμα προσβάσιμο λογαριασμό/εγκατάσταση** της Blitzit. Καμία αγορά, αναβάθμιση, σύνδεση άσχετης υπηρεσίας, επέμβαση σε προστατευμένη επικοινωνία ή αλλαγή στοιχείων ασφαλείας.
- [ ] Δούλεψε κατά προτίμηση σε **δοκιμαστικές λίστες και tasks**, ποτέ με πραγματικά σημαντικές εργασίες ή προσωπικό περιεχόμενο. Μην διαγράφεις υπάρχοντα προσωπικά δεδομένα για να δοκιμάσεις συμπεριφορά.
- [ ] Πριν από την έναρξη, το Codex καταγράφει (εκτός ευαίσθητων δεδομένων): έκδοση/build αν φαίνεται, Windows, οθόνη/ανάλυση, scaling/DPI, χρωματικό προφίλ αν διαθέσιμο, theme, γλώσσα, ώρα/ζώνη ώρας, σχετικές επιλογές Preferences και διαθέσιμα/μη διαθέσιμα features.
- [ ] Κατά προτίμηση εγγραφή **πραγματικών 60 FPS**, χωρίς fast-forward, time-lapse, τεχνητά frame interpolation ή επεξεργασία. Αν γίνεται μόνο 30 FPS, συνέχισε κανονικά αλλά δήλωσε 30 FPS: δεν αποδεικνύονται εξαιρετικά σύντομες micro-animations με ακρίβεια 60 FPS.
- [ ] Κράτα αναγνώσιμο το **ολόκληρο παράθυρο** και τον κέρσορα, συμπεριλαμβάνοντας floating windows, tooltips, OS notifications και μενού όταν εξετάζονται. Μην κόβεις πάνω/κάτω άκρα ή μετακινείς συνεχώς το παράθυρο για κάδρο. Αν χρειάζονται δύο οθόνες, καταγράφονται όσες είναι απαραίτητες και σημειώνεται τι φαίνεται.
- [ ] Απενεργοποίησε την καταγραφή μικροφώνου εφόσον δεν χρειάζεται· για ειδοποιήσεις/ήχους κράτησε μόνο **system audio** όταν αυτό είναι τεχνικά διαθέσιμο και ασφαλές ως προς την ιδιωτικότητα. Μην εκθέτεις emails, κωδικούς, cookies, tokens, ειδοποιήσεις τρίτων ή ιδιωτικά tabs.
- [ ] Κλείσε άσχετα παράθυρα/ειδοποιήσεις και κράτα τις τρέχουσες ρυθμίσεις όσο σταθερές γίνεται μέχρι την ειδική ενότητα Themes/Preferences. Μην αλλάζεις ώρα/ημερομηνία συστήματος, μην πειράζεις AppData/Windows profiles και μην αποσυνδέεις εξοπλισμό μόνο για να προκαλέσεις state.
- [ ] Εξασφάλισε ελεύθερο χώρο για το αρχικό βίντεο και τα τοπικά τεχνικά logs. Κράτησε **αμετάβλητα** τα raw αρχεία. Απόφυγε χρήση εργαλείου εγγραφής που παύει αυτόματα όταν η Blitzit ελαχιστοποιείται.
- [ ] Σημείωσε μόνο: **session ID**, filename βίντεο, ώρα έναρξης, capture FPS και όποιες ενότητες δεν ήταν διαθέσιμες. Το Codex αναλαμβάνει τη λεπτομερή αντιστοίχιση.

### Ελάχιστα προτεινόμενα δοκιμαστικά δεδομένα

Χρησιμοποίησε *φανερά αναγνωρίσιμα αλλά μη προσωπικά* ονόματα, μόνο αν δημιουργούνται από φυσιολογικές λειτουργίες της Blitzit:

- Λίστες: **M11 Work**, **M11 Personal**, **M11 Archive Test**.
- Tasks: **M11 Plan 15m**, **M11 Draft 30m**, **M11 Quick 5m**, **M11 No EST**, **M11 Due Tomorrow**, **M11 Repeat**, **M11 Delete Test**.
- Subtasks: **M11 Step A**, **M11 Step B**, **M11 Step C**.
- Notes: **M11 Note sample**, μία δεύτερη γραμμή με formatting και, μόνο αν απαιτείται, ουδέτερο μη ιδιωτικό URL που **δεν ανοίγεις** αν δεν υπάρχει λόγος.
- Σημεία συγχρονισμού: **M11 SYNC START**, **M11 SYNC MID**, **M11 SYNC END**, εφόσον το Codex επιλέξει έναν ασφαλή/προσβάσιμο τρόπο δημιουργίας ή άλλης μοναδικής αναγνώρισής τους.

**Μην αλλάξεις βίαια την αυθεντική συμπεριφορά για να ταιριάξει στα παραπάνω ονόματα.** Αν τα δεδομένα υπάρχουν ήδη, διακρίνεις το νέο session με suffix ή με session ID. Αν υπάρχει περιορισμός trial/account, σημειώνεις **NOT AVAILABLE**.

### 2Α. Τι παραλείπεις και πώς καταγράφεις άγνωστες λειτουργίες

**Μη σπαταλάς χρόνο σε υπηρεσίες που δεν θα υπάρχουν στην τοπική εφαρμογή:** login/account/profile, συνδρομές/upgrade/billing, AI chat/Blitzy, MCP/AI agents, online sync, integrations (π.χ. Notion ή εξωτερικά ημερολόγια), support/community/help και συναφή εμπορικά/cloud flows. **Δεν τα ανοίγεις, δεν κάνεις αλληλεπιδράσεις, δεν εξετάζεις backend/events ή animations αποκλειστικά αυτών των υπηρεσιών**. Αν φαίνονται ήδη στην περιήγηση, αρκεί η παθητική εμφάνιση του ονόματος/icon στο γενικό πλάνο. Δεν αποτελούν παραλείψεις του M11. Αν ένα κοινό control σε χρήσιμη τοπική οθόνη έχει ίδιο visual pattern, εξετάζεις το τοπικό control, όχι την άσχετη online υπηρεσία.

**Ωστόσο, μην προσπερνάς άγνωστες λειτουργίες επειδή δεν υπάρχουν στον παλιό οδηγό.** Καθώς ανοίγεις Home, λίστες, task overflow, scheduling, Focus/Timer, Preferences, Reports και Sessions, κοίτα συνοπτικά τα **πραγματικά διαθέσιμα μενού** και εντόπισε κάθε επιλογή που δεν καλύπτει το script:

1. Αν φαίνεται νέα ενέργεια που θα μπορούσε να λειτουργεί **τοπικά** (οργάνωση, timer, παραγωγικότητα, προβολές, στατιστικά, προσωπικές ρυθμίσεις), κράτα τον κέρσορα πάνω της και κατέγραψε **όνομα, icon, πού βρίσκεται, version/theme και ορατό αποτέλεσμα**. Αν είναι ασφαλές, εκτέλεσε όλη τη σχετική UI ροή με τη μικροδιαδικασία της ενότητας 3· δεν απαιτείται να ξέρεις από πριν αν θα υλοποιηθεί.
2. Αν δεν είναι ξεκάθαρο αν αφορά τοπική λειτουργία ή cloud, καταγράφεις **μόνο σύντομη, μη επεμβατική επισκόπηση** χωρίς login, συνδρομές, εξωτερικούς λογαριασμούς ή άγνωστες αλλαγές δεδομένων. Προχωράς στη συνέχεια του οδηγού.
3. Αν είναι προφανώς **μόνο online/commercial service**, το αφήνεις χωρίς κλικ. Η παθητική εμφάνισή του δεν συνεπάγεται πλήρη καταγραφή.
4. **Δεν αποφασίζεις εσύ επιτόπου** αν η νέα επιλογή πρέπει να προστεθεί στο Narro. Το Codex, μετά τη λήξη και το freeze, καταγράφει ξεχωριστά νέες υποψήφιες τοπικές λειτουργίες για μελλοντική αξιολόγηση με source timecode, χωρίς να τις συγχέει με bugs/ελλείψεις ή τις 41 παλαιές αβεβαιότητες.

**Πρακτικός κανόνας:** *Άγνωστο = το προσέχω και το τεκμηριώνω. Σαφώς άσχετη online υπηρεσία = την προσπερνώ. Νέο τοπικό χρήσιμο feature = το καταγράφω ουσιαστικά, δεν το υλοποιώ αυτόματα.*

## 3. Η σταθερή «μικροδιαδικασία» για ΚΑΘΕ σχετικό στοιχείο

Για **κάθε στοιχείο της τοπικά χρήσιμης εμπειρίας Blitzit** (κουμπί, icon, link, card, row, checkbox, dropdown, toggle, modal, tooltip, tab, popover, input ή menu item), καθώς και για νεοανακαλυφθέντα ασφαλή τοπικά flows, ακολούθησε όπου έχει νόημα το ίδιο μοτίβο. **Εξαιρούνται τα καθαρά online/account/AI/MCP/subscription/integration controls της ενότητας 2Α:**

1. **Πριν:** δείξε 1–2 δευτερόλεπτα αμετάβλητη κατάσταση (τίτλοι, counters, σειρά, χρώματα, enabled/disabled).
2. **Hover:** πήγαινε αργά τον κέρσορα πάνω στο στοιχείο και κράτησέ τον 1–2 δευτερόλεπτα. Παρατήρησε αν αποκαλύπτονται εικονίδια, tooltip, underline, αλλαγή χρώματος, shadow, scale ή cursor.
3. **Ενέργεια:** ένα κανονικό κλικ/keyboard action χωρίς περιττές επαναλήψεις. Μην πατάς αμέσως επόμενο κουμπί: άφησε να καταγραφεί *ολόκληρη* η animation και η κατάσταση που ακολουθεί.
4. **Μετά:** δείξε 1–3 δευτερόλεπτα το αποτέλεσμα. Άνοιξε, όπου γίνεται, και την αντίστοιχη διαδρομή ακύρωσης/κλεισίματος, και *ξεχωριστά* τη διαδρομή επιβεβαίωσης.
5. **Κλείσιμο ή επιστροφή:** έλεγξε Escape, Cancel, κλικ εκτός, X, Enter/Tab **μόνο όταν η ενέργεια είναι ασφαλής** και σχετική. Μην υποθέτεις ότι όλες οι διαδρομές υπάρχουν.
6. **Επίδραση:** έλεγξε αν άλλαξαν task order/IDs ορατά, counters, focus, toast, scheduling, history, scroll, selection ή διάρκεια. Για persistence κάνε επιστροφή/επανείσοδο ή επανεκκίνηση μόνο στα προβλεπόμενα ασφαλή σημεία.
7. **Προχώρα:** αν κάτι είναι προσωρινά αδύνατο, μη χάνεις την υπόλοιπη καταγραφή προσπαθώντας επ' άπειρον. Συνέχισε, σημείωσε το section ID και την αιτία.

**Ειδικά για animations:** Μην κινείς επίτηδες τον κέρσορα γρήγορα πάνω από πολλά στοιχεία συγχρόνως. Ένα ξεκάθαρο input → φανερό αποτέλεσμα ανά ενέργεια. Για drag: δείξε hover, mouse-down, σύρσιμο, θέση εισαγωγής, release, settle. Το Codex θα μετρήσει *μετά* τις διάρκειες και τα frames· εσύ δεν μετράς milliseconds.

**Για destructive λειτουργίες:** Πρώτα κάνε άνοιγμα → παρατήρηση → **Cancel/κλείσιμο**, ύστερα ξεχωριστά άνοιγμα → **Confirm** πάνω σε τεχνητό test item. Μην δοκιμάσεις confirm σε πραγματικό προσωπικό task/list. Μην υποθέτεις ότι κάθε delete έχει confirmation: η τυχόν **άμεση** διαγραφή είναι σημαντικό εύρημα.

## 4. Συγχρονισμός βίντεο/τεχνικής καταγραφής

- **Άγκυρα START**: μετά το READY, ξεκίνα εγγραφή, δείξε αρχική οθόνη, κάνε μια σαφή και ασφαλή αναγνωρίσιμη ενέργεια που έχει συμφωνήσει το Codex (π.χ. άνοιγμα/κλείσιμο Settings ή δημιουργία μοναδικού test task). Μην βασιστείς μόνο σε ένα μη ανιχνεύσιμο hover.
- **Άγκυρα MID**: περίπου στο πέρασμα από board/tasks σε Focus, κάνε δεύτερη σαφή αναγνωρίσιμη ενέργεια ή διακριτό test edit, σύμφωνα με τον οδηγό συγχρονισμού του Codex.
- **Άγκυρα END**: κοντά στην ολοκλήρωση, επανάλαβε συμφωνημένη μοναδική αναγνωρίσιμη ενέργεια και άφησε λίγο ακίνητη την τελική εικόνα.
- Κράτα το βίντεο **συνεχές** μεταξύ αγκυρών. Αν αλλάξεις πραγματικά setup/theme, κάνε restart ή χαθεί λήψη/log, κράτα τα τμήματα ως ξεχωριστά, χρονολογημένα και hash-verified sessions, **όχι μοντάζ που κρύβει το κενό**.
- Δεν χρειάζεται να ταιριάξουν ακριβώς τα ρολόγια. Το Codex βρίσκει offset/drift από πολλαπλές άγκυρες και δηλώνει αβέβαιες ή απούσες αντιστοιχίσεις. Τα backend requests **δεν** συνεπάγονται ότι έχουμε δει τον ιδιωτικό server ή ότι ξέρουμε τον κώδικά του.

## 5. S00 — Εκκίνηση, αρχικές συνθήκες και γενική περιήγηση

- [ ] **S00.01** Με ανοιχτή την εγγραφή δείξε ολόκληρη την Blitzit χωρίς κίνηση του ποντικιού. Αν υπάρχει τρέχουσα αρχική φόρτωση/empty state κράτησέ τη.
- [ ] **S00.02** Εμφάνισε την έκδοση/build μόνο αν υπάρχει ακίνδυνο UI σημείο. Μην εμφανίσεις account/private identifiers.
- [ ] **S00.03** Περίγραψε *οπτικά* τη σειρά των βασικών περιοχών μέσω του κέρσορα: header, navigation, Home, lists, κύρια actions, footer/status, dialogs. Άφηνε hover σε **κάθε σχετικό τοπικό control**, όχι σε υπηρεσίες που εξαιρούνται στην ενότητα 2Α.
- [ ] **S00.04** Πλοηγήσου Home → μια λίστα → All Lists → Home. Κάθε φορά άφησε την οθόνη να σταθεροποιηθεί, ώστε να φανούν transitions, selection, scroll, active state και navigation.
- [ ] **S00.05** Δείξε τι συμβαίνει με resizable/minimized/restored window **μόνο αν πρόκειται για κανονικά υποστηριζόμενη ενέργεια**. Πρόσεξε αναδίπλωση τίτλων, clipping, popover anchoring και animations.
- [ ] **S00.06 — SYNC START** Εκτέλεσε τη συμφωνημένη ορατή άγκυρα/μοναδική test ενέργεια μετά το READY του τεχνικού logger.
- [ ] **S00.07 — DISCOVERY SCAN** Κοίτα μόνο την ορατή δομή navigation και τα κανονικά διαθέσιμα τοπικά μενού για **άγνωστα νέα features**. Όσα φαίνονται χρήσιμα τοπικά τα καταγράφεις με ασφαλές hover/δοκιμή και ακολουθείς την ενότητα 2Α· σαφώς online υπηρεσίες παραλείπονται.

## 6. S01 — Home, λίστες, κάρτες και γενική αναζήτηση

- [ ] **S01.01** Δείξε Home με τουλάχιστον δύο λίστες. Παρατήρησε list tile, χρώμα, icon/initial, progress/EST preview, task counts, μικρά badges και κενή/γεμάτη λίστα.
- [ ] **S01.02** Πέρνα από κάθε σημείο κάρτας: background, τίτλος, icon, buttons, overflow. Κράτα hover και μετά άνοιξε κάθε menu.
- [ ] **S01.03** Άνοιξε μια λίστα από tile και γύρισε πίσω. Κατέγραψε αλλαγές active state, breadcrumb, header, scroll, focus.
- [ ] **S01.04** Αν υπάρχουν ειδικές προβολές για archived lists ή archived done tasks, άνοιξέ τες πρώτα σε **empty / default** κατάσταση και γύρνα πίσω.
- [ ] **S01.05** Άνοιξε Search/command palette (π.χ. ορατό icon ή Ctrl+F αν όντως λειτουργεί). Δείξε άδειο input, typed query με matching λίστα, matching task και no-results, clear, keyboard navigation, Escape, click εκτός, quick actions Add Task/Add List/Reports **όπου υπάρχουν**.
- [ ] **S01.06** Δοκίμασε αλλαγή επιλογής από list selector (μία λίστα → All Lists → άλλη λίστα). Δείξε κάθε transition και τίτλο.

## 7. S02 — Create/Edit List: πλήρης οπτική και λειτουργική ανατομία

- [ ] **S02.01** Άνοιξε **Create List** από το πραγματικό σημείο δημιουργίας. Μην γράψεις αμέσως: δείξε **ολόκληρο** modal, backdrop, entrance animation, τίτλο, προεπιλεγμένο χρώμα/icon, όλα τα labels, button states και θέση.
- [ ] **S02.02** Κάνε hover πάνω σε **κάθε** επιλογή color swatch, selected state, border, tooltip, preview και σχετικό icon/color picker. Δοκίμασε αρκετές διαφορετικές χρωματικές επιλογές, ώστε να φαίνεται η ανταπόκριση στο preview. Μη θεωρήσεις τις RGB τιμές του βίντεο αυθεντικές source tokens.
- [ ] **S02.03** Αν η Blitzit επιτρέπει icon/image upload, άνοιξε την επιλογή **χωρίς να αποκαλύψεις προσωπικά filenames** και κατέγραψε επιλογή/preview/ακύρωση με ακίνδυνο test asset. Όπου δεν υπάρχει δυνατότητα, **NOT AVAILABLE**.
- [ ] **S02.04** Δοκίμασε κενό όνομα, μεγάλο όνομα, focus/Tab/Enter, hover Cancel/X, άνοιγμα-κλείσιμο χωρίς Save. Παρατήρησε validation, disabled controls, κλείσιμο με Escape ή outside-click αν υποστηρίζονται.
- [ ] **S02.05** Δημιούργησε **M11 Work**. Δείξε πώς κλείνει το modal, πώς εμφανίζεται η κάρτα στη Home, αν εμφανίζεται toast και πώς επηρεάζονται διάταξη/scroll.
- [ ] **S02.06** Δημιούργησε **M11 Personal** και **M11 Archive Test**, με διαφορετικά διαθέσιμα χρώματα ώστε να παρατηρηθούν list-specific tokens σε Home/Board/Focus.
- [ ] **S02.07** Άνοιξε **Edit List** σε test list. Δείξε διατήρηση αρχικών τιμών, αλλαγή name/color/icon, Cancel (χωρίς επίδραση) και νέα είσοδο → Save → ενημέρωση κάθε ορατής εμφάνισης. Αν υπάρχει Duplicate, κατέγραψέ το και σημείωσε τον νέο τίτλο/ordering.
- [ ] **S02.08** Κατάγραψε light/dark διαφορές εδώ **στην ειδική S18 επιστροφή**, ώστε να μη σπας τη ροή capture. Η Blitzit source συμπεριφορά δεν συνεπάγεται αλλαγή στο εγκεκριμένο Spectrum Core picker/icons του Narro.

## 8. S03 — Κενή και γεμάτη planning board / lanes

- [ ] **S03.01** Μπες στη νέα M11 Work όσο είναι άδεια. Δείξε **Backlog / This Week / Today / Done**, empty copy, add controls, titles, gradients, περιγράμματα, counters, προεπιλογές, sticky στοιχεία.
- [ ] **S03.02** Κάνε χωριστό hover σε lane header, add στο header, add στο κάτω μέρος, row/actions (όταν υπάρχουν), Today outline/CTA **Blitzit now**, Done information, horizontal/vertical scroll.
- [ ] **S03.03** Άνοιξε inline create και άφησε να φανεί η entrance/reflow, πριν πληκτρολογήσεις. Κλείσε με Cancel, κλικ εκτός ή Escape όπου όντως υποστηρίζεται.
- [ ] **S03.04** Αφού γεμίσει από τα επόμενα βήματα, επέστρεψε για να παρατηρήσεις **ίδια γεωμετρία με πραγματικά tasks**, τίτλους και counts. Μην θεωρήσεις την κενή οθόνη αντιπροσωπευτική όλων των states.

## 9. S04 — Task δημιουργία, ονομασία, EST και Time Taken

- [ ] **S04.01** Δημιούργησε task από **+ κάτω** σε Backlog και έπειτα από **+ πάνω** όπου υπάρχει. Δείξε θέση εισαγωγής, αρχικό focus, buttons Cancel/Confirm και εμφάνιση νέας row.
- [ ] **S04.02** Δημιούργησε τα **M11 Plan 15m**, **M11 Draft 30m**, **M11 Quick 5m**, **M11 No EST**. Για ένα άφησε κενό EST, για άλλο όρισέ το από το input και για άλλο χρησιμοποίησε title-suffix parsing **μόνο αν το σχετικό preference είναι ενεργό**.
- [ ] **S04.03** Δοκίμασε edit title με single-click/double-click όπου έχει νόημα. Κατέγραψε επιλεγμένο κείμενο, text cursor, αλλαγή ονόματος, Enter/Escape/blur και commit.
- [ ] **S04.04** Άνοιξε EST editor σε row: ακριβής θέση, default, formats, save/blur, invalid και boundary input χωρίς να προκαλέσεις πραγματική παρατεταμένη εργασία. Δείξε πώς παρουσιάζεται το νέο EST και αν αλλάζει lane total.
- [ ] **S04.05** Άνοιξε **Time Taken** editor και τροποποίησε *δοκιμαστική* τιμή αν επιτρέπεται. Δείξε αν η μορφή, οι συνολικές τιμές και η row αλλάζουν, και αν παραμένουν μετά από επανείσοδο.
- [ ] **S04.06** Δοκίμασε long title με αναδίπλωση ή ellipsis, hover tooltip, icon controls, selection/keyboard focus. Αν η Blitzit εμφανίζει validation error για άδειο/μη έγκυρο όνομα, κράτα το ορατό.
- [ ] **S04.07** Αν υπάρχει quick task creation popup/shortcut, κατέγραψε το **ξεχωριστά** από inline add: αρχική επιλογή λίστας, keyboard navigation, submit/cancel, τελικό row.
- [ ] **S04.08** Έλεγξε ξανά όλες τις ορατές αριθμητικές τιμές/EST totals μετά τις δημιουργίες· το Codex θα ανακατασκευάσει αριθμητικά τους aggregates.

## 10. S05 — Task rows, hover actions, μετακινήσεις και reorder

- [ ] **S05.01** Σε κάθε lane με πραγματικά tasks δείξε pre-hover και hover row: completion control, ordinal/badge, Notes, lane-left/right, overflow, drag affordance, background, reflow **χωρίς** κλικ.
- [ ] **S05.02** Σύρε task **μέσα στο ίδιο lane** από πάνω προς κάτω και αντίστροφα. Κράτα κέρσορα πριν το mouse-down, σύρε αργά ώστε να φαίνεται ghost/placeholder, άσε το κουμπί και περίμενε settle. Δείξε τελική σειρά.
- [ ] **S05.03** Σύρε test task **Backlog → This Week → Today**, σε διαφορετικές θέσεις εισαγωγής. Δείξε πώς ανανεώνονται counters/EST και θέσεις στις δύο στήλες *κατά τη διάρκεια* και *μετά*.
- [ ] **S05.04** Επανάλαβε μια μετακίνηση μέσω **hover arrows/context menu** αντί για drag, αν υποστηρίζεται. Παρατήρησε αν η συμπεριφορά/ordering διαφέρει.
- [ ] **S05.05** Σύρε ή ολοκλήρωσε ένα test task στο Done και, όπου υπάρχει, κάνε undo/uncomplete. Κατέγραψε checkbox/animation, Today progress, Done count, timestamp/copy και επαναφορά.
- [ ] **S05.06** Μπες σε All Lists και επαλήθευσε πώς εμφανίζεται το μετακινημένο task χωρίς duplication και τι γράφει το list badge/label.
- [ ] **S05.07** Άνοιξε overflow με προσοχή: κράτα κάθε menu state, hover ανά επιλογή, animation/placement και διάκριση visible/disabled, και εξέτασε τις πράξεις **ξεχωριστά** στις οικείες ενότητες.

## 11. S06 — Subtasks: create, edit, reorder, done, delete

- [ ] **S06.01** Άνοιξε subtasks σε test task. Δείξε collapsed → expanded animation, progress ring/label, empty section, add input.
- [ ] **S06.02** Πρόσθεσε **M11 Step A/B/C**. Δείξε creation/keyboard focus/submit/row order. Άλλαξε τίτλο μίας υπάρχουσας subtask.
- [ ] **S06.03** Σημείωσε μία completed και μετά uncompleted, έπειτα δύο από τρεις. Δείξε progress ring/number animation και επίδραση στο parent row.
- [ ] **S06.04** Μετακίνησε μία subtask πάνω/κάτω ή με drag, όπου υπάρχει. Δείξε hover/reorder controls και τελικό order.
- [ ] **S06.05** Διάγραψε **μόνο** τη δοκιμαστική subtask (πρώτα παρατήρησε αν ανοίγει confirmation ή γίνεται άμεσα). Δείξε update σε progress/remaining list.
- [ ] **S06.06** Κλείσε και ξανάνοιξε subtasks. Έλεγξε persistence και προετοιμάσου να εμφανιστεί η ίδια task στο Focus/Floating αργότερα.

## 12. S07 — Notes: inline, rich text, Focus και links

- [ ] **S07.01** Άνοιξε Notes σε test task από row/menu. Δείξε θέση, πλάτος, αρχικό κενό περιεχόμενο, animations και focus.
- [ ] **S07.02** Πρόσθεσε 2–3 γραμμές ουδέτερου κειμένου. Δείξε bold, italic, strike, bullets, numbering, undo/redo, επιλογή κειμένου και scroll του editor όπου υπάρχουν.
- [ ] **S07.03** Δοκίμασε κενές γραμμές, μεγαλύτερη σημείωση, wrapping, resize/expand (αν προσφέρεται), αποθήκευση με blur/close και ξανάνοιγμα.
- [ ] **S07.04** Έλεγξε safe tooltip/link handling χωρίς να ξεκινήσεις αυτομάτως άσχετη εξωτερική σελίδα. Μην εισαγάγεις ιδιωτικό URL.
- [ ] **S07.05** Κατάγραψε Notes σε **Focus** και **Floating Timer** ξανά στα S12–S13, διότι ίσως χρησιμοποιούν διαφορετική παρουσίαση και animation.

## 13. S08 — Scheduling, date/time picker και υπενθυμίσεις

- [ ] **S08.01** Άνοιξε scheduling από πραγματικό task menu. Δείξε ακριβώς popover/modal, visible shortcut options, calendar layout, week start, selected/disabled days, navigation months, labels, input focus.
- [ ] **S08.02** Επίλεξε **Today**, παρατήρησε θέση/lane/label και ξανάνοιξε για να δεις preselected state. Επανέλαβε με **Tomorrow**, **Later today** και **Next week**, **μόνο αν οι επιλογές υπάρχουν**. Αλλάζεις το ίδιο *δοκιμαστικό* task για να μην δημιουργηθεί άσκοπο πλήθος.
- [ ] **S08.03** Δοκίμασε custom date με ημερολόγιο και, αν υπάρχει, συγκεκριμένη **ώρα**. Σύγκρινε date-only εναντίον date+time και την οπτική εμφάνιση scheduled group.
- [ ] **S08.04** Κατέγραψε Clear/Remove schedule, Cancel/Apply, Escape και outside-click όπου εφαρμόζονται. Μη μαντεύεις συμπεριφορά μη ορατού control.
- [ ] **S08.05** Προγραμμάτισε **M11 Due Tomorrow** για μελλοντική ημερομηνία και παρατήρησε αλλαγή lane. Αν υποστηρίζονται future-time Today tasks, κατέγραψε αν φαίνονται αλλά δεν ξεκινούν ακόμη σε Blitz.
- [ ] **S08.06** Εξέτασε reminder controls: on/off, προεπιλεγμένος χρόνος, επιλογές, disabled/conditional states, χωρίς να μεταβάλεις άσχετες OS security/notification settings.
- [ ] **S08.07** Μην αλλάξεις το ρολόι Windows για να προκαλέσεις due date ή notification. Όπου απαιτείται πραγματική αναμονή ή πρόσβαση που δεν υπάρχει, σημείωσε **NOT OBSERVED / SAFE LIMITATION**.

## 14. S09 — Recurrence: όλες οι επιλογές και branches

- [ ] **S09.01** Άνοιξε recurrence σε **M11 Repeat**. Δείξε **όλες** τις διαθέσιμες επιλογές: daily, weekdays, weekly, monthly, custom interval/weekday όπου πράγματι υπάρχουν.
- [ ] **S09.02** Για κάθε επιλογή πρώτα κάνε hover/preview, έπειτα επίλεξε **ένα** representative rule και δείξε αλλαγές form, selected state, description/preview, Save/Cancel.
- [ ] **S09.03** Δημιούργησε ασφαλές recurring test task. Δείξε parent/instance σε Backlog/Today/This Week όπως εμφανίζεται πραγματικά, menu/repeated symbol, σχέση task και ημερομηνίας.
- [ ] **S09.04** Άνοιξε Edit recurrence και δοκίμασε cancel, αλλαγή κανόνα, επιλογή **Replace Existing Tasks** εάν υπάρχει και είναι ασφαλές πάνω σε test-only data. Κατέγραψε όλα τα warning/confirmation states.
- [ ] **S09.05** Δοκίμασε Remove/Detach recurrence σε **test data**, πρώτα cancel όπου υπάρχει. Δείξε ποια instances παραμένουν/εξαφανίζονται και την προοπτική ιστορικού. Μην κάνεις destructive αλλαγές σε πραγματικά tasks.
- [ ] **S09.06** Μετά από κλείσιμο/επανείσοδο στη λίστα κατέγραψε persistence και το αν επανεμφανίζεται parent/children χωρίς απροσδόκητο duplication.

## 15. S10 — Κάθε μορφή διαγραφής, αρχειοθέτησης και ανάκτησης

**Αυτή η ενότητα είναι υποχρεωτική γιατί το «Delete» δεν ορίζεται μόνο από το αποτέλεσμα.** Για κάθε είδος διαγραφής καταγράφεται το **πριν → trigger → prompt ή direct action → cancel → confirm → transition → τελικό state**.

- [ ] **S10.01 Task delete:** Σε **M11 Delete Test** άνοιξε overflow και Delete, **χωρίς να θεωρήσεις δεδομένο modal**. Αν εμφανιστεί, δείξε backdrop, copy, icon, confirm/cancel, focus/default, hover και animation· επίλεξε **Cancel** αρχικά.
- [ ] **S10.02 Task delete confirm:** Επανέλαβε σε ίδιο disposable test task και επίλεξε Confirm εφόσον επιτρέπεται. Δείξε πώς εξαφανίζεται row, πώς αναδιατάσσονται οι άλλες, counters/progress, messages/toasts, scroll/focus και αν η πράξη είναι undoable.
- [ ] **S10.03 List archive:** Άνοιξε Archive σε **M11 Archive Test** και κατέγραψε confirm/cancel ή άμεσο αποτέλεσμα, animation εξαφάνισης tile, navigation, Archived Lists placement.
- [ ] **S10.04 List restore:** Άνοιξε Archived Lists, δείξε empty/populated states και Restore/Unarchive μιας test list, καταγράφοντας επιστροφή Home/Board και διατήρηση σχετικών δεδομένων.
- [ ] **S10.05 Permanent list delete:** Αν απαιτεί archive-first, ξανααρχειοθέτησε test list και άνοιξε permanent delete. Κάνε **Cancel πρώτα**· Confirm **μόνο** αν η λίστα περιέχει αποκλειστικά disposable test data και το irreversible αποτέλεσμα έχει γίνει κατανοητό.
- [ ] **S10.06 Archived Done Tasks:** Άνοιξε sibling view, search/list filter, empty/filled, archived-task overflow, πιθανή restore και **αν** προσφέρεται permanent task deletion κάνε test-only cancel/confirm με τα ίδια στάδια.
- [ ] **S10.07** Κάνε επιστροφή σε Home/Reports όπου το αποτέλεσμα της test διαγραφής μπορεί να ελεγχθεί. Επανεξέτασε μετά την ασφαλή επανεκκίνηση στο S21 για persistence.
- [ ] **S10.08** Αν κάποιο Delete λειτουργεί **χωρίς** confirmation, μην το «διορθώσεις» οπτικά κατά την καταγραφή: κράτα το άμεσο αποτέλεσμα ως source evidence. Το Narro μπορεί να εφαρμόζει δικές του εγκεκριμένες δικλίδες ασφάλειας, ξεχωριστά από την παρατήρηση.

## 16. S11 — Blitzit now: είσοδος στο Focus και queue

- [ ] **S11.01** Βάλε αρκετές τεχνητές εργασίες στο **Today**, με συγκεκριμένη σειρά προτεραιότητας και διαφορετικά EST. Άφησε το board σταθερό: Today's progress, total, gradient CTA, highlighted lane.
- [ ] **S11.02 — SYNC MID** Κάνε συμφωνημένη αναγνωρίσιμη ενέργεια πριν από το Focus entry. Αν δημιουργείς test task για συγχρονισμό, έλεγξε και τη θέση του.
- [ ] **S11.03** Κάνε hover στο **Blitzit now**, έπειτα πάτησέ το μία φορά. **Μην κάνεις αμέσως άλλο κλικ.** Δείξε ολόκληρη board fade/gradient/transition, εμφάνιση Focus Panel και κατάσταση προηγούμενου main window.
- [ ] **S11.04** Δείξε το Focus **αμέσως μετά την είσοδο**: active task, timer, queue, Today progress, EST, list selector, done/scheduled groups, Notes/subtasks και controls.
- [ ] **S11.05** Κάνε hover σε κάθε queue row/active task/control. Δείξε menu, arrow/rocket, alternate actions, tooltip, menu dismissal, επιλογή λίστας.
- [ ] **S11.06** Reorder queue/test task με drag ή arrows αν υπάρχει. Δείξε ολόκληρη κίνηση και live counters.
- [ ] **S11.07** Δοκίμασε **Make Live/Switch Task** σε δεύτερο eligible test task. Δείξε swap active task, timer/title reset/continue, queue order, προηγούμενο Time Taken και πιθανές ειδοποιήσεις.
- [ ] **S11.08** Άνοιξε Notes και subtasks από Focus, συμπλήρωσε/ολοκλήρωσε test περιεχόμενο και κατέγραψε όλες τις transient states και αλλαγές στο progress.
- [ ] **S11.09** Άνοιξε Focus Preferences/selector και επέστρεψε. Δείξε Home/Exit action και αν διατηρείται η συνεδρία ή γίνεται Pause, χωρίς να χαθεί το setup για Floating.
- [ ] **S11.10** Αν δεν ξεκινά Focus επειδή όλα τα Today tasks είναι μελλοντικά, κατέγραψε disabled/error/empty state **χωρίς** αλλαγή συστημικής ώρας.

## 17. S12 — Focus live timer: Pause, Break, Skip, Done, success

- [ ] **S12.01** Δείξε running timer με ακριβή οπτική εξέλιξη για μερικά πραγματικά δευτερόλεπτα και όλες τις controls σε resting/hover states.
- [ ] **S12.02** Πάτησε **Pause**, περίμενε, άνοιξε relevant EST/Time Taken editors αν είναι ορατοί, κάνε Resume και έλεγξε τι αλλάζει στην εμφάνιση και στις durations.
- [ ] **S12.03** Πάτησε **Break** σε safe test session. Δείξε break UI, διάρκειες/controls, skip/end/resume όπου υπάρχουν, τυχόν αντίστροφη μέτρηση/alert. Μην περιμένεις μεγάλο break αν δεν μπορεί να ρυθμιστεί με ασφάλεια.
- [ ] **S12.04** Δοκίμασε **Skip** μόνο σε test task και δείξε switch στο επόμενο, queue position, elapsed Time Taken, messages.
- [ ] **S12.05** Πάτησε **Done** σε test task. Αν εμφανίζεται success/celebration state, δείξε **όλη** την είσοδο, copy, progress, εικόνες/GIF, ήχο (όπου ασφαλές), επιλογές **Next Task / Take a Break** αν πράγματι εμφανίζονται και exit animation.
- [ ] **S12.06** Πρώτα δοκίμασε μία διαδρομή success/Next Task και μετά **ξεχωριστό** test cycle για Take a Break, εφόσον προσφέρεται. Μη συμπεράνεις συμπεριφορά από μόνο το label.
- [ ] **S12.07** Ολοκλήρωσε test queue ώστε να φανεί το **last-task/empty-focus/all-done** state, τυχόν banner/screen και επιστροφή main. Για άλλη ενότητα Focus μπορείς να επανέλθεις με νέα test tasks.
- [ ] **S12.08** Κατάγραψε conditional variations success screen on/off και ήχου/GIF μόνο αφού εξεταστούν Preferences (S17), χωρίς να αλλάξεις απρόσεκτα το ενεργό timer στη μέση.

## 18. S13 — Floating Timer: compact, expanded, hover, κίνηση, θέση

- [ ] **S13.01** Από ενεργό Focus άνοιξε Floating Timer. Δείξε Focus → compact window transition, bounds, z-order, title/time, opacity/border/shadow, controls resting.
- [ ] **S13.02** Κάνε αργό hover **πάνω σε ολόκληρη** compact surface και χωριστά σε timer digits, title, buttons, corners/resize icon. Δείξε hidden controls που εμφανίζονται ή αποσύρονται, αλλαγές icon/gradient/tooltip.
- [ ] **S13.03** Δείξε collapsed → expanded subtasks, add/complete/reorder/delete μικρό test subtask, progress ring, scroll, expanded → collapsed, και αντίστοιχες animations.
- [ ] **S13.04** Δοκίμασε τις λειτουργίες Pause/Resume, Break, Skip, Notes, Done **όπου είναι διαθέσιμες**, σε disposable test tasks. Δείξε αν αλλάζει compact geometry ή ανοίγουν ξεχωριστά panels.
- [ ] **S13.05** Σύρε Floating Timer **μέσα στην ίδια οθόνη** από μία ασφαλή θέση σε άλλη. Δείξε mouse-down, actual movement, release, drag threshold, edges/snap και αν το timer μένει above άλλων κανονικών παραθύρων.
- [ ] **S13.06** Επέστρεψε από Floating → Focus και πάλι πίσω, ώστε να αποδειχτεί διατήρηση task identity/elapsed time και οπτική κατεύθυνση μετάβασης.
- [ ] **S13.07** Αν υπάρχουν δεύτερη οθόνη, left/right docking, movement μεταξύ monitors ή re-size, κατέγραψέ τα **μόνο σε ήδη διαθέσιμη ασφαλή διάταξη**. Μην αλλάξεις καλώδια/OS topology ή χρησιμοποιήσεις exclusive-fullscreen εφαρμογή.
- [ ] **S13.08** Κατέγραψε minimize/restore/main window focus και ορατότητα Floating. Αν υπάρχει Find Timer shortcut/attention animation, κάνε χρήση χωρίς να αλλάξεις global hotkeys άλλων εφαρμογών.

## 19. S14 — Timer modes: EST, Time's Up, overtime, Pomodoro, count-up

- [ ] **S14.01 EST countdown:** Με task που έχει πραγματικά μικρό EST, άφησε να φανεί κανονική αντίστροφη μέτρηση, κείμενο/unit, paused/running design.
- [ ] **S14.02 Time's Up:** Αν η αυθεντική Blitzit επιτρέπει *ασφαλές σύντομο* EST, άφησέ το να φτάσει φυσικά 00:00. Δείξε transition, ήχο/flash/message, **Time's Up** screen και επιλογές Extend/Done/Switch. Μην πειράζεις system clock ή διεργασίες για τεχνητό expiry.
- [ ] **S14.03 Extend/overtime:** Επίλεξε Extend όπου υπάρχει. Δείξε νέα οπτική timer μορφή, χρώμα/sign και πώς συνεχίζεται Time Taken. Έπειτα ολοκλήρωσε με test task.
- [ ] **S14.04 Count-up:** Κλείσε Pomodoro και δημιούργησε/χρησιμοποίησε task **χωρίς EST**. Δείξε από 00:00 την αύξουσα καταμέτρηση, pause/resume και τελικό work time.
- [ ] **S14.05 Pomodoro settings:** Ενεργοποίησε Pomodoro στο ασφαλές διαθέσιμο ελάχιστο/δοκιμαστικό interval, κατέγραψε εμφανιζόμενα dependent fields/switches και την επιστροφή στο live task.
- [ ] **S14.06 Pomodoro work → break → next work:** Αν ο κύκλος μπορεί να ολοκληρωθεί χωρίς μη ρεαλιστική αναμονή, δείξε όλες τις φάσεις, notification/prompt και manual resume. Αν όχι, **NOT OBSERVED** με λόγο, χωρίς να προσποιηθείς ότι είδες την αλλαγή.
- [ ] **S14.07** Επανέλαβε representative timer mode σε **Focus** και **Floating** όταν είναι ουσιαστικά διαφορετικό το visible UI. Μην εκτελέσεις όλες τις μακροχρόνιες διάρκειες μόνο για πληρότητα βίντεο.

## 20. S15 — Reports: Overview, charts, filters, εξαγωγή

- [ ] **S15.01** Από Home ή command palette άνοιξε Reports και περίμενε. Δείξε loader/empty/populated states, heading, tabs, header actions, all filters, chart axes/legend, cards.
- [ ] **S15.02** Στο Overview πέρασε τον κέρσορα **πάνω σε κάθε τύπο chart/σημείου**, κράτησε tooltip, μετακίνησε σε διαφορετικές μπάρες/ημέρες, δείξε legend toggles/hover όπου υπάρχουν.
- [ ] **S15.03** Δείξε metrics Total Work Days/Tasks Done/Time Worked/Averages, Most Productive hour/day/month, Time by List, completion punctuality/early-late με **δοκιμαστικά στοιχεία μόνο αν είναι διαθέσιμα**.
- [ ] **S15.04** Άνοιξε **List filter** και περιήγησε All Lists/μία test list, clear/cancel/apply και αλλαγές charts/counters.
- [ ] **S15.05** Άνοιξε **Date Range picker**. Κατέγραψε presets Today, Yesterday, This week, Last 30/60/90 days **όπου υπάρχουν**, custom calendar month navigation, two-date selection, hover/range highlight, Cancel/Apply και επίδραση στις κάρτες.
- [ ] **S15.06** Δοκίμασε empty-report range και restored/populated range, αν υπάρχει data. Κατέγραψε exact labels, units, zero states, loading/errors.
- [ ] **S15.07** Άνοιξε **Export PDF** μόνο με μη ευαίσθητα δεδομένα· δείξε default dialog/preview/save state χωρίς να δημοσιοποιήσεις περιεχόμενο πραγματικού λογαριασμού. Σώσε/επιθεώρησε δοκιμαστικό αρχείο μόνο αν ασφαλές και χρειάζεται.

## 21. S16 — Sessions/history: δημιουργία, αλλαγές, διαγραφή, CSV

- [ ] **S16.01** Άνοιξε Sessions tab και δείξε top totals, rows, chronological order, break visibility toggle, filters/search/date range, empty/populated states.
- [ ] **S16.02** Αν υπάρχουν δοκιμαστικά recorded sessions, άνοιξε detail μιας test task/session. Δείξε session number, date, start, end, duration, edit controls και κάθε focus/hover.
- [ ] **S16.03** Άνοιξε **Add Session** και δοκίμασε cancel, valid test create, invalid field state, final creation. Παρατήρησε αλλαγές σε totals/Reports.
- [ ] **S16.04** Επεξεργάσου μία χειροκίνητη test session: date/start/end/duration, Cancel/Save, και έλεγξε persistence/aggregates.
- [ ] **S16.05** Άνοιξε session Delete, δες prompt ή άμεση δράση, κάνε πρώτα Cancel αν υπάρχει και Confirm μόνο σε disposable test session. Δείξε totals και row disappearance.
- [ ] **S16.06** Δοκίμασε Hide/Show break sessions και πώς αλλάζει ο πίνακας (όχι αναγκαστικά τα ίδια aggregates).
- [ ] **S16.07** Άνοιξε Export CSV/PDF **ό,τι πράγματι προσφέρει η Blitzit** με ουδέτερα test δεδομένα· κατέγραψε ορατό αποτέλεσμα/dialog. Μη θεωρήσεις τα exports του Narro αποδεικτικό για το source UI.

## 22. S17 — Preferences: όλες οι ομάδες, υπο-καταστάσεις, alerts, celebration

Για **κάθε ορατή επιλογή**: πρώτα screenshot-like σταθερή οθόνη, μετά hover, click/open, επίδραση στα dependent controls, cancel/apply όπου υπάρχουν και τελικά αποκατάσταση της αρχικής τιμής (εκτός εάν έχει σχεδιαστεί test σε άλλο state).

- [ ] **S17.01 Blitz Panel:** monitor επιλογές, side Left/Right, disabled/unavailable, dropdown animation, επιλεγμένη οθόνη· μόνο ήδη υπάρχον monitors.
- [ ] **S17.02 General:** Theme System/Dark/Light, Hide EST / Time Taken, auto-parse EST from title, timezone/locale controls αν εμφανίζονται, start on wake/login αν επιτρέπεται η απλή επιθεώρηση χωρίς αλλαγές OS.
- [ ] **S17.03 Blitz Mode:** Pomodoros toggle, work sprint, break length, default manual break, scrolling long timer title· δείξε dependent control reveal/hide.
- [ ] **S17.04 Alerts:** timed alerts on/off, frequency, alert sound dropdown, preview/play/stop, volume, flash animation on timer, system notifications και schedule reminder timing. Στόχος είναι η **ορατή** ροή/ήχος όπου ασφαλές, όχι βίαιη ενεργοποίηση system notifications.
- [ ] **S17.05 Celebration:** Show success screen, GIF animation toggle, success sound preview, conditional controls enabled/disabled. Κατέγραψε ένα πραγματικό **test-task completion** με on, και αν γίνεται ένα με off, μετά την αποκατάσταση.
- [ ] **S17.06** Κατέγραψε scrolling μέσα στο Preferences panel, sticky headings/sidebars, collapse sections, helper text, tooltips, input validation και close/back behavior.
- [ ] **S17.07** Στο τέλος αποκατάστησε **μόνο τις ρυθμίσεις που άλλαξες** και κατέγραψε την κατάσταση. Μην ενεργοποιήσεις πληρωμένες λειτουργίες ή λογαριασμούς τρίτων για πληρότητα.

## 23. S18 — Χρώματα, themes, typography και οπτική συνέπεια

**Κρίσιμο:** Το Codex πρέπει να εξαγάγει **αυθεντικές Blitzit color values** από προσιτά, hash-verified client theme/styles/computed styles όπου επιτρέπεται. Το βίντεο *συμπληρώνει* αλλά δεν αποδεικνύει ότι τα sampled screen pixels ισούνται με το original HEX token.

- [ ] **S18.01** Δείξε ολόκληρο Home, Board με tasks, modal Create/Edit List, task hover/menu, Focus, Floating και Reports σε **Dark**.
- [ ] **S18.02** Επανέλαβε **τα ίδια βασικά states** σε **Light** (όχι νέο αυθαίρετο dataset): neutral canvas, cards, overlays, borders, dividers, shadow, focus ring, text hierarchy, gradients, accent/list colors.
- [ ] **S18.03** Αν υπάρχει **System** theme, κατέγραψε επιλογή και resulting appearance, χωρίς ανεξέλεγκτη αλλαγή OS theme αν δεν συμφωνήθηκε.
- [ ] **S18.04** Επανάλαβε representative **normal/hover/pressed/focus/selected/disabled/invalid/success** σε buttons, list swatches, tabs, inputs, checkboxes, progress, menus, modals και charts, σε κάθε διαθέσιμο theme.
- [ ] **S18.05** Άφησε σταθερή εικόνα για gradients, overlay/backdrop, alpha compositing, border/shadow και scrollbar, ώστε να μπορούν να γίνουν calibrated image comparisons.
- [ ] **S18.06** Δοκίμασε μεγάλα/πολύ μικρά κείμενα, ellipsis, text contrast και layout density. Σημείωσε αν το recording profile ή compression επηρεάζουν χρώματα.
- [ ] **S18.07** Μην επιβάλεις αλλαγή εμφάνισης/συμπεριφοράς στον ήδη εγκεκριμένο **Narro Spectrum Core Create/Edit List picker, image upload και 218 offline icons**: η source palette είναι υλικό μελλοντικής σχετικής σύγκρισης, όχι άδεια αλλαγής αυτών των κλειδωμένων εξαιρέσεων.

## 24. S19 — Keyboard, navigation, accessibility states και shortcuts

- [ ] **S19.01** Από Board και ανοιχτό modal δοκίμασε Tab/Shift+Tab, Enter/Space, Escape, focus ring, default button και έλεγξε αν κλείσιμο modal επαναφέρει σωστά το focus.
- [ ] **S19.02** Έλεγξε Ctrl+F search και quick task creation (π.χ. Ctrl+Alt+T) **μόνο εφόσον το UI/shortcut list το επιβεβαιώνει**.
- [ ] **S19.03** Σε test Focus δοκίμασε τα διαθέσιμα shortcut commands για Pause, Break, Skip, Done, Notes, εφόσον επιβεβαιώνονται από την αυθεντική Blitzit και δεν συγκρούονται με ασφαλείς λειτουργίες του συστήματος.
- [ ] **S19.04** Αν η Blitzit διαθέτει global shortcuts για Open main, Alternate Focus/Timer και Find Timer, δες configuration/on/off **χωρίς να αντικαταστήσεις άσχετες system/user bindings**. Επανέλαβε ένα ασφαλές enabled command και κατέγραψε την ορατή αντίδραση.
- [ ] **S19.05** Αν υπάρχει built-in shortcut dialog, κατέγραψε πλήρη scroll και κάθε toggle/tooltip.
- [ ] **S19.06** Εξέτασε keyboard focus και dismiss behavior σε popovers/menus, long scroll, disabled items και error states· απόφυγε accessibility settings αλλαγές στο OS χωρίς χωριστή απόφαση.

## 25. S20 — Loading, errors, όρια και μη συνηθισμένες καταστάσεις

- [ ] **S20.01** Με δοκιμαστικά στοιχεία δείξε empty lists, no-search-results, empty Reports/Sessions, μη επιλέξιμο Focus, και long title/notes, όσο αυτά προκύπτουν φυσικά.
- [ ] **S20.02** Δοκίμασε ακύρωση form, unsupported input, duplicate visible title ή invalid date **μόνο εφόσον δεν απειλεί δεδομένα**. Κατέγραψε validation errors/copy.
- [ ] **S20.03** Δείξε pending/loading όταν εμφανίζονται φυσικά μετά από νόμιμη δράση, καθώς και retries/timeouts **μόνο αν προκύψουν χωρίς** network tampering, forced outages, fuzzing ή παράκαμψη ελέγχων.
- [ ] **S20.04** Αν προκύψει crash/bug/strange animation, **μην κόψεις** το βίντεο ούτε σβήσεις την ανεπιθύμητη κατάσταση. Κατέγραψέ την· επανάληψη σε νέο attempt μόνο μετά την αρχική λήψη.
- [ ] **S20.05** Μην επιχειρήσεις να προκαλέσεις fail με αφαίρεση δικτύου ή παρεμβολή σε authentication, ανεξέλεγκτη αλλαγή Windows ώρας, αφαίρεση οθόνης, kill διεργασιών ή επέμβαση σε ακατέργαστο proprietary storage. Εκτός νόμιμης κανονικής UI χρήσης σημείωσε NOT TESTED.
- [ ] **S20.06** Για κάθε μη προσβάσιμη λειτουργία κατέγραψε το πραγματικό reason: δεν υπάρχει στο συγκεκριμένο build/tier, unavailable UI, time-limited, safety-limited ή capture failure — όχι αυθαίρετη εικασία ότι δεν την έχει ποτέ η Blitzit.

## 26. S21 — Persistence, window lifecycle, restart

- [ ] **S21.01** Κράτησε από test data ένα χαρακτηριστικό list color/title, ένα reordered task, ένα scheduled/recurring task, μια note/subtask, μια completed task και μια session με πραγματικό elapsed.
- [ ] **S21.02** Πήγαινε Home → άλλαξε λίστα → ξαναγύρισε. Δείξε αν διατηρείται κάθε επιλεγμένο state, η σειρά και το scroll/focus.
- [ ] **S21.03** Ελαχιστοποίησε/επανέφερε Blitzit, δες tray αν υπάρχει, Focus/Floating presentation όπου ασφαλές. Κατέγραψε task/time continuity.
- [ ] **S21.04** **Μόνο με συνεννόηση και ενεργό logging** κάνε κανονικό κλείσιμο και επανεκκίνηση **της Blitzit** (όχι αλλαγή εγκατάστασης/OS). Αν το logger δεν επιβιώνει, νέο διασυνδεδεμένο capture session με ρητό gap· δεν διαγράφεται η αρχική καταγραφή.
- [ ] **S21.05** Έλεγξε ξανά τα παραπάνω persisted examples, τη συμπεριφορά τυχόν interrupted Focus/Timer και τη σταθερότητα Reports/Sessions. Μην υποθέτεις server persistence ή local DB semantics μόνο από το animation.
- [ ] **S21.06** Μην εκτελέσεις uninstall/reinstall, manual διαγραφή AppData, migration, fresh profile, hardware hotplug ή OS sleep experiments στο πλαίσιο αυτού του ασφαλούς guide.

## 27. S22 — Τελική συνολική περιήγηση και SYNC END

- [ ] **S22.01** Πέρνα σύντομα αλλά προσεκτικά ξανά από Home, μια list card, Board, list/task overflow, task scheduling, Focus, Floating, Preferences, Reports/Overview και Sessions. Σκοπός να εντοπίσεις **εκείνη τη στιγμή** τι έμεινε εκτός. Κατά τη διαδρομή πρόσεξε και **νέες, μη καταλογογραφημένες τοπικά χρήσιμες λειτουργίες**, χωρίς να ανοίξεις excluded service areas.
- [ ] **S22.02** Κάνε ασφαλή **SYNC END** άγκυρα που έχει συμφωνηθεί με το Codex. Δείξε σταθερή τελική εικόνα με ενεργό session ID/τελευταίο test item όταν γίνεται.
- [ ] **S22.03** Κλείσε πρώτα την **εγγραφή βίντεο**. Τότε το Codex σταματά/επαληθεύει τεχνικά logs και υπολογίζει metadata/hashes· **όχι νωρίτερα**.
- [ ] **S22.04** Μην επεξεργαστείς το πρωτότυπο βίντεο. Αν χρειάζεται redaction/clip για sharing, φτιάξε χωριστό αντίγραφο, διατηρώντας το τοπικό original ασφαλές. Μην ανεβάσεις raw network/auth traces ή proprietary installer/binaries στο GitHub.
- [ ] **S22.05** Σημείωσε μόνο τα section IDs που δεν μπόρεσαν να εκτελεστούν και τον λόγο τους. Το Codex αποφασίζει αν χρειάζεται *στοχευμένη συμπληρωματική λήψη*, πριν παγώσει πλήρως το evidence corpus.

## 28. Γρήγορος πίνακας κάλυψης πριν το κλείσιμο

Αυτός **δεν** αντικαθιστά τα αναλυτικά βήματα. Είναι έλεγχος ότι δεν ξεχάστηκε ολόκληρη κατηγορία.

| ID | Ομάδα | Καταγράφηκε; |
| --- | --- | --- |
| S00–S01 | Startup, Home, list tiles, navigation, search | [ ] |
| S02 | Create/Edit List, palette, image/icon, validation | [ ] |
| S03–S05 | Board empty/filled, tasks, EST, Time Taken, hover, reorder, drag/lane movements | [ ] |
| S06–S07 | Subtasks, progress, Notes/editor/formatting | [ ] |
| S08–S09 | Schedule/date/time, reminders, recurrence/custom/replace/detach | [ ] |
| S10 | Delete/cancel/confirm, archive/unarchive, permanent deletion, archived tasks | [ ] |
| S11–S12 | Board→Focus, queue, live switch, pause/break/skip/done/success | [ ] |
| S13–S14 | Floating timer, micro-controls, drag/move/expand, EST/Time's Up/Pomodoro/count-up | [ ] |
| S15–S16 | Reports/Overview, charts/filters/date ranges/exports, Sessions/create/edit/delete | [ ] |
| S17–S18 | Preferences, alerts, celebration, dark/light/system and authentic palette evidence | [ ] |
| S19–S20 | Keyboard, shortcuts, focus, boundary/empty/validation/error states | [ ] |
| S21–S22 | Persistence/restart, final overview and synchronized END | [ ] |
| DISCOVERY | Νέα άγνωστα τοπικά χρήσιμα features: βασικά τεκμήρια / νέα ασφαλή flows· εξαιρούμενες online υπηρεσίες SKIPPED | [ ] |

**Σημασία του check:** ένα checkbox σημαίνει ότι *ακολουθήθηκε το script*, **όχι** ότι κάθε μικροκατάσταση επιβεβαιώθηκε. Η τελική source completeness κρίνεται από το Codex στο per-interface evidence ledger μετά από έλεγχο του **πραγματικού raw video και των διαθέσιμων logs**.

## 29. Αν κάτι πάει στραβά

| Περίπτωση | Τι κάνεις |
| --- | --- |
| Ένα κουμπί/feature δεν υπάρχει | Δείχνεις τη σχετική οθόνη, συνεχίζεις· σημειώνεις ID + «δεν εμφανίστηκε», όχι τεχνητή αναπλήρωση. |
| Δεν υπάρχει τεχνικό log ή το Codex δεν έδωσε READY | **Μην αρχίσεις το συγχρονισμένο session ως δήθεν έγκυρο**· πρώτα εξακρίβωση capture capability ή ρητή, τεκμηριωμένη απόφαση για visual-only evidence. |
| Log αποσυνδέθηκε στη μέση | Δεν κρύβεις gap, συνεχίζεις οπτικά αν είναι ασφαλές· Codex καταγράφει μη παρατηρημένο διάστημα και τυχόν επανεκκίνηση logger. |
| Βίντεο κόπηκε τεχνικά | Διατήρησε τα κομμάτια ως raw parts με timestamps και νέο synchronization anchor· όχι αθόρυβο splice. |
| Ανοίγει μυστικό/account/ιδιωτικό περιεχόμενο | Σταμάτα/κάλυψε την ευαίσθητη έκθεση και πρόσθεσε redacted derivative. Μην ανεβάσεις το raw. |
| Ένα destructive test δεν είναι ασφαλές | Κάνεις μόνο άνοιγμα/Cancel, σημειώνεις confirm NOT TESTED. Δεν διαγράφεις πραγματικά δεδομένα. |
| Timer mode χρειάζεται πολλή ώρα | Καταγράφεις αρχή και διαθέσιμα controls, δηλώνεις completion transition NOT OBSERVED. Δεν αλλάζεις system clock. |
| Οι οθόνες έχουν διαφορετικό layout | Κρατάς τη version-specific συμπεριφορά, δεν την «διορθώνεις» ώστε να μοιάζει με παλιό Pass-3. |
| Μία μικρο-κίνηση δεν φαίνεται στα FPS | Codex τη σημειώνει UNRESOLVED/FRAME-LIMITED, όχι ως μετρημένη ακριβή διάρκεια. |

## 30. Τι πρέπει να παραδώσει τελικά το Codex από αυτόν τον οδηγό

Το Codex, **αφού** ολοκληρωθεί η καταγραφή και το frozen corpus, πρέπει να δημιουργήσει:

1. **Χάρτη κάθε διεπαφής/συστατικού/state/transition** με IDs S00–S22, συμπεριλαμβάνοντας όλα τα menus, hover/pressed/focus, empty, pending, disabled, error, modals, tooltips, notifications και πραγματικά edge cases.
2. **Χρονολόγιο οπτικών ενεργειών** με video file/hash, timecodes, πριν/μετά frames, original FPS, διάρκειες όπου μετρήσιμες, motion sequencing, geometry, copy, color, opacity, gradient, transition και visual hierarchy.
3. **Συγχρονισμένο event/state ledger** με ακριβή endpoints/event shapes/state/persistence traces **μόνο όπου παρατηρήθηκαν**, capture channel, clock offset/drift, matching confidence και explicit unsupported/missing coverage.
4. **Αυθεντική παλέτα Blitzit** από ανακτήσιμες αρχικές τιμές CSS/theme/style/asset/computed style με provenance, theme/state/semantic roles/alpha/gradients. Ξεχωριστά rendered pixel samples και approximations, ποτέ σύγχυση με επαληθευμένα HEX.
5. **Σύγκριση Blitzit ↔ Narro ανά state** (οπτικό, λειτουργικό, motion, timing, navigation, persistence), με διάκριση version-specific source behavior, confirmed parity, gap, accepted Narro exception και unknown.
6. **Τεκμηριωμένη ανακατασκευή** με ορθή Narro-local λογική όπου δεν γνωρίζουμε original code. Οι λειτουργίες πρέπει να δουλεύουν end-to-end· μια screenshot-like αλλά ανενεργή οθόνη δεν αρκεί.
7. **Ολοκληρωμένο reconciliation και επιλεγμένες διορθώσεις** μόνο μετά το freeze και την πλήρη analysis phase, με regression tests, CI, πραγματική affected validation και source-to-Narro side-by-side αποδείξεις.
8. **Ξεχωριστό μητρώο νέων χαρακτηριστικών που δεν υπήρχαν στα προηγούμενα evidence**: όνομα/θέση/έκδοση/source timecode, συνοπτική λειτουργία, βαθμός βεβαιότητας και κατηγορία (ήδη καλυμμένο, νέο υποψήφιο τοπικό feature για μελλοντική προσθήκη, εξαιρούμενη online υπηρεσία, ασαφές). Τα καθαρά online features δεν υποβάλλονται σε πλήρη ανάλυση. Η καταχώριση νέου υποψήφιου feature **δεν** το μετατρέπει αυτόματα σε υποχρεωτική υλοποίηση του M11.

**Προστατευόμενες εξαιρέσεις:** Narro local-only architecture, data integrity/accessibility/Windows correctness, εγκεκριμένο Spectrum Core Create/Edit List picker, image upload και 218 offline icons. Δεν προσθέτουμε cloud/subscription/AI/integrations μόνο επειδή εμφανίστηκαν στην πηγή.

**Κανόνας ολοκλήρωσης:** «Κάλυψα όλες τις ενότητες του βίντεο» δεν ισούται με «όλες οι διεπαφές ελέγχθηκαν». Το Codex πρέπει να επαληθεύσει τις πραγματικές observed states/branches, να αιτιολογήσει τα κενά και να καταγράψει τις αναγκαίες συμπληρωματικές λήψεις προτού δηλώσει ότι το corpus ολοκληρώθηκε.

---

**Σχετικά τεκμήρια:** [Κύριο M11](BLITZIT_LIVE_REFERENCE_AUDIT.md) · [Pass-3 methodology](BLITZIT_FORENSIC_REAUDIT_PLAN.md) · [Product spec](PRODUCT_SPEC.md) · [Evidence routing](EVIDENCE_ROUTING_MAP.md) · [Audit crosswalk](AUDIT_IMPLEMENTATION_CROSSWALK.md).

**Υπενθύμιση:** Αυτός ο οδηγός δημιουργήθηκε μετά από ρητό αίτημα για **προετοιμασία εγγράφου**, όχι για εκκίνηση της προαιρετικής ζωντανής καμπάνιας M11. Το M11 παραμένει DORMANT και ο denominator των υποχρεωτικών milestones παραμένει 10.
