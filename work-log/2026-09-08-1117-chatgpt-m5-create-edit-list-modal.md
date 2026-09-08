# M5 Create/Edit List modal — validated

Date: 2026-09-08 (Europe/Athens)

## Scope

Completed only the ordered Milestone 5 item `Create/Edit List modal with icon import, color selection, title, cancel/create states`.

Validated implementation:

- one reusable accessible Create/Edit List modal with dimmed viewport backdrop, close control, Escape dismissal, Tab focus trap and opener-focus restoration;
- local JPG/JPEG/PNG/SVG icon selection and preview with frontend and Rust size/content validation and a 1 MiB cap;
- rejection of scripted, `javascript:` and DOCTYPE SVG payloads;
- Narro-owned app-data `list-icons/` storage using UUID filenames, with only relative owned paths persisted;
- persistence-first reuse of the validated M2 `create_list` and `update_list` boundaries;
- renderer-facing create/edit commands return success only; after commit the modal closes and Home re-reads authoritative SQLite state;
- typed invalid-input/not-found/general failures keep the modal open;
- new imported icons are cleaned on failed mutations, database-open failure occurs before icon write, partial temporary writes receive best-effort cleanup, replaced old icons are removed only after update commit, and cleanup refuses non-owned paths;
- real runtime Create entry points are wired from the sidebar and Home, and real Edit is wired from the existing card menu;
- Open, Duplicate and Archive remain unbound because their targets are later ordered items;
- deterministic light/dark create/edit fixtures validate modal semantics, selected color state, measured DOM-layout viewport backdrop coverage, strict 1280x720 PNG output and geometry-only light/dark parity;
- deterministic `scripts/test-ui-list-editor-modal.mjs` coverage is part of frontend preflight;
- no list board, detailed task-card states, drag/drop, inline task editing, scheduling, subtasks, notes, list settings, search, Settings or Reports behavior was absorbed.

## Exact PR validation

PR #83: `M5: add Create/Edit List modal`.

Final validated PR head:

`17f3e3c1b9c7fad562b6bc7e05eee029bf047598`

Windows PR CI #307:

- run `34204710799`;
- job `101991403060`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10047503212`, digest `sha256:41bc8583d36927989be1c604151e69df97b70e24b9cf0df6b1c2e67127398371`;
- diagnostic artifact `10047701183`, digest `sha256:646145f1a90ce6434080e7cac9f283023369d2106517da3996265281eef1a03e`;
- final exact-head semantic/diff review: **PASS**; 16 changed files confined to the list editor, existing Home/App-shell wiring, visual harness/tests and branch tracking;
- PR comments, submitted reviews and inline review threads requiring resolution: **none**.

The final reliability review before merge additionally hardened two icon-storage failure boundaries: database availability is established before a new icon write, and failed partial temporary writes receive best-effort cleanup. Both changes were included in the exact head above and revalidated by CI #307.

PR #83 was squash-merged with expected-head guard `17f3e3c1b9c7fad562b6bc7e05eee029bf047598`.

## Resulting-main validation

Validated source/test SHA:

`997ba6d019425ec2a15fdef630ca50c2fbab981f`

Windows main CI #308:

- run `34206908315`;
- job `101998422358`;
- exact source SHA `997ba6d019425ec2a15fdef630ca50c2fbab981f`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10048388708`, digest `sha256:67e1919bd4e996a9fae786bea1f0fe5da73a3327b8cdf6a24a531934992ab840`;
- diagnostic artifact `10048640730`, digest `sha256:163c10356a44fc7238aead403f5d465bbe47b8ae4b1d69a52773219368792c3d`.

Markdown-only tracking descendants do not replace the validated source/test SHA above.

## Continuation

Milestone 5 advances to **11 of 28** validated top-level items.

The next ordered item is `List board with Backlog, This Week, Today, Done`.

Start from the validated persistence/domain planning buckets plus current Home/List Editor navigation. Implement the narrow list-board hierarchy and minimum real read projection/navigation only. Keep the later detailed task-card state model, drag/drop/reorder, inline editing, EST/Time Taken editing, scheduling/recurrence editor, subtasks, notes, list settings, search, Settings and Reports out of scope unless a strict dependency is documented.

Blockers: none.
