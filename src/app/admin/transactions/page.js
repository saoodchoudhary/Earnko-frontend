'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Search, Filter, Download, RefreshCw, ChevronRight, ChevronLeft,
  Eye, MoreVertical, Calendar, FileText, CheckCircle, XCircle,
  Clock, AlertCircle, DollarSign, CreditCard, Users, Store as StoreIcon
} from 'lucide-react'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'under_review', label: 'Under Review' },
]

const rangeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
]

const limitOptions = [10, 20, 50, 100]

export default function AdminTransactionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [range, setRange] = useState('7d')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [bulkAction, setBulkAction] = useState('')

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit) 
      })
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      if (range) params.set('range', range)

      const res = await fetch(`${base}/api/admin/transactions?${params.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load transactions')

      setItems(data?.data?.items || [])
      setTotal(data?.data?.total || 0)
      setSelectedRows(new Set()) // Clear selection on new load
    } catch (err) {
      toast.error(err.message || 'Error loading transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [q, status, range, page, limit])

  const updateStatus = async (id, nextStatus) => {
    try {
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/transactions/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ status: nextStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update')
      
      toast.success('Status updated successfully')
      
      // Update local state
      setItems(items.map(item => 
        item._id === id ? { ...item, status: nextStatus } : item
      ))
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRows.size === 0) {
      toast.error('Please select an action and at least one transaction')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/transactions/bulk-status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ 
          ids: Array.from(selectedRows), 
          status: bulkAction 
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Bulk update failed')
      
      toast.success(`${selectedRows.size} transactions updated`)
      setSelectedRows(new Set())
      setBulkAction('')
      loadData(false) // Refresh data without loader
    } catch (err) {
      toast.error(err.message || 'Bulk update failed')
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(items.map(item => item._id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `transactions-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Data exported successfully')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
        <p className="text-gray-600 mt-1">Manage and review all platform transactions</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Transaction Filters</h2>
              <p className="text-gray-600 text-sm mt-1">Filter and search transactions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search order ID, user, store..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value) }}
            />
          </div>
          
          <div>
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              value={status}
              onChange={(e) => { setPage(1); setStatus(e.target.value) }}
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              value={range}
              onChange={(e) => { setPage(1); setRange(e.target.value) }}
            >
              {rangeOptions.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
            >
              {limitOptions.map(n => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRows.size > 0 && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-900">
                {selectedRows.size} transaction(s) selected
              </div>
              <div className="flex items-center gap-3">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                >
                  <option value="">Select action...</option>
                  <option value="confirmed">Mark as Confirmed</option>
                  <option value="pending">Mark as Pending</option>
                  <option value="cancelled">Mark as Cancelled</option>
                  <option value="under_review">Mark as Under Review</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                  disabled={!bulkAction}
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">All Transactions</h3>
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} transactions
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">No Transactions Found</h4>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-gray-800 rounded border-gray-300 focus:ring-gray-500"
                      checked={selectedRows.size === items.length && items.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amounts
                  </th>
                  <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-gray-800 rounded border-gray-300 focus:ring-gray-500"
                        checked={selectedRows.has(tx._id)}
                        onChange={(e) => handleSelectRow(tx._id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 font-mono">
                            {tx.orderId?.substring(0, 12)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {tx._id?.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="text-sm text-gray-900 truncate max-w-[150px]">
                            {tx.user?.email || tx.user?._id || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <StoreIcon className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="text-sm text-gray-600 truncate max-w-[150px]">
                            {tx.store?.name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="font-medium text-gray-900">
                            ₹{Number(tx.productAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Commission:</span>
                          <span className="font-medium text-green-600">
                            ₹{Number(tx.commissionAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{formatDate(tx.createdAt)}</div>
                        <div className="text-gray-500">{formatTime(tx.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 appearance-none pr-8"
                            value={tx.status}
                            onChange={(e) => updateStatus(tx._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="under_review">Under Review</option>
                          </select>
                          <ChevronRight className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
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
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        page === pageNum
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {!loading && items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Amount"
            value={`₹${items.reduce((sum, tx) => sum + (tx.productAmount || 0), 0).toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Total Commission"
            value={`₹${items.reduce((sum, tx) => sum + (tx.commissionAmount || 0), 0).toLocaleString()}`}
            icon={<CreditCard className="w-5 h-5" />}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Pending Transactions"
            value={items.filter(tx => tx.status === 'pending').length}
            icon={<Clock className="w-5 h-5" />}
            color="bg-amber-100 text-amber-600"
          />
          <StatCard
            title="Avg. Commission"
            value={`₹${Math.round(items.reduce((sum, tx) => sum + (tx.commissionAmount || 0), 0) / items.length).toLocaleString()}`}
            icon={<AlertCircle className="w-5 h-5" />}
            color="bg-purple-100 text-purple-600"
          />
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
    confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" /> },
    under_review: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <AlertCircle className="w-3 h-3" /> },
  }
  
  const { color, icon } = config[status] || { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: <AlertCircle className="w-3 h-3" /> 
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${color}`}>
      {icon}
      <span className="text-sm font-medium capitalize">{status?.replace('_', ' ') || 'Unknown'}</span>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg ${color.split(' ')[0]} flex items-center justify-center`}>
          <div className={color.split(' ')[1]}>
            {icon}
          </div>
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}