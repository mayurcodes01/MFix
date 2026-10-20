import { useEffect, useRef } from 'react';
import anime from 'animejs';

// Full screen welcome. In the desktop app it lives in its own window that covers the display for 3 seconds.
export const SPLASH_MS = 3000;

function Particles({ colors }) {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current, cx = cv.getContext('2d');
    let w, h, raf;
    const fit = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; };
    fit(); addEventListener('resize', fit);
    const pts = Array.from({ length: 70 }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, c: colors[1 + (i % 3)] }));
    const tick = () => {
      cx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 160) { cx.strokeStyle = `rgba(255,255,255,${(1 - d / 160) * 0.16})`; cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y); cx.stroke(); }
        }
        cx.fillStyle = pts[i].c; cx.globalAlpha = 0.8; cx.beginPath(); cx.arc(pts[i].x, pts[i].y, 2.2, 0, 7); cx.fill(); cx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); };
  }, [colors]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export default function Splash({ colors, onDone }) {
  const root = useRef();
  useEffect(() => {
    const tl = anime.timeline({ easing: 'easeOutExpo' });
    tl.add({ targets: '.sp-glow', scale: [0.4, 1], opacity: [0, 1], duration: 1600 }, 0)
      .add({ targets: '.sp-ring', strokeDashoffset: [anime.setDashoffset, 0], duration: 1500, delay: anime.stagger(180) }, 0)
      .add({ targets: '.sp-core', scale: [0, 1], opacity: [0, 1], duration: 900, easing: 'easeOutElastic(1, .6)' }, 300)
      .add({ targets: '.sp-letter', translateY: [60, 0], opacity: [0, 1], duration: 900, delay: anime.stagger(100) }, 700)
      .add({ targets: '.sp-sub', opacity: [0, 1], translateY: [12, 0], duration: 700 }, 1300)
      .add({ targets: '.sp-bar', width: ['0%', '100%'], duration: 1500, easing: 'easeInOutQuad' }, 1300);
    const spin = anime({ targets: '.sp-orbit', rotate: '1turn', duration: 5000, easing: 'linear', loop: true });
    const spin2 = anime({ targets: '.sp-orbit2', rotate: '-1turn', duration: 8000, easing: 'linear', loop: true });
    const fade = setTimeout(() => anime({ targets: root.current, opacity: 0, duration: 300, easing: 'easeInQuad' }), SPLASH_MS - 300);
    const done = onDone ? setTimeout(onDone, SPLASH_MS) : null;
    return () => { tl.pause(); spin.pause(); spin2.pause(); clearTimeout(fade); done && clearTimeout(done); };
  }, [onDone]);

  const [bg, c1, c2, c3] = colors;
  const dot = (c, style) => <i className="absolute rounded-full" style={{ width: 14, height: 14, background: c, boxShadow: '0 0 22px ' + c, ...style }} />;
  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden" style={{ background: bg }}>
      <div className="sp-glow absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0" style={{ background: `radial-gradient(circle, color-mix(in srgb,${c1} 55%,transparent), color-mix(in srgb,${c3} 18%,transparent) 45%, transparent 70%)`, filter: 'blur(30px)' }} />
      <Particles colors={colors} />
      <div className="relative h-[340px] w-[340px]">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          <defs><linearGradient id="spg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset=".5" stopColor={c2} /><stop offset="1" stopColor={c3} /></linearGradient></defs>
          <circle className="sp-ring" cx="100" cy="100" r="96" fill="none" stroke="url(#spg)" strokeWidth="1.8" strokeLinecap="round" />
          <circle className="sp-ring" cx="100" cy="100" r="78" fill="none" stroke="url(#spg)" strokeWidth="1.1" strokeLinecap="round" opacity=".7" />
          <circle className="sp-ring" cx="100" cy="100" r="60" fill="none" stroke="url(#spg)" strokeWidth=".8" strokeLinecap="round" opacity=".5" />
        </svg>
        <div className="sp-orbit absolute inset-0">{dot(c1, { left: '50%', top: -7, marginLeft: -7 })}{dot(c3, { left: '50%', bottom: -7, marginLeft: -7 })}</div>
        <div className="sp-orbit2 absolute inset-[40px]">{dot(c2, { left: -7, top: '50%', marginTop: -7 })}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="sp-core flex h-28 w-28 items-center justify-center rounded-[36px]" style={{ background: `linear-gradient(135deg,${c1},${c2})`, boxShadow: `0 0 90px ${c1}, inset 0 1px 0 rgba(255,255,255,.5)` }}>
            <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.2-.7-.7-2.2z" /></svg>
          </div>
        </div>
      </div>
      <div className="relative mt-8 flex font-display text-8xl font-bold tracking-tight">
        {'MFix'.split('').map((l, i) => <span key={i} className="sp-letter gradtext inline-block opacity-0">{l}</span>)}
      </div>
      <div className="sp-sub relative mt-3 text-lg tracking-wide text-white/70 opacity-0">Welcome. Getting your toolkit ready</div>
      <div className="relative mt-10 h-1.5 w-96 overflow-hidden rounded-full bg-white/10"><div className="sp-bar h-full rounded-full" style={{ width: 0, background: `linear-gradient(90deg,${c1},${c2},${c3})` }} /></div>
    </div>
  );
}
