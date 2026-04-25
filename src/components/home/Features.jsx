'use client';

import {
  BadgeCheck, BarChart2, BarChart3, Link2,
  TrendingUp, Users, Wallet, Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────── */
function useCountUp(target, duration = 1800, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(Math.floor(eased * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return val;
}

/* ─────────────────────────────────────────
   INTERSECTION OBSERVER HOOK
───────────────────────────────────────── */
function useInView(threshold = 0.25) {
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
   MINI SPARKLINE SVG
───────────────────────────────────────── */
function Sparkline({ data, color, height = 40, width = 100 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const fill = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────
   MINI DONUT CHART
───────────────────────────────────────── */
function Donut({ pct, color, size = 56, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color + '22'} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   CARD SHELL
───────────────────────────────────────── */
function FeatureShell({ children, accent, minH = 260, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        background: 'var(--color-surface)',
        border: `1px solid ${hov ? accent + '42' : 'rgba(37,99,235,0.09)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: 'clamp(1.1rem, 4vw, 1.75rem)',
        overflow: 'hidden',
        boxShadow: hov
          ? `var(--shadow-xl), 0 0 0 1px ${accent}18, 0 20px 56px ${accent}20`
          : 'var(--shadow-sm)',
        transform: hov ? 'translateY(-6px) scale(1.013)' : 'translateY(0) scale(1)',
        transition: 'all 360ms cubic-bezier(0.16,1,0.3,1)',
        minHeight: minH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* top shimmer bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg,${accent},${accent}88)`,
        borderRadius: '99px 99px 0 0',
        opacity: hov ? 1 : 0, transition: 'opacity 320ms',
      }} />
      {/* radial glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: `radial-gradient(ellipse at 0% 110%, ${accent}14 0%, transparent 60%)`,
        opacity: hov ? 1 : 0, transition: 'opacity 360ms',
        pointerEvents: 'none',
      }} />
      {children(hov)}
    </div>
  );
}

/* ─────────────────────────────────────────
   CARD 1 — LINK GENERATOR
───────────────────────────────────────── */
function CardLinkGen({ inView }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1800);
    const t3 = setTimeout(() => setStep(3), 3000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [inView]);

  const SAMPLE_URL    = 'flipkart.com/product/B08XYZ123';
  const AFFILIATE_URL = 'earnko.in/r/priya-a3k9';

  return (
    <FeatureShell accent="#2563eb" minH={280}>
      {(hov) => (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.75rem' }}>
            <div style={{ minWidth: 0 }}>
              <span className="feat-badge" style={{ background: '#eff6ff', border: '1px solid rgba(37,99,235,.22)', color: '#2563eb' }}>
                <Zap style={{ width: 10, height: 10 }} /> Instant
              </span>
              <h3 className="feat-title">One-Click Link Generation</h3>
              <p className="feat-desc">
                Paste any product URL and receive a fully tracked affiliate link in under a second.
              </p>
            </div>
            <div className="feat-icon-box" style={{
              background: hov ? '#2563eb' : '#eff6ff',
              transform: hov ? 'rotate(-10deg) scale(1.12)' : 'none',
            }}>
              <Link2 style={{ width: 20, height: 20, color: hov ? '#fff' : '#2563eb' }} />
            </div>
          </div>

          {/* Live demo */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem',
            background: '#f8faff', borderRadius: 'var(--radius-xl)',
            padding: 'clamp(0.75rem, 3vw, 1rem) clamp(0.75rem, 3vw, 1.1rem)',
            border: '1px solid rgba(37,99,235,0.10)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.55rem 0.85rem',
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
              border: `1.5px solid ${step >= 1 ? '#2563eb44' : 'rgba(37,99,235,.14)'}`,
              transition: 'border-color 400ms',
            }}>
              <Link2 style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'monospace', fontSize: 'clamp(0.62rem, 1.8vw, 0.72rem)',
                color: step >= 1 ? '#0f172a' : '#94a3b8',
                transition: 'color 400ms', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {step >= 1 ? SAMPLE_URL : 'Paste any store product URL…'}
              </span>
              {step >= 1 && (
                <span style={{
                  padding: '0.18rem 0.55rem', borderRadius: 99,
                  background: '#eff6ff', color: '#2563eb',
                  fontSize: '0.6rem', fontWeight: 900, flexShrink: 0,
                  animation: 'fade-up-in 0.3s ease both',
                }}>LIVE</span>
              )}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              opacity: step >= 2 ? 1 : 0,
              transform: step >= 2 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)',
            }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#2563eb40,#2563eb)' }} />
              <Zap style={{ width: 14, height: 14, color: '#2563eb' }} />
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#2563eb,#2563eb40)' }} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.85rem',
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              borderRadius: 'var(--radius-lg)',
              opacity: step >= 3 ? 1 : 0,
              transform: step >= 3 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)',
            }}>
              <BadgeCheck style={{ width: 14, height: 14, color: '#93c5fd', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'monospace', fontSize: 'clamp(0.62rem, 1.8vw, 0.72rem)',
                color: '#fff', flex: 1, letterSpacing: '0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {AFFILIATE_URL}
              </span>
              <span style={{
                padding: '0.18rem 0.55rem', borderRadius: 99,
                background: 'rgba(255,255,255,0.18)',
                color: '#fff', fontSize: '0.6rem', fontWeight: 900, flexShrink: 0,
              }}>Copy</span>
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

function CardAnalytics({ inView }) {
  const clicks  = useCountUp(8420,  1600, inView);
  const conv    = useCountUp(312,   1800, inView);
  const revenue = useCountUp(31500, 2000, inView);

  return (
    <FeatureShell accent="#059669" minH={280}>
      {(hov) => (
        <>
          <span className="feat-badge" style={{ background: '#ecfdf5', border: '1px solid rgba(5,150,105,.22)', color: '#059669' }}>
            <BarChart3 style={{ width: 10, height: 10 }} /> Real-Time
          </span>
          <h3 className="feat-title">Live Analytics</h3>
          <p className="feat-desc" style={{ marginBottom: '1.25rem' }}>
            Track every click, conversion, and commission live.
          </p>

          <div style={{ flex: 1 }}>
            <Sparkline data={SPARK_DATA} color="#059669" height={52} width={200} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.85rem' }}>
              {[
                { label: 'Clicks',   value: clicks.toLocaleString('en-IN'),      color: '#2563eb' },
                { label: 'Converts', value: conv.toLocaleString('en-IN'),         color: '#059669' },
                { label: 'Revenue',  value: `₹${(revenue / 1000).toFixed(1)}K`,  color: '#d97706', full: true },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '0.65rem 0.8rem',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(37,99,235,0.08)',
                  gridColumn: s.full ? 'span 2' : undefined,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-faint)', fontWeight: 700 }}>{s.label}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900,
                    fontSize: '0.88rem', color: s.color, fontVariantNumeric: 'tabular-nums',
                  }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </FeatureShell>
  );
}

/* ─────────────────────────────────────────
   CARD 3 — WALLET PAYOUT
───────────────────────────────────────── */
function CardWallet({ inView }) {
  const [pulse, setPulse] = useState(false);
  const earned = useCountUp(31500, 2200, inView);

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
    <FeatureShell accent="#d97706" minH={280}>
      {(hov) => (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem' }}>
            <div style={{ minWidth: 0 }}>
              <span className="feat-badge" style={{ background: '#fffbeb', border: '1px solid rgba(217,119,6,.22)', color: '#d97706' }}>
                <Zap style={{ width: 10, height: 10 }} /> Instant
              </span>
              <h3 className="feat-title">Instant Payouts</h3>
              <p className="feat-desc">Commissions land in your wallet immediately.</p>
            </div>
            <div className="feat-icon-box" style={{
              background: hov ? '#d97706' : '#fffbeb',
              transform: hov ? 'rotate(-8deg) scale(1.1)' : 'none',
            }}>
              <Wallet style={{ width: 20, height: 20, color: hov ? '#fff' : '#d97706' }} />
            </div>
          </div>

          {/* Balance pill */}
          <div style={{
            padding: '0.85rem 1rem',
            background: 'linear-gradient(135deg,#d97706,#b45309)',
            borderRadius: 'var(--radius-xl)', marginBottom: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 6px 20px rgba(217,119,6,.30)',
            transform: pulse ? 'scale(1.025)' : 'scale(1)',
            transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,.7)', fontWeight: 700, marginBottom: 3 }}>
                WALLET BALANCE
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 4vw, 1.45rem)',
                fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums',
              }}>
                ₹{earned.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{
              padding: '0.28rem 0.75rem', borderRadius: 99,
              background: 'rgba(255,255,255,.18)', fontSize: '0.65rem',
              fontWeight: 800, color: '#fff', whiteSpace: 'nowrap',
            }}>Withdraw</div>
          </div>

          {/* Recent txs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {TXS.map((tx, i) => (
              <div key={tx.store} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem 0.75rem',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(37,99,235,0.07)',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateX(0)' : 'translateX(-12px)',
                transition: `all 400ms cubic-bezier(0.16,1,0.3,1) ${i * 120 + 300}ms`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: tx.color, flexShrink: 0,
                  boxShadow: `0 0 0 3px ${tx.color}22`,
                }} />
                <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--color-text)', flex: 1, minWidth: 0 }}>
                  {tx.store}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.78rem',
                  fontWeight: 900, color: '#059669', whiteSpace: 'nowrap',
                }}>+{tx.amt}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--color-faint)', whiteSpace: 'nowrap' }}>{tx.time}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </FeatureShell>
  );
}

/* ─────────────────────────────────────────
   CARD 4 — VERIFIED COMMISSIONS
───────────────────────────────────────── */
function CardVerified({ inView }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setActive(p => (p + 1) % 3), 1800);
    return () => clearInterval(id);
  }, [inView]);

  const NETWORKS = [
    { name: 'Cuelinks', pct: 94, color: '#2563eb' },
    { name: 'ExtraPe',  pct: 87, color: '#7c3aed' },
    { name: 'Trackier', pct: 91, color: '#059669' },
  ];

  return (
    <FeatureShell accent="#0891b2" minH={280}>
      {(hov) => (
        <>
          <span className="feat-badge" style={{ background: '#ecfeff', border: '1px solid rgba(8,145,178,.22)', color: '#0891b2' }}>
            <BadgeCheck style={{ width: 10, height: 10 }} /> Verified
          </span>
          <h3 className="feat-title">Verified Commissions</h3>
          <p className="feat-desc" style={{ marginBottom: '1.25rem' }}>
            Every commission is verified directly with the partner network before crediting.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-around' }}>
            {NETWORKS.map((n, i) => (
              <div key={n.name} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                padding: 'clamp(0.5rem, 2vw, 0.85rem) clamp(0.4rem, 2vw, 0.65rem)',
                background: active === i ? n.color + '12' : 'var(--color-surface-2)',
                borderRadius: 'var(--radius-xl)',
                border: `1px solid ${active === i ? n.color + '40' : 'rgba(37,99,235,0.08)'}`,
                transition: 'all 400ms', flex: 1,
              }}>
                <Donut pct={active === i ? n.pct : 0} color={n.color} size={48} stroke={5} />
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                  fontWeight: 900, color: active === i ? n.color : 'var(--color-text)',
                  transition: 'color 400ms',
                }}>{n.pct}%</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--color-faint)', fontWeight: 700, textAlign: 'center' }}>
                  {n.name}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </FeatureShell>
  );
}

/* ─────────────────────────────────────────
   CARD 5 — 200+ STORES
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

function CardStores({ inView }) {
  const count = useCountUp(200, 1600, inView);
  return (
    <FeatureShell accent="#7c3aed" minH={260}>
      {(hov) => (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.75rem' }}>
            <div style={{ minWidth: 0 }}>
              <span className="feat-badge" style={{ background: '#f5f3ff', border: '1px solid rgba(124,58,237,.22)', color: '#7c3aed' }}>
                <Users style={{ width: 10, height: 10 }} /> Powerful
              </span>
              <h3 className="feat-title">
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', color: '#7c3aed',
                  fontVariantNumeric: 'tabular-nums',
                }}>{count}+</span>{' '}
                Partner Stores
              </h3>
              <p className="feat-desc">
                Access every top Indian brand — Flipkart, Myntra, Nykaa, Ajio, Amazon, and many more.
              </p>
            </div>
            <div className="feat-icon-box" style={{
              background: hov ? '#7c3aed' : '#f5f3ff',
              transform: hov ? 'rotate(-8deg) scale(1.1)' : 'none',
            }}>
              <BarChart2 style={{ width: 20, height: 20, color: hov ? '#fff' : '#7c3aed' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {STORES.map((s, i) => (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.38rem 0.75rem',
                background: s.bg, borderRadius: 99,
                border: `1px solid ${s.color}25`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(10px)',
                transition: `all 400ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`,
                cursor: 'default',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: s.color, whiteSpace: 'nowrap' }}>{s.name}</span>
                <span style={{
                  fontSize: '0.58rem', color: 'var(--color-faint)', fontWeight: 600,
                  paddingLeft: '0.3rem', borderLeft: `1px solid ${s.color}30`, whiteSpace: 'nowrap',
                }}>{s.cat}</span>
              </div>
            ))}
            <div style={{
              padding: '0.38rem 0.75rem', borderRadius: 99,
              background: 'var(--color-surface-2)',
              border: '1px dashed rgba(124,58,237,.25)',
              fontSize: '0.7rem', fontWeight: 800, color: '#7c3aed',
              opacity: inView ? 1 : 0,
              transition: 'opacity 400ms 560ms',
            }}>+192 more →</div>
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
  const [sectionRef, inView] = useInView(0.08);

  return (
    <section
      className="home-section home-section-tinted"
      ref={sectionRef}
      style={{ overflow: 'hidden' }}
    >
      <style>{`
        @keyframes fade-up-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Shared card atoms ── */
        .feat-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0.22rem 0.65rem;
          border-radius: 99px;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .feat-title {
          font-family: var(--font-display);
          font-size: clamp(0.9rem, 2.5vw, 1.05rem);
          font-weight: 900;
          color: var(--color-text);
          margin-bottom: 0.4rem;
          line-height: 1.25;
        }
        .feat-desc {
          font-size: clamp(0.72rem, 2vw, 0.8rem);
          color: var(--color-muted);
          line-height: 1.7;
          margin: 0;
        }
        .feat-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 340ms;
          flex-shrink: 0;
        }

        /* ── Bento grid ── */
        .features-bento {
          display: grid;
          gap: 1.1rem;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto;
        }

        /* Card slot helpers */
        .feat-col-2 { grid-column: span 2; }
        .feat-col-1 { grid-column: span 1; }

        /* ── Tablet (2-col) ── */
        @media (max-width: 900px) {
          .features-bento {
            grid-template-columns: repeat(2, 1fr);
          }
          .feat-col-2 { grid-column: span 2; }
          .feat-col-1 { grid-column: span 1; }
        }

        /* ── Mobile (1-col) ── */
        @media (max-width: 560px) {
          .features-bento {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .feat-col-2,
          .feat-col-1 { grid-column: span 1; }
        }
      `}</style>

      <div className="site-container">
        {/* Section header */}
        <div className="section-header">
          <span className="badge badge-blue">
            <Zap style={{ width: 11, height: 11 }} /> Why EarnKo
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

        {/* Responsive bento grid */}
        <div className="features-bento">
          {/* Row 1 — Link Gen (wide) + Analytics */}
          <div className="feat-col-2">
            <CardLinkGen inView={inView} />
          </div>
          <div className="feat-col-1">
            <CardAnalytics inView={inView} />
          </div>

          {/* Row 2 — Wallet + Verified */}
          <div className="feat-col-1">
            <CardWallet inView={inView} />
          </div>
          <div className="feat-col-1">
            <CardVerified inView={inView} />
          </div>

          {/* Row 3 — Stores (full width) */}
          <div className="feat-col-2" style={{ gridColumn: 'span 3' }}>
            <CardStores inView={inView} />
          </div>
        </div>
      </div>
    </section>
  );
}