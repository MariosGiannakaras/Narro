-- One native Floating Timer placement; updated after settled user moves.
CREATE TABLE floating_timer_placement (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    payload_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
