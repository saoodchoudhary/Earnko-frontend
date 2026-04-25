'use client';

import React , { useEffect, useRef, useState, useCallback } from 'react';
import { Gift, Link2, Share2, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';

/* ─────────────────────────────────────────
   STEP DATA
───────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    icon: Gift,
    accent: '#2563eb',
    accentLight: '#eff6ff',
    accentMid: '#60a5fa',
    accentPale: '#dbeafe',
    numGrad: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    barGrad: 'linear-gradient(90deg,#2563eb,#60a5fa)',
    glowColor: 'rgba(37,99,235,0.16)',
    title: 'Register for Free',
    desc: 'Sign up in 30 seconds. No investment required and no hidden fees ever.',
    proof: '2.4L+ members joined',
    microsteps: ['Enter your email', 'Verify in one click', 'Dashboard unlocked'],
  },
  {
    num: '02',
    icon: Link2,
    accent: '#0891b2',
    accentLight: '#ecfeff',
    accentMid: '#67e8f9',
    accentPale: '#cffafe',
    numGrad: 'linear-gradient(135deg,#0891b2,#0e7490)',
    barGrad: 'linear-gradient(90deg,#0891b2,#67e8f9)',
    glowColor: 'rgba(8,145,178,0.16)',
    title: 'Generate a Link',
    desc: 'Paste any product URL from 500+ stores. Get a trackable link in one click.',
    proof: '50M+ links created',
    microsteps: ['Paste product URL', 'Choose your store', 'Copy short link'],
  },
  {
    num: '03',
    icon: Share2,
    accent: '#2563eb',
    accentLight: '#eff6ff',
    accentMid: '#93c5fd',
    accentPale: '#bfdbfe',
    numGrad: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    barGrad: 'linear-gradient(90deg,#3b82f6,#93c5fd)',
    glowColor: 'rgba(59,130,246,0.16)',
    title: 'Share Anywhere',
    desc: 'Post on WhatsApp, Instagram, or Telegram and reach your entire audience.',
    proof: '10Cr+ reach generated',
    microsteps: ['Pick a platform', 'Send your link', 'Track every click'],
  },
  {
    num: '04',
    icon: Wallet,
    accent: '#059669',
    accentLight: '#ecfdf5',
    accentMid: '#34d399',
    accentPale: '#d1fae5',
    numGrad: 'linear-gradient(135deg,#059669,#047857)',
    barGrad: 'linear-gradient(90deg,#059669,#34d399)',
    glowColor: 'rgba(5,150,105,0.16)',
    title: 'Earn Commission',
    desc: 'Every confirmed purchase sends real commission straight to your wallet.',
    proof: '₹12Cr+ paid out',
    microsteps: ['Purchase confirmed', 'Commission credited', 'Withdraw anytime'],
  },
];

/* ─────────────────────────────────────────
   HOOKS
───────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCountUp(end, trigger, duration = 1300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * end));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [trigger, end, duration]);
  return val;
}

/* ─────────────────────────────────────────
   STEP CARD
───────────────────────────────────────── */
function StepCard({ step, index, sectionVisible, forcedVisible = false }) {
  const [hov, setHov] = useState(false);
  const [ref, cardVisible] = useInView(0.05);
  const Icon = step.icon;
  const delay = index * 110;
  const show = forcedVisible || (sectionVisible && cardVisible);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        background: hov
          ? `linear-gradient(160deg, ${step.accentLight} 0%, #ffffff 100%)`
          : 'var(--color-surface)',
        border: `1.5px solid ${hov ? step.accent + '35' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: '2.25rem 1.5rem 1.6rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        overflow: 'hidden',
        height: '100%',
        boxShadow: hov
          ? `0 20px 48px ${step.glowColor}, 0 4px 16px rgba(0,0,0,0.05)`
          : 'var(--shadow-sm)',
        transform: show
          ? hov ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)'
          : 'translateY(26px) scale(0.97)',
        opacity: show ? 1 : 0,
        transition: `
          transform 480ms cubic-bezier(0.16,1,0.3,1) ${forcedVisible ? 0 : delay}ms,
          opacity 420ms ease ${forcedVisible ? 0 : delay}ms,
          box-shadow 260ms ease,
          background 220ms ease,
          border-color 220ms ease
        `,
      }}
    >
      {/* Top accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: step.barGrad,
        borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
        opacity: hov ? 1 : 0,
        transition: 'opacity 240ms ease',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 20% 110%, ${step.glowColor} 0%, transparent 60%)`,
        pointerEvents: 'none',
        opacity: hov ? 1 : 0,
        transition: 'opacity 300ms ease',
      }} />

      {/* Step number badge */}
      <div style={{
        position: 'absolute', top: '1.1rem', right: '1.1rem',
        width: 36, height: 36, borderRadius: '50%',
        background: step.numGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 12px ${step.accent}40`,
        transform: hov ? 'rotate(10deg) scale(1.1)' : 'rotate(0) scale(1)',
        transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
        zIndex: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem', fontWeight: 900, color: '#fff',
          letterSpacing: '0.04em',
        }}>{step.num}</span>
      </div>

      {/* Icon box */}
      <div style={{
        width: 52, height: 52, borderRadius: '0.875rem',
        background: hov
          ? `linear-gradient(135deg, ${step.accent}, ${step.accentMid})`
          : step.accentLight,
        border: `1.5px solid ${step.accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: hov ? `0 8px 20px ${step.glowColor}` : 'none',
        transition: 'all 280ms cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', zIndex: 1,
      }}>
        <Icon
          size={22}
          style={{
            color: hov ? '#fff' : step.accent,
            transform: hov ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0)',
            transition: 'color 240ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1rem', fontWeight: 900,
        color: hov ? step.accent : 'var(--color-text)',
        lineHeight: 1.25,
        transition: 'color 220ms ease',
        position: 'relative', zIndex: 1,
      }}>{step.title}</h3>

      {/* Desc */}
      <p style={{
        fontSize: '0.81rem', lineHeight: 1.7,
        color: 'var(--color-muted)',
        position: 'relative', zIndex: 1,
      }}>{step.desc}</p>

      {/* Microsteps */}
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', flexDirection: 'column', gap: '0.32rem',
        opacity: hov ? 1 : 0.55,
        transform: hov ? 'translateY(0)' : 'translateY(5px)',
        transition: 'opacity 260ms ease, transform 260ms ease',
        position: 'relative', zIndex: 1,
      }}>
        {step.microsteps.map((m, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.71rem', fontWeight: 700,
            color: 'var(--color-muted)',
          }}>
            <CheckCircle2 size={11} style={{ color: step.accent, flexShrink: 0 }} />
            {m}
          </li>
        ))}
      </ul>

      {/* Social proof chip */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.26rem 0.65rem', borderRadius: 9999,
        background: step.accentPale,
        border: `1px solid ${step.accent}22`,
        alignSelf: 'flex-start', marginTop: 'auto',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: step.accent }} />
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: step.accent }}>
          {step.proof}
        </span>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: step.barGrad,
        borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)',
        transformOrigin: 'left center',
        transform: hov ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   CONNECTOR ARROW (desktop only)
───────────────────────────────────────── */
function Arrow({ color, inView, delay }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '2.6rem',
      flexShrink: 0,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateX(0) scale(1)' : 'translateX(-6px) scale(0.7)',
      transition: `opacity 350ms ease ${delay}ms, transform 350ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ArrowRight size={13} style={{ color, opacity: 0.6 }} />
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────
   MOBILE CAROUSEL  ← FIXED
───────────────────────────────────────── */
function MobileCarousel({ sectionVisible }) {
  const trackRef = useRef(null);
  const itemRefs = useRef([]);           // ← ref to each card wrapper
  const [activeIdx, setActiveIdx] = useState(0);

  // ── FIX: use IntersectionObserver on each card instead of scroll math ──
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // One observer watching all card wrappers
    const obs = new IntersectionObserver(
      (entries) => {
        // Find the entry that is MOST visible (highest intersectionRatio)
        let best = -1;
        let bestRatio = -1;
        entries.forEach((entry) => {
          const idx = Number(entry.target.dataset.idx);
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = idx;
          }
        });
        if (best >= 0) setActiveIdx(best);
      },
      {
        root: track,                      // ← scroll container is the root
        threshold: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // fire at multiple thresholds
      }
    );

    itemRefs.current.forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Scroll to card by index
  const scrollTo = useCallback((idx) => {
    const el = itemRefs.current[idx];
    if (!el) return;
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, []);

  return (
    <div style={{ position: 'relative' }}>

      {/* Edge fade masks */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 28,
        background: 'linear-gradient(to right, var(--color-surface-2, #f1f5fb), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 28,
        background: 'linear-gradient(to left, var(--color-surface-2, #f1f5fb), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ── Scroll track ── */}
      <div
        ref={trackRef}
        className="hiw-track"
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          overflowY: 'visible',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingInline: '1.25rem',
          paddingBottom: '0.75rem',
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            ref={(el) => { itemRefs.current[i] = el; }}
            data-idx={i}                         // ← used by IntersectionObserver
            style={{
              flex: '0 0 calc(85vw - 2rem)',
              maxWidth: 300,
              minWidth: 252,
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
            }}
          >
            <StepCard
              step={step}
              index={i}
              sectionVisible={sectionVisible}
              forcedVisible={sectionVisible}
            />
          </div>
        ))}
      </div>

      {/* ── Dot indicators ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.45rem',
        marginTop: '1.1rem',
        height: 16,               // fixed height prevents layout shift
      }}>
        {STEPS.map((step, i) => {
          const isActive = activeIdx === i;
          return (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to step ${i + 1}`}
              aria-current={isActive ? 'true' : undefined}
              style={{
                width: isActive ? 28 : 8,
                height: 8,
                borderRadius: 9999,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
                background: isActive
                  ? step.accent
                  : 'rgba(37,99,235,0.18)',
                boxShadow: isActive
                  ? `0 2px 8px ${step.accent}50`
                  : 'none',
                transform: isActive ? 'scaleY(1)' : 'scaleY(0.85)',
                transition: 'width 300ms cubic-bezier(0.16,1,0.3,1), background 280ms ease, box-shadow 280ms ease, transform 200ms ease',
              }}
            />
          );
        })}
      </div>

      {/* ── Swipe hint ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.3rem', marginTop: '0.55rem',
        opacity: activeIdx === 0 ? 0.5 : 0,
        transition: 'opacity 400ms ease',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <span style={{
          fontSize: '0.62rem',
          color: 'var(--color-faint)',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>
          swipe to see all steps
        </span>
        <ArrowRight size={10} style={{ color: 'var(--color-faint)' }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DESKTOP STEPS ROW
───────────────────────────────────────── */
function DesktopStepsRow({ inView }) {
  return (
    <div className="hiw-steps-row" style={{ marginBottom: 'clamp(1.75rem,4vw,2.75rem)' }}>
      {STEPS.map((step, i) => (
        <React.Fragment key={step.num}>
          <StepCard key={step.num} step={step} index={i} sectionVisible={inView} />
          {i < STEPS.length - 1 && (
            <div key={`arrow-${i}`} className="hiw-arrow-col" style={{ padding: '0 0.4rem' }}>
              <Arrow color={step.accentMid} inView={inView} delay={i * 110 + 180} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function HowItWorks() {
  const [sectionRef, inView] = useInView(0.08);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <>
      <style>{`
        @keyframes pulse-badge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.20); }
          60%       { box-shadow: 0 0 0 8px rgba(37,99,235,0); }
        }

        /* Hide carousel scrollbar — webkit */
        .hiw-track::-webkit-scrollbar { display: none; }

        /* Desktop grid */
        .hiw-steps-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          gap: 0;
          align-items: start;
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .hiw-steps-row {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .hiw-arrow-col { display: none !important; }
        }

        /* Stats row */
        .hiw-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.9rem;
        }
        @media (max-width: 580px) {
          .hiw-stats-row { grid-template-columns: repeat(2, 1fr); gap: 0.65rem; }
        }

        /* CTA strip */
        .hiw-cta-strip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          text-align: center;
        }
        @media (min-width: 600px) {
          .hiw-cta-strip {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="home-section home-section-tinted"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Ambient blobs */}
        <div aria-hidden style={{
          position: 'absolute', top: -100, right: -120,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', bottom: -80, left: -100,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="site-container" style={{ position: 'relative' }}>

          {/* Section Header */}
          <div
            className="section-header"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(22px)',
              transition: 'opacity 550ms ease, transform 550ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.32rem 1rem',
              borderRadius: 9999,
              background: 'var(--blue-light)',
              border: '1.5px solid rgba(37,99,235,0.2)',
              animation: inView ? 'pulse-badge 2.6s ease infinite' : 'none',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)' }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.66rem', fontWeight: 900,
                color: 'var(--blue-dark)',
                letterSpacing: '0.09em', textTransform: 'uppercase',
              }}>How It Works</span>
            </div>

            <h2 className="section-title">
              Start earning in{' '}
              <span className="gradient-text">4 simple steps</span>
            </h2>
            <p className="section-subtitle">
              No experience needed. No upfront cost. Just an account and you&apos;re ready to go.
            </p>
          </div>

          {/* Steps: Mobile Carousel vs Desktop Grid */}
          {isMobile ? (
            <div style={{
              marginInline: '-1rem',
              marginBottom: 'clamp(1.75rem,4vw,2.75rem)',
            }}>
              <MobileCarousel sectionVisible={inView} />
            </div>
          ) : (
            <DesktopStepsRow inView={inView} />
          )}


        </div>
      </section>
    </>
  );
}