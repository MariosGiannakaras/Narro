import sys

with open('src/App.tsx', 'r') as f:
    app = f.read()

# Add focus_surface_show etc
old_buttons = '''          <hr />
          <button onClick={() => runCmd("focus_surface_mode_panel")}>FocusSurface -&gt; Panel</button>
          <button onClick={() => runCmd("focus_surface_mode_timer")}>FocusSurface -&gt; Timer</button>
        </div>'''
        
new_buttons = '''          <button onClick={() => runCmd("main_window_close")}>Close Main</button>
          <hr />
          <button onClick={() => runCmd("focus_surface_show")}>Show FocusSurface</button>
          <button onClick={() => runCmd("focus_surface_hide")}>Hide FocusSurface</button>
          <button onClick={() => runCmd("focus_surface_focus")}>Focus FocusSurface</button>
          <button onClick={() => runCmd("focus_surface_mode_panel")}>FocusSurface -&gt; Panel</button>
          <button onClick={() => runCmd("focus_surface_mode_timer")}>FocusSurface -&gt; Timer</button>
        </div>'''

app = app.replace(old_buttons, new_buttons)

with open('src/App.tsx', 'w') as f:
    f.write(app)

