'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Download, RefreshCw, Search, Calendar, Store as StoreIcon, Filter
} from 'lucide-react';

export default function ReportsPage() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all'); // all|pending|confirmed|cancelled|under_review
  const [storeId, setStoreId] = useState('all');

  const [from, setFrom] = useState(''); // yyyy-mm-dd
  const [to, setTo] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const buildQuery = () => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', '20');

    if (q.trim()) p.set('q', q.trim());
    if (status !== 'all') p.set('status', status);
    if (storeId !== 'all') p.set('storeId', storeId);

    if (from) p.set('from', new Date(from).toISOString());
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      p.set('to', end.toISOString());
    }
    return p.toString();
  };

  const loadStores = async () => {
    try {
      const res = await fetch(`${base}/api/stores`);
      const data = await safeJson(res);
      if (!res.ok) return;

      // Assuming stores endpoint returns { success, data: { stores: [...] } } or similar
      const list =
        data?.data?.stores ||
        data?.data?.items ||
        data?.stores ||
        [];
      setStores(Array.isArray(list) ? list : []);
    } catch {}
  };

  const loadReports = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login?next=/dashboard/reports';
        return;
      }

      const qs = buildQuery();
      const res = await fetch(`${base}/api/user/reports/orders?${qs}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await safeJson(res);

      if (!res.ok) {
        toast.error(data?.message || 'Failed to load reports');
        setItems([]);
        setTotalPages(1);
        return;
      }

      const arr = Array.isArray(data?.data?.items) ? data.data.items : [];
      setItems(arr);
      setTotalPages(Number(data?.data?.totalPages || 1));
    } catch (e) {
      toast.error('Failed to load reports');
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadReports(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, storeId, from, to]);

  // Load when filters change (with debounce-ish)
  useEffect(() => {
    const t = setTimeout(() => loadReports(true), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, storeId, from, to, page]);

  const exportCsv = () => {
    const header = [
      'Store', 'Status', 'OrderId', 'OrderDate',
      'Product', 'Amount', 'Commission', 'ShortUrl'
    ];
    const rows = items.map(it => ([
      it?.store?.name || '',
      it?.status || '',
      it?.orderId || '',
      it?.orderDate ? formatDate(it.orderDate) : '',
      it?.product?.title || '',
      Number(it?.amount || 0),
      Number(it?.commission || 0),
      it?.source?.shortUrl || ''
    ]));

    const csv = [header, ...rows]
      .map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports(false);
  };

  const statusBadge = (s) => {
    const x = String(s || '').toLowerCase();
    const cls =
      x === 'confirmed' ? 'bg-green-100 text-green-700' :
      x === 'cancelled' ? 'bg-red-100 text-red-700' :
      x === 'under_review' ? 'bg-purple-100 text-purple-700' :
      'bg-amber-100 text-amber-700'; // pending default

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${cls}`}>
        {x || 'pending'}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-gray-500">Orders + Conversions (pending included)</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-black text-white text-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 rounded border text-sm"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Search</label>
          <div className="flex items-center gap-2 border rounded px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="OrderId / Store / Product"
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Status</label>
          <div className="flex items-center gap-2 border rounded px-3 py-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full outline-none text-sm bg-transparent"
            >
              <option value="all">All</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="under_review">under_review</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Store</label>
          <div className="flex items-center gap-2 border rounded px-3 py-2">
            <StoreIcon className="w-4 h-4 text-gray-400" />
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full outline-none text-sm bg-transparent"
            >
              <option value="all">All</option>
              {stores.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">From</label>
            <div className="flex items-center gap-2 border rounded px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">To</label>
            <div className="flex items-center gap-2 border rounded px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 border rounded overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-3">Store</th>
                <th className="text-left px-3 py-3">Order Date</th>
                <th className="text-left px-3 py-3">OrderId</th>
                <th className="text-left px-3 py-3">Product / Offer</th>
                <th className="text-right px-3 py-3">Amount</th>
                <th className="text-right px-3 py-3">Commission</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Source Link</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">No records</td></tr>
              ) : (
                items.map(it => (
                  <tr key={it.id} className="border-t">
                    <td className="px-3 py-3">{it?.store?.name || '-'}</td>
                    <td className="px-3 py-3">{it?.orderDate ? formatDate(it.orderDate) : '-'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{it?.orderId || '-'}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{it?.product?.title || '-'}</div>
                      {it?.product?.url ? (
                        <a className="text-xs text-blue-600 break-all" href={it.product.url} target="_blank" rel="noreferrer">
                          {it.product.url}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-right">{fmtINR(it?.amount)}</td>
                    <td className="px-3 py-3 text-right">{fmtINR(it?.commission)}</td>
                    <td className="px-3 py-3">{statusBadge(it?.status)}</td>
                    <td className="px-3 py-3">
                      {it?.source?.shortUrl ? (
                        <a className="text-blue-600 text-xs break-all" href={it.source.shortUrl} target="_blank" rel="noreferrer">
                          {it.source.shortUrl}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 ? (
          <div className="flex items-center justify-between px-3 py-3 border-t bg-gray-50">
            <div className="text-xs text-gray-500">Page {page} / {totalPages}</div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}