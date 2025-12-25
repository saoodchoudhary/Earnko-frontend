'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import QuickLinkGenerator from '../../../components/QuickLinkGenerator';
import {
  Link as LinkIcon, Zap, BarChart3, Copy, ExternalLink,
  RefreshCw, Search, Filter, TrendingUp, Eye,
  Target, DollarSign, Clock, Calendar, ChevronRight,
  Download, MoreVertical, Globe, Shield, Users,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

export default function AffiliateToolsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    conversionRate: 0
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [generatingLink, setGeneratingLink] = useState(false);

  const loadData = async (signal, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const token = localStorage.getItem('token');
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      
      // Load links
      const res = await fetch(`${base}/api/user/links`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.message || 'Failed to load links');
      const linksData = js?.data?.items || [];
      setItems(linksData);

      // Load additional stats if needed
      if (linksData.length > 0) {
        const totalClicks = linksData.reduce((acc, it) => acc + Number(it.clicks || 0), 0);
        const totalConversions = linksData.reduce((acc, it) => acc + Number(it.approvedConversions || 0), 0);
        const totalEarnings = linksData.reduce((acc, it) => acc + Number(it.approvedCommissionSum || 0), 0);
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(1) : 0;
        
        setStats({
          totalClicks,
          totalConversions,
          totalEarnings,
          conversionRate
        });
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'Error loading links');
      }
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
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
    
    // Apply search filter
    let filtered = src;
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      filtered = filtered.filter((it) => {
        return (
          String(it.subid || '').toLowerCase().includes(qq) ||
          String(it.shareUrl || '').toLowerCase().includes(qq) ||
          String(it.cuelinksUrl || '').toLowerCase().includes(qq)
        );
      });
    }

    // Apply type filter
    if (selectedFilter === 'with-clicks') {
      filtered = filtered.filter(it => Number(it.clicks || 0) > 0);
    } else if (selectedFilter === 'with-conversions') {
      filtered = filtered.filter(it => Number(it.approvedConversions || 0) > 0);
    } else if (selectedFilter === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(it => new Date(it.createdAt || 0) > sevenDaysAgo);
    }

    return filtered;
  }, [items, q, selectedFilter]);

  const copyToClipboard = async (text, msg = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg, {
        icon: '📋',
        duration: 2000
      });
    } catch {
      toast.error('Failed to copy');
    }
  };

  const refresh = () => {
    setRefreshing(true);
    const controller = new AbortController();
    loadData(controller.signal, false);
  };

  const exportData = () => {
    // Simple export to JSON
    const dataStr = JSON.stringify(view, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `earnko-links-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Data exported successfully!');
  };

  const handleGenerateLink = () => {
    setGeneratingLink(true);
    // This would be handled by QuickLinkGenerator
    setTimeout(() => {
      setGeneratingLink(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Affiliate Link Generator</h1>
                  <p className="text-blue-100 mt-1">Create, manage, and track your affiliate links</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Links" 
            value={totals.totalLinks}
            icon={<LinkIcon className="w-5 h-5" />}
            color="from-blue-500 to-blue-600"
            change="+12"
          />
          <StatCard 
            title="Total Clicks" 
            value={totals.totalClicks}
            icon={<Eye className="w-5 h-5" />}
            color="from-cyan-500 to-blue-500"
            change="+342"
          />
          <StatCard 
            title="Conversions" 
            value={totals.totalApproved}
            icon={<Target className="w-5 h-5" />}
            color="from-green-500 to-emerald-600"
            change="+15"
          />
          <StatCard 
            title="Total Earnings" 
            value={`₹${Number(totals.totalEarnings || 0).toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="from-purple-500 to-pink-600"
            change="+₹1,250"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Generator & Filters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Link Generator Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Generate New Link
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Paste any product/store URL to create trackable affiliate links</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={refresh}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <QuickLinkGenerator onGenerated={refresh} />
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>All links are secured with advanced tracking and analytics</span>
                </div>
              </div>
            </div>

            {/* Links List */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              {/* List Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-blue-600" />
                      My Links
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Manage and track all your affiliate links</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="search"
                        placeholder="Search links..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm w-full sm:w-56"
                      />
                    </div>
                    
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
                    >
                      <option value="all">All Links</option>
                      <option value="with-clicks">With Clicks</option>
                      <option value="with-conversions">With Conversions</option>
                      <option value="recent">Last 7 Days</option>
                    </select>
                  </div>
                </div>
                
                {/* Results Count */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{view.length}</span> of <span className="font-semibold">{items.length}</span> links
                  </div>
                  {view.length > 0 && (
                    <button
                      onClick={exportData}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  )}
                </div>
              </div>

              {/* Links Grid */}
              <div className="p-6">
                {loading ? (
                  <LinksSkeleton />
                ) : view.length === 0 ? (
                  <EmptyState q={q} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {view.map((it) => (
                      <LinkCard key={it.subid} it={it} copyToClipboard={copyToClipboard} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Analytics & Tips */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Performance Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-bold text-green-600">{stats.conversionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Click Value</span>
                  <span className="font-bold text-gray-900">
                    ₹{stats.totalClicks > 0 ? Math.round(stats.totalEarnings / stats.totalClicks) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Links</span>
                  <span className="font-bold text-gray-900">
                    {items.filter(it => Number(it.clicks || 0) > 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Top Performing</span>
                  <span className="font-bold text-purple-600">
                    {items.length > 0 ? Math.max(...items.map(it => Number(it.clicks || 0))) : 0}
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

            {/* Quick Tips */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Pro Tips
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Use Share URL for click tracking on Earnko</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Share Cuelinks URL directly for instant redirects</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Check analytics regularly to optimize your links</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Use descriptive SubIDs for better tracking</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <LinkIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {item.subid?.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{item.clicks || 0}</div>
                      <div className="text-xs text-gray-500">Clicks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, change }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        {change && (
          <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}

function LinkCard({ it, copyToClipboard }) {
  const created = it.createdAt ? new Date(it.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '-';
  
  const time = it.createdAt ? new Date(it.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '-';

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
              {it.subid?.substring(0, 10)}...
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              Number(it.clicks || 0) > 50 ? 'bg-green-100 text-green-600' :
              Number(it.clicks || 0) > 10 ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {Number(it.clicks || 0)} clicks
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Created on {created} at {time}
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* URLs Section */}
      <div className="space-y-4">
        {/* Share URL */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Share URL</span>
            </div>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              Tracked
            </span>
          </div>
          <div className="text-sm text-gray-600 break-all font-mono mb-3">
            {it.shareUrl?.substring(0, 40)}...
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => copyToClipboard(it.shareUrl, 'Share URL copied!')}
              className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <a 
              href={it.shareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>

        {/* Cuelinks URL */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Cuelinks URL</span>
            </div>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Direct
            </span>
          </div>
          <div className="text-sm text-gray-600 break-all font-mono mb-3">
            {it.cuelinksUrl?.substring(0, 40)}...
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => copyToClipboard(it.cuelinksUrl, 'Cuelinks URL copied!')}
              className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <a 
              href={it.cuelinksUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Clicks</div>
          <div className="text-lg font-bold text-gray-900">{Number(it.clicks || 0).toLocaleString()}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Conversions</div>
          <div className="text-lg font-bold text-green-600">{Number(it.approvedConversions || 0).toLocaleString()}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Earnings</div>
          <div className="text-lg font-bold text-purple-600">₹{Number(it.approvedCommissionSum || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function LinksSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ q }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
        <LinkIcon className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {q ? 'No matching links found' : 'No links created yet'}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {q ? 'Try adjusting your search terms or filters' : 'Generate your first affiliate link to start tracking clicks and earnings'}
      </p>
      {!q && (
        <button
          onClick={() => document.querySelector('input')?.focus()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
        >
          <Zap className="w-5 h-5" />
          Generate First Link
        </button>
      )}
    </div>
  );
}