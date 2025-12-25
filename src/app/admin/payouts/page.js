'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  CreditCard, Filter, Download, RefreshCw, CheckCircle, XCircle,
  Clock, AlertCircle, IndianRupee, MoreVertical, Eye, Search,
  ChevronDown, Calendar, User, Wallet, TrendingUp
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status', icon: <Filter className="w-4 h-4" /> },
  { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4 text-amber-500" /> },
  { value: 'approved', label: 'Approved', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  { value: 'processed', label: 'Processed', icon: <CheckCircle className="w-4 h-4 text-blue-500" /> },
  { value: 'rejected', label: 'Rejected', icon: <XCircle className="w-4 h-4 text-red-500" /> },
]

export default function AdminPayoutsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [status, setStatus] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    processed: 0,
    rejected: 0
  })

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const params = new URLSearchParams()
      if (status) params.set('status', status)

      const res = await fetch(`${base}/api/admin/payouts?${params.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to load payouts')
      
      const payouts = js?.data?.payouts || []
      setItems(payouts)

      // Calculate stats
      const statsData = {
        total: payouts.length,
        pending: payouts.filter(p => p.status === 'pending').length,
        approved: payouts.filter(p => p.status === 'approved').length,
        processed: payouts.filter(p => p.status === 'processed').length,
        rejected: payouts.filter(p => p.status === 'rejected').length
      }
      setStats(statsData)

    } catch (err) {
      toast.error(err.message || 'Error loading payouts')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [status])

  const updateStatus = async (id, nextStatus) => {
    try {
      setBusyId(id)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/payouts/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ status: nextStatus })
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to update')
      
      toast.success(`Payout ${nextStatus} successfully`)
      await loadData(false) // Reload data without showing loading
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setBusyId(null)
    }
  }

  const refreshData = () => {
    setRefreshing(true)
    loadData(false)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `payouts-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Data exported successfully!')
  }

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.affiliate?.name?.toLowerCase().includes(query) ||
      item.affiliate?.email?.toLowerCase().includes(query) ||
      item._id?.toLowerCase().includes(query)
    )
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'processed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600 mt-1">Manage and process affiliate payouts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard title="Total" value={stats.total} color="gray" />
          <StatCard title="Pending" value={stats.pending} color="amber" />
          <StatCard title="Approved" value={stats.approved} color="green" />
          <StatCard title="Processed" value={stats.processed} color="blue" />
          <StatCard title="Rejected" value={stats.rejected} color="red" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, email or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm min-w-[160px]"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <Th>Affiliate</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-3"></div>
                      <div className="text-gray-600">Loading payouts...</div>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="w-12 h-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No Payouts Found</h3>
                      <p className="text-gray-500 text-sm">
                        {searchQuery ? 'Try different search terms' : 'No payouts available for selected filters'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(payout => (
                  <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payout.affiliate?.name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payout.affiliate?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-gray-500" />
                        <div className="text-sm font-bold text-gray-900">
                          {Number(payout.amount || 0).toLocaleString()}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="text-sm text-gray-900 capitalize">
                        {payout.method || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payout.bank?.accountNumber?.slice(-4) || payout.upiId || 'No details'}
                      </div>
                    </Td>
                    <Td>
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status === 'pending' && <Clock className="w-3 h-3" />}
                        {payout.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {payout.status === 'processed' && <CheckCircle className="w-3 h-3" />}
                        {payout.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {payout.status?.charAt(0).toUpperCase() + payout.status?.slice(1)}
                      </div>
                    </Td>
                    <Td>
                      <div className="text-sm text-gray-900">
                        {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payout.createdAt ? new Date(payout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/payouts/${payout._id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Link>
                        
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            {payout.status !== 'approved' && payout.status !== 'processed' && (
                              <button
                                onClick={() => updateStatus(payout._id, 'approved')}
                                disabled={busyId === payout._id}
                                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve Payout
                              </button>
                            )}
                            {payout.status !== 'processed' && payout.status !== 'rejected' && (
                              <button
                                onClick={() => updateStatus(payout._id, 'processed')}
                                disabled={busyId === payout._id}
                                className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Processed
                              </button>
                            )}
                            {payout.status !== 'rejected' && (
                              <button
                                onClick={() => updateStatus(payout._id, 'rejected')}
                                disabled={busyId === payout._id}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject Payout
                              </button>
                            )}
                            <div className="border-t border-gray-200">
                              <Link
                                href={`/admin/payouts/${payout._id}`}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredItems.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-semibold">{filteredItems.length}</span> payouts
              </div>
              <div className="text-sm text-gray-500">
                Total Amount: <span className="font-semibold">
                  ₹{filteredItems.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color = 'gray' }) {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}

function Th({ children, className = '' }) { 
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
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