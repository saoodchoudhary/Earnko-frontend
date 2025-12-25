'use client';

import { useEffect, useState } from 'react';
import {
  Eye, Filter, Download, Search, Calendar,
  Globe, Smartphone, Clock, ChevronDown,
  ExternalLink, TrendingUp, RefreshCw,
  BarChart3, Users
} from 'lucide-react';

export default function MyClicksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueClicks: 0,
    todayClicks: 0,
    conversionRate: 0
  });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const res = await fetch(`${base}/api/user/clicks`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (res.ok) {
          const clicks = data?.data?.items || [];
          setItems(clicks);
          
          const totalClicks = clicks.length;
          const uniqueIps = new Set(clicks.map(c => c.ipAddress || c.ip)).size;
          const today = new Date().toDateString();
          const todayClicks = clicks.filter(c => 
            new Date(c.createdAt).toDateString() === today
          ).length;
          const conversionRate = totalClicks > 0 ? 
            ((uniqueIps / totalClicks) * 100).toFixed(1) : 0;

          setStats({
            totalClicks,
            uniqueClicks: uniqueIps,
            todayClicks,
            conversionRate
          });
        }
      } catch (error) {
        console.error('Error loading clicks:', error);
      } finally { 
        setLoading(false); 
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const filteredItems = items.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        (item.customSlug || '').toLowerCase().includes(query) ||
        (item.store?.name || '').toLowerCase().includes(query) ||
        (item.ipAddress || item.ip || '').toLowerCase().includes(query);
      if (!matches) return false;
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      const clickDate = new Date(item.createdAt);
      
      switch (timeFilter) {
        case 'today':
          return clickDate.toDateString() === now.toDateString();
        case '7days':
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          return clickDate >= sevenDaysAgo;
        case '30days':
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return clickDate >= thirtyDaysAgo;
        default:
          return true;
      }
    }

    return true;
  });

  const getDeviceIcon = (userAgent) => {
    const ua = (userAgent || '').toLowerCase();
    if (ua.includes('mobile')) return '📱';
    if (ua.includes('tablet')) return '📱';
    if (ua.includes('android')) return '🤖';
    if (ua.includes('iphone') || ua.includes('ipad')) return '🍎';
    if (ua.includes('windows')) return '🪟';
    if (ua.includes('mac')) return '💻';
    if (ua.includes('linux')) return '🐧';
    return '💻';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const refreshData = () => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/user/clicks`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (res.ok) setItems(data?.data?.items || []);
      } catch {} finally { setLoading(false); }
    }
    load();
    return () => controller.abort();
  };

  const exportData = () => {
    const csvData = filteredItems.map(item => ({
      'Date': new Date(item.createdAt).toLocaleString(),
      'Slug': item.customSlug || '',
      'Store': item.store?.name || '',
      'IP Address': item.ipAddress || item.ip || '',
      'Device': getDeviceIcon(item.userAgent),
      'User Agent': item.userAgent || ''
    }));

    const csvHeaders = ['Date', 'Slug', 'Store', 'IP Address', 'Device', 'User Agent'];
    const csvRows = csvData.map(row => 
      csvHeaders.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    
    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Get top performing links
  const getTopLinks = () => {
    const slugCounts = {};
    items.forEach(click => {
      const slug = click.customSlug || 'Unknown';
      slugCounts[slug] = (slugCounts[slug] || 0) + 1;
    });
    
    return Object.entries(slugCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  // Get device distribution
  const getDeviceDistribution = () => {
    const deviceCounts = {};
    items.forEach(click => {
      const device = getDeviceIcon(click.userAgent);
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    
    return Object.entries(deviceCounts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Click Analytics</h1>
                <p className="text-blue-100 mt-1">Track all clicks on your affiliate links</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalClicks}</div>
            <div className="text-sm text-gray-500 mt-1">Total Clicks</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.uniqueClicks}</div>
            <div className="text-sm text-gray-500 mt-1">Unique Visitors</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.todayClicks}</div>
            <div className="text-sm text-gray-500 mt-1">Today's Clicks</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</div>
            <div className="text-sm text-gray-500 mt-1">Engagement Rate</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Click History</h2>
              <p className="text-gray-600 text-sm mt-1">All clicks on your affiliate links</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search by slug, store, or IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-64"
                />
              </div>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} clicks
          </div>
        </div>

        {/* Clicks Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                {searchQuery || timeFilter !== 'all' ? 'No matching clicks found' : 'No clicks yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery || timeFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start sharing your links to track clicks'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Click Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((click) => (
                    <tr key={click._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                            <span className="text-lg">{getDeviceIcon(click.userAgent)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {click.customSlug || 'Unknown Slug'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {click.store?.name || 'Unknown Store'}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-1">
                              IP: {click.ipAddress || click.ip || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {click.userAgent?.split('(')[1]?.split(')')[0] || 'Unknown Device'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]" title={click.userAgent || ''}>
                            {click.userAgent?.substring(0, 60) || 'No user agent'}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            {formatTimeAgo(click.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(click.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(filteredItems.length, 10)} of {filteredItems.length} clicks
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">Top Performing Links</h3>
            <div className="space-y-3">
              {getTopLinks().map(([slug, count], i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 truncate max-w-[120px]" title={slug}>
                    {slug}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">clicks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">Device Distribution</h3>
            <div className="space-y-3">
              {getDeviceDistribution().map(([device, count], i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{device}</span>
                    <span className="text-sm text-gray-700">
                      {device === '📱' ? 'Mobile' : 
                       device === '💻' ? 'Desktop' : 
                       device === '🤖' ? 'Android' : 
                       device === '🍎' ? 'iOS' : 'Other'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">clicks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {items
                .slice(0, 3)
                .map((click, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 truncate max-w-[120px]" title={click.customSlug || 'Click'}>
                      {click.customSlug?.substring(0, 20) || 'Click'}...
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(click.createdAt)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}