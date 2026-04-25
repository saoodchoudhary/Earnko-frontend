'use client';

import {
  BadgeCheck, BarChart2, BarChart3, Link2,
  TrendingUp, Users, Wallet, Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.earnko.com';

/* ─────────────────────────────────────────
   HOOKS
───────────────────────────────────────── */
function useCountUp(target, duration = 1800, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started || !target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - pct, 3)) * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return val;
}

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─────────────────────────────────────────
   SPARKLINE
───────────────────────────────────────── */
function Sparkline({ data, color, height = 40 }) {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const fill = `${d} L${w},${height} L0,${height} Z`;
  const id = `sg-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────
   DONUT
───────────────────────────────────────── */
function Donut({ pct, color, size = 52, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color + '22'} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(pct/100)*circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   CARD SHELL
───────────────────────────────────────── */
function FeatureShell({ children, accent, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="feat-shell"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        '--accent': accent,
        '--hov-shadow': `var(--shadow-xl), 0 0 0 1px ${accent}18, 0 20px 56px ${accent}20`,
        ...style,
      }}
      data-hov={hov ? '1' : '0'}
    >
      <div className="feat-shell-bar" />
      <div className="feat-shell-glow" />
      {children(hov)}
    </div>
  );
}

/* ─────────────────────────────────────────
   CARD 1 — LINK GENERATOR
───────────────────────────────────────── */
const DEMO_ITEMS = [
  { input: 'flipkart.com/samsung-galaxy-s25',    output: 'earnko.in/r/dfxjd',  store: 'Flipkart' },
  { input: 'myntra.com/nike-air-max-270',         output: 'earnko.in/r/jhgmy',  store: 'Myntra' },
  { input: 'nykaa.com/lakme-absolute-kit',        output: 'earnko.in/r/fdklm',  store: 'Nykaa' },
  { input: 'ajio.in/boat-airdopes-141',           output: 'earnko.in/r/amytd',  store: 'Ajio' },
];

function CardLinkGen({ inView }) {
  const [step, setStep] = useState(0);
  const [idx,  setIdx]  = useState(0);
  const timers = useRef([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };

  const run = useCallback((i) => {
    setStep(0); setIdx(i);
    after(() => setStep(1), 600);
    after(() => setStep(2), 1800);
    after(() => setStep(3), 3000);
    after(() => setStep(4), 5000);
    after(() => setStep(5), 5500);
    after(() => run((i + 1) % DEMO_ITEMS.length), 6200);
  }, []);

  useEffect(() => {
    if (!inView) return;
    run(0);
    return clear;
  }, [inView]);

  const demo = DEMO_ITEMS[idx];
  const inputActive  = step >= 1 && step <= 5;
  const inputFading  = step === 5;
  const arrowVisible = step >= 2 && step <= 5;
  const outputIn     = step === 3;
  const outputFading = step === 4 || step === 5;

  return (
    <FeatureShell accent="#2563eb">
      {(hov) => (
        <>
          <div className="feat-card-top">
            <div className="feat-card-meta">
              <span className="feat-badge" style={{ background: '#eff6ff', border: '1px solid rgba(37,99,235,.22)', color: '#2563eb' }}>
                <Zap size={10} aria-hidden="true" /> Instant
              </span>
              <h3 className="feat-title">One-Click Link Generation</h3>
              <p className="feat-desc">Paste any product URL and receive a fully tracked affiliate link in under a second.</p>
            </div>
            <div className="feat-icon-box" style={{
              background: hov ? '#2563eb' : '#eff6ff',
              transform: hov ? 'rotate(-10deg) scale(1.12)' : 'none',
            }}>
              <Link2 size={20} style={{ color: hov ? '#fff' : '#2563eb' }} aria-hidden="true" />
            </div>
          </div>

          {/* Live demo */}
          <div className="feat-demo-box">
            {/* Input */}
            <div className="feat-demo-row" style={{
              border: `1.5px solid ${step >= 1 ? '#2563eb44' : 'rgba(37,99,235,.14)'}`,
              opacity: inputFading ? 0 : (inputActive ? 1 : 0.6),
              transform: inputFading ? 'translateY(-6px)' : 'none',
              transition: 'all 0.4s ease',
            }}>
              <Link2 size={13} style={{ color: '#94a3b8', flexShrink: 0 }} aria-hidden="true" />
              <span className="feat-mono feat-overflow">
                {inputActive ? demo.input : 'Paste any store product URL…'}
              </span>
              {inputActive && !inputFading && (
                <span className="feat-chip feat-chip-blue">{demo.store}</span>
              )}
            </div>

            {/* Arrow */}
            <div className="feat-arrow" style={{ opacity: arrowVisible ? 1 : 0, transition: 'opacity 0.4s ease' }} aria-hidden="true">
              <div className="feat-arrow-line" style={{ background: 'linear-gradient(90deg,#2563eb40,#2563eb)' }} />
              <Zap size={12} color="#2563eb" />
              <div className="feat-arrow-line" style={{ background: 'linear-gradient(90deg,#2563eb,#2563eb40)' }} />
            </div>

            {/* Output */}
            <div className="feat-demo-row feat-demo-output" style={{
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              opacity: (outputIn || outputFading) ? (outputFading ? 0 : 1) : 0,
              transform: (outputIn || outputFading) ? (outputFading ? 'translateY(6px)' : 'none') : 'translateY(8px)',
              transition: 'all 0.45s ease',
            }}>
              <BadgeCheck size={13} style={{ color: '#93c5fd', flexShrink: 0 }} aria-hidden="true" />
              <span className="feat-mono feat-overflow" style={{ color: '#fff', letterSpacing: '0.02em' }}>
                {demo.output}
              </span>
              <button className="feat-copy-btn" aria-label="Copy affiliate link">Copy</button>
            </div>
          </div>
        </>
      )}
    </FeatureShell>
  );
}

/* ─────────────────────────────────────────
   CARD 2 — ANALYTICS
───────────────────────────────────────── */
const SPARK_DATA = [12, 19, 14, 28, 22, 34, 29, 42, 38, 51, 47, 62];

function CardAnalytics({ inView, liveStats }) {
  const clicks  = useCountUp(liveStats?.conversions ?? 8420,  1600, inView);
  const conv    = useCountUp(Math.round((liveStats?.conversions ?? 8420) * 0.037), 1800, inView);
  const revenue = useCountUp(liveStats?.payout ?? 31500, 2000, inView);

  return (
    <FeatureShell accent="#059669">
      {() => (
        <>
          <span className="feat-badge" style={{ background: '#ecfdf5', border: '1px solid rgba(5,150,105,.22)', color: '#059669' }}>
            <BarChart3 size={10} aria-hidden="true" /> Real-Time
          </span>
          <h3 className="feat-title">Live Analytics</h3>
          <p className="feat-desc" style={{ marginBottom: '1rem' }}>Track every click, conversion, and commission live.</p>

          <Sparkline data={SPARK_DATA} color="#059669" height={48} />

          <div className="feat-stats-grid">
            {[
              { label: 'Clicks',    value: clicks.toLocaleString('en-IN'),              color: '#2563eb' },
              { label: 'Converts',  value: conv.toLocaleString('en-IN'),                color: '#059669' },
              { label: 'Revenue',   value: `₹${(revenue/1000).toFixed(1)}K`,           color: '#d97706', full: true },
            ].map(s => (
              <div key={s.label} className={`feat-stat-pill${s.full ? ' feat-stat-full' : ''}`}>
                <span className="feat-stat-label">{s.label}</span>
                <span className="feat-stat-val" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </FeatureShell>
  );
}

/* ─────────────────────────────────────────
   CARD 3 — WALLET
───────────────────────────────────────── */
function CardWallet({ inView, liveStats }) {
  const [pulse, setPulse] = useState(false);
  const earned = useCountUp(liveStats?.payout ?? 31500, 2200, inView);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setPulse(true), 2400);
    return () => clearTimeout(t);
  }, [inView]);

  const TXS = [
    { store: 'Myntra',   amt: '₹480',   time: '2m ago',  color: '#db2777' },
    { store: 'Flipkart', amt: '₹1,240', time: '15m ago', color: '#2563eb' },
    { store: 'Nykaa',    amt: '₹360',   time: '1h ago',  color: '#d97706' },
  ];

  return (
    <FeatureShell accent="#d97706">
      {(hov) => (
        <>
          <div className="feat-card-top">
            <div className="feat-card-meta">
              <span className="feat-badge" style={{ background: '#fffbeb', border: '1px solid rgba(217,119,6,.22)', color: '#d97706' }}>
                <Zap size={10} aria-hidden="true" /> Instant
              </span>
              <h3 className="feat-title">Instant Payouts</h3>
              <p className="feat-desc">Commissions land in your wallet immediately.</p>
            </div>
            <div className="feat-icon-box" style={{
              background: hov ? '#d97706' : '#fffbeb',
              transform: hov ? 'rotate(-8deg) scale(1.1)' : 'none',
            }}>
              <Wallet size={20} style={{ color: hov ? '#fff' : '#d97706' }} aria-hidden="true" />
            </div>
          </div>

          {/* Balance pill */}
          <div className="feat-wallet-balance" style={{ transform: pulse ? 'scale(1.025)' : 'scale(1)' }}>
            <div>
              <div className="feat-wallet-label">WALLET BALANCE</div>
              <div className="feat-wallet-amount">₹{earned.toLocaleString('en-IN')}</div>
            </div>
            <button className="feat-withdraw-btn" aria-label="Withdraw earnings">Withdraw</button>
          </div>

          {/* Transactions */}
          <div className="feat-txs">
            {TXS.map((tx, i) => (
              <div key={tx.store} className="feat-tx-row" style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateX(0)' : 'translateX(-12px)',
                transition: `all 400ms cubic-bezier(0.16,1,0.3,1) ${i * 120 + 300}ms`,
              }}>
                <div className="feat-tx-dot" style={{ background: tx.color, boxShadow: `0 0 0 3px ${tx.color}22` }} />
                <span className="feat-tx-store">{tx.store}</span>
                <span className="feat-tx-amt">+{tx.amt}</span>
                <span className="feat-tx-time">{tx.time}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </FeatureShell>
  );
}

/* ─────────────────────────────────────────
   CARD 4 — STORES
───────────────────────────────────────── */
const STORES = [
  { name: 'Flipkart',   color: '#2563eb', bg: '#eff6ff', cat: 'Electronics' },
  { name: 'Myntra',     color: '#db2777', bg: '#fdf2f8', cat: 'Fashion' },
  { name: 'Nykaa',      color: '#d97706', bg: '#fffbeb', cat: 'Beauty' },
  { name: 'Amazon',     color: '#d97706', bg: '#fffbeb', cat: 'All' },
  { name: 'Ajio',       color: '#7c3aed', bg: '#f5f3ff', cat: 'Fashion' },
  { name: 'Meesho',     color: '#059669', bg: '#ecfdf5', cat: 'Lifestyle' },
  { name: 'HealthKart', color: '#0891b2', bg: '#ecfeff', cat: 'Health' },
  { name: 'boAt',       color: '#2563eb', bg: '#eff6ff', cat: 'Audio' },
];

function CardStores({ inView, liveStats }) {
  const count = useCountUp(liveStats?.stores ?? 200, 1600, inView);
  return (
    <FeatureShell accent="#7c3aed">
      {(hov) => (
        <>
          <div className="feat-card-top">
            <div className="feat-card-meta">
              <span className="feat-badge" style={{ background: '#f5f3ff', border: '1px solid rgba(124,58,237,.22)', color: '#7c3aed' }}>
                <Users size={10} aria-hidden="true" /> Powerful
              </span>
              <h3 className="feat-title">
                <span style={{ color: '#7c3aed', fontVariantNumeric: 'tabular-nums' }}>{count}+</span>{' '}Partner Stores
              </h3>
              <p className="feat-desc">Access every top Indian brand — Flipkart, Myntra, Nykaa, Ajio, Amazon, and many more.</p>
            </div>
            <div className="feat-icon-box" style={{
              background: hov ? '#7c3aed' : '#f5f3ff',
              transform: hov ? 'rotate(-8deg) scale(1.1)' : 'none',
            }}>
              <BarChart2 size={20} style={{ color: hov ? '#fff' : '#7c3aed' }} aria-hidden="true" />
            </div>
          </div>

          <div className="feat-stores-wrap">
            {STORES.map((s, i) => (
              <div key={s.name} className="feat-store-chip" style={{
                background: s.bg,
                border: `1px solid ${s.color}25`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(10px)',
                transition: `all 400ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`,
              }}>
                <div className="feat-store-dot" style={{ background: s.color }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: s.color, whiteSpace: 'nowrap' }}>{s.name}</span>
                <span className="feat-store-cat" style={{ borderLeft: `1px solid ${s.color}30` }}>{s.cat}</span>
              </div>
            ))}
            <div className="feat-store-more" style={{
              opacity: inView ? 1 : 0, transition: 'opacity 400ms 560ms',
            }}>+{Math.max(0, count - STORES.length)} more →</div>
          </div>
        </>
      )}
    </FeatureShell>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function Features() {
  const [sectionRef, inView] = useInView(0.06);
  const [liveStats, setLiveStats]   = useState(null);
  const [statsLoading, setLoading]  = useState(true);

  // Fetch public stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/stats`, {
          next: { revalidate: 300 }, // 5 min cache (Next.js extended fetch)
        });
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        if (json.success) setLiveStats(json.data);
      } catch {
        // silently fall back to FALLBACK_STATS in each card
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="home-section home-section-tinted feat-section" ref={sectionRef}>
      <style>{`
        /* ── Keyframes ── */
        @keyframes fade-up-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        /* ── Shell ── */
        .feat-shell {
          position: relative;
          background: var(--color-surface);
          border: 1px solid rgba(37,99,235,0.09);
          border-radius: var(--radius-2xl, 1.25rem);
          padding: clamp(1rem, 4vw, 1.75rem);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: border-color 360ms, box-shadow 360ms, transform 360ms cubic-bezier(0.16,1,0.3,1);
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 260px;
        }
        .feat-shell:hover {
          border-color: color-mix(in oklch, var(--accent) 26%, transparent);
          box-shadow: var(--hov-shadow);
          transform: translateY(-5px) scale(1.01);
        }
        .feat-shell-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--accent), color-mix(in oklch, var(--accent) 55%, transparent));
          border-radius: 99px 99px 0 0;
          opacity: 0; transition: opacity 320ms;
        }
        .feat-shell:hover .feat-shell-bar { opacity: 1; }
        .feat-shell-glow {
          position: absolute; inset: 0; border-radius: inherit;
          background: radial-gradient(ellipse at 0% 110%, color-mix(in oklch, var(--accent) 8%, transparent) 0%, transparent 60%);
          opacity: 0; transition: opacity 360ms; pointer-events: none;
        }
        .feat-shell:hover .feat-shell-glow { opacity: 1; }

        /* ── Atoms ── */
        .feat-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 0.22rem 0.65rem; border-radius: 99px;
          font-size: 0.6rem; font-weight: 800;
          letter-spacing: 0.09em; text-transform: uppercase;
          margin-bottom: 0.6rem;
        }
        .feat-title {
          font-family: var(--font-display);
          font-size: clamp(0.88rem, 2.5vw, 1.05rem);
          font-weight: 900; color: var(--color-text);
          margin-bottom: 0.4rem; line-height: 1.25;
        }
        .feat-desc {
          font-size: clamp(0.72rem, 2vw, 0.8rem);
          color: var(--color-muted); line-height: 1.7; margin: 0;
        }
        .feat-icon-box {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: all 340ms; flex-shrink: 0;
        }

        /* ── Card top row ── */
        .feat-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem; margin-bottom: 1.1rem;
        }
        .feat-card-meta { min-width: 0; flex: 1; }

        /* ── Demo box ── */
        .feat-demo-box {
          flex: 1; display: flex; flex-direction: column; gap: 0.55rem;
          background: #f8faff; border-radius: var(--radius-xl, 0.75rem);
          padding: clamp(0.75rem, 3vw, 1rem);
          border: 1px solid rgba(37,99,235,0.10);
          margin-top: 0.25rem;
        }
        .feat-demo-row {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 0.85rem;
          background: var(--color-surface);
          border-radius: var(--radius-lg, 0.5rem);
          min-width: 0;
        }
        .feat-demo-output { background: linear-gradient(135deg,#2563eb,#1d4ed8); }
        .feat-mono {
          font-family: monospace;
          font-size: clamp(0.6rem, 1.8vw, 0.72rem);
          color: #0f172a; flex: 1;
        }
        .feat-overflow { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .feat-chip {
          padding: 0.18rem 0.5rem; border-radius: 99px;
          font-size: 0.6rem; font-weight: 900; flex-shrink: 0;
        }
        .feat-chip-blue { background: #eff6ff; color: #2563eb; }
        .feat-copy-btn {
          padding: 0.18rem 0.5rem; border-radius: 99px;
          background: rgba(255,255,255,.18); color: #fff;
          font-size: 0.6rem; font-weight: 900; flex-shrink: 0;
          border: none; cursor: pointer;
        }
        .feat-arrow {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .feat-arrow-line { flex: 1; height: 1px; }

        /* ── Analytics stats ── */
        .feat-stats-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.55rem; margin-top: 0.75rem;
        }
        .feat-stat-pill {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.75rem;
          background: var(--color-surface-2);
          border-radius: var(--radius-lg, 0.5rem);
          border: 1px solid rgba(37,99,235,0.08);
        }
        .feat-stat-full { grid-column: span 2; }
        .feat-stat-label { font-size: 0.62rem; color: var(--color-faint); font-weight: 700; }
        .feat-stat-val {
          font-family: var(--font-display); font-weight: 900;
          font-size: 0.85rem; font-variant-numeric: tabular-nums;
        }

        /* ── Wallet ── */
        .feat-wallet-balance {
          padding: 0.85rem 1rem;
          background: linear-gradient(135deg,#d97706,#b45309);
          border-radius: var(--radius-xl, 0.75rem); margin-bottom: 0.75rem;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 6px 20px rgba(217,119,6,.30);
          transition: transform 400ms cubic-bezier(0.16,1,0.3,1);
        }
        .feat-wallet-label {
          font-size: 0.58rem; color: rgba(255,255,255,.7);
          font-weight: 700; margin-bottom: 3px;
        }
        .feat-wallet-amount {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 4vw, 1.4rem);
          font-weight: 900; color: #fff; font-variant-numeric: tabular-nums;
        }
        .feat-withdraw-btn {
          padding: 0.28rem 0.75rem; border-radius: 99px;
          background: rgba(255,255,255,.18); font-size: 0.65rem;
          font-weight: 800; color: #fff; border: none; cursor: pointer;
          white-space: nowrap;
        }
        .feat-txs { display: flex; flex-direction: column; gap: 0.42rem; }
        .feat-tx-row {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.48rem 0.7rem;
          background: var(--color-surface-2);
          border-radius: var(--radius-lg, 0.5rem);
          border: 1px solid rgba(37,99,235,0.07);
        }
        .feat-tx-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .feat-tx-store { font-size: 0.72rem; font-weight: 700; color: var(--color-text); flex: 1; min-width: 0; }
        .feat-tx-amt { font-family: var(--font-display); font-size: 0.76rem; font-weight: 900; color: #059669; white-space: nowrap; }
        .feat-tx-time { font-size: 0.6rem; color: var(--color-faint); white-space: nowrap; }

        /* ── Stores ── */
        .feat-stores-wrap { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.25rem; }
        .feat-store-chip {
          display: flex; align-items: center; gap: 0.42rem;
          padding: 0.36rem 0.7rem; border-radius: 99px; cursor: default;
        }
        .feat-store-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .feat-store-cat {
          font-size: 0.58rem; color: var(--color-faint); font-weight: 600;
          padding-left: 0.28rem; white-space: nowrap;
        }
        .feat-store-more {
          padding: 0.36rem 0.7rem; border-radius: 99px;
          background: var(--color-surface-2);
          border: 1px dashed rgba(124,58,237,.25);
          font-size: 0.7rem; font-weight: 800; color: #7c3aed;
        }

        /* ═══════════════════════════════
           SKELETON LOADER
        ═══════════════════════════════ */
        .feat-skeleton {
          background: linear-gradient(90deg,
            var(--color-surface-2) 25%,
            var(--color-surface-offset, #eee) 50%,
            var(--color-surface-2) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: var(--radius-lg, 0.5rem);
        }

        /* ═══════════════════════════════
           BENTO GRID
        ═══════════════════════════════ */
        .features-bento {
          display: grid;
          gap: 1rem;
          /* Desktop: 3 columns */
          grid-template-columns: repeat(3, 1fr);
          grid-template-areas:
            "linkgen linkgen analytics"
            "wallet  stores  stores";
        }
        .feat-area-linkgen   { grid-area: linkgen; }
        .feat-area-analytics { grid-area: analytics; }
        .feat-area-wallet    { grid-area: wallet; }
        .feat-area-stores    { grid-area: stores; }

        /* Tablet: 2 columns */
        @media (max-width: 900px) {
          .features-bento {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "linkgen  linkgen"
              "analytics wallet"
              "stores   stores";
          }
        }

        /* Mobile: 1 column, all full-width */
        @media (max-width: 560px) {
          .features-bento {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            grid-template-areas:
              "linkgen"
              "analytics"
              "wallet"
              "stores";
          }
          /* Tighter padding on mobile */
          .feat-shell { min-height: 0; }
          /* Wallet balance font smaller on tiny screens */
          .feat-wallet-amount { font-size: 1.15rem; }
          /* Stores wrap tighter */
          .feat-store-chip { padding: 0.3rem 0.6rem; }
        }

        /* Touch: disable hover lift (no hover-capable pointer) */
        @media (hover: none) {
          .feat-shell:hover {
            transform: none;
            box-shadow: var(--shadow-sm);
            border-color: rgba(37,99,235,0.09);
          }
          .feat-shell:active {
            transform: scale(0.985);
            box-shadow: var(--shadow-md);
          }
          .feat-shell-bar, .feat-shell-glow { display: none; }
        }
      `}</style>

      <div className="site-container">
        {/* Section header */}
        <div className="section-header">
          <span className="badge badge-blue">
            <Zap size={11} aria-hidden="true" /> Why EarnKo
          </span>
          <h2 className="section-title">
            Everything you need to{' '}
            <span className="gradient-text">earn more</span>
          </h2>
          <p className="section-subtitle">
            Built for creators, influencers, and everyday shoppers who want to
            turn recommendations into real income.
          </p>
        </div>

        {/* Bento grid — named areas = zero confusion on mobile reorder */}
        <div className="features-bento" role="list" aria-label="Platform features">
          <div className="feat-area-linkgen"   role="listitem"><CardLinkGen   inView={inView} /></div>
          <div className="feat-area-analytics" role="listitem"><CardAnalytics inView={inView} liveStats={liveStats} /></div>
          <div className="feat-area-wallet"    role="listitem"><CardWallet    inView={inView} liveStats={liveStats} /></div>
          <div className="feat-area-stores"    role="listitem"><CardStores    inView={inView} liveStats={liveStats} /></div>
        </div>
      </div>
    </section>
  );
}