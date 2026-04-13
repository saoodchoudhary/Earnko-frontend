'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Download,
  RefreshCw,
  Search,
  Store as StoreIcon,
  Calendar,
  Filter,
  ExternalLink
} from 'lucide-react';

export default function ReportsPage() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);

  // filters (EarnPe-like)
  const [storeId, setStoreId] = useState('all');
  const [orderStatus, setOrderStatus] = useState('all'); // all|paid|pending|rejected
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState('');

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // pagination (server-side)
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

  // Map backend statuses -> UI buckets (no network names anywhere)
  const normalizeStatus = (s) => {
    const x = String(s || '').toLowerCase();
    if (['approved', 'confirmed', 'valid', 'paid', 'completed'].includes(x)) return 'paid';
    if (['pending', 'under_review', 'processing'].includes(x)) return 'pending';
    if (['rejected', 'cancelled', 'invalid', 'void'].includes(x)) return 'rejected';
    return 'pending';
  };

  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const formatDateTime = (d) => {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return '';
    const date = x.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = x.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  };

  const buildQuery = () => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', String(pageSize));

    if (q.trim()) p.set('q', q.trim());
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

      const list = data?.data?.stores || data?.data?.items || data?.stores || [];
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
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await safeJson(res);
      if (!res.ok) {
        toast.error(data?.message || 'Failed to load reports');
        setItems([]);
        setTotalPages(1);
        return;
      }

      const arr = Array.isArray(data?.data?.items) ? data.data.items : [];
      const mapped = arr.map(r => ({
        ...r,
        __uiStatus: normalizeStatus(r.status),
      }));

      setItems(mapped);
      setTotalPages(Number(data?.data?.totalPages || 1));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load reports');
      setItems([]);
      setTotalPages(1);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!base) return;
    loadStores();
    loadReports(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // reset page on filter change
  useEffect(() => { setPage(1); }, [storeId, orderStatus, pageSize, q, from, to]);

  // reload on filter/page change (debounce search)
  useEffect(() => {
    if (!base) return;
    const t = setTimeout(() => loadReports(true), q.trim() ? 250 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, orderStatus, pageSize, q, from, to, page]);

  const filteredItems = useMemo(() => {
    return items.filter(it => {
      if (orderStatus === 'all') return true;
      return it.__uiStatus === orderStatus;
    });
  }, [items, orderStatus]);

  const summary = useMemo(() => {
    const paidEarnings = filteredItems
      .filter(x => x.__uiStatus === 'paid')
      .reduce((sum, x) => sum + Number(x.cashback || 0), 0);

    return { paidEarnings, orders: filteredItems.length };
  }, [filteredItems]);

  const exportCsv = () => {
    const header = ['Store', 'Order Date', 'OrderId', 'Title', 'Product Link', 'Amount', 'Cashback', 'Status'];
    const rows = filteredItems.map(it => ([
      it?.store?.name || '',
      it?.orderDate ? formatDateTime(it.orderDate) : '',
      it?.orderId || '',
      it?.product?.title || '',
      it?.product?.url || '',
      Number(it?.amount || 0),
      Number(it?.cashback || 0),
      it?.__uiStatus || ''
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

  const onRefresh = () => {
    setRefreshing(true);
    loadReports(false);
  };

  const badgeClass = (s) => {
    if (s === 'paid') return 'bg-green-100 text-green-700';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header (Earnko colors) */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-7">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
                <p className="text-blue-100 mt-1">Paid / Pending / Rejected orders</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-5">
        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500">Store</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                <StoreIcon className="w-4 h-4 text-gray-400" />
                <select
                  className="w-full bg-transparent outline-none text-sm"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                >
                  <option value="all">All</option>
                  {stores.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Page Size</label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none text-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Order Status</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  className="w-full bg-transparent outline-none text-sm"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-gray-500">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Search</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="OrderId / title"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs text-gray-500">Paid Earnings</div>
            <div className="text-2xl font-bold text-gray-900">{fmtINR(summary.paidEarnings)}</div>
            <div className="text-xs text-gray-400 mt-1">
              (Report last updated: {new Date().toLocaleString('en-IN')})
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Orders</div>
            <div className="text-2xl font-bold text-gray-900">{summary.orders}</div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Store</th>
                  <th className="text-left px-4 py-3">Order Date</th>
                  <th className="text-left px-4 py-3">OrderId</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">Cashback</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">No records found</td>
                  </tr>
                ) : (
                  filteredItems.map((it) => (
                    <tr key={it.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{it?.store?.name || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {it?.orderDate ? formatDateTime(it.orderDate) : '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{it?.orderId || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">
                          {String(it?.product?.title || 'Product').slice(0, 60)}
                        </div>
                        {it?.share?.shortUrl ? (
                          <a
                            className="text-xs text-blue-600 break-all inline-block mt-1"
                            href={it.share.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Your Earnko shared link"
                          >
                            {it.share.shortUrl}
                          </a>
                        ) : null}
                      </td>

                      {/* Product link */}
                      <td className="px-4 py-3">
                        {it?.product?.url ? (
                          <a
                            href={it.product.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 text-xs break-all"
                            title="Open product"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">{fmtINR(it?.amount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">{fmtINR(it?.cashback)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeClass(it.__uiStatus)}`}>
                          {it.__uiStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalPages > 1 ? (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <div className="text-xs text-gray-500">Page {page} / {totalPages}</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 bg-white"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 bg-white"
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
    </div>
  );
}