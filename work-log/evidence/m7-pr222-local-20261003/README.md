# PR #222 local regression evidence

These captures exercise production Notes/Create components and the production Focus coordinator CSS in an Edge test fixture. They are **automated browser evidence**, not screenshots of the Tauri EXE and not physical Windows acceptance.

All **18 light/dark scenarios PASS**: four Notes geometry/draft cases per theme, delayed Create success/error/empty per theme, and both transition directions per theme. HTML files retain the semantic result JSON. PNGs show the tested rendered states. Forward/reverse ownership tests also verify immediate restoration on rollback.

The full frontend preflight passed before the final scoped rollback-opacity correction. The final production build, affected transition/reduced-motion contracts, Rust formatting and the 18 rendered scenarios passed after that correction. Local Rust compile/Clippy/tests were NOT RUN because MSVC link.exe is absent; authoritative Windows CI remains required. Performance harness self-tests do not establish native idle CPU/memory acceptance.

[Provenance](provenance.json) identifies source file hashes and the local source commit; documentation/evidence-only rebases may subsequently change the final CI commit. [Hashes](manifest.json) cover the captured evidence. Native frame, Notes reachability, Greek shortcuts, keyboard ownership, normal/reduced motion, two-monitor drag/DPI/topology and same-EXE restart checks remain OPEN until observed on the exact final EXE.
