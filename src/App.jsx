import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import anime from 'animejs';
import { Wrench, Camera, SlidersHorizontal, Info, Play, Search, Trash2, ExternalLink, ShieldCheck, MessageCircleQuestion, LayoutDashboard, HardDrive, Wifi, RefreshCw, Battery, MemoryStick, Cpu, Printer, Volume2, Monitor, Power, Image, FolderOpen, Clipboard, Rocket, FileText, Activity, KeyRound, History, Zap, Network, Database, Sparkles, CircleCheck } from 'lucide-react';
import Background from './Background.jsx';
import Splash from './Splash.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { cn } from '@/lib/utils';

// [base, color one, color two, color three]
const THEMES = {
  aurora: ['#0a0a1f', '#7c5cff', '#22d3ee', '#f472b6'],
  ember: ['#140806', '#ff5a36', '#ffb020', '#ff2d75'],
  orchid: ['#120a1c', '#c026d3', '#8b5cf6', '#fb7185'],
  tide: ['#04121c', '#0ea5e9', '#14b8a6', '#6366f1'],
  mint: ['#051410', '#10b981', '#a3e635', '#22d3ee'],
  graphite: ['#0d0e10', '#64748b', '#94a3b8', '#e2e8f0'],
  sunrise: ['#160b12', '#f97316', '#f43f5e', '#facc15'],
  midnight: ['#05060f', '#3b82f6', '#8b5cf6', '#06b6d4'],
};
const SPEED = { off: 0, calm: 0.5, normal: 1, lively: 1.8 };
const DEF = { theme: 'aurora', blur: '22', refraction: '0', motion: 'normal', grain: '0', background: '1', auto_snapshot: '0', glass_window: '1' };
const NAV = [['home', 'Home', LayoutDashboard], ['tools', 'Tools', Wrench], ['snaps', 'Snapshots', Camera], ['settings', 'Settings', SlidersHorizontal], ['about', 'About', Info]];
const TITLES = {
  home: ['Welcome back', 'Your PC at a glance, with the most used tools one click away.'],
  tools: ['Tools', 'Every function is a card. Press Run and MFix does the rest.'],
  snaps: ['Snapshots', 'Save the state of your PC and compare before and after.'],
  settings: ['Settings', 'Make MFix look and feel the way you like.'],
  about: ['About', 'About MFix and its author.'],
};
// icon per tool, picked by keywords in the tool id
const ICONS = [[/temp|cleaner|recycle/, Trash2], [/dns|network|ip_|winsock|wifi/, Network], [/disk|storage|drive|space/, HardDrive], [/update|delivery/, RefreshCw], [/battery/, Battery], [/memory/, MemoryStick], [/driver/, Cpu], [/print/, Printer], [/audio/, Volume2], [/system_info|information/, Monitor], [/hibern|power/, Power], [/thumbnail|icon/, Image], [/explorer|large/, FolderOpen], [/clipboard/, Clipboard], [/startup/, Rocket], [/event/, FileText], [/process/, Activity], [/activation/, KeyRound], [/restore/, History], [/optimize/, Zap], [/component|dism|repair|file_repair/, Wrench], [/maintenance/, Sparkles]];
const toolIcon = (id) => (ICONS.find(([re]) => re.test(id)) || [0, Wrench])[1];
const CATCOL = { 1: 1, 2: 3, 3: 2, 4: 1 };
const call = (...a) => (window.mfix ? window.mfix.call(...a) : Promise.resolve({ ok: false, error: 'Open MFix from the desktop app.' }));
const cap = (s) => s[0].toUpperCase() + s.slice(1);

function Count({ n }) {
  const el = useRef(), o = useRef({ v: 0 });
  useEffect(() => {
    anime({ targets: o.current, v: n, round: 1, duration: 900, easing: 'easeOutExpo', update: () => { if (el.current) el.current.textContent = o.current.v; } });
  }, [n]);
  return <span ref={el}>0</span>;
}

function Orbs({ colors, on }) {
  const box = useRef();
  useEffect(() => {
    if (!on) return;
    const a = anime({ targets: box.current.children, translateX: () => anime.random(-160, 160), translateY: () => anime.random(-120, 120), scale: () => [1, anime.random(11, 16) / 10], duration: () => anime.random(7000, 12000), direction: 'alternate', loop: true, easing: 'easeInOutSine' });
    return () => a.pause();
  }, [on]);
  const pos = [['8%', '10%'], ['55%', '45%'], ['30%', '70%']];
  return (
    <div ref={box} className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {pos.map(([l, t], i) => <i key={i} className="absolute rounded-full" style={{ width: 340, height: 340, left: l, top: t, background: colors[i + 1], opacity: 0.22, filter: 'blur(70px)' }} />)}
    </div>
  );
}

const glow = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px');
  e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px');
};

function ToolCard({ t, busy, run, compact }) {
  const Icon = toolIcon(t.id), col = 'var(--c' + (CATCOL[t.cat] || 2) + ')';
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }} onPointerMove={glow} className="tool glass glass-card flex flex-col gap-4 rounded-[28px] p-5">
      <div className="flex items-start gap-4">
        <div className="icon-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ '--tile': col }}><Icon size={26} className="text-white" /></div>
        <div className="min-w-0">
          <div className="font-display text-[17px] font-semibold leading-tight">{t.title}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-white/75">
            {t.admin && <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5"><ShieldCheck size={11} />Admin</span>}
            {t.ask && <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5"><MessageCircleQuestion size={11} />Asks first</span>}
            {!t.admin && !t.ask && <span className="rounded-full bg-white/10 px-2 py-0.5">Safe to run</span>}
          </div>
        </div>
      </div>
      {!compact && <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-white/65">{t.desc}</p>}
      <Button className="mt-auto w-full" disabled={!!busy} onClick={() => run(t)}><Play size={15} />{busy === t.id ? 'Running' : 'Run'}</Button>
    </motion.div>
  );
}

const Stat = ({ icon: Icon, label, n, col }) => (
  <div onPointerMove={glow} className="glass glass-card flex items-center gap-4 rounded-[28px] p-5">
    <div className="icon-tile flex h-12 w-12 items-center justify-center rounded-2xl" style={{ '--tile': col }}><Icon size={22} /></div>
    <div><div className="font-display text-3xl font-semibold leading-none"><Count n={n} /></div><div className="mt-1.5 text-xs text-white/60">{label}</div></div>
  </div>
);

function HomeView({ d, go, busy, run }) {
  const quick = ['disk_space_check', 'temp_cleaner', 'dns_flush', 'system_information'].map((id) => d.tools.find((t) => t.id === id)).filter(Boolean);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        <Stat icon={Wrench} label="Tools" n={d.tools.length} col="var(--c1)" />
        <Stat icon={Activity} label="Runs so far" n={d.stats.runs} col="var(--c2)" />
        <Stat icon={Camera} label="Snapshots" n={d.stats.snaps} col="var(--c3)" />
        <Stat icon={HardDrive} label="Free space, GB" n={d.stats.free_gb} col="var(--c1)" />
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Quick actions</h2><Button variant="ghost" size="sm" onClick={() => go('tools')}>All tools</Button></div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">{quick.map((t) => <ToolCard key={t.id} t={t} busy={busy} run={run} compact />)}</div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Browse by category</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {Object.entries(d.cats).map(([k, name]) => (
            <button key={k} onPointerMove={glow} onClick={() => go('tools', Number(k))} className="glass glass-card flex items-center justify-between rounded-[28px] p-5 text-left">
              <div><div className="font-display font-semibold">{name}</div><div className="mt-1 text-xs text-white/60">{d.tools.filter((t) => t.cat === Number(k)).length} tools</div></div>
              <span className="icon-tile flex h-10 w-10 items-center justify-center rounded-xl" style={{ '--tile': 'var(--c' + (CATCOL[k] || 2) + ')' }}><Wrench size={18} /></span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Recent activity</h2>
        <div className="glass rounded-[28px] p-2">
          {d.runs.length === 0 && <p className="p-4 text-sm text-white/60">Nothing yet. Run a tool and it will show up here.</p>}
          {d.runs.map((r, i) => <div key={i} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-white/5"><span className="flex items-center gap-3"><CircleCheck size={16} className="text-white/60" />{r.title}</span><span className="text-white/55">{r.started}, {r.seconds}s</span></div>)}
        </div>
      </section>
    </div>
  );
}

function ToolsView({ d, q, setQ, cat, setCat, busy, run }) {
  const list = d.tools.filter((t) => (!cat || t.cat === cat) && (t.title + ' ' + t.desc).toLowerCase().includes(q.toLowerCase()));
  const chips = [[0, 'All'], ...Object.entries(d.cats).map(([k, v]) => [Number(k), v])];
  return (
    <div className="space-y-7">
      <div className="space-y-4">
        <div className="glass flex h-12 items-center gap-3 rounded-2xl px-4">
          <Search size={18} className="text-white/55" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools" className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" />
        </div>
        <div className="flex flex-wrap gap-2">{chips.map(([k, v]) => <Button key={k} size="sm" variant={cat === k ? 'default' : 'glass'} className="h-9 px-4" onClick={() => setCat(k)}>{v}</Button>)}</div>
      </div>
      {Object.entries(d.cats).filter(([k]) => list.some((t) => t.cat === Number(k))).map(([k, name]) => (
        <section key={k}>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-white/65">{name}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
            {list.filter((t) => t.cat === Number(k)).map((t) => <ToolCard key={t.id} t={t} busy={busy} run={run} />)}
          </div>
        </section>
      ))}
      {list.length === 0 && <p className="px-2 text-sm text-white/60">No tools match your search.</p>}
    </div>
  );
}

function SnapsView({ d, load, s, set }) {
  const [label, setLabel] = useState(''), [sel, setSel] = useState([]), [diff, setDiff] = useState(null), [wait, setWait] = useState(false);
  const take = async () => { setWait(true); await call('snapCreate', label); setLabel(''); setWait(false); load(); };
  const pick = (id) => setSel((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id].slice(-2)));
  const cmp = async () => { const [a, b] = [...sel].sort((x, y) => x - y); const r = await call('snapDiff', a, b); setDiff(r.ok ? r.lines : [r.error]); };
  const del = async (id) => { await call('snapDelete', id); setSel((x) => x.filter((i) => i !== id)); setDiff(null); load(); };
  return (
    <div className="space-y-5">
      <Card><CardContent className="space-y-5 p-6">
        <div className="font-display text-lg font-semibold">Snapshots</div>
        <p className="text-sm text-white/65">A snapshot records free space, temp size, memory, running processes and startup entries. Take one before and after a cleanup, then compare the two.</p>
        <div className="flex flex-wrap gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label, for example Before cleanup" className="glass h-10 min-w-[220px] flex-1 rounded-2xl bg-transparent px-4 text-sm outline-none placeholder:text-white/40" />
          <Button disabled={wait} onClick={take}><Camera size={16} />{wait ? 'Capturing' : 'Take snapshot'}</Button>
          <Button variant="glass" disabled={sel.length !== 2} onClick={cmp}>Compare selected</Button>
        </div>
        <div className="flex items-center gap-3 text-sm"><Switch checked={s.auto_snapshot === '1'} onCheckedChange={(v) => set('auto_snapshot', v ? '1' : '0')} />Snapshot before and after every script run</div>
      </CardContent></Card>
      {diff && <Card><CardContent><div className="mb-2 font-display font-semibold">Comparison</div>{diff.map((l, i) => <div key={i} className="py-0.5 text-sm text-white/80">{l}</div>)}</CardContent></Card>}
      {d.snaps.length === 0 && <p className="px-2 text-sm text-white/60">No snapshots yet. Take your first one above.</p>}
      {d.snaps.map((n) => (
        <Card key={n.id} className={cn('cursor-pointer', sel.includes(n.id) && 'ring-2 ring-white/70')} onClick={() => pick(n.id)}>
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <div><div className="font-semibold">{n.label}</div><div className="text-xs text-white/60">{n.created}</div><div className="mt-1 text-sm text-white/75">{n.summary}</div></div>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); del(n.id); }} aria-label="Delete snapshot"><Trash2 size={16} /></Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const Row = ({ t, sub, children }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div><div className="text-sm font-semibold">{t}</div>{sub && <div className="text-xs text-white/55">{sub}</div>}</div>{children}
  </div>
);

function SettingsView({ s, set, local }) {
  const flag = (k) => <Switch checked={s[k] === '1'} onCheckedChange={(v) => set(k, v ? '1' : '0')} />;
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-6">
        <div className="mb-4 font-display text-lg font-semibold">Themes</div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.entries(THEMES).map(([k, c]) => (
            <button key={k} onClick={() => set('theme', k)} className={cn('h-20 rounded-2xl border p-3 text-left text-sm font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,.6)]', s.theme === k ? 'border-white ring-2 ring-white/60' : 'border-white/20')} style={{ background: `linear-gradient(135deg,${c[1]},${c[2]},${c[3]})` }}>{cap(k)}</button>
          ))}
        </div>
      </CardContent></Card>
      <Card><CardContent className="divide-y divide-white/10 p-6">
        <div className="pb-2 font-display text-lg font-semibold">Effects</div>
        <Row t="Glass blur" sub="How frosted the panels look">
          <input type="range" min="8" max="44" value={s.blur} onChange={(e) => local('blur', e.target.value)} onPointerUp={(e) => set('blur', e.target.value)} onKeyUp={(e) => set('blur', e.target.value)} className="w-40 accent-[var(--c2)]" />
        </Row>
        <Row t="Transparent window" sub="See-through frosted window (Windows 11)">{flag('glass_window')}</Row>
        <Row t="Liquid refraction" sub="Bends the background behind glass">{flag('refraction')}</Row>
        <Row t="Film grain" sub="Fine texture over the whole window">{flag('grain')}</Row>
        <Row t="Animated background" sub="Flowing gradient drawn with three.js">{flag('background')}</Row>
        <Row t="Motion" sub="Speed of animations and the background">
          <div className="flex gap-1">{Object.keys(SPEED).map((m) => <Button key={m} size="sm" variant={s.motion === m ? 'default' : 'glass'} onClick={() => set('motion', m)}>{cap(m)}</Button>)}</div>
        </Row>
      </CardContent></Card>
    </div>
  );
}

function AboutView() {
  const open = (u) => window.mfix && window.mfix.open(u);
  return (
    <Card><CardContent className="space-y-5 p-6">
      <div className="gradtext font-display text-4xl font-bold">MFix</div>
      <p className="text-sm text-white/70">MFix keeps routine Windows maintenance one click away. Every tool runs a plain batch script you can read, and every run is logged.</p>
      <div>
        <div className="font-display text-lg font-semibold">Mayur Dhole</div>
        <p className="text-sm text-white/70">I build practical tools that pair solid engineering with design that feels good to use.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => open('https://github.com/mayurcodes01')}><ExternalLink size={16} />GitHub</Button>
        <Button onClick={() => open('https://www.linkedin.com/in/mayur-dhole-bb60893a5')}><ExternalLink size={16} />LinkedIn</Button>
      </div>
      <p className="text-xs text-white/50">Built with batch scripts, Python and SQLite, Node.js, three.js, anime.js, Framer Motion and shadcn.</p>
    </CardContent></Card>
  );
}

function App() {
  const [splash, setSplash] = useState(!(window.mfix && window.mfix.desktop)), [glassOk, setGlassOk] = useState(/glass/.test(location.search)), [d, setD] = useState(null), [view, setView] = useState('home'), [q, setQ] = useState(''), [cat, setCat] = useState(0), [busy, setBusy] = useState(null), [note, setNote] = useState('');
  const load = useCallback(() => call('boot').then((r) => setD(r.ok ? r : { error: r.error })), []);
  useEffect(() => { load(); }, [load]);
  const s = (d && d.settings) || DEF, colors = THEMES[s.theme] || THEMES.aurora;
  useEffect(() => {
    const r = document.documentElement;
    ['bg', 'c1', 'c2', 'c3'].forEach((k, i) => r.style.setProperty('--' + k, colors[i]));
    r.style.setProperty('--blur', s.blur + 'px');
    r.dataset.refraction = s.refraction; r.dataset.grain = s.grain;
  }, [s.theme, s.blur, s.refraction, s.grain]);
  useEffect(() => {
    if ((view === 'tools' || view === 'home') && d && d.tools && s.motion !== 'off') anime({ targets: '.tool', opacity: [0, 1], translateY: [16, 0], delay: anime.stagger(20), duration: 520, easing: 'easeOutCubic' });
  }, [view, cat, q, d && d.tools && d.tools.length]);
  useEffect(() => { if (!note || busy) return; const t = setTimeout(() => setNote(''), 5000); return () => clearTimeout(t); }, [note, busy]);

  useEffect(() => {
    try { localStorage.setItem('mfix_theme', s.theme); } catch {}
    const on = s.glass_window === '1';
    document.documentElement.dataset.glass = on && glassOk ? '1' : '0';
    if (window.mfix && window.mfix.glass) window.mfix.glass(on).then(setGlassOk);
  }, [s.glass_window, s.theme, glassOk]);
  const go = (v, c) => { setView(v); if (c !== undefined) setCat(c); else if (v === 'tools') setCat(0); };
  const local = (k, v) => setD((x) => ({ ...x, settings: { ...x.settings, [k]: String(v) } }));
  const set = (k, v) => { local(k, v); call('set', k, String(v)); };
  const run = async (t) => {
    setBusy(t.id); setNote(t.title + ' is running. Use the console window that opened.');
    const r = await call('run', t.id); setBusy(null);
    setNote(!r.ok ? r.error || 'The script could not start.' : r.code === 0 ? t.title + ' completed.' : r.code === 2 ? t.title + ' was cancelled.' : r.code === 9 ? 'Administrator approval was declined.' : t.title + ' finished with code ' + r.code + '.');
    load();
  };

    return (
    <MotionConfig reducedMotion={s.motion === 'off' ? 'always' : 'never'}>
      {s.background === '1' && !(glassOk && s.glass_window === '1') && <Background colors={colors} speed={SPEED[s.motion]} />}
      {splash && <Splash colors={colors} onDone={() => setSplash(false)} />}
      <Orbs colors={colors} on={s.motion !== 'off'} />
      <div className="fixed inset-x-0 top-0 z-30 flex h-10 items-center justify-center text-xs font-semibold tracking-wide text-white/50" style={{ WebkitAppRegion: 'drag' }}>MFix</div>
      <div className="relative z-10 flex h-screen flex-col gap-4 px-5 pb-3 pt-11">
        <div className="flex min-h-0 flex-1 gap-5">
          <aside className="glass flex w-64 shrink-0 flex-col rounded-[32px] p-5">
            <div className="flex items-center gap-3 px-2 pb-6 pt-1">
              <span className="icon-tile flex h-11 w-11 items-center justify-center rounded-2xl" style={{ '--tile': 'var(--c1)' }}><Wrench size={22} /></span>
              <div><div className="gradtext font-display text-2xl font-bold leading-none">MFix</div><div className="mt-1 text-[11px] text-white/55">Windows care</div></div>
            </div>
            <nav className="space-y-1.5">
              {NAV.map(([k, name, Icon]) => (
                <button key={k} onClick={() => go(k)} className={cn('relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition', view === k ? 'text-white' : 'text-white/65 hover:bg-white/10 hover:text-white')}>
                  {view === k && <motion.span layoutId="navpill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-2xl bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,.4)]" />}
                  <Icon size={19} className="relative" /><span className="relative">{name}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto rounded-2xl bg-white/8 p-4 text-xs leading-relaxed text-white/65"><div className="mb-1 flex items-center gap-2 font-semibold text-white"><Database size={14} />Local and private</div>Everything runs on this PC. Nothing is uploaded.</div>
          </aside>
          <main className="min-w-0 flex-1 overflow-y-auto pr-2">
            <div className="mx-auto max-w-6xl pb-8">
              {d && d.tools && (
                <div className="mb-7">
                  <h1 className="font-display text-4xl font-bold">{TITLES[view][0]}</h1>
                  <p className="mt-2 text-[15px] text-white/60">{TITLES[view][1]}</p>
                </div>
              )}
              {!d && <p className="p-6 text-white/70">Loading</p>}
              {d && d.error && <div className="glass rounded-3xl p-6"><div className="font-display font-semibold">MFix could not start its backend</div><p className="mt-1 text-sm text-white/70">{d.error}</p></div>}
              {d && d.tools && (
                <AnimatePresence mode="wait">
                  <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {view === 'home' && <HomeView d={d} go={go} busy={busy} run={run} />}
                    {view === 'tools' && <ToolsView d={d} q={q} setQ={setQ} cat={cat} setCat={setCat} busy={busy} run={run} />}
                    {view === 'snaps' && <SnapsView d={d} load={load} s={s} set={set} />}
                    {view === 'settings' && <SettingsView s={s} set={set} local={local} />}
                    {view === 'about' && <AboutView />}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>
        <footer className="glass flex h-9 shrink-0 items-center justify-between rounded-full px-5 text-xs text-white/60">
          <span className="flex items-center gap-2"><i className={cn('h-2 w-2 rounded-full', d && d.tools ? 'bg-emerald-400' : d && d.error ? 'bg-red-400' : 'bg-amber-300')} />{busy ? 'Running a tool' : d && d.tools ? 'Ready' : d && d.error ? 'Backend unavailable' : 'Starting'}</span>
          <span>{d && d.tools ? d.tools.length + ' tools' : ''}</span>
          <span>MFix 1.0.0</span>
        </footer>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
        <AnimatePresence>
          {note && <motion.div key={note} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-full px-6 py-3 text-sm">{note}</motion.div>}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function SplashOnly() {
  let t = 'aurora';
  try { t = localStorage.getItem('mfix_theme') || t; } catch {}
  return <Splash colors={THEMES[t] || THEMES.aurora} />;
}
export default function Root() { return location.hash === '#splash' ? <SplashOnly /> : <App />; }
