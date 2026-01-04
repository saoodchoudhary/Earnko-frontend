'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreditCard, Filter, Download, RefreshCw,
  Search, CheckCircle, Clock,
  AlertCircle, IndianRupee, Store, Calendar
} from 'lucide-react';

export default function UserTransactionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'processing' | 'rejected'
  const [dateFilter, setDateFilter] = useState('all');     // 'all' | 'today' | 'week' | 'month' | 'year'

  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    totalTransactions: 0
  });

  // simple client-side pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  // Normalize backend statuses to UI categories
  // Backend schema includes: pending, confirmed, cancelled, under_review
  // Webhook may send: approved/rejected/valid/paid/void etc.
  const normalizeStatus = (s) => {
    const x = String(s || '').toLowerCase();
    if (['approved', 'confirmed', 'valid', 'paid', 'completed'].includes(x)) return 'approved';
    if (['pending', 'under_review', 'processing'].includes(x)) return 'pending';
    if (['rejected', 'cancelled', 'invalid', 'void'].includes(x)) return 'rejected';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'rejected': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const withinDateFilter = (d) => {
    if (dateFilter === 'all') return true;
    const now = new Date();
    const t = new Date(d);
    if (Number.isNaN(t.getTime())) return false;
    const diffDays = Math.floor((now - t) / (1000 * 60 * 60 * 24));
    if (dateFilter === 'today') return t.toDateString() === now.toDateString();
    if (dateFilter === 'week') return diffDays <= 7;
    if (dateFilter === 'month') return diffDays <= 30;
    if (dateFilter === 'year') return diffDays <= 365;
    return true;
  };

  const loadTransactions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        if (typeof window !== 'undefined') window.location.href = '/login?next=/dashboard/transactions';
        return;
      }
      const res = await fetch(`${base}/api/conversions/me`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await safeJson(res);
      if (res.ok) {
        const conversions = Array.isArray(data?.data?.conversions) ? data.data.conversions : [];
        // normalize mapped shape
        const mapped = conversions.map(tx => ({
          ...tx,
          __normStatus: normalizeStatus(tx.status),
          store: tx.store || null
        }));
        setItems(mapped);

        // stats
        const totalEarnings = mapped.reduce((sum, tx) => sum + Number(tx.commissionAmount || 0), 0);
        const pendingAmount = mapped
          .filter(tx => tx.__normStatus === 'pending')
          .reduce((sum, tx) => sum + Number(tx.commissionAmount || 0), 0);
        const approvedAmount = mapped
          .filter(tx => tx.__normStatus === 'approved')
          .reduce((sum, tx) => sum + Number(tx.commissionAmount || 0), 0);

        setStats({
          totalEarnings,
          pendingAmount,
          approvedAmount,
          totalTransactions: mapped.length
        });
      } else {
        toast.error(data?.message || 'Failed to load transactions');
        setItems([]);
        setStats({ totalEarnings: 0, pendingAmount: 0, approvedAmount: 0, totalTransactions: 0 });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Error loading transactions');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
      setPage(1); // reset to first page after load
    }
  };

  useEffect(() => {
    if (base) loadTransactions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  const refreshTransactions = () => {
    setRefreshing(true);
    loadTransactions(false);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter(tx => {
      // search
      const matchesSearch =
        q === '' ||
        String(tx.orderId || '').toLowerCase().includes(q) ||
        String(tx.store?.name || '').toLowerCase().includes(q);

      // status
      const matchesStatus = statusFilter === 'all' || tx.__normStatus === statusFilter || (statusFilter === 'processing' && tx.__normStatus === 'pending');

      // date
      const matchesDate = withinDateFilter(tx.createdAt);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [items, searchQuery, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page]);

  const exportData = () => {
    const dataStr = JSON.stringify(filteredItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
                <p className="text-blue-100 mt-1">Track all your earnings and commissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={refreshTransactions}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Stats & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Overview */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Transaction Summary</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500">Total Earnings</div>
                  <div className="text-2xl font-bold text-green-600">{fmtINR(stats.totalEarnings)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Approved</div>
                    <div className="text-lg font-bold text-gray-900">{fmtINR(stats.approvedAmount)}</div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Pending</div>
                    <div className="text-lg font-bold text-gray-900">{fmtINR(stats.pendingAmount)}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Total Transactions</div>
                  <div className="text-lg font-bold text-gray-900">{stats.totalTransactions}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Transactions
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search by order or store..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending/Under Review</option>
                    <option value="rejected">Rejected/Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last 365 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={exportData}
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <button className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  View Statement
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Transactions Table */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Showing {filteredItems.length} of {items.length} transactions
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated just now
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Transactions Found</h3>
                    <p className="text-gray-600">
                      {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                        ? 'No transactions match your filters'
                        : 'You have no transactions yet'
                      }
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Store
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pageItems.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.orderId || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Order #{tx._id?.substring(0, 8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                                <Store className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {tx.store?.name || 'Unknown Store'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {String(tx.productName || '').substring(0, 24) || 'Product'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {fmtINR(tx.productAmount || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">
                              {fmtINR(tx.commissionAmount || 0)}
                            </div>
                            {tx.commissionRate != null && (
                              <div className="text-xs text-gray-500">
                                {Number(tx.commissionRate || 0)}% rate
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(tx.__normStatus)}`}>
                              {getStatusIcon(tx.__normStatus)}
                              {tx.__normStatus?.charAt(0).toUpperCase() + tx.__normStatus?.slice(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(tx.createdAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Footer */}
              {filteredItems.length > 0 && !loading && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {page} of {totalPages} • Showing {pageItems.length} rows
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}