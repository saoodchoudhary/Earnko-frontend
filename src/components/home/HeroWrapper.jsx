// HeroWrapper.jsx — NO 'use client'
// Ye sirf tab use hoga jab page.js Server Component ho
import Hero from './Hero';

async function fetchLiveStats() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stats/public`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.data;
    return [
      { key: 'payout', value: d.payout,  trend: d.payoutTrend },
      { key: 'users',  value: d.users,   trend: d.usersTrend  },
      { key: 'links',  value: d.links,   trend: d.linksTrend  },
      { key: 'stores', value: d.stores,  trend: d.storesTrend },
    ];
  } catch {
    return null;
  }
}

export default async function HeroWrapper() {
  const stats = await fetchLiveStats();
  return <Hero stats={stats} />;
}