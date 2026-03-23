'use client';

import { useEffect, useMemo, useState } from 'react';

export default function TelegramConnectPage() {
  const [status, setStatus] = useState('Connecting...');
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.earnko.com';

  const tgId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const u = new URL(window.location.href);
    return u.searchParams.get('tgId') || '';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        if (!token) {
          setStatus('Please login to Earnko first, then open this link again from Telegram.');
          return;
        }
        if (!tgId) {
          setStatus('Missing tgId. Please go back to Telegram and run /connect again.');
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

        setStatus('Connected! Go back to Telegram and paste any product link.');
      } catch (e) {
        setStatus(e?.message || 'Failed to connect.');
      }
    })();
  }, [base, tgId]);

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>Connect Telegram</h1>
      <p style={{ marginTop: 12 }}>{status}</p>
    </div>
  );
}