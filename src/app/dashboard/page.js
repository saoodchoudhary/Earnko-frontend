'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  TrendingUp,
  Link as LinkIcon,
  Wallet,
  Zap,
  BarChart3,
  Users,
  ArrowRight,
  ChevronRight,
  Clock,
  DollarSign,
  Target,
  Eye,
  CheckCircle,
  Calendar,
  Gift,
  Store as StoreIcon,
  CreditCard,
  RefreshCw,
  ExternalLink,
  Download,
  Filter,
} from 'lucide-react';

/**
 * Recharts: client-only (prevents hydration issues).
 */
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });

/**
 * Helpers
 */
function normalizeList(obj) {
  const candidate =
    (obj?.data?.items && Array.isArray(obj.data.items) && obj.data.items) ||
    (obj?.data && Array.isArray(obj.data) && obj.data) ||
    (obj?.items && Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj) ? obj : []);
  return Array.isArray(candidate) ? candidate : [];
}

function toYMD(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '';
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, '0');
  const dd = String(x.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseAnyDateToYMD(input) {
  if (!input) return '';
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return toYMD(d);
}

function lastNDaysSeries(n = 30) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(toYMD(d));
  }
  return out;
}

function safeNumber(n, fb = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fb;
}

function formatINR(n, digits = 0) {
  const num = safeNumber(n, 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(num);
  } catch {
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  }
}

function formatCompact(n) {
  const num = safeNumber(n, 0);
  try {
    return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  } catch {
    return String(num);
  }
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const BRAND = {
  blue: '#2563EB',
  cyan: '#06B6D4',
  indigo: '#6366F1',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

const PIE_COLORS = [BRAND.blue, BRAND.cyan, BRAND.indigo, BRAND.green, BRAND.amber, BRAND.red];

function humanizeRange(range) {
  if (range === '7d') return 'Last 7 days';
  if (range === '30d') return 'Last 30 days';
  if (range === '90d') return 'Last 90 days';
  return range;
}

/**
 * Tooltip: compact + mobile friendly
 */
function NiceTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-3 max-w-[240px]">
      <div className="text-xs font-semibold text-gray-600 mb-2">Date: {label}</div>
      <div className="space-y-1">
        {payload.slice(0, 4).map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
              <span className="text-gray-700 font-semibold truncate">{p.name || p.dataKey}</span>
            </div>
            <span className="text-gray-900 font-extrabold">
              {currency ? formatINR(p.value) : Number(p.value || 0).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [range, setRange] = useState('30d');

  const [me, setMe] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [links, setLinks] = useState([]);
  const [offers, setOffers] = useState([]);

  const [analyticsSummary, setAnalyticsSummary] = useState({
    clicksTotal: 0,
    conversionsTotal: 0,
    commissionTotal: 0,
    pendingAmount: 0,
    approvedAmount: 0,
  });
  const [analyticsDaily, setAnalyticsDaily] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [todayClicks, setTodayClicks] = useState(0);
  const [todayConversions, setTodayConversions] = useState(0);
  const [todayCommission, setTodayCommission] = useState(0);

  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [refreshTick, setRefreshTick] = useState(0);

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  // auth guard
  useEffect(() => {
    const token = getToken();
    if (!token) router.replace('/login?next=/dashboard');
  }, [router]);

  const refreshAll = () => setRefreshTick(v => v + 1);

  // load me
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        const token = getToken();
        setLoadingMe(true);

        const r = await fetch(`${base}/api/auth/me`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await safeJson(r);
        if (!r.ok) {
          toast.error(d?.message || `Failed to load profile (HTTP ${r.status})`);
          return;
        }
        setMe(d?.data?.user || d?.data || null);
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading profile');
      } finally {
        setLoadingMe(false);
      }
    }
    load();
    return () => controller.abort();
  }, [base, refreshTick]);

  // load wallet
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        const token = getToken();
        setLoadingWallet(true);

        const r = await fetch(`${base}/api/wallet/me`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await safeJson(r);
        if (!r.ok) {
          toast.error(d?.message || `Failed to load wallet (HTTP ${r.status})`);
          return;
        }
        setWallet(d?.data?.wallet || null);
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading wallet');
      } finally {
        setLoadingWallet(false);
      }
    }
    load();
    return () => controller.abort();
  }, [base, refreshTick]);

  // load links
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        const token = getToken();
        setLoadingLinks(true);

        const r = await fetch(`${base}/api/user/links`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await safeJson(r);
        if (!r.ok) {
          toast.error(d?.message || `Failed to load links (HTTP ${r.status})`);
          setLinks([]);
          return;
        }
        setLinks(normalizeList(d?.data));
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading links');
        setLinks([]);
      } finally {
        setLoadingLinks(false);
      }
    }
    load();
    return () => controller.abort();
  }, [base, refreshTick]);

  // load offers
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        setLoadingOffers(true);

        const params = new URLSearchParams({ limit: '12' });
        const r = await fetch(`${base}/api/public/offers?${params.toString()}`, { signal: controller.signal });
        const d = await safeJson(r);
        if (!r.ok) {
          toast.error(d?.message || `Failed to load offers (HTTP ${r.status})`);
          setOffers([]);
          return;
        }

        const list = Array.isArray(d?.data?.offers)
          ? d.data.offers
          : Array.isArray(d?.data?.items)
          ? d.data.items
          : [];

        const sorted = [...list].sort((a, b) => {
          const rd = (b.rate || 0) - (a.rate || 0);
          if (rd !== 0) return rd;
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });

        setOffers(sorted);
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading offers');
        setOffers([]);
      } finally {
        setLoadingOffers(false);
      }
    }
    load();
    return () => controller.abort();
  }, [base, refreshTick]);

  // load analytics (range)
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        const token = getToken();
        setAnalyticsLoading(true);

        const r = await fetch(`${base}/api/user/analytics?range=${encodeURIComponent(range)}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await safeJson(r);
        if (!r.ok) {
          toast.error(d?.message || `Failed to load analytics (HTTP ${r.status})`);
          setAnalyticsSummary({
            clicksTotal: 0, conversionsTotal: 0, commissionTotal: 0, pendingAmount: 0, approvedAmount: 0
          });
          setAnalyticsDaily([]);
          return;
        }

        const summary = d?.data?.summary || {};
        const daily = Array.isArray(d?.data?.daily) ? d.data.daily : [];

        setAnalyticsSummary({
          clicksTotal: safeNumber(summary.clicksTotal, 0),
          conversionsTotal: safeNumber(summary.conversionsTotal, 0),
          commissionTotal: safeNumber(summary.commissionTotal, 0),
          pendingAmount: safeNumber(summary.pendingAmount, 0),
          approvedAmount: safeNumber(summary.approvedAmount, 0),
        });

        setAnalyticsDaily(daily);
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading analytics');
        setAnalyticsSummary({
          clicksTotal: 0, conversionsTotal: 0, commissionTotal: 0, pendingAmount: 0, approvedAmount: 0
        });
        setAnalyticsDaily([]);
      } finally {
        setAnalyticsLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [base, range, refreshTick]);

  // load today (1d)
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) return;
        const token = getToken();

        const r = await fetch(`${base}/api/user/analytics?range=1d`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await safeJson(r);
        if (!r.ok) return;

        const daily = Array.isArray(d?.data?.daily) ? d.data.daily : [];
        const todayAgg = daily.reduce(
          (acc, cur) => ({
            clicks: acc.clicks + safeNumber(cur.clicks, 0),
            conversions: acc.conversions + safeNumber(cur.conversions, 0),
            commission: acc.commission + safeNumber(cur.commission, 0),
          }),
          { clicks: 0, conversions: 0, commission: 0 }
        );

        setTodayClicks(todayAgg.clicks);
        setTodayConversions(todayAgg.conversions);
        setTodayCommission(todayAgg.commission);
      } catch {
        // silent
      }
    }
    load();
    return () => controller.abort();
  }, [base, refreshTick]);

  // totals
  const totals = useMemo(() => {
    const availableBalance = safeNumber(wallet?.availableBalance, 0);
    const confirmedCashback = safeNumber(wallet?.confirmedCashback, 0);
    const pendingCashback = safeNumber(wallet?.pendingCashback, 0);
    const referralEarnings = safeNumber(wallet?.referralEarnings, 0);
    const totalWithdrawn = safeNumber(wallet?.totalWithdrawn, 0);

    const totalEarnings = confirmedCashback + pendingCashback + referralEarnings + totalWithdrawn;

    const clicksTotal = safeNumber(analyticsSummary.clicksTotal, 0);
    const conversionsTotal = safeNumber(analyticsSummary.conversionsTotal, 0);
    const commissionTotal = safeNumber(analyticsSummary.commissionTotal, 0);

    const conversionRate = clicksTotal > 0 ? (conversionsTotal / clicksTotal) * 100 : 0;

    return {
      availableBalance,
      confirmedCashback,
      pendingCashback,
      referralEarnings,
      totalWithdrawn,
      totalEarnings,

      clicksTotal,
      conversionsTotal,
      commissionTotal,
      conversionRate,
    };
  }, [wallet, analyticsSummary]);

  const keysByRange = useMemo(() => {
    const n = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    return lastNDaysSeries(n);
  }, [range]);

  const chartSeries = useMemo(() => {
    const keys = keysByRange;
    const map = new Map();

    const raw = Array.isArray(analyticsDaily) ? analyticsDaily : [];
    for (const row of raw) {
      const ymd = parseAnyDateToYMD(row?.date || row?.day || row?.createdAt);
      if (!ymd) continue;

      const prev = map.get(ymd) || { clicks: 0, conversions: 0, commission: 0 };
      map.set(ymd, {
        clicks: prev.clicks + safeNumber(row?.clicks, 0),
        conversions: prev.conversions + safeNumber(row?.conversions, 0),
        commission: prev.commission + safeNumber(row?.commission, 0),
      });
    }

    return keys.map((ymd) => {
      const v = map.get(ymd) || { clicks: 0, conversions: 0, commission: 0 };
      return { date: ymd, label: ymd.slice(5), ...v };
    });
  }, [analyticsDaily, keysByRange]);

  const recentLinks = useMemo(() => {
    const arr = Array.isArray(links) ? [...links] : [];
    arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return arr.slice(0, 5);
  }, [links]);

  const pieData = useMemo(() => {
    const data = [
      { name: 'Confirmed', value: totals.confirmedCashback },
      { name: 'Pending', value: totals.pendingCashback },
      { name: 'Withdrawn', value: totals.totalWithdrawn },
      { name: 'Referral', value: totals.referralEarnings },
    ].filter((x) => safeNumber(x.value, 0) > 0);

    if (data.length === 0) return [{ name: 'No data', value: 1 }];
    return data;
  }, [totals]);

  const exportCsv = () => {
    const lines = [];
    lines.push(['TYPE', 'DATE', 'CLICKS', 'CONVERSIONS', 'COMMISSION'].map(csvEscape).join(','));
    for (const d of chartSeries) {
      lines.push(['DAILY', d.date, d.clicks, d.conversions, d.commission].map(csvEscape).join(','));
    }
    lines.push('');
    lines.push(['TYPE', 'LINK_ID', 'URL', 'CLICKS', 'CONVERSIONS', 'EARNINGS', 'CREATED_AT'].map(csvEscape).join(','));
    for (const l of recentLinks) {
      lines.push([
        'LINK',
        l.subid || l._id || '',
        l.shareUrl || l.shortUrl || '',
        safeNumber(l.clicks, 0),
        safeNumber(l.approvedConversions || l.conversions, 0),
        safeNumber(l.approvedCommissionSum || l.commission, 0),
        l.createdAt || '',
      ].map(csvEscape).join(','));
    }

    downloadTextFile(`earnko-dashboard-${toYMD(new Date())}-${range}.csv`, lines.join('\n'));
    toast.success('CSV exported');
  };

  const goGenerate = () => router.push('/dashboard/affiliate');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Compact Professional Header */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">
                    {loadingMe ? 'Loading…' : `Welcome${me?.name ? `, ${me.name}` : ''}`}
                  </h1>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {humanizeRange(range)} • Keep earning with smart analytics
                  </p>
                </div>
              </div>

              {/* Range tabs */}
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl p-1 backdrop-blur-sm">
                  {['7d', '30d', '90d'].map((k) => (
                    <button
                      key={k}
                      onClick={() => setRange(k)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        range === k ? 'bg-white text-blue-700 shadow-sm' : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      {k.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 ml-2 mt-2 md:mt-0 text-xs text-white/90 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                  <Filter className="w-4 h-4" />
                  Total includes pending
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goGenerate}
                className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Generate
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={refreshAll}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={exportCsv}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs - cleaner */}
      <section className="container mx-auto px-4 -mt-5">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 md:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Kpi title="Total" value={formatINR(totals.totalEarnings)} icon={<DollarSign className="w-4 h-4" />} tone="blue" loading={loadingWallet} />
            <Kpi title="Available" value={formatINR(totals.availableBalance)} icon={<Wallet className="w-4 h-4" />} tone="dark" loading={loadingWallet} />
            <Kpi title="Confirmed" value={formatINR(totals.confirmedCashback)} icon={<CheckCircle className="w-4 h-4" />} tone="green" loading={loadingWallet} />
            <Kpi title="Pending" value={formatINR(totals.pendingCashback)} icon={<Clock className="w-4 h-4" />} tone="amber" loading={loadingWallet} />
            <Kpi title="Clicks" value={formatCompact(totals.clicksTotal)} icon={<Eye className="w-4 h-4" />} tone="indigo" loading={analyticsLoading} />
            <Kpi title="Conv." value={formatCompact(totals.conversionsTotal)} icon={<Target className="w-4 h-4" />} tone="cyan" loading={analyticsLoading} />
          </div>
        </div>
      </section>

      {/* Charts - mobile safe */}
      <section className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Commission line */}
          <Card title="Commission Trend" subtitle="Daily commission (range)" right={
            <Link href="/dashboard/analytics" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              Open analytics <ChevronRight className="w-4 h-4" />
            </Link>
          }>
            {analyticsLoading ? (
              <Skeleton height={260} />
            ) : (
              <div className="h-[260px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartSeries} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="commissionGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={BRAND.blue} />
                        <stop offset="100%" stopColor={BRAND.cyan} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94A3B8" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" width={40} />
                    <Tooltip content={<NiceTooltip currency />} />
                    <Line type="monotone" dataKey="commission" name="Commission" stroke="url(#commissionGrad)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <MiniPill label="Today" value={formatINR(todayCommission)} />
              <MiniPill label="Clicks" value={formatCompact(todayClicks)} />
              <MiniPill label="Conv" value={formatCompact(todayConversions)} />
            </div>
          </Card>

          {/* Clicks & conversions bar */}
          <Card title="Traffic" subtitle="Clicks vs conversions">
            {analyticsLoading ? (
              <Skeleton height={260} />
            ) : (
              <div className="h-[260px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartSeries} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94A3B8" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" width={40} />
                    <Tooltip content={<NiceTooltip />} />
                    {/* Legend hidden on mobile to prevent cut */}
                    <Legend wrapperStyle={{ fontSize: 12 }} className="hidden md:block" />
                    <Bar dataKey="clicks" name="Clicks" fill={BRAND.blue} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="conversions" name="Conversions" fill={BRAND.cyan} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 font-semibold">
                Conversion rate
              </div>
              <div className="text-sm font-extrabold text-gray-900">
                {totals.conversionRate.toFixed(2)}%
              </div>
            </div>
          </Card>

          {/* Pie */}
          <Card title="Wallet Distribution" subtitle="Confirmed / Pending / Withdrawn / Referral">
            {loadingWallet ? (
              <Skeleton height={260} />
            ) : (
              <div className="h-[260px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<NiceTooltip currency />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SmallStat label="Confirmed" value={formatINR(totals.confirmedCashback)} />
              <SmallStat label="Pending" value={formatINR(totals.pendingCashback)} />
              <SmallStat label="Withdrawn" value={formatINR(totals.totalWithdrawn)} />
              <SmallStat label="Referral" value={formatINR(totals.referralEarnings)} />
            </div>
          </Card>

          {/* Recent links + Offers */}
          <div className="space-y-6">
            <Card
              title="Recent Links"
              subtitle="Last generated links"
              right={
                <Link href="/dashboard/affiliate" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  Manage <ChevronRight className="w-4 h-4" />
                </Link>
              }
            >
              {loadingLinks ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : recentLinks.length === 0 ? (
                <Empty
                  icon={<LinkIcon className="w-7 h-7 text-gray-400" />}
                  title="No links yet"
                  subtitle="Generate a link to start tracking clicks and earnings."
                  actionText="Generate"
                  onAction={() => router.push('/dashboard/affiliate')}
                />
              ) : (
                <div className="space-y-2">
                  {recentLinks.map((l, idx) => {
                    const url = l.shareUrl || l.shortUrl || '';
                    const clicks = safeNumber(l.clicks, 0);
                    const conv = safeNumber(l.approvedConversions || l.conversions, 0);
                    const earn = safeNumber(l.approvedCommissionSum || l.commission, 0);
                    return (
                      <div key={l.subid || l._id || idx} className="rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[11px] text-gray-500">
                              {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''}
                            </div>
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {(l.subid || 'link').slice(0, 18)}
                            </div>
                            <div className="text-xs text-gray-600 break-all line-clamp-2">{url || '-'}</div>
                          </div>

                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100">
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </a>
                          ) : null}
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <Tiny label="Clicks" value={clicks.toLocaleString('en-IN')} />
                          <Tiny label="Conv" value={conv.toLocaleString('en-IN')} tone="green" />
                          <Tiny label="Earn" value={formatINR(earn)} tone="purple" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card
              title="Featured Offers"
              subtitle="High commission offers"
              right={
                <Link href="/offers" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              }
            >
              {loadingOffers ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : offers.length === 0 ? (
                <Empty
                  icon={<Gift className="w-7 h-7 text-gray-400" />}
                  title="No offers"
                  subtitle="Offers will appear here when available."
                />
              ) : (
                <div className="space-y-2">
                  {offers.slice(0, 6).map((o, idx) => (
                    <div key={o._id || idx} className="rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {o.title || o.categoryKey || 'Offer'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{o.store?.name || 'Store'}</div>
                        </div>
                        <Link
                          href="/dashboard/affiliate"
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg"
                        >
                          Create
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      <StyleTag />
    </main>
  );
}

/**
 * UI components
 */
function Card({ title, subtitle, right, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-lg font-extrabold text-gray-900 truncate">{title}</div>
          <div className="text-xs text-gray-600 mt-0.5">{subtitle}</div>
        </div>
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Skeleton({ height = 220 }) {
  return <div className="w-full rounded-2xl bg-gray-100 animate-pulse" style={{ height }} />;
}

function Kpi({ title, value, icon, tone, loading }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    dark: 'bg-gray-900 text-white border-gray-900',
  };

  const chip = tones[tone] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${chip}`}>
          {icon}
        </div>
        <div className="text-[11px] text-gray-500 font-semibold">{title}</div>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-6 w-20 rounded bg-gray-100 animate-pulse" />
        ) : (
          <div className="text-lg font-extrabold text-gray-900">{value}</div>
        )}
      </div>
    </div>
  );
}

function MiniPill({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-sm font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-extrabold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function Tiny({ label, value, tone }) {
  const tones = {
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  const cls = tones[tone] || 'bg-gray-50 border-gray-200 text-gray-700';
  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center ${cls}`}>
      <div className="text-[10px] opacity-80">{label}</div>
      <div className="text-xs font-extrabold">{value}</div>
    </div>
  );
}

function Empty({ icon, title, subtitle, actionText, onAction }) {
  return (
    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-3 text-sm font-extrabold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{subtitle}</div>
      {actionText ? (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
}

const styles = `
  .line-clamp-2{
    overflow:hidden;
    display:-webkit-box;
    -webkit-box-orient:vertical;
    -webkit-line-clamp:2;
  }
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}