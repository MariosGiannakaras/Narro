from pathlib import Path
import subprocess, re, json, hashlib, datetime

ROOT = Path(__file__).parent
SRC = Path(r'E:\SystemFiles\Desktop\Narro-PA352')
OUT = ROOT / 'analysis' / 'pa05-automated'
OUT.mkdir(parents=True, exist_ok=True)
HEAD = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=SRC, text=True).strip()
assert HEAD == 'f7456738b8b8498387d4d9637409c4a384f95ba3'
def blob(ref, path):
    return subprocess.check_output(['git', 'show', f'{ref}:{path}'], cwd=SRC)
files = ['src-tauri/src/windows/mod.rs', 'src-tauri/src/windows/topology.rs',
         'src-tauri/src/floating_placement.rs', 'src-tauri/src/timer_region.rs',
         'src/diagnosticApi.ts']
proof = {'source': HEAD, 'nativeEvidenceSource': '35528dea', 'files': [], 'functions': []}
for p in files:
    old, new = blob('35528dea', p), blob(HEAD, p)
    assert old == new, p
    proof['files'].append({'path': p, 'identical': True, 'sha256': hashlib.sha256(new).hexdigest()})
oldlib, newlib = blob('35528dea', 'src-tauri/src/lib.rs').decode(), blob(HEAD, 'src-tauri/src/lib.rs').decode()
for name in ['monitor_descriptor', 'resolve_monitor_by_key', 'preferred_focus_panel_work_area',
             'apply_panel_native', 'revalidate_open_focus_panel_after_display_change',
             'refresh_open_timer_region_for_dpi_change', 'revalidate_open_timer_after_display_change']:
    pat = re.compile(r'^(?:pub(?:\([^\n]*?\))?\s+)?fn ' + re.escape(name) + r'\b[\s\S]*?^}', re.M)
    a, b = pat.search(oldlib), pat.search(newlib)
    assert a and b, name
    assert a.group() == b.group(), name
    proof['functions'].append({'name': name, 'identical': True,
                               'sha256': hashlib.sha256(b.group().encode()).hexdigest()})
# Execute the exact committed Preferences contract and its exact committed inputs.
# This avoids the known CRLF-sensitive literal assertion in a core.autocrlf checkout.
canonical = OUT / 'canonical-git-bytes'
script = 'scripts/test-ui-preferences.mjs'
raw = blob(HEAD, script)
dependencies = set(re.findall(r'\bread\("([^"]+)"\)', raw.decode()))
for p in sorted(dependencies | {script}):
    dest = canonical / p
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(blob(HEAD, p))
result = subprocess.run(['node', script], cwd=canonical, capture_output=True, text=True)
(OUT / 'test-ui-preferences-canonical-git-bytes.txt').write_text(result.stdout + result.stderr, encoding='utf-8')
assert result.returncode == 0, result.stderr
proof['preferencesCanonicalGitBytes'] = {'exitCode': result.returncode, 'files': len(dependencies) + 1,
    'workingTreeAttempt': 'CRLF-sensitive static assertion failed; exact Git-byte execution PASS; no product failure inferred'}
ci = (ROOT / 'analysis' / 'pa356-ci-complete.log').read_text(encoding='utf-8-sig')
groups = ['windows::tests::', 'windows::topology::tests::', 'floating_placement::tests::',
          'monitor_selection_tests::', 'timer_region::tests::', 'persistence::floating_placement::tests::']
tests = []
for line in ci.splitlines():
    match = re.search(r'\btest ([\w:]+) \.\.\. (ok|FAILED|ignored)', line)
    if match and any(match[1].startswith(g) for g in groups):
        tests.append({'name': match[1], 'result': match[2]})
assert tests and all(t['result'] == 'ok' for t in tests)
proof['exactWindowsCi'] = {'run': 38688646540, 'selectedTests': tests, 'passed': len(tests)}
(OUT / 'exact-windows-ci-selected-tests.txt').write_text('\n'.join(
    line for line in ci.splitlines() if any(g in line for g in groups)) + '\n', encoding='utf-8')
proof['generatedAtUtc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
(OUT / 'source-and-validation-proof.json').write_text(json.dumps(proof, indent=2), encoding='utf-8')
print(json.dumps({'sourceFilesIdentical': len(files), 'nativeFunctionsIdentical': len(proof['functions']),
    'windowsTestsPassed': len(tests), 'preferencesCanonical': result.returncode}))
