'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Search, Filter, Plus, Edit, Eye, Trash2,
  Store as StoreIcon, CheckCircle, XCircle,
  RefreshCw, Download, Clock,
  TrendingUp, Cookie
} from 'lucide-react';

export default function AdminStoresPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedStores, setSelectedStores] = useState([]);

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

  const loadStores = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: 'updatedAt',
        order: 'desc'
      });
      if (q) params.set('q', q);
      if (isActive !== '') params.set('isActive', isActive);

      const url = `${base}/api/admin/stores?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load stores');

      setItems(data?.data?.items || []);
      setTotal(data?.data?.total || 0);
    } catch (err) {
      toast.error(err.message || 'Error loading stores');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, isActive, page, limit]);

  const removeItem = async (id) => {
    if (!confirm('Are you sure you want to delete this store?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/stores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to delete');

      toast.success('Store deleted successfully');
      setItems(prev => prev.filter(i => i._id !== id));
      setTotal(t => Math.max(0, t - 1));
      setSelectedStores(prev => prev.filter(s => s !== id));
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const toggleActive = async (it) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/stores/${it._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ isActive: !it.isActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update');

      toast.success(`Store ${!it.isActive ? 'activated' : 'deactivated'} successfully`);
      setItems(prev => prev.map(s => (s._id === it._id ? data.data.item : s)));
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const toggleSelectStore = (id) => {
    setSelectedStores(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStores.length === items.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(items.map(item => item._id));
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    loadStores(false);
  };

  const exportData = () => {
    const data = items.map(store => ({
      Name: store.name,
      Network: store.affiliateNetwork,
      'Commission Rate': `${store.commissionRate || 0}${store.commissionType === 'percentage' ? '%' : ''}`,
      Type: store.commissionType,
      'Cookie Duration': `${store.cookieDuration || 30} days`,
      Status: store.isActive ? 'Active' : 'Inactive',
      'Last Updated': store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : '-',
      Products: store.productCount || 0
    }));

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stores-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Data exported successfully');
  };

  // Helper: build public logo URL from backend if relative path like "/uploads/..."
  const getLogoUrl = (logo) => {
    if (!logo || typeof logo !== 'string') return '';
    if (logo.startsWith('http://') || logo.startsWith('https://')) return logo;
    return `${base}${logo}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600 mt-1">Manage affiliate stores and their settings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/admin/stores/create"
              className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Store
            </Link>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Search stores..."
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
            />
          </div>

          <select
            className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={isActive}
            onChange={(e) => { setPage(1); setIsActive(e.target.value); }}
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <select
            className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(1)}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} stores
        </div>
        {selectedStores.length > 0 && (
          <div className="text-sm text-gray-700">
            {selectedStores.length} store{selectedStores.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {/* Stores Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedStores.length === items.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-gray-800 rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Store
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Network
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Cookie
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8">
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                    <div className="text-gray-600">Loading stores...</div>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <StoreIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No stores found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                  <Link
                    href="/admin/stores/create"
                    className="mt-4 inline-flex items-center gap-2 text-gray-800 hover:text-gray-900"
                  >
                    <Plus className="w-4 h-4" />
                    Add your first store
                  </Link>
                </td>
              </tr>
            ) : (
              items.map(store => {
                const logoUrl = getLogoUrl(store.logo);
                return (
                  <tr
                    key={store._id}
                    className={`hover:bg-gray-50 transition-colors ${selectedStores.includes(store._id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store._id)}
                        onChange={() => toggleSelectStore(store._id)}
                        className="w-4 h-4 text-gray-800 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/stores/${store._id}`}
                        className="group flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden group-hover:bg-gray-200 transition-colors">
                          {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logoUrl}
                              alt={`${store.name} logo`}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <StoreIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-gray-800 transition-colors">
                            {store.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {store.productCount || 0} products
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {store.affiliateNetwork || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">
                          {store.commissionRate || 0}
                          {store.commissionType === 'percentage' ? '%' : ''}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {store.commissionType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Cookie className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-gray-900">{store.cookieDuration || 30}d</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {store.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/stores/${store._id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/stores/${store._id}/edit`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Store"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleActive(store)}
                          className={`p-2 rounded-lg transition-colors ${
                            store.isActive
                              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={store.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {store.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeItem(store._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Store"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages} • {total} stores total
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 transition-colors ${
                page <= 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className={`px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 transition-colors ${
                page >= totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}