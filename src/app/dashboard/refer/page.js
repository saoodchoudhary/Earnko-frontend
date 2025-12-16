'use client';

import { useEffect, useState } from 'react';

export default function ReferPage() {
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const token = localStorage.getItem('token');
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const h = { Authorization: token ? `Bearer ${token}` : '' };
      try {
        const r1 = await fetch(`${base}/api/auth/me`, { signal: controller.signal, headers: h });
        const d1 = await r1.json();
        if (r1.ok) setMe(d1?.data?.user || d1?.data || null);
        const r2 = await fetch(`${base}/api/user/referrals`, { signal: controller.signal, headers: h }).catch(() => null);
        const d2 = r2 ? await r2.json() : null;
        if (r2?.ok) setStats(d2?.data || null);
      } catch {}
    }
    load();
    return () => controller.abort();
  }, []);

  const referralCode = me?._id || '';
  const referralLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/register?ref=${referralCode}`;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Refer & Earn</h1>
      <div className="bg-white border rounded-lg p-4 space-y-2">
        <div className="text-sm">Your referral link</div>
        <div className="text-sm break-all">{referralLink}</div>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat title="Referrals" value={stats.totalReferrals || 0} />
          <Stat title="Active" value={stats.activeReferrals || 0} />
          <Stat title="Referral Earnings" value={`₹${Number(stats.referralEarnings || 0).toFixed(0)}`} />
          <Stat title="Clicks" value={stats.clicks || 0} />
        </div>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}