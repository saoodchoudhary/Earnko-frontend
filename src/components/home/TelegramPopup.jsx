'use client';

import { useEffect, useState } from 'react';
import { X, Send, Users, Zap, Bell, Star, TrendingUp } from 'lucide-react';

const STORAGE_KEY = 'ek_tg_popup_v2';
const DELAY_MS    = 5000;

export default function TelegramPopup() {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(STORAGE_KEY)) return; } catch {}
    const t = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // ✅ FIX: Single dismiss function — no conflict
  function dismiss() {
    setAnimate(false);
    setTimeout(() => setVisible(false), 380);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: animate ? 1 : 0,
          transition: 'opacity 350ms ease',
        }}
      />

      {/* ✅ FIX: Centering done via flexbox on a wrapper — no translate conflict */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 12px',
          // On mobile — align to bottom
          alignItems: 'center',
          paddingBottom: window?.innerWidth < 640 ? '12px' : '0',
          pointerEvents: 'none',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Join Earnko Telegram Channel"
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '400px',
            opacity: animate ? 1 : 0,
            transform: animate ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
            transition: 'opacity 380ms cubic-bezier(0.16,1,0.3,1), transform 380ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <Card dismiss={dismiss} />
        </div>
      </div>
    </>
  );
}

/* ─── Card extracted — clean separation ─── */
function Card({ dismiss }) {
  const PERKS = [
    { icon: <Bell size={11} />,       text: 'Daily Deals' },
    // { icon: <Zap size={11} />,        text: 'High Payouts' },
    // { icon: <TrendingUp size={11} />, text: 'Earn More' },
    { icon: <Users size={11} />,      text: '1k+ Members' },
  ];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: '1.5rem',
        background: 'linear-gradient(160deg, #0d1117 0%, #161b2e 45%, #0d1117 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.12)',
      }}
    >
      {/* ── Glow blobs ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -60, left: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)',
        filter: 'blur(36px)', pointerEvents: 'none',
      }} />

      {/* ── Animated top bar ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #6366f1, #06b6d4, #6366f1, transparent)',
        backgroundSize: '200% 100%',
        animation: 'tg-bar 3s linear infinite',
      }} />

      {/* ── Close button — ✅ fixed z-index + pointer-events ── */}
      <button
        onClick={dismiss}
        aria-label="Close"
        style={{
          position: 'absolute', top: 14, right: 14,
          zIndex: 10, width: 30, height: 30,
          borderRadius: '50%', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.45)',
          transition: 'background 200ms, color 200ms, transform 200ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <X size={14} />
      </button>

      {/* ── Content ── */}
      <div style={{ padding: 'clamp(1.25rem, 5vw, 1.75rem)', position: 'relative', zIndex: 2 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
          {/* Telegram icon */}
          <div style={{
            width: 52, height: 52, borderRadius: '1rem', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #2AABEE, #1a8fc7)',
            boxShadow: '0 8px 24px rgba(42,171,238,0.4)',
            position: 'relative',
          }}>
            <Send size={22} color="#fff" style={{ marginLeft: 2 }} aria-hidden="true" />
            {/* Live dot */}
            <span aria-hidden="true" style={{
              position: 'absolute', top: -3, right: -3,
              width: 12, height: 12, borderRadius: '50%',
              background: '#10b981',
              border: '2px solid #0d1117',
              boxShadow: '0 0 0 3px rgba(16,185,129,0.3)',
              animation: 'tg-pulse 2s ease-in-out infinite',
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: 99,
                background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.25)',
              }}>Official Channel</span>
           
            </div>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: '0.95rem', margin: 0, letterSpacing: '-0.01em' }}>
              Earnko Affiliate
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', margin: 0 }}>@EarnkoAffiliate · Telegram</p>
          </div>
        </div>

        {/* Heading */}
        <h2 style={{
          color: '#fff', fontWeight: 900, margin: '0 0 0.5rem',
          fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', lineHeight: 1.2, letterSpacing: '-0.02em',
        }}>
          Get Exclusive Deals &{' '}
          <span style={{
            background: 'linear-gradient(90deg, #818cf8, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Affiliate Secrets</span>{' '}
          — Daily
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem',
          lineHeight: 1.65, margin: '0 0 1.1rem',
        }}>
          Join our community and receive{' '}
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>highest cashback offers</strong>,{' '}
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>store payout alerts</strong>, and
          pro tips to maximize your affiliate earnings — delivered straight to your phone.
        </p>

        {/* Perks chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.1rem' }}>
          {PERKS.map(p => (
            <div key={p.text} style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.28rem 0.65rem', borderRadius: 99,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 700,
            }}>
              <span style={{ color: '#818cf8' }}>{p.icon}</span>
              {p.text}
            </div>
          ))}
        </div>


        {/* CTA */}
        <a
          href="https://t.me/Earnkoaffiliate"
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.6rem', width: '100%', padding: '0.9rem',
            borderRadius: '0.875rem', textDecoration: 'none',
            background: 'linear-gradient(135deg, #2AABEE 0%, #1a8fc7 100%)',
            boxShadow: '0 10px 30px rgba(42,171,238,0.4)',
            color: '#fff', fontWeight: 900,
            fontSize: '0.9rem', letterSpacing: '-0.01em',
            transition: 'transform 200ms, box-shadow 200ms',
            marginBottom: '0.65rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 14px 36px rgba(42,171,238,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(42,171,238,0.4)';
          }}
        >
          <Send size={16} aria-hidden="true" />
          Join Free on Telegram
          <span style={{
            padding: '0.18rem 0.55rem', borderRadius: 99,
            background: 'rgba(255,255,255,0.2)',
            fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.05em',
          }}>FREE</span>
        </a>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          style={{
            width: '100%', textAlign: 'center', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)',
            transition: 'color 200ms', padding: '0.25rem',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
        >
          No thanks, I'll skip for now
        </button>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes tg-bar {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes tg-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.3); }
          50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0.1); }
        }
      `}</style>
    </div>
  );
}