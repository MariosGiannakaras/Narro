from pathlib import Path
import subprocess,sys,datetime,json,time,traceback
r=Path(__file__).parent.resolve()
def run(name,*args):
    result=subprocess.run([sys.executable,str(r/name),*args],capture_output=True,text=True,timeout=180 if name=='watch-deadlines.py' else 45)
    with (r/'bounded-runner.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'helper':name,'args':args,'exit':result.returncode,'out':result.stdout,'err':result.stderr})+'\n')
    if result.returncode:raise RuntimeError(result.stderr)
    return result
recording=False
try:
    run('focus-assist-scope.py','quiet-test-off')
    run('isolate-profile.py')
    run('seed-and-launch.py')
    run('obs-control.py','725632','Start Recording');recording=True
    # Activate actual existing Settings, leaving Narro running in the background.
    # No keyboard/mouse is sent to any unrelated application.
    import ctypes as c,ctypes.wintypes as w
    u=c.windll.user32;u.GetForegroundWindow.restype=w.HWND
    u.ShowWindow(790236,3)
    foreground=u.GetForegroundWindow();ft=u.GetWindowThreadProcessId(foreground,None);ct=c.windll.kernel32.GetCurrentThreadId()
    attached=bool(ft and ft!=ct and u.AttachThreadInput(ct,ft,True))
    try:
        u.BringWindowToTop(790236);u.SetForegroundWindow(790236)
    finally:
        if attached:u.AttachThreadInput(ct,ft,False)
    for _ in range(20):
        if u.GetForegroundWindow()==790236:break
        time.sleep(.1)
    assert u.GetForegroundWindow()==790236,'Background precondition failed'
    run('uia_controls.py','790236')
    run('watch-deadlines.py')
finally:
    if recording:
        try:run('obs-control.py','725632','Stop Recording')
        except Exception:traceback.print_exc()
    # Cleanup is local to this exact owned validation process/profile.
    try:
        launch=json.loads((r/'launch.json').read_text())
        run('tray_quit.py','normal Quit after bounded background probe')
        run('restore-profile.py')
    except Exception:traceback.print_exc()
    try:run('focus-assist-scope.py','restore')
    except Exception:traceback.print_exc()
    print('BOUNDED_CAPTURE_FINISHED',flush=True)
