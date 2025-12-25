'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard, Filter, Download, RefreshCw,
  Search, TrendingUp, CheckCircle, Clock,
  AlertCircle, IndianRupee, Store, Calendar,
  ArrowUpRight, ChevronDown
} from 'lucide-react';

export default function UserTransactionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    totalTransactions: 0
  });

  const loadTransactions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/conversions/me`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (res.ok) {
        const conversions = data?.data?.conversions || [];
        setItems(conversions);
        
        // Calculate stats
        const totalEarnings = conversions.reduce((sum, tx) => sum + Number(tx.commissionAmount || 0), 0);
        const pendingAmount = conversions
          .filter(tx => tx.status === 'pending' || tx.status === 'processing')
          .reduce((sum, tx) => sum + Number(tx.commissionAmount || 0), 0);
        const approvedAmount = conversions
          .filter(tx => tx.status === 'approved' || tx.status === 'completed')
          .reduce((sum, tx) => sum + Number(tx.commissionAmount || 0), 0);
        
        setStats({
          totalEarnings,
          pendingAmount,
          approvedAmount,
          totalTransactions: conversions.length
        });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const refreshTransactions = () => {
    setRefreshing(true);
    loadTransactions(false);
  };

  const filteredItems = items.filter(tx => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      tx.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.store?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    // Date filter (simplified - would need proper date logic)
    const matchesDate = dateFilter === 'all' || true;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'pending':
      case 'processing':
        return 'bg-amber-100 text-amber-600';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-3 h-3" />;
      case 'rejected':
      case 'cancelled':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
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

  const exportData = () => {
    const dataStr = JSON.stringify(filteredItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

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
                  <div className="text-2xl font-bold text-green-600">
                    ₹{stats.totalEarnings.toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Approved</div>
                    <div className="text-lg font-bold text-gray-900">
                      ₹{stats.approvedAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Pending</div>
                    <div className="text-lg font-bold text-gray-900">
                      ₹{stats.pendingAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Total Transactions</div>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.totalTransactions}
                  </div>
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
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
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
                  Export as CSV
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
                      {filteredItems.map((tx) => (
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
                                  {tx.productName?.substring(0, 20) || 'Product'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{Number(tx.productAmount || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">
                              ₹{Number(tx.commissionAmount || 0).toLocaleString()}
                            </div>
                            {tx.commissionRate && (
                              <div className="text-xs text-gray-500">
                                {tx.commissionRate}% rate
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(tx.status)}`}>
                              {getStatusIcon(tx.status)}
                              {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1)}
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
              {filteredItems.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {Math.min(filteredItems.length, 10)} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
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