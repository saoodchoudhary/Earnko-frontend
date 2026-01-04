'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  TrendingUp, Link as LinkIcon, Wallet, Zap, BarChart3,
  Users, ArrowRight, ChevronRight,
  Clock, DollarSign, Target, Eye, CheckCircle,
  Calendar, Gift, Store as StoreIcon, CreditCard, RefreshCw, MoreVertical
} from 'lucide-react';

function normalizeList(obj) {
  const candidate =
    (obj?.data?.items && Array.isArray(obj.data.items) && obj.data.items) ||
    (obj?.data && Array.isArray(obj.data) && obj.data) ||
    (obj?.items && Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj) ? obj : []);
  return Array.isArray(candidate) ? candidate : [];
}

export default function DashboardPage() {
  const router = useRouter();

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
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);

  const [todayClicks, setTodayClicks] = useState(0);
  const [todayConversions, setTodayConversions] = useState(0);
  const [todayCommission, setTodayCommission] = useState(0);

  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

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

  // Guard: if not logged in, redirect to login
  useEffect(() => {
    const token = getToken();
    if (!token) router.replace('/login?next=/dashboard');
  }, [router]);

  // Load user
  useEffect(() => {
    const controller = new AbortController();
    async function loadUser() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        const token = getToken();
        setLoadingMe(true);
        const rMe = await fetch(`${base}/api/auth/me`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const dMe = await safeJson(rMe);
        if (!rMe.ok) {
          const msg = dMe?.message || `Failed to load profile (HTTP ${rMe.status})`;
          toast.error(msg);
          return;
        }
        setMe(dMe?.data?.user || dMe?.data || null);
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading profile');
      } finally { setLoadingMe(false); }
    }
    loadUser();
    return () => controller.abort();
  }, [base]);

  // Load wallet
  useEffect(() => {
    const controller = new AbortController();
    async function loadWallet() {
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
          const msg = d?.message || `Failed to load wallet (HTTP ${r.status})`;
          toast.error(msg);
          return;
        }
        setWallet(d?.data?.wallet || null);
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading wallet');
      } finally { setLoadingWallet(false); }
    }
    loadWallet();
    return () => controller.abort();
  }, [base]);

  // Load links (for recent list)
  useEffect(() => {
    const controller = new AbortController();
    async function loadLinks() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        const token = getToken();
        setLoadingLinks(true);
        const rLinks = await fetch(`${base}/api/user/links`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const dLinks = await safeJson(rLinks);
        if (!rLinks.ok) {
          const msg = dLinks?.message || `Failed to load links (HTTP ${rLinks.status})`;
          toast.error(msg);
          setLinks([]);
          return;
        }
        setLinks(normalizeList(dLinks?.data));
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading links');
        setLinks([]);
      } finally { setLoadingLinks(false); }
    }
    loadLinks();
    return () => controller.abort();
  }, [base]);

  // Load aggregated analytics for daily chart and summary
  useEffect(() => {
    const controller = new AbortController();
    async function loadAnalytics30d() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        const token = getToken();
        setAnalyticsLoading(true);
        const r = await fetch(`${base}/api/user/analytics?range=30d`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await safeJson(r);
        if (!r.ok) {
          const msg = d?.message || `Failed to load analytics (HTTP ${r.status})`;
          toast.error(msg);
          throw new Error(msg);
        }
        const summary = d?.data?.summary || {};
        const daily = Array.isArray(d?.data?.daily) ? d.data.daily : [];
        setAnalyticsSummary({
          clicksTotal: Number(summary.clicksTotal || 0),
          conversionsTotal: Number(summary.conversionsTotal || 0),
          commissionTotal: Number(summary.commissionTotal || 0),
          pendingAmount: Number(summary.pendingAmount || 0),
          approvedAmount: Number(summary.approvedAmount || 0),
        });
        setAnalyticsDaily(daily);
      } catch (err) {
        setAnalyticsSummary({
          clicksTotal: 0, conversionsTotal: 0, commissionTotal: 0, pendingAmount: 0, approvedAmount: 0
        });
        setAnalyticsDaily([]);
      } finally {
        setAnalyticsLoading(false);
      }
    }
    loadAnalytics30d();
    return () => controller.abort();
  }, [base, analyticsRefresh]);

  // Load today's analytics (real clicks, conversions, commission)
  useEffect(() => {
    const controller = new AbortController();
    async function loadAnalytics1d() {
      try {
        if (!base) return;
        const token = getToken();
        const r = await fetch(`${base}/api/user/analytics?range=1d`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await safeJson(r);
        if (!r.ok) return; // don't toast here, 30d call already toasted if backend down
        const daily = Array.isArray(d?.data?.daily) ? d.data.daily : [];
        const todayAgg = daily.reduce(
          (acc, cur) => ({
            clicks: acc.clicks + Number(cur.clicks || 0),
            conversions: acc.conversions + Number(cur.conversions || 0),
            commission: acc.commission + Number(cur.commission || 0),
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
    loadAnalytics1d();
    return () => controller.abort();
  }, [base, analyticsRefresh]);

  // Offers preview (FIXED: read from data.offers per backend)
  useEffect(() => {
    const controller = new AbortController();
    async function loadOffers() {
      try {
        if (!base) { toast.error('Backend URL not configured'); return; }
        setLoadingOffers(true);
        const params = new URLSearchParams({ limit: '12' });
        const r = await fetch(`${base}/api/public/offers?${params.toString()}`, { signal: controller.signal });
        const d = await safeJson(r);
        if (!r.ok) {
          const msg = d?.message || `Failed to load offers (HTTP ${r.status})`;
          toast.error(msg);
          setOffers([]);
          return;
        }
        const list = Array.isArray(d?.data?.offers)
          ? d.data.offers
          : Array.isArray(d?.data?.items)
          ? d.data.items
          : [];
        // Sort by rate desc then updatedAt desc for nicer display
        const sorted = [...list].sort((a, b) => {
          const rd = (b.rate || 0) - (a.rate || 0);
          if (rd !== 0) return rd;
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });
        setOffers(sorted);
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error('Error loading offers');
        setOffers([]);
      } finally { setLoadingOffers(false); }
    }
    loadOffers();
    return () => controller.abort();
  }, [base]);

  const totals = useMemo(() => {
    return {
      availableBalance: Number(wallet?.availableBalance || 0),
      confirmedCashback: Number(wallet?.confirmedCashback || 0),
      pendingCashback: Number(wallet?.pendingCashback || 0),
      referralEarnings: Number(wallet?.referralEarnings || 0),
      clicksTotal: Number(analyticsSummary.clicksTotal || 0),
      conversionsTotal: Number(analyticsSummary.conversionsTotal || 0),
      earningsApproved: Number(analyticsSummary.approvedAmount || 0),
      commissionTotal: Number(analyticsSummary.commissionTotal || 0),
      totalWithdrawn: Number(wallet?.totalWithdrawn || 0),
    };
  }, [wallet, analyticsSummary]);

  // Earnings breakdown metrics (requested)
  const earningsBreakdown = useMemo(() => {
    const totalEarnings = totals.confirmedCashback + totals.pendingCashback + totals.totalWithdrawn;
    return {
      totalEarnings,
      redeemedEarnings: totals.totalWithdrawn,
      pendingAmount: totals.pendingCashback,
      availableForWithdraw: totals.availableBalance,
    };
  }, [totals]);

  const recentLinks = useMemo(() => {
    const arr = Array.isArray(links) ? [...links] : [];
    arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return arr.slice(0, 5);
  }, [links]);

  const goGenerate = () => router.push('/dashboard/affiliate');

  // Prepare bar chart from analyticsDaily
  const bars = useMemo(() => {
    const series = Array.isArray(analyticsDaily) ? analyticsDaily : [];
    const maxClicks = series.reduce((m, d) => Math.max(m, Number(d.clicks || 0)), 0) || 1;
    return series.map(d => {
      const clicks = Number(d.clicks || 0);
      const height = Math.max(6, Math.round((clicks / maxClicks) * 90)); // 6..90%
      return { date: d.date, clicks, height, conversions: Number(d.conversions || 0) };
    });
  }, [analyticsDaily]);

  const refreshAnalytics = () => setAnalyticsRefresh(v => v + 1);

  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString()}`;
  const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {loadingMe ? 'Loading...' : `Welcome back${me?.name ? `, ${me.name}` : ''}`}
                  </h1>
                  <p className="text-blue-100 mt-1">Track your earnings and optimize your strategy</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={goGenerate}
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
              >
                <Zap className="w-5 h-5" />
                Generate Link
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <CreditCard className="w-5 h-5" />, label: 'Withdraw', href: '/dashboard/withdraw', color: 'from-green-500 to-emerald-500' },
              { icon: <Users className="w-5 h-5" />, label: 'Referrals', href: '/dashboard/referrals', color: 'from-purple-500 to-pink-500' },
              { icon: <Gift className="w-5 h-5" />, label: 'Top Offers', href: '/offers', color: 'from-amber-500 to-orange-500' },
              { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/analytics', color: 'from-blue-500 to-cyan-500' },
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 hover:border-white/30 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-white`}>
                  {action.icon}
                </div>
                <div className="font-semibold text-white">{action.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Summary Row (requested) */}
      <section className="container mx-auto px-4 -mt-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BreakdownTile label="Total Earnings" value={fmtINR(earningsBreakdown.totalEarnings)} color="text-blue-700" />
            <BreakdownTile label="Redeemed Earnings" value={fmtINR(earningsBreakdown.redeemedEarnings)} color="text-green-700" />
            <BreakdownTile label="Pending Amount" value={fmtINR(earningsBreakdown.pendingAmount)} color="text-amber-700" />
            <BreakdownTile label="Available For Withdraw" value={fmtINR(earningsBreakdown.availableForWithdraw)} color="text-purple-700" />
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Available Balance"
            value={totals.availableBalance}
            icon={<Wallet className="w-5 h-5" />}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Confirmed Cashback"
            value={totals.confirmedCashback}
            icon={<CheckCircle className="w-5 h-5" />}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Pending Cashback"
            value={totals.pendingCashback}
            icon={<Clock className="w-5 h-5" />}
            color="from-amber-500 to-orange-600"
          />
          <StatCard
            title="Referral Earnings"
            value={totals.referralEarnings}
            icon={<Users className="w-5 h-5" />}
            color="from-purple-500 to-pink-600"
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Performance Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Overview Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Performance Overview
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Last 30 days performance metrics</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Last 30 days
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={refreshAnalytics} title="Refresh analytics">
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Real-time Today Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <MiniStat
                  label="Today's Clicks"
                  value={todayClicks}
                  icon={<Eye className="w-4 h-4" />}
                  color="blue"
                />
                <MiniStat
                  label="Today's Conversions"
                  value={todayConversions}
                  icon={<Target className="w-4 h-4" />}
                  color="green"
                />
                <MiniStat
                  label="Today's Earnings"
                  value={fmtINR(todayCommission)}
                  icon={<DollarSign className="w-4 h-4" />}
                  color="purple"
                />
                <MiniStat
                  label="Conversion Rate"
                  value={fmtPct(todayClicks ? (todayConversions / todayClicks) * 100 : 0)}
                  icon={<Target className="w-4 h-4" />}
                  color="amber"
                />
              </div>

              {/* 30-day Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <MiniStat
                  label="Total Clicks (30d)"
                  value={totals.clicksTotal}
                  icon={<Eye className="w-4 h-4" />}
                  color="blue"
                />
                <MiniStat
                  label="Conversions (30d)"
                  value={totals.conversionsTotal}
                  icon={<Target className="w-4 h-4" />}
                  color="green"
                />
                <MiniStat
                  label="Commission (30d)"
                  value={fmtINR(totals.commissionTotal)}
                  icon={<DollarSign className="w-4 h-4" />}
                  color="purple"
                />
              </div>

              {/* Daily Activity Chart */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Daily Click Activity</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1" onClick={refreshAnalytics}>
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>

                {analyticsLoading ? (
                  <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                ) : bars.length === 0 ? (
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No activity data available</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="h-40 flex items-end justify-between gap-1 px-2">
                      {bars.map((b, i) => (
                        <div key={i} className="flex flex-col items-center" style={{ width: 'calc(100% / 30)' }}>
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-300 hover:opacity-90"
                            style={{ height: `${b.height}%` }}
                            title={`${b.clicks} clicks on ${b.date}`}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {i % 5 === 0 ? b.date.split('-')[2] : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-sm"></div>
                      Click activity over 30 days
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Links Card (mobile-optimized) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    Recent Affiliate Links
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Your recently generated links</p>
                </div>
                <Link
                  href="/dashboard/affiliate"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  Manage all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {loadingLinks ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                  ))
                ) : recentLinks.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-3">No links generated yet</p>
                    <button
                      onClick={goGenerate}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      Generate First Link
                    </button>
                  </div>
                ) : (
                  recentLinks.map((link, index) => (
                    <div
                      key={link.subid || index}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div className="text-[11px] font-mono bg-gray-100 px-2 py-1 rounded max-w-[150px] sm:max-w-none truncate">
                              {link.subid || '-'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : ''}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 break-all line-clamp-2 sm:line-clamp-1">
                            {link.shareUrl || link.shortUrl || '-'}
                          </div>
                        </div>

                        <div className="sm:self-start self-end">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-[11px] text-gray-500">Clicks</div>
                          <div className="text-sm font-bold text-gray-900">{Number(link.clicks || 0)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[11px] text-gray-500">Conversions</div>
                          <div className="text-sm font-bold text-green-600">
                            {Number(link.approvedConversions || link.conversions || 0)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[11px] text-gray-500">Earnings</div>
                          <div className="text-sm font-bold text-purple-600">
                            ₹{Number(link.approvedCommissionSum || link.commission || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Performance Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Performance Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Today's Clicks</span>
                  <span className="font-bold text-gray-900">{Number(todayClicks).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Today's Conversions</span>
                  <span className="font-bold text-gray-900">{Number(todayConversions).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Today's Earnings</span>
                  <span className="font-bold text-gray-900">{fmtINR(todayCommission)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-bold text-green-600">
                    {fmtPct(todayClicks ? (todayConversions / todayClicks) * 100 : 0)}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-200">
                <Link
                  href="/dashboard/analytics"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1 group"
                >
                  View Detailed Analytics
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Featured Offers preview (from backend, FIXED) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-gray-600" />
                Featured Offers
              </h3>
              {loadingOffers ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : !Array.isArray(offers) || offers.length === 0 ? (
                <div className="text-center py-6">
                  <Gift className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-gray-600">No offers available</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.slice(0, 4).map((offer, idx) => (
                    <div key={offer._id || idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {offer.title || offer.categoryKey || 'Offer'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {offer.store?.name || 'Store'}
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold">
                        {typeof offer.commissionRate === 'number' ? `${Math.round(offer.commissionRate)}%` : 'Var'}
                      </div>
                      <Link
                        href="/dashboard/affiliate"
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-md transition-all"
                      >
                        Create Link
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Deals Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                Featured Deals & Offers
              </h2>
              <p className="text-gray-600 text-sm mt-1">High commission offers for you</p>
            </div>
            <Link
              href="/offers"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View all offers
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingOffers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : !Array.isArray(offers) || offers.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
              <Gift className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No offers available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {offers.slice(0, 4).map((offer, idx) => (
                <div key={offer._id || idx} className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 truncate">{offer.store?.name || 'Store'}</div>
                        <div className="font-bold text-gray-900 line-clamp-1">{offer.title || offer.categoryKey}</div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold">
                      {typeof offer.commissionRate === 'number' ? `${Math.round(offer.commissionRate)}%` : 'Var'}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {offer.description || 'High converting affiliate offer'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">Commission</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push('/dashboard/affiliate')}
                      className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                    >
                      <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Generate Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Earnings Breakdown Section (separate section as requested)
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <BreakdownTile label="Total Earnings" value={fmtINR(earningsBreakdown.totalEarnings)} color="text-blue-700" />
            <BreakdownTile label="Redeemed Earnings" value={fmtINR(earningsBreakdown.redeemedEarnings)} color="text-green-700" />
            <BreakdownTile label="Pending Amount" value={fmtINR(earningsBreakdown.pendingAmount)} color="text-amber-700" />
            <BreakdownTile label="Available For Withdraw" value={fmtINR(earningsBreakdown.availableForWithdraw)} color="text-purple-700" />
          </div>
        </div>
      </section> */}

      <StyleTag />
    </main>
  );
}

function BreakdownTile({ label, value, color }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-white transition-colors">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">₹{Number(value || 0).toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}

function MiniStat({ label, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-white transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-lg font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// Add this CSS for line clamping
const styles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Add the style tag
const StyleTag = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);