import sys

with open('src/Focus.tsx', 'r') as f:
    app = f.read()

old_buttons = '''      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={() => runCmd("mutate_state")}>Mutate State</button>
        <button onClick={() => runCmd("main_window_recreate")}>Recreate Main</button>
        <button onClick={() => runCmd("main_window_show")}>Show Main</button>
        <button onClick={() => runCmd("main_window_hide")}>Hide Main</button>
        <button onClick={() => runCmd("focus_surface_mode_panel")}>Panel Mode</button>
        <button onClick={() => runCmd("focus_surface_mode_timer")}>Timer Mode</button>
      </div>'''

new_buttons = '''      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={() => runCmd("mutate_state")}>Mutate State</button>
        <button onClick={() => runCmd("main_window_recreate")}>Recreate Main</button>
        <button onClick={() => runCmd("main_window_show")}>Show Main</button>
        <button onClick={() => runCmd("main_window_hide")}>Hide Main</button>
        <button onClick={() => runCmd("main_window_destroy")}>Destroy Main</button>
        <button onClick={() => runCmd("main_window_close")}>Close Main</button>
        <button onClick={() => runCmd("focus_surface_mode_panel")}>Panel Mode</button>
        <button onClick={() => runCmd("focus_surface_mode_timer")}>Timer Mode</button>
      </div>'''

app = app.replace(old_buttons, new_buttons)

with open('src/Focus.tsx', 'w') as f:
    f.write(app)

