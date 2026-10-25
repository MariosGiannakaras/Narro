Narro M7 validation logs

This folder is created automatically only when narro-m7-validation.exe runs.
Upload the whole Narro-M7-Logs folder after the restart test so both process sessions and the terminal result remain available for debugging.
events.jsonl contains technical window/monitor/persistence events with timestamps.
No task titles, notes, list names, task descriptions, telemetry, or cloud uploads are recorded.
PASS requires a qualifying Timer drag, normal tray Quit, a new process/session, unchanged monitor topology, and a successful saved-position restore.
FAIL means the recorded persistence/restore data contradicts the expected placement.
INCONCLUSIVE means required evidence was missing or the topology changed during the restart test.
