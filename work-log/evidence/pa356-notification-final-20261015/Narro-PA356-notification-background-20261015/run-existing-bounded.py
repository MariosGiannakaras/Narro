from pathlib import Path
import subprocess,sys,datetime,json,time,ctypes as c,ctypes.wintypes as w
r=Path(__file__).parent.resolve();errors=[];recording=False
def run(name,*args):
    p=subprocess.run([sys.executable,str(r/name),*args],capture_output=True,text=True,timeout=180 if name=='watch-deadlines.py' else 45)
    with (r/'bounded-runner.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'helper':name,'args':args,'exit':p.returncode,'out':p.stdout,'err':p.stderr})+'\n')
    if p.returncode:raise RuntimeError(p.stderr)
    return p
try:
    run('focus-assist-scope.py','quiet-test-off');run('arm-existing.py')
    run('obs-control.py','725632','Start Recording');recording=True
    plan=json.loads((r/'probe-plan.json').read_text());h=plan['mainHwnd'];u=c.windll.user32;u.GetForegroundWindow.restype=w.HWND
    u.ShowWindow(w.HWND(h),6);time.sleep(.3);fg=u.GetForegroundWindow();pid=w.DWORD();u.GetWindowThreadProcessId(fg,c.byref(pid))
    assert u.IsIconic(w.HWND(h)) and pid.value!=json.loads((r/'launch.json').read_text())['pid']
    (r/'background-precondition.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'main':h,'minimized':True,'foreground':int(fg),'foregroundPid':pid.value},indent=2))
    run('watch-deadlines.py')
finally:
    if recording:
        try:run('obs-control.py','725632','Stop Recording')
        except Exception as e:errors.append(str(e))
    try:run('tray_quit.py');run('restore-profile.py')
    except Exception as e:errors.append(str(e))
    try:run('focus-assist-scope.py','restore')
    except Exception as e:errors.append(str(e))
    (r/'cleanup-result.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'errors':errors},indent=2))
    print(json.dumps({'finished':True,'cleanupErrors':errors}),flush=True)
    if errors:raise RuntimeError(errors)
