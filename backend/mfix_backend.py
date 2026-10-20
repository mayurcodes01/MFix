"""MFix backend: SQLite storage, script runner and snapshots. Called by Electron as: python mfix_backend.py <command> [args]. Prints one JSON object."""
import sys, os, json, time, shutil, string, sqlite3, subprocess

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
BASE = os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
SCRIPTS = os.path.join(ROOT, 'scripts')
DATA = os.path.join(os.environ.get('LOCALAPPDATA') or os.path.expanduser('~'), 'MFix')
os.makedirs(DATA, exist_ok=True)
with open(os.path.join(BASE, 'tools.json'), encoding='utf-8') as fh:
    META = json.load(fh)
TOOLS = {t['id']: t for t in META['tools']}
DEFAULTS = {'theme': 'aurora', 'blur': '22', 'refraction': '0', 'motion': 'normal', 'grain': '0', 'background': '1', 'auto_snapshot': '0', 'glass_window': '1'}
now = lambda: time.strftime('%Y-%m-%d %H:%M:%S')
gb = lambda n: f'{abs(n) / 2**30:.1f} GB'
mb = lambda n: f'{abs(n) / 2**20:.0f} MB'


def db():
    c = sqlite3.connect(os.path.join(DATA, 'mfix.db'))
    c.row_factory = sqlite3.Row
    c.executescript('create table if not exists runs(id integer primary key,tool text,started text,seconds real,code integer);'
                    'create table if not exists snaps(id integer primary key,label text,created text,data text);'
                    'create table if not exists settings(k text primary key,v text);')
    return c


def settings(c):
    s = dict(DEFAULTS)
    s.update({r['k']: r['v'] for r in c.execute('select k,v from settings')})
    return s


def dirsize(p, cap=60000):
    n = t = 0
    for r, _, fs in os.walk(p):
        for f in fs:
            n += 1
            try:
                t += os.path.getsize(os.path.join(r, f))
            except OSError:
                pass
            if n > cap:
                return t
    return t


def collect():
    disks = []
    for L in string.ascii_uppercase:
        p = L + ':\\'
        if os.path.exists(p):
            try:
                u = shutil.disk_usage(p)
                disks.append({'drive': L, 'total': u.total, 'free': u.free})
            except OSError:
                pass
    info = {}
    try:
        ps = ("$o=Get-CimInstance Win32_OperatingSystem;$s=@(Get-CimInstance Win32_StartupCommand|Select-Object -ExpandProperty Name);"
              "[pscustomobject]@{os=$o.Caption;memTotal=[int64]$o.TotalVisibleMemorySize;memFree=[int64]$o.FreePhysicalMemory;startup=$s}|ConvertTo-Json -Compress")
        info = json.loads(subprocess.run(['powershell', '-NoProfile', '-Command', ps], capture_output=True, text=True, timeout=60).stdout)
    except Exception:
        pass
    try:
        n = len(subprocess.run(['tasklist', '/fo', 'csv', '/nh'], capture_output=True, text=True, timeout=30).stdout.strip().splitlines())
    except Exception:
        n = 0
    st = info.get('startup') or []
    if isinstance(st, str):
        st = [st]
    tmp = os.environ.get('TEMP', '')
    return {'disks': disks, 'os': info.get('os', ''), 'mem_total_kb': info.get('memTotal', 0), 'mem_free_kb': info.get('memFree', 0),
            'processes': n, 'temp_bytes': dirsize(tmp) if tmp else 0, 'startup': st}


def summary(d):
    x = d['disks'][0] if d['disks'] else {'drive': '?', 'free': 0}
    for k in d['disks']:
        if k['drive'] == os.environ.get('SystemDrive', 'C:')[0]:
            x = k
    return f"Free on {x['drive']}: {gb(x['free'])}, processes {d['processes']}, temp {mb(d['temp_bytes'])}"


def snap_create(c, label):
    d = collect()
    c.execute('insert into snaps(label,created,data) values(?,?,?)', (label or 'Snapshot', now(), json.dumps(d)))
    c.commit()
    return {'ok': True}


def snap_diff(c, a, b):
    rows = [c.execute('select data from snaps where id=?', (i,)).fetchone() for i in (a, b)]
    if not all(rows):
        return {'ok': False, 'error': 'Snapshot not found.'}
    A, B = (json.loads(r['data']) for r in rows)

    def mv(label, x, fmt):
        return f'{label}: unchanged' if abs(x) < 1 else f'{label}: {"up" if x > 0 else "down"} {fmt(x)}'
    L = []
    da = {d['drive']: d for d in A['disks']}
    for d in B['disks']:
        if d['drive'] in da:
            L.append(mv(f"Free space on {d['drive']}", d['free'] - da[d['drive']]['free'], gb))
    L.append(mv('Temp files', B['temp_bytes'] - A['temp_bytes'], mb))
    L.append(mv('Free memory', (B['mem_free_kb'] - A['mem_free_kb']) * 1024, mb))
    p = B['processes'] - A['processes']
    L.append('Processes: unchanged' if p == 0 else f'Processes: {"up" if p > 0 else "down"} {abs(p)}')
    sa, sb = set(A['startup']), set(B['startup'])
    L.append('Startup entries added: ' + (', '.join(sorted(sb - sa)) or 'none'))
    L.append('Startup entries removed: ' + (', '.join(sorted(sa - sb)) or 'none'))
    return {'ok': True, 'lines': L}


def run(c, tid):
    t = TOOLS.get(tid)
    if not t:
        return {'ok': False, 'error': 'Unknown tool.'}
    if os.name != 'nt':
        return {'ok': False, 'error': 'Scripts can only run on Windows.'}
    import ctypes
    bat = os.path.join(SCRIPTS, t['file'])
    auto = settings(c)['auto_snapshot'] == '1'
    if auto:
        snap_create(c, 'Before ' + t['title'])
    start = time.time()
    if t['admin'] and not ctypes.windll.shell32.IsUserAnAdmin():
        ps = ("try{$p=Start-Process -FilePath cmd.exe -ArgumentList '/c','\"%s\"' -Verb RunAs -Wait -PassThru;exit $p.ExitCode}catch{exit 9}"
              % bat.replace("'", "''"))
        code = subprocess.run(['powershell', '-NoProfile', '-Command', ps]).returncode
    else:
        code = subprocess.run(['cmd.exe', '/c', bat], creationflags=getattr(subprocess, 'CREATE_NEW_CONSOLE', 0)).returncode
    secs = round(time.time() - start, 1)
    c.execute('insert into runs(tool,started,seconds,code) values(?,?,?,?)', (tid, now(), secs, code))
    c.commit()
    if auto:
        snap_create(c, 'After ' + t['title'])
    return {'ok': True, 'code': code, 'seconds': secs}


def boot(c):
    root = os.environ.get('SystemDrive', 'C:') + '\\'
    try:
        free = round(shutil.disk_usage(root).free / 2**30)
    except OSError:
        free = 0
    runs = [{'title': TOOLS[r['tool']]['title'] if r['tool'] in TOOLS else r['tool'], 'started': r['started'], 'seconds': r['seconds'], 'code': r['code']}
            for r in c.execute('select * from runs order by id desc limit 8')]
    snaps = [{'id': r['id'], 'label': r['label'], 'created': r['created'], 'summary': summary(json.loads(r['data']))}
             for r in c.execute('select * from snaps order by id desc limit 40')]
    stats = {'runs': c.execute('select count(*) from runs').fetchone()[0], 'snaps': c.execute('select count(*) from snaps').fetchone()[0], 'free_gb': free}
    return {'ok': True, 'tools': META['tools'], 'cats': META['cats'], 'settings': settings(c), 'stats': stats, 'runs': runs, 'snaps': snaps}


def main(a):
    c = db()
    cmd = a[0] if a else ''
    if cmd == 'boot':
        return boot(c)
    if cmd == 'run' and len(a) > 1:
        return run(c, a[1])
    if cmd == 'snap_create':
        return snap_create(c, a[1] if len(a) > 1 else '')
    if cmd == 'snap_diff' and len(a) > 2:
        return snap_diff(c, int(a[1]), int(a[2]))
    if cmd == 'snap_delete' and len(a) > 1:
        c.execute('delete from snaps where id=?', (int(a[1]),))
        c.commit()
        return {'ok': True}
    if cmd == 'set' and len(a) > 2 and a[1] in DEFAULTS:
        c.execute('insert into settings(k,v) values(?,?) on conflict(k) do update set v=excluded.v', (a[1], a[2][:40]))
        c.commit()
        return {'ok': True}
    return {'ok': False, 'error': 'Unknown command.'}


if __name__ == '__main__':
    try:
        print(json.dumps(main(sys.argv[1:]), ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'ok': False, 'error': str(e)}))
