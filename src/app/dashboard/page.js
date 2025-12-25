'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, Link as LinkIcon, Wallet, Zap, BarChart3, 
  Users, ExternalLink, ArrowRight, ChevronRight, Filter,
  Clock, DollarSign, Target, Eye, CheckCircle, 
  Sparkles, Bell, Settings, Calendar, TrendingUp as TrendingIcon,
  Gift, Store, CreditCard, RefreshCw, MoreVertical
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

  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Guard: if not logged in, redirect to login
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.replace('/login?next=/dashboard');
  }, [router]);

  // Load user
  useEffect(() => {
    const controller = new AbortController();
    async function loadUser() {
      try {
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

        setLoadingMe(true);
        const rMe = await fetch(`${base}/api/auth/me`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const dMe = await rMe.json();
        if (rMe.ok) setMe(dMe?.data?.user || dMe?.data || null);
      } catch {}
      finally { setLoadingMe(false); }
    }
    loadUser();
    return () => controller.abort();
  }, []);

  // Load wallet
  useEffect(() => {
    const controller = new AbortController();
    async function loadWallet() {
      try {
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        setLoadingWallet(true);
        const r = await fetch(`${base}/api/wallet/me`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await r.json();
        if (r.ok) setWallet(d?.data?.wallet || null);
      } catch {}
      finally { setLoadingWallet(false); }
    }
    loadWallet();
    return () => controller.abort();
  }, []);

  // Load links (for recent list)
  useEffect(() => {
    const controller = new AbortController();
    async function loadLinks() {
      try {
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        setLoadingLinks(true);
        const rLinks = await fetch(`${base}/api/user/links`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const dLinks = await rLinks.json();
        if (rLinks.ok) setLinks(normalizeList(dLinks?.data));
      } catch {
        setLinks([]);
      } finally { setLoadingLinks(false); }
    }
    loadLinks();
    return () => controller.abort();
  }, []);

  // Load aggregated analytics for daily chart and summary
  useEffect(() => {
    const controller = new AbortController();
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        setAnalyticsLoading(true);
        const r = await fetch(`${base}/api/user/analytics?range=30d`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d?.message || 'Failed to load analytics');
        const summary = d?.data?.summary || {};
        const daily = Array.isArray(d?.data?.daily) ? d.data.daily : [];
        setAnalyticsSummary({
          clicksTotal: summary.clicksTotal || 0,
          conversionsTotal: summary.conversionsTotal || 0,
          commissionTotal: summary.commissionTotal || 0,
          pendingAmount: summary.pendingAmount || 0,
          approvedAmount: summary.approvedAmount || 0,
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
    loadAnalytics();
    return () => controller.abort();
  }, []);

  // Offers preview
  useEffect(() => {
    const controller = new AbortController();
    async function loadOffers() {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        setLoadingOffers(true);
        const params = new URLSearchParams({ limit: '8' });
        const r = await fetch(`${base}/api/public/offers?${params.toString()}`, { signal: controller.signal });
        const d = await r.json();
        setOffers(normalizeList(d));
      } catch {
        setOffers([]);
      } finally { setLoadingOffers(false); }
    }
    loadOffers();
    return () => controller.abort();
  }, []);

  const totals = useMemo(() => {
    return {
      availableBalance: wallet?.availableBalance || 0,
      confirmedCashback: wallet?.confirmedCashback || 0,
      pendingCashback: wallet?.pendingCashback || 0,
      referralEarnings: wallet?.referralEarnings || 0,
      clicksTotal: analyticsSummary.clicksTotal || 0,
      conversionsTotal: analyticsSummary.conversionsTotal || 0,
      earningsApproved: analyticsSummary.approvedAmount || 0
    };
  }, [wallet, analyticsSummary]);

  const recentLinks = useMemo(() => {
    const arr = Array.isArray(links) ? [...links] : [];
    arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return arr.slice(0, 5);
  }, [links]);

  const goGenerate = () => router.push('/dashboard/affiliate');

  // Prepare bar chart from analyticsDaily
  const bars = useMemo(() => {
    const series = Array.isArray(analyticsDaily) && analyticsDaily.length > 0
      ? analyticsDaily
      : [];
    // Compute max clicks to scale bars
    const maxClicks = series.reduce((m, d) => Math.max(m, Number(d.clicks || 0)), 0) || 1;
    return series.map(d => {
      const clicks = Number(d.clicks || 0);
      const height = Math.max(6, Math.round((clicks / maxClicks) * 90)); // 6..90px
      return { date: d.date, clicks, height, conversions: Number(d.conversions || 0) };
    });
  }, [analyticsDaily]);

  // Quick actions
  const quickActions = [
    { icon: <Zap className="w-5 h-5" />, label: 'Generate Link', href: '/dashboard/affiliate', color: 'from-blue-500 to-cyan-500' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Withdraw', href: '/dashboard/withdraw', color: 'from-green-500 to-emerald-500' },
    { icon: <Users className="w-5 h-5" />, label: 'Referrals', href: '/dashboard/referrals', color: 'from-purple-500 to-pink-500' },
    { icon: <Gift className="w-5 h-5" />, label: 'Top Offers', href: '/offers', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 hover:border-white/30 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <div className="font-semibold text-white">{action.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Available Balance" 
            value={totals.availableBalance}
            icon={<Wallet className="w-5 h-5" />}
            color="from-blue-500 to-blue-600"
            change="+12.5%"
          />
          <StatCard 
            title="Confirmed Cashback" 
            value={totals.confirmedCashback}
            icon={<CheckCircle className="w-5 h-5" />}
            color="from-green-500 to-emerald-600"
            change="+8.2%"
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
            change="+15.3%"
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
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Filter className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <MiniStat 
                  label="Total Clicks" 
                  value={totals.clicksTotal} 
                  icon={<Eye className="w-4 h-4" />}
                  change="+8.2%"
                  color="blue"
                />
                <MiniStat 
                  label="Conversions" 
                  value={totals.conversionsTotal} 
                  icon={<Target className="w-4 h-4" />}
                  change="+3.5%"
                  color="green"
                />
                <MiniStat 
                  label="Earnings" 
                  value={`₹${Number(totals.earningsApproved || 0).toLocaleString()}`}
                  icon={<DollarSign className="w-4 h-4" />}
                  change="+12.5%"
                  color="purple"
                />
              </div>

              {/* Daily Activity Chart */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Daily Click Activity</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
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

            {/* Recent Links Card */}
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
                    <div key={link.subid || index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {link.subid?.substring(0, 8)}...
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(link.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {link.shareUrl?.substring(0, 60)}...
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Clicks</div>
                          <div className="text-sm font-bold text-gray-900">{link.clicks || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Conversions</div>
                          <div className="text-sm font-bold text-green-600">{link.approvedConversions || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Earnings</div>
                          <div className="text-sm font-bold text-purple-600">₹{Number(link.approvedCommissionSum || 0).toFixed(0)}</div>
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
                <TrendingIcon className="w-5 h-5 text-blue-600" />
                Performance Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Today's Clicks</span>
                  <span className="font-bold text-gray-900">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Today's Earnings</span>
                  <span className="font-bold text-gray-900">₹1,250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-bold text-green-600">4.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Campaigns</span>
                  <span className="font-bold text-gray-900">8</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-200">
                <Link 
                  href="/dashboard/analytics"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1 group"
                >
                  View Detailed Analytics
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { time: '2 min ago', action: 'Link generated for iPhone 15', amount: '₹850', type: 'success' },
                  { time: '15 min ago', action: 'Commission earned from Amazon', amount: '₹320', type: 'success' },
                  { time: '1 hour ago', action: 'New follower clicked your link', amount: '', type: 'info' },
                  { time: '3 hours ago', action: 'Payout processed to bank', amount: '₹2,500', type: 'success' },
                  { time: 'Yesterday', action: 'Store added: Myntra', amount: '', type: 'info' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'success' ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        <Bell className="w-4 h-4" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                    {activity.amount && (
                      <div className="text-sm font-bold text-green-600">{activity.amount}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Stores */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-gray-600" />
                Top Performing Stores
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Amazon', earnings: '₹8,450', growth: '+12%', icon: '🛒' },
                  { name: 'Flipkart', earnings: '₹5,230', growth: '+8%', icon: '📦' },
                  { name: 'Myntra', earnings: '₹3,890', growth: '+15%', icon: '👕' },
                  { name: 'Ajio', earnings: '₹2,150', growth: '+5%', icon: '👗' },
                ].map((store, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-lg">
                        {store.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <TrendingIcon className="w-3 h-3" />
                          {store.growth}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{store.earnings}</div>
                      <div className="text-xs text-gray-500">Earnings</div>
                    </div>
                  </div>
                ))}
              </div>
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
                      <div>
                        <div className="text-xs text-gray-500">{offer.store?.name || 'Store'}</div>
                        <div className="font-bold text-gray-900 line-clamp-1">{offer.title || offer.name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {offer.description || 'Special offer with high conversion rate'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    {typeof offer.rate === 'number' ? (
                      <div className="text-lg font-bold text-green-600">{Number(offer.rate).toFixed(0)}%</div>
                    ) : (
                      <div className="text-sm text-gray-500">Variable</div>
                    )}
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
    </main>
  );
}

function StatCard({ title, value, icon, color, change }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        {change && (
          <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">₹{Number(value || 0).toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}

function MiniStat({ label, value, icon, change, color }) {
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
        {change && (
          <div className="text-xs font-bold text-green-600">{change}</div>
        )}
      </div>
      <div className="text-lg font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
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