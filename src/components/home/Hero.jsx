'use client';

import { ArrowRight, BadgeCheck, Link2, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function useCountUp(target, duration = 1600, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started || !target) return;
    let startTs = null;
    const raf = (ts) => {
      if (!startTs) startTs = ts;
      const pct = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(Math.floor(eased * target));
      if (pct < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [started, target, duration]);
  return val;
}

/* ─────────────────────────────────────────
   INTERSECTION OBSERVER
───────────────────────────────────────── */
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
  }, []);
  return [ref, inView];
}

/* ─────────────────────────────────────────
   MINI SPARKLINE
───────────────────────────────────────── */
function Sparkline({ data = [], color = '#2563eb', height = 36 }) {
  if (!data.length) return null;
  const w = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const fill = `${d} L${w},${height} L0,${height} Z`;
  const id = `sp-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: 80, height }} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────
   DEMO PRODUCTS — har cycle alag URL + output
───────────────────────────────────────── */
const DEMO_ITEMS = [
  {
    input:  'flipkart.com/galaxy-s25',
    output: 'earnko.com/dfxjd',
    store:  'Flipkart',
  },
  {
    input:  'myntra.com/nike-air-270',
    output: 'earnko.com/jhgmy',
    store:  'Myntra',
  },
  {
    input:  'nykaa.com/lakme-kit',
    output: 'earnko.com/fdklm',
    store:  'Nykaa',
  },
  {
    input:  'ajio.in/boat-airdopes-141',
    output: 'earnko.com/amytd',
    store:  'Ajio',
  },
];

/* ─────────────────────────────────────────
   ANIMATED LINK GENERATOR DEMO
   
   Timeline per cycle (total ~6.5s):
   0ms    → step=0  (blank input)
   600ms  → step=1  (input appears with URL)
   1800ms → step=2  (arrow animates)
   3000ms → step=3  (output appears)
   5000ms → step=4  (output fades out)
   5500ms → step=5  (input fades out, cycle resets)
   6000ms → next cycle starts with NEW demo item
───────────────────────────────────────── */
function LinkGeneratorDemo({ inView }) {
  const [step,       setStep]       = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const timersRef = useRef([]);

  function clearAll() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  }

  function runCycle(idx) {
    setStep(0);
    setCycleIndex(idx);

    schedule(() => setStep(1), 600);   // input URL appears
    schedule(() => setStep(2), 1800);  // arrow animates
    schedule(() => setStep(3), 3000);  // output appears
    schedule(() => setStep(4), 5000);  // output starts fading
    schedule(() => setStep(5), 5500);  // input starts fading
    // next cycle — new demo item
    schedule(() => runCycle((idx + 1) % DEMO_ITEMS.length), 6200);
  }

  useEffect(() => {
    if (!inView) return;
    runCycle(0);
    return () => clearAll();
  }, [inView]);

  const demo = DEMO_ITEMS[cycleIndex];

  /*
    step 0 → blank
    step 1 → input visible
    step 2 → input + arrow
    step 3 → input + arrow + output
    step 4 → output fading out
    step 5 → everything fading out
  */
  const inputActive   = step >= 1 && step <= 5;
  const inputFading   = step === 5;
  const arrowVisible  = step >= 2 && step <= 5;
  const outputVisible = step === 3;        // enter
  const outputFading  = step === 4 || step === 5; // exit

  return (
    <div className="hero-link-demo" aria-label="Affiliate link generator demo">
      {/* Header */}
      <div className="hero-link-demo-header">
        <div className="hero-link-demo-icon-wrap">
          <Link2 size={14} aria-hidden="true" />
        </div>
        <span className="hero-link-demo-label">Affiliate Link Generator</span>
      </div>

      {/* Input row */}
      <div
        className={`hero-link-row hero-link-row-input
          ${inputActive  ? 'active'  : ''}
          ${inputFading  ? 'fading'  : ''}
        `}
        style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}
      >
        <Link2 size={13} aria-hidden="true" style={{ color: '#94a3b8', flexShrink: 0 }} />
        <span className="hero-link-monospace hero-link-url">
          {inputActive ? demo.input : 'Paste any store product URL…'}
        </span>
        {inputActive && !inputFading && (
          <span className="hero-link-chip hero-link-chip-blue">{demo.store}</span>
        )}
      </div>

      {/* Arrow */}
      <div
        className={`hero-link-arrow ${arrowVisible ? 'visible' : ''}`}
        aria-hidden="true"
        style={{ transition: 'opacity 0.4s ease' }}
      >
        <div className="hero-link-arrow-line hero-link-arrow-line-left" />
        <Zap size={12} color="#2563eb" />
        <div className="hero-link-arrow-line hero-link-arrow-line-right" />
      </div>

      {/* Output row — enter & exit animation via CSS classes */}
      <div
        className={`hero-link-row hero-link-row-output
          ${outputVisible ? 'visible'       : ''}
          ${outputFading  ? 'visible fading' : ''}
        `}
        style={{ transition: 'opacity 0.45s ease, transform 0.45s ease' }}
      >
        <BadgeCheck size={13} style={{ color: '#93c5fd', flexShrink: 0 }} aria-hidden="true" />
        <span className="hero-link-monospace hero-link-affiliate">
          {demo.output}
        </span>
        <button className="hero-link-copy-btn" aria-label="Copy affiliate link">Copy</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const SPARKLINES = {
  payout:  [18, 22, 19, 28, 24, 35, 30, 42, 38, 52, 47, 63],
  users:   [8,  12, 15, 11, 19, 22, 26, 21, 30, 28, 35, 38],
  links:   [30, 35, 28, 42, 38, 50, 45, 60, 55, 70, 65, 82],
  stores:  [5,  8,  7,  10, 9,  13, 12, 15, 14, 17, 16, 20],
};

function StatCard({ stat, inView }) {
  const numericTarget = stat._raw ?? 0;
  const counted = useCountUp(numericTarget, 1800, inView);

  const displayValue = stat._raw
    ? stat.prefix
      ? `${stat.prefix}${counted >= 1_00_00_000
          ? `${(counted / 1_00_00_000).toFixed(1)}Cr+`
          : counted >= 1_00_000
            ? `${(counted / 1_00_000).toFixed(1)}L+`
            : counted >= 1_000
              ? `${(counted / 1_000).toFixed(0)}K+`
              : `${counted}+`}`
      : counted >= 1_00_000
        ? `${(counted / 1_00_000).toFixed(1)}L+`
        : counted >= 1_000
          ? `${counted.toLocaleString('en-IN')}+`
          : `${counted}+`
    : stat.value;

  return (
    <div className="hero-stat-card">
      <div className="hero-stat-top">
        <div className="hero-stat-icon-wrap" style={{ background: stat.iconBg }} aria-hidden="true">
          {stat.icon}
        </div>
        <Sparkline data={SPARKLINES[stat.key] || []} color={stat.color} height={34} />
      </div>
      <div className="hero-stat-value" style={{ color: stat.color }}>{displayValue}</div>
      <div className="hero-stat-bottom">
        <span className="hero-stat-label">{stat.label}</span>
        <span className="hero-stat-trend" aria-label={`Trend: ${stat.trend} increase`}>{stat.trend} ↑</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN HERO COMPONENT
───────────────────────────────────────── */
const FALLBACK_STATS = [
  { key: 'payout',  prefix: '₹', value: '₹2.4L+', _raw: 2_40_000, label: 'Total Paid Out',  trend: '+18%', color: '#2563eb', iconBg: '#eff6ff', icon: <span style={{ fontSize: 15 }}>₹</span> },
  { key: 'users',               value: '10k+',    _raw: 10_000,    label: 'Active Users',    trend: '+32%', color: '#059669', iconBg: '#ecfdf5', icon: <Users size={15} aria-hidden="true" /> },
  { key: 'links',               value: '85L+',     _raw: 85_00_000,   label: 'Links Generated', trend: '+41%', color: '#d97706', iconBg: '#fffbeb', icon: <Link2 size={15} aria-hidden="true" /> },
  { key: 'stores',              value: '200+',     _raw: 200,         label: 'Partner Stores',  trend: '+12%', color: '#7c3aed', iconBg: '#f5f3ff', icon: <TrendingUp size={15} aria-hidden="true" /> },
];

const TRUST_ITEMS = [
  { icon: <BadgeCheck size={12} aria-hidden="true" />, text: 'Instant Commissions' },
  { icon: <Zap size={12} aria-hidden="true" />,        text: 'Zero Investment' },
  { icon: <Users size={12} aria-hidden="true" />,      text: '10k+ Earners' },
];

export default function Hero({ stats: serverStats }) {
  const [sectionRef, inView] = useInView(0.08);
  const [entered, setEntered] = useState(false);

  const stats = FALLBACK_STATS.map(fb => {
    const live = serverStats?.find(s => s.key === fb.key);
    return live ? { ...fb, _raw: live.value, trend: live.trend ?? fb.trend } : fb;
  });

  useEffect(() => {
    if (inView && !entered) setEntered(true);
  }, [inView]);

  return (
    <section
      className="hero-section"
      ref={sectionRef}
      aria-label="EarnKo — India's #1 Affiliate Earning Platform"
    >
      <div className="hero-dot-grid" aria-hidden="true" />
      <div className="hero-blob hero-blob-1" aria-hidden="true" />
      <div className="hero-blob hero-blob-2" aria-hidden="true" />

      <div className="site-container">
        <div className={`hero-inner ${entered ? 'hero-entered' : ''}`}>

          {/* ── COPY SIDE ── */}
          <div className="hero-copy">
            <div className={`hero-eyebrow ${entered ? 'anim-fade-up anim-d0' : 'anim-hidden'}`}>
              <span className="hero-eyebrow-dot" aria-hidden="true" />
              <span>India's #1 Affiliate Earning Platform</span>
              <span className="hero-eyebrow-arrow" aria-hidden="true">✦</span>
            </div>

            <h1 className={`hero-heading ${entered ? 'anim-fade-up anim-d1' : 'anim-hidden'}`}>
              Shop. Share.{' '}
              <span className="hero-heading-gradient">Earn Real</span>{' '}
              <br className="hero-br-mobile" />
              Commission with{' '}
              <span className="hero-heading-brand">EarnKo</span>
            </h1>

            <p className={`hero-subtext ${entered ? 'anim-fade-up anim-d2' : 'anim-hidden'}`}>
              Generate affiliate links for 200+ top Indian stores — Flipkart, Myntra, Nykaa, Ajio —
              and earn cashback on every purchase your audience makes.{' '}
              <strong>Zero investment. Unlimited income.</strong>
            </p>

            <div className={`hero-cta-group ${entered ? 'anim-fade-up anim-d3' : 'anim-hidden'}`}>
              <Link href="/register" className="hero-btn-primary" aria-label="Start earning free with EarnKo">
                Start Earning Free
                <ArrowRight size={16} aria-hidden="true" className='hidden sm:block' />
              </Link>
              <Link href="/stores" className="hero-btn-secondary" aria-label="Explore all 200+ partner stores">
                Explore Stores
              </Link>
            </div>

            <div className={`hero-trust-strip ${entered ? 'anim-fade-up anim-d4' : 'anim-hidden'}`}>
              {TRUST_ITEMS.map((t) => (
                <div key={t.text} className="hero-trust-chip">
                  {t.icon}
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── DASHBOARD VISUAL ── */}
          <div
            className={`hero-visual ${entered ? 'anim-slide-left anim-d2' : 'anim-hidden'}`}
            aria-label="EarnKo Dashboard Preview"
            role="img"
          >
        

            <div className="hero-dashboard">
              <div className="hero-dash-header">
                <div className="hero-dash-header-left">
                  <div className="hero-dash-header-icon" aria-hidden="true">
                    <TrendingUp size={16} />
                  </div>
                  <span className="hero-dash-title">Earning Dashboard</span>
                </div>
                <span className="hero-live-badge" role="status" aria-label="Live data">
                  <span className="live-dot" aria-hidden="true" />
                  Live
                </span>
              </div>

              <div className="hero-stats-grid" role="list" aria-label="Platform statistics">
                {stats.map((s,i) => (
                  <div key={i} role="listitem">
                    <StatCard stat={s} inView={entered} />
                  </div>
                ))}
              </div>

              <LinkGeneratorDemo inView={entered} />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}