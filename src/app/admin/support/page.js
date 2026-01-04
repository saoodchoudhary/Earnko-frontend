'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  MessageSquare, Search, Filter, Eye, RefreshCw, 
  AlertCircle, CheckCircle, Clock, XCircle, MoreVertical,
  User, Mail, Calendar, Download,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const STATUS = [
  { value: '', label: 'All Status', color: 'bg-gray-100 text-gray-700' },
  { value: 'open', label: 'Open', color: 'bg-blue-50 text-blue-600' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-50 text-amber-600' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-50 text-green-600' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-600' },
]

export default function AdminSupportPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    total: 0
  })

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const envWarned = useRef(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

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
      const statuses = ['open','in_progress','resolved','closed']
      const reqs = statuses.map(s => fetch(`${base}/api/admin/support/tickets?status=${s}&limit=1`, { headers }))
      const resArr = await Promise.all(reqs)
      for (const r of resArr) { if (!r.ok) await handleHttpError(r) }
      const dataArr = await Promise.all(resArr.map(r => r.json().catch(() => ({}))))
      const totals = {}
      statuses.forEach((s, i) => { totals[s] = Number(dataArr[i]?.data?.total || 0) })
      // Also total across all
      const rAll = await fetch(`${base}/api/admin/support/tickets?limit=1`, { headers })
      if (!rAll.ok) await handleHttpError(rAll)
      const jAll = await rAll.json().catch(() => ({}))
      setStats({
        open: totals.open || 0,
        in_progress: totals.in_progress || 0,
        resolved: totals.resolved || 0,
        closed: totals.closed || 0,
        total: Number(jAll?.data?.total || 0)
      })
    } catch (err) {
      toast.error(err.message || 'Failed to load ticket stats')
    }
  }

  const loadTickets = async (showLoading = true) => {
    try {
      ensureEnvConfigured()
      if (showLoading) setLoading(true)
      const base = getBase()
      const headers = getHeaders()

      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit) 
      })
      if (q) params.set('q', q)
      if (status) params.set('status', status)

      const res = await fetch(`${base}/api/admin/support/tickets?${params.toString()}`, { headers })
      if (!res.ok) await handleHttpError(res)
      const data = await res.json()
      
      setItems(Array.isArray(data?.data?.items) ? data.data.items : [])
      setTotal(Number(data?.data?.total || 0))

      // Refresh global totals (backend-supported)
      loadStatusTotals()
    } catch (err) {
      toast.error(err.message || 'Error loading tickets')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page, limit])

  const refreshData = () => {
    setRefreshing(true)
    loadTickets(false)
  }

  const exportTickets = () => {
    const data = {
      tickets: items,
      exportedAt: new Date().toISOString(),
      filters: { q, status, page, limit }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `support-tickets-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Tickets exported successfully')
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      ensureEnvConfigured()
      setActionLoadingId(ticketId)
      const base = getBase()
      const headers = { 'Content-Type': 'application/json', ...getHeaders() }
      const allowed = ['open','in_progress','resolved','closed']
      if (!allowed.includes(newStatus)) throw new Error('Invalid status')

      const res = await fetch(`${base}/api/admin/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) await handleHttpError(res)
      const js = await res.json()
      const updatedTicket = js?.data?.ticket
      if (!updatedTicket || updatedTicket.status !== newStatus) {
        throw new Error('Status update did not persist')
      }

      setItems(prev => prev.map(t => (t._id === ticketId ? updatedTicket : t)))
      setOpenMenuId(null)
      toast.success(`Ticket status updated to ${newStatus.replace('_',' ')}`)
      // Refresh totals in background
      loadStatusTotals()
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600 mt-1">Manage and resolve customer support tickets</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportTickets}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview (computed from backend totals) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Open Tickets" 
          value={stats.open}
          icon={<AlertCircle className="w-5 h-5" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard 
          title="In Progress" 
          value={stats.in_progress}
          icon={<Clock className="w-5 h-5" />}
          color="from-amber-500 to-orange-600"
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="from-green-500 to-emerald-600"
        />
        <StatCard 
          title="Closed" 
          value={stats.closed}
          icon={<XCircle className="w-5 h-5" />}
          color="from-gray-600 to-gray-800"
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Search by subject, user email, or ticket ID..."
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value) }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent appearance-none"
                value={status}
                onChange={(e) => { setPage(1); setStatus(e.target.value) }}
              >
                {STATUS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <select 
              className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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

      {/* Tickets Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No tickets found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ticket Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {ticket.subject}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-mono text-xs">
                              #{ticket._id?.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.user?.name || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {ticket.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        <div className="text-xs text-gray-500">
                          {ticket.priority === 'high' && '🔴 High'}
                          {ticket.priority === 'medium' && '🟡 Medium'}
                          {ticket.priority === 'low' && '🟢 Low'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/support/${ticket._id}`}
                          className="px-3 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Link>
                        
                        <div className="relative" onMouseLeave={() => setOpenMenuId(null)}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === ticket._id ? null : ticket._id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg"
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === ticket._id}
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          <div className={`absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 z-10 ${
                            openMenuId === ticket._id ? 'opacity-100 visible' : 'opacity-0 invisible'
                          }`}>
                            <div className="py-1">
                              <button 
                                onClick={() => handleStatusChange(ticket._id, 'in_progress')}
                                disabled={actionLoadingId === ticket._id}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                Mark as In Progress
                              </button>
                              <button 
                                onClick={() => handleStatusChange(ticket._id, 'resolved')}
                                disabled={actionLoadingId === ticket._id}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                Mark as Resolved
                              </button>
                              <button 
                                onClick={() => handleStatusChange(ticket._id, 'closed')}
                                disabled={actionLoadingId === ticket._id}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Close Ticket
                              </button>
                            </div>
                          </div>
                        </div>
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
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-semibold">{total}</span> tickets
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
                        className={`w-8 h-8 text-sm font-medium rounded-lg ${
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
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
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
      <div className="text-2xl font-bold text-gray-900">{Number(value || 0).toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusConfig = {
    open: { label: 'Open', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    resolved: { label: 'Resolved', color: 'bg-green-50 text-green-600 border-green-200' },
    closed: { label: 'Closed', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  }
  
  const config = statusConfig[status] || { label: 'Unknown', color: 'bg-gray-50 text-gray-600 border-gray-200' }
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  )
}