'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  Search, RefreshCw, DollarSign, CheckCircle,
  XCircle, AlertCircle, Clock, Eye, ChevronLeft,
  ChevronRight, Download, CreditCard, TrendingUp, ArrowUpRight
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status', color: 'bg-gray-100 text-gray-700' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'reversed', label: 'Reversed', color: 'bg-rose-100 text-rose-700' },
  { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
]

export default function AdminCommissionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    paid: 0,
    total: 0,
    revenue: 0
  })

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { return await res.json() } catch { return null }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  const loadData = async (showLoading = true) => {
    try {
      if (!base) {
        toast.error('NEXT_PUBLIC_BACKEND_URL not set')
        setItems([]); setTotal(0); setStats({ pending:0, approved:0, paid:0, total:0, revenue:0 })
        return
      }
      if (showLoading) setLoading(true)
      const token = getToken()
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set('status', status)
      if (searchQuery) params.set('q', searchQuery)

      const res = await fetch(`${base}/api/admin/commissions?${params.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await safeJson(res)
      if (!res.ok) {
        const msg = data?.message || `Failed to load commissions (HTTP ${res.status})`
        if ((data?.message || '').startsWith('<!DOCTYPE') || (data?.message || '').includes('<html')) {
          toast.error('Received HTML from API. Check backend URL.')
        } else {
          toast.error(msg)
        }
        setItems([]); setTotal(0); setStats({ pending:0, approved:0, paid:0, total:0, revenue:0 })
        return
      }

      const list = data?.data?.commissions || data?.data?.items || data?.commissions || data?.items || []
      const totalCount = data?.data?.total ?? data?.data?.totalItems ?? (Array.isArray(list) ? list.length : 0)

      const arr = Array.isArray(list) ? list : []
      setItems(arr)
      setTotal(Number(totalCount) || 0)

      if (data?.data?.stats) {
        setStats({
          pending: Number(data.data.stats.pending || 0),
          approved: Number(data.data.stats.approved || 0),
          paid: Number(data.data.stats.paid || 0),
          total: Number(data.data.stats.total || totalCount || 0),
          revenue: Number(data.data.stats.revenue || 0),
        })
      } else {
        const statsData = {
          pending: arr.filter(c => c.status === 'pending').length,
          approved: arr.filter(c => c.status === 'approved').length,
          paid: arr.filter(c => c.status === 'paid').length,
          total: Number(totalCount) || arr.length,
          revenue: arr.reduce((sum, c) => sum + Number(c.amount || c.commissionAmount || 0), 0)
        }
        setStats(statsData)
      }

    } catch (err) {
      toast.error(err.message || 'Server error while loading commissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, searchQuery, page, limit])

  const refreshData = () => {
    loadData(false)
    toast.success('Data refreshed')
  }

  const approve = async (id) => {
    try {
      if (!base) { toast.error('NEXT_PUBLIC_BACKEND_URL not set'); return }
      setBusyId(id)
      const token = getToken()
      const res = await fetch(`${base}/api/admin/commissions/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await safeJson(res)
      if (!res.ok) {
        const msg = data?.message || `Approve failed (HTTP ${res.status})`
        toast.error(msg)
        return
      }
      toast.success('Commission approved successfully')
      setItems(prev => prev.map(c => (c._id === id ? { ...c, status: 'approved' } : c)))
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1
      }))
    } catch (err) {
      toast.error(err.message || 'Error approving commission')
    } finally {
      setBusyId(null)
    }
  }

  const reverse = async (id) => {
    try {
      if (!base) { toast.error('NEXT_PUBLIC_BACKEND_URL not set'); return }
      setBusyId(id)
      const token = getToken()
      const res = await fetch(`${base}/api/admin/commissions/${id}/reverse`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ reason: 'manual_admin_reversal' })
      })
      const data = await safeJson(res)
      if (!res.ok) {
        const msg = data?.message || `Reverse failed (HTTP ${res.status})`
        toast.error(msg)
        return
      }
      toast.success('Commission reversed successfully')
      setItems(prev => prev.map(c => (c._id === id ? { ...c, status: 'reversed' } : c)))
    } catch (err) {
      toast.error(err.message || 'Error reversing commission')
    } finally {
      setBusyId(null)
    }
  }

  const exportData = () => {
    const exportRows = (Array.isArray(items) ? items : []).map(item => ({
      'Order ID': item.transaction?.orderId || '',
      'Affiliate': item.affiliate?.name || '',
      'Email': item.affiliate?.email || '',
      'Amount': `₹${Number(item.amount || item.commissionAmount || 0)}`,
      'Status': item.status || '',
      'Date': item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
      'Store': item.store?.name || ''
    }))

    const headers = Object.keys(exportRows[0] || {})
    const csv = [
      headers.join(','),
      ...exportRows.map(row => headers.map(h => String(row[h]).replace(/,/g, ' ')).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Commission Management</h1>
            <p className="text-gray-600 mt-1 text-sm">Manage and track affiliate commissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportData}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link 
              href="/admin/offers" 
              className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Manage Offers
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Commissions"
          value={stats.total}
          icon={<DollarSign className="w-5 h-5" />}
          color="from-gray-700 to-gray-900"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
          color="from-amber-500 to-amber-700"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="from-green-500 to-green-700"
        />
        <StatCard
          title="Paid"
          value={stats.paid}
          icon={<CreditCard className="w-5 h-5" />}
          color="from-emerald-500 to-emerald-700"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${Number(stats.revenue || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-blue-600 to-blue-800"
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Search order ID or affiliate..."
              value={searchQuery}
              onChange={(e) => { setPage(1); setSearchQuery(e.target.value) }}
            />
          </div>
          
          <select
            className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value) }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          
          <select
            className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
          
          <button
            onClick={refreshData}
            className="px-4 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <Th>Affiliate</Th>
                <Th>Order Details</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6">
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-gray-500">
                      No commissions found
                    </div>
                  </td>
                </tr>
              ) : items.map((commission) => (
                <tr key={commission._id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                        {commission.affiliate?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {commission.affiliate?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {commission.affiliate?.email || ''}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="font-medium text-gray-900">
                      {commission.transaction?.orderId || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {commission.store?.name || 'Unknown Store'}
                    </div>
                  </Td>
                  <Td>
                    <div className="text-lg font-bold text-gray-900">
                      ₹{Number(commission.amount || commission.commissionAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {commission.commissionRate ? `${commission.commissionRate}%` : ''}
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge status={commission.status} />
                  </Td>
                  <Td>
                    <div className="text-sm text-gray-900">
                      {commission.createdAt ? new Date(commission.createdAt).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {commission.createdAt ? new Date(commission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {commission.status === 'pending' && (
                        <button
                          onClick={() => approve(commission._id)}
                          disabled={busyId === commission._id}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {busyId === commission._id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {busyId === commission._id ? 'Processing...' : 'Approve'}
                        </button>
                      )}
                      
                      {commission.status !== 'reversed' && commission.status !== 'paid' && (
                        <button
                          onClick={() => reverse(commission._id)}
                          disabled={busyId === commission._id}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {busyId === commission._id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {busyId === commission._id ? 'Processing...' : 'Reverse'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => {/* Optionally navigate to a commission detail page */}}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-sm text-gray-600">
          Showing {Math.min(((page - 1) * limit) + 1, total)} to {Math.min(page * limit, total)} of {total} commissions
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    page === pageNum
                      ? 'bg-gray-800 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {totalPages > 5 && <span className="text-gray-500">...</span>}
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  )
}

function StatusBadge({ status }) {
  const statusMap = {
    pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
    approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
    paid: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CreditCard className="w-3 h-3" /> },
    rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-3 h-3" /> },
    reversed: { color: 'bg-rose-100 text-rose-800 border-rose-200', icon: <XCircle className="w-3 h-3" /> },
    under_review: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <AlertCircle className="w-3 h-3" /> },
  }
  const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: null }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {status?.replace('_', ' ') || 'Unknown'}
    </span>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}