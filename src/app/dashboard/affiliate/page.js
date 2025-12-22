'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import QuickLinkGenerator from '../../../components/QuickLinkGenerator';

export default function AffiliateToolsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const res = await fetch(`${base}/api/user/links`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.message || 'Failed to load links');
      setItems(js?.data?.items || []);
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Error loading');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const totals = useMemo(() => {
    const totalLinks = items.length || 0;
    const totalClicks = items.reduce((acc, it) => acc + Number(it.clicks || 0), 0);
    const totalApproved = items.reduce((acc, it) => acc + Number(it.approvedConversions || 0), 0);
    const totalEarnings = items.reduce((acc, it) => acc + Number(it.approvedCommissionSum || 0), 0);
    return { totalLinks, totalClicks, totalApproved, totalEarnings };
  }, [items]);

  const view = useMemo(() => {
    const src = Array.isArray(items) ? [...items] : [];
    // Sort by created desc
    src.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (!q.trim()) return src;
    const qq = q.trim().toLowerCase();
    return src.filter((it) => {
      return (
        String(it.subid || '').toLowerCase().includes(qq) ||
        String(it.shareUrl || '').toLowerCase().includes(qq) ||
        String(it.cuelinksUrl || '').toLowerCase().includes(qq)
      );
    });
  }, [items, q]);

  const copy = async (text, msg = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error('Copy failed');
    }
  };

  const refresh = () => {
    const controller = new AbortController();
    load(controller.signal);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Affiliate Tools</h1>
          <p className="text-gray-300 mt-2">Generate and manage your Cuelinks-powered links. Track clicks and earnings.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Links" value={totals.totalLinks} />
          <StatCard title="Total Clicks" value={totals.totalClicks} />
          <StatCard title="Approved Conversions" value={totals.totalApproved} />
          <StatCard title="Earnings (₹)" value={Number(totals.totalEarnings || 0).toFixed(0)} />
        </div>

        {/* Generator */}
        <section className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Generate Cuelinks Link</h2>
              <p className="text-sm text-gray-500">Paste any product/store URL. We’ll create a Cuelinks link and a Share URL to track clicks.</p>
            </div>
            <button className="btn btn-outline" onClick={refresh}>Refresh</button>
          </div>
          <div className="mt-4">
            {/* Optional: refresh list after successful generation */}
            <QuickLinkGenerator onGenerated={() => refresh()} />
            <div className="text-xs text-gray-500 mt-2">
              Tip: Share the “Share URL” so clicks get tracked on Earnko, and attribution still works on Cuelinks.
            </div>
          </div>
        </section>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <input
            className="input w-full sm:w-80"
            placeholder="Search by subid or URL..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-outline" onClick={refresh}>Refresh</button>
        </div>

        {/* Links List */}
        <section className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Links</h2>
            {!loading && (
              <span className="text-xs text-gray-500">Showing {view.length} of {items.length}</span>
            )}
          </div>

          {loading ? (
            <LinksSkeleton />
          ) : view.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {view.map((it) => (
                <LinkCard key={it.subid} it={it} copy={copy} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{typeof value === 'number' ? Number(value).toLocaleString() : value}</div>
    </div>
  );
}

function LinkCard({ it, copy }) {
  const created = it.createdAt ? new Date(it.createdAt).toLocaleString() : '-';
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">Created</div>
          <div className="text-sm">{created}</div>
        </div>
        <span className="px-2 py-1 border rounded text-xs bg-gray-50">SubID</span>
      </div>

      <div className="mt-2 text-xs text-gray-600 break-all font-mono">{it.subid}</div>

      {/* Share URL */}
      <div className="mt-3">
        <div className="text-xs text-gray-500">Share URL (tracks clicks)</div>
        <div className="text-xs break-all">{it.shareUrl}</div>
        <div className="mt-1 flex gap-2">
          <button className="btn btn-outline btn-xs" onClick={() => copy(it.shareUrl, 'Share URL copied!')}>Copy</button>
          <a className="btn btn-outline btn-xs" href={it.shareUrl} target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      </div>

      {/* Cuelinks URL */}
      <div className="mt-3">
        <div className="text-xs text-gray-500">Cuelinks URL (direct)</div>
        <div className="text-xs break-all">{it.cuelinksUrl}</div>
        <div className="mt-1 flex gap-2">
          <button className="btn btn-outline btn-xs" onClick={() => copy(it.cuelinksUrl, 'Cuelinks URL copied!')}>Copy</button>
          <a className="btn btn-outline btn-xs" href={it.cuelinksUrl} target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat label="Clicks" value={it.clicks || 0} />
        <MiniStat label="Approved" value={it.approvedConversions || 0} />
        <MiniStat label="Earnings (₹)" value={Number(it.approvedCommissionSum || 0).toFixed(0)} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded p-2 text-center">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-sm font-semibold">{typeof value === 'number' ? Number(value).toLocaleString() : value}</div>
    </div>
  );
}

function LinksSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="h-4 skeleton rounded w-24" />
          <div className="h-3 skeleton rounded w-40 mt-2" />
          <div className="h-3 skeleton rounded w-full mt-3" />
          <div className="h-3 skeleton rounded w-3/4 mt-2" />
          <div className="h-8 skeleton rounded w-full mt-3" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-6 text-center">
      <div className="text-lg font-semibold">No links yet</div>
      <div className="text-sm text-gray-600 mt-1">Generate your first link above and start sharing.</div>
    </div>
  );
}