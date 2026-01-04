'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  Search, Filter, RefreshCw, Eye, AlertCircle, 
  CheckCircle, Clock, ChevronRight, ChevronLeft,
  Download, Server
} from 'lucide-react'

export default function AdminWebhooksPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  const [stats, setStats] = useState({
    total: 0,
    received: 0,
    processed: 0,
    error: 0
  })

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const envWarned = useRef(false)
  const getBase = () => process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return { Authorization: token ? `Bearer ${token}` : '' }
  }
  const ensureEnvConfigured = () => {
    const base = getBase()
    if (!base && !envWarned.current) {
      envWarned.current = true
      toast.error('Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL')
    }
  }
  const handleHttpError = async (res) => {
    let message = 'Request failed'
    try {
      const data = await res.clone().json()
      if (data?.message) message = data.message
    } catch {}
    if (res.status === 401) message = 'Unauthorized. Please login again.'
    if (res.status === 403) message = 'Forbidden. Admin access required.'
    throw new Error(message)
  }

  const loadStatusTotals = async () => {
    try {
      ensureEnvConfigured()
      const base = getBase()
      const headers = getHeaders()

      const statuses = ['received','processed','error']
      const reqs = statuses.map(s => fetch(`${base}/api/admin/webhooks?status=${s}&limit=1`, { headers }))
      const resArr = await Promise.all(reqs)
      for (const r of resArr) { if (!r.ok) await handleHttpError(r) }
      const dataArr = await Promise.all(resArr.map(r => r.json().catch(() => ({}))))

      const totals = {}
      statuses.forEach((s, i) => { totals[s] = Number(dataArr[i]?.data?.total || 0) })

      // Total across all
      const rAll = await fetch(`${base}/api/admin/webhooks?limit=1`, { headers })
      if (!rAll.ok) await handleHttpError(rAll)
      const jAll = await rAll.json().catch(() => ({}))

      setStats({
        total: Number(jAll?.data?.total || 0),
        received: totals.received || 0,
        processed: totals.processed || 0,
        error: totals.error || 0
      })
    } catch (err) {
      toast.error(err.message || 'Failed to load webhook stats')
    }
  }

  const loadData = async (signal, showLoading = true) => {
    try {
      ensureEnvConfigured()
      if (showLoading) setLoading(true)
      const base = getBase()
      const headers = getHeaders()

      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      if (source) params.set('source', source)

      const res = await fetch(`${base}/api/admin/webhooks?${params.toString()}`, {
        signal,
        headers
      })
      if (!res.ok) await handleHttpError(res)
      const data = await res.json()

      setItems(Array.isArray(data?.data?.items) ? data.data.items : [])
      setTotal(Number(data?.data?.total || 0))

      // Update stats in background
      loadStatusTotals()
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Error loading events')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadData(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, source, page, limit])

  const refresh = () => {
    setRefreshing(true)
    const controller = new AbortController()
    loadData(controller.signal, false)
  }

  const handleFilterReset = () => {
    setQ('')
    setStatus('')
    setSource('')
    setPage(1)
  }

  const exportData = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      filters: { q, status, source, page, limit },
      items
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webhooks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully!')
  }

  // Backend-supported status change via PATCH /api/admin/webhooks/:id/mark
  const handleStatusChange = async (eventId, newStatus) => {
    try {
      ensureEnvConfigured()
      const base = getBase()
      const headers = { 'Content-Type': 'application/json', ...getHeaders() }
      const allowed = ['received','processed','error']
      if (!allowed.includes(newStatus)) throw new Error('Invalid status')

      const res = await fetch(`${base}/api/admin/webhooks/${eventId}/mark`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) await handleHttpError(res)
      const js = await res.json()
      const updated = js?.data?.item
      if (!updated || updated.status !== newStatus) throw new Error('Status update did not persist')

      setItems(prev => prev.map(ev => (ev._id === eventId ? updated : ev)))
      toast.success(`Event marked as ${newStatus}`)
      // Refresh stats in background
      loadStatusTotals()
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhook Events</h1>
            <p className="text-gray-600 mt-1">Monitor and manage webhook events from various sources</p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Events" 
          value={stats.total}
          icon={<Server className="w-5 h-5" />}
          color="from-gray-700 to-gray-900"
        />
        <StatCard 
          title="Received" 
          value={stats.received}
          icon={<Clock className="w-5 h-5" />}
          color="from-blue-600 to-blue-800"
        />
        <StatCard 
          title="Processed" 
          value={stats.processed}
          icon={<CheckCircle className="w-5 h-5" />}
          color="from-green-600 to-green-800"
        />
        <StatCard 
          title="Errors" 
          value={stats.error}
          icon={<AlertCircle className="w-5 h-5" />}
          color="from-red-600 to-red-800"
        />
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <button
            onClick={handleFilterReset}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Event Type
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                placeholder="Type to search..."
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value) }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              value={status}
              onChange={(e) => { setPage(1); setStatus(e.target.value) }}
            >
              <option value="">All Statuses</option>
              <option value="received">Received</option>
              <option value="processed">Processed</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <input
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              placeholder="Source (e.g., cuelinks)"
              value={source}
              onChange={(e) => { setPage(1); setSource(e.target.value) }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per page
            </label>
            <select
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Webhook Events</h3>
            <p className="text-gray-600 text-sm mt-1">Real-time webhook monitoring</p>
          </div>
          <button
            onClick={exportData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <Th>Source</Th>
                <Th>Event Type</Th>
                <Th>Status</Th>
                <Th>Transaction</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                  <td colSpan={6} className="p-12 text-center">
                    <div className="text-center">
                      <Server className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-700 mb-1">No Events Found</h4>
                      <p className="text-gray-600">No webhook events match your current filters</p>
                    </div>
                  </td>
                </tr>
              ) : items.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <div className="font-medium text-gray-900">{event.source || '-'}</div>
                  </Td>
                  <Td>
                    <div className="font-medium text-gray-900">{event.eventType || '-'}</div>
                    {event.eventData && (
                      <div className="text-xs text-gray-500 truncate max-w-[220px]">
                        {JSON.stringify(event.eventData).substring(0, 80)}...
                      </div>
                    )}
                  </Td>
                  <Td>
                    <StatusBadge status={event.status} />
                  </Td>
                  <Td>
                    <div className="font-mono text-sm text-gray-700 truncate max-w-[220px]">
                      {event.transaction?._id || event.transaction || '-'}
                    </div>
                  </Td>
                  <Td>
                    <div className="text-sm text-gray-900">
                      {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.createdAt ? new Date(event.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/webhooks/${event._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <select
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                        value={event.status}
                        onChange={(e) => handleStatusChange(event._id, e.target.value)}
                      >
                        <option value="received">Received</option>
                        <option value="processed">Processed</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-semibold">{total}</span> events
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    received: {
      color: 'bg-blue-100 text-blue-600 border-blue-200',
      icon: <Clock className="w-3 h-3" />
    },
    processed: {
      color: 'bg-green-100 text-green-600 border-green-200',
      icon: <CheckCircle className="w-3 h-3" />
    },
    error: {
      color: 'bg-red-100 text-red-600 border-red-200',
      icon: <AlertCircle className="w-3 h-3" />
    }
  }

  const { color, icon } = config[status] || { 
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: null
  }

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium ${color}`}>
      {icon}
      <span className="capitalize">{status || 'Unknown'}</span>
    </div>
  )
}

function Th({ children, className = '' }) { 
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  ) 
}

function Td({ children, className = '' }) { 
  return (
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  ) 
}