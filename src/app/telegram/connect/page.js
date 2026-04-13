'use client';

import { useEffect, useMemo, useState } from 'react';

export default function TelegramConnectPage() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.earnko.com';

  const tgId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const u = new URL(window.location.href);
    return u.searchParams.get('tgId') || '';
  }, []);

  const [status, setStatus] = useState({
    state: 'loading', // 'loading' | 'success' | 'error'
    title: 'Connecting…',
    message: 'Please wait while we securely connect your Telegram account.'
  });

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        if (!token) {
          // ✅ login behavior unchanged (only UI copy)
          setStatus({
            state: 'error',
            title: 'Login required',
            message: 'Please login to Earnko first, then open this link again from Telegram.'
          });
          return;
        }
        if (!tgId) {
          setStatus({
            state: 'error',
            title: 'Missing Telegram ID',
            message: 'Missing tgId. Please go back to Telegram and run /connect again.'
          });
          return;
        }

        const res = await fetch(`${base}/api/integrations/telegram/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ telegramUserId: tgId })
        });

        const js = await res.json().catch(() => null);
        if (!res.ok) throw new Error(js?.message || 'Failed');

        setStatus({
          state: 'success',
          title: 'Connected',
          message: 'Your Telegram is now connected. Go back to Telegram and paste any product link to generate a short link.'
        });
      } catch (e) {
        setStatus({
          state: 'error',
          title: 'Connection failed',
          message: e?.message || 'Failed to connect.'
        });
      }
    })();
  }, [base, tgId]);

  const Icon = () => {
    if (status.state === 'success') {
      return (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6L9 17l-5-5"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }

    if (status.state === 'error') {
      return (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: 'rgba(239, 68, 68, 0.10)',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid rgba(239, 68, 68, 0.25)'
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 8v5"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M12 16.5h.01"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M10.3 4.3h3.4L21 11.6v3.8L13.7 22h-3.4L3 15.4v-3.8L10.3 4.3Z"
              stroke="#ef4444"
              strokeWidth="1.6"
              opacity="0.65"
            />
          </svg>
        </div>
      );
    }

    // loading
    return (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: 'rgba(59, 130, 246, 0.10)',
          display: 'grid',
          placeItems: 'center',
          border: '1px solid rgba(59, 130, 246, 0.20)'
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            border: '3px solid rgba(59, 130, 246, 0.25)',
            borderTopColor: 'rgba(59, 130, 246, 0.95)',
            animation: 'spin 900ms linear infinite'
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 800px at 10% 0%, rgba(34,211,238,0.10), transparent 55%), radial-gradient(1000px 700px at 90% 10%, rgba(59,130,246,0.10), transparent 55%), linear-gradient(to bottom right, #f8fafc, #ffffff)',
        padding: 24
      }}
    >
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          maxWidth: 720,
          margin: '0 auto'
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 10px 30px rgba(2, 6, 23, 0.06)',
            borderRadius: 18,
            padding: 22
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Icon />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.01em'
                }}
              >
                Connect Telegram
              </div>
              <div style={{ marginTop: 2, fontSize: 13, color: 'rgba(15, 23, 42, 0.65)' }}>
                Secure account linking
              </div>
            </div>

            {status.state === 'success' ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.10)',
                  border: '1px solid rgba(16, 185, 129, 0.20)',
                  padding: '6px 10px',
                  borderRadius: 999
                }}
              >
                Connected
              </span>
            ) : null}
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {status.title}
            </div>

            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: 'rgba(15, 23, 42, 0.75)' }}>
              {status.message}
            </div>

            {status.state === 'success' ? (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 14,
                  border: '1px solid rgba(16, 185, 129, 0.22)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: '#065f46',
                  fontSize: 13,
                  lineHeight: 1.6
                }}
              >
                Tip: Go back to Telegram and paste a product URL. EarnkoBot will reply with a short share link.
              </div>
            ) : null}

            {status.state === 'error' ? (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 14,
                  border: '1px solid rgba(239, 68, 68, 0.22)',
                  background: 'rgba(239, 68, 68, 0.06)',
                  color: '#7f1d1d',
                  fontSize: 13,
                  lineHeight: 1.6
                }}
              >
                If you’re logged out, login to Earnko first, then open this Telegram connect link again.
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'rgba(15, 23, 42, 0.55)' }}>
          Earnko • Telegram Integration
        </div>
      </div>
    </div>
  );
}