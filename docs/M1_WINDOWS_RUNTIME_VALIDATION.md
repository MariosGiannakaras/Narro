# Milestone 1: Windows Runtime Validation Harness

This document outlines the manual validation procedures for testing the Tauri 2 native runtime behavior on Windows. Since automated CI cannot interact with the desktop shell or prove Windows-specific morphological webview constraints, these scenarios must be run manually.

## Build and Run

To launch the harness locally:
\\\ash
npm run tauri dev
\\\

## Scenario 1: Shared Authoritative Rust State

**Goal**: Prove that both \main\ and \ocusSurface\ project the exact same state without duplicating authoritative copies in renderer memory.

**Steps**:
1. Launch the application. Both the \main\ window and \ocusSurface\ window should appear.
2. In the \main\ window, click **Mutate State (Counter)**.
3. Verify that the counter increments in the \main\ window.
4. **PASS/FAIL**: Look at the \ocusSurface\ window. Did it immediately receive the updated counter?
5. In the \ocusSurface\ window, click **Mutate State**.
6. **PASS/FAIL**: Did the \main\ window immediately receive the updated counter?

## Scenario 2: Main Window Programmatic Lifecycle

**Goal**: Prove that closing/destroying the \main\ window does not terminate the Rust process, and that recreating it instantly projects the current surviving state.

**Steps**:
1. Ensure the counter has been mutated to a recognizable value (e.g., 5).
2. In the \ocusSurface\ window, click **Hide Main**. Verify \main\ disappears.
3. In the \ocusSurface\ window, click **Show Main**. Verify \main\ reappears.
4. In the \ocusSurface\ window, click **Destroy Main** (or click the native Windows 'X' on the \main\ window). Verify \main\ is closed.
5. While \main\ is destroyed, click **Mutate State** in the \ocusSurface\ window. Verify the counter still increments in the focus UI (proving Rust state remains active).
6. **PASS/FAIL**: In the \ocusSurface\ window, click **Recreate Main**. Does the \main\ window reappear?
7. **PASS/FAIL**: In the newly recreated \main\ window, does it instantly display the correct surviving counter value (e.g., 6) rather than resetting to 0?

## Scenario 3: FocusSurface Morphing (Focus Panel <-> Floating Timer)

**Goal**: Prove that we can switch modes by dynamically resizing and restyling the *same* webview, without creating a third persistent window.

**Steps**:
1. Verify the list of Active Webviews in the \main\ window shows only \main, focusSurface\.
2. In the \ocusSurface\ window, click **Timer Mode**.
3. **PASS/FAIL**: Does the window resize to a compact geometry (300x100)?
4. **PASS/FAIL**: Open a normal maximized application (e.g., a web browser or Notepad). Does the compact Timer Mode window stay strictly **Always on Top**?
5. **PASS/FAIL**: Is the compact Timer Mode window hidden from the Windows Taskbar? (Skip-taskbar behavior).
6. In the compact \ocusSurface\ window, click **Panel Mode**.
7. **PASS/FAIL**: Does the window restore to panel geometry (400x700)?
8. **PASS/FAIL**: Does it correctly restore taskbar presence and drop its always-on-top constraint?
9. **PASS/FAIL**: Click **Refresh Window List** in the \main\ window. Does the list still show exactly \main, focusSurface\ (proving no 3rd window was created)?
