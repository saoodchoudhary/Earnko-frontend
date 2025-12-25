'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  MousePointer, Search, Filter, Download,
  ChevronLeft, ChevronRight, Calendar, User,
  Store, Globe, Clock, RefreshCw, Eye
} from 'lucide-react'

export default function AdminClicksPage() {
  const [items, setItems] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [q, setQ] = useState('')
  const [storeId, setStoreId] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [dateRange, setDateRange] = useState('all')
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueUsers: 0,
    topStore: null
  })

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  // Load stores
  useEffect(() => {
    const controller = new AbortController()
    async function loadStores() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/stores`, { 
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (res.ok) setStores(data?.data?.stores || [])
      } catch {}
    }
    loadStores()
    return () => controller.abort()
  }, [])

  // Load clicks and stats
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const params = new URLSearchParams({ 
          page: String(page), 
          limit: String(limit) 
        })
        if (q) params.set('q', q)
        if (storeId) params.set('storeId', storeId)
        if (dateRange !== 'all') params.set('dateRange', dateRange)
        
        // Load clicks
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/clicks?${params.toString()}`, {
          signal: controller.signal, 
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load clicks')
        setItems(data?.data?.items || [])
        setTotal(data?.data?.total || 0)

        // Load stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/clicks/stats?${params.toString()}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.data || {
            totalClicks: data?.data?.total || 0,
            uniqueUsers: 0,
            topStore: null
          })
        }

      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }
    load()
    return () => controller.abort()
  }, [q, storeId, page, limit, dateRange])

  const refreshData = () => {
    setRefreshing(true)
    setPage(1)
  }

  const exportClicks = () => {
    const data = items.map(item => ({
      Slug: item.customSlug || '-',
      User: item.user?.email || item.user?._id || '-',
      Store: item.store?.name || '-',
      IP: item.ipAddress || item.ip || '-',
      UserAgent: item.userAgent || '-',
      Date: item.createdAt ? new Date(item.createdAt).toISOString() : '-'
    }))
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Clicks exported successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clicks Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor all affiliate link clicks across the platform</p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Clicks" 
          value={stats.totalClicks}
          icon={<MousePointer className="w-5 h-5" />}
          color="from-gray-700 to-gray-900"
        />
        <StatCard 
          title="Unique Users" 
          value={stats.uniqueUsers}
          icon={<User className="w-5 h-5" />}
          color="from-blue-600 to-blue-800"
        />
        <StatCard 
          title="Top Store" 
          value={stats.topStore?.name || 'None'}
          icon={<Store className="w-5 h-5" />}
          color="from-green-600 to-green-800"
          description={`${stats.topStore?.clicks || 0} clicks`}
        />
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Filter className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Filter Clicks</h2>
            <p className="text-gray-600 text-sm mt-1">Search and filter click records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm"
              placeholder="Search slug, IP, user agent..."
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value) }}
            />
          </div>
          
          <select
            className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm"
            value={storeId}
            onChange={(e) => { setPage(1); setStoreId(e.target.value) }}
          >
            <option value="">All Stores</option>
            {stores.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <select
            className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm"
            value={dateRange}
            onChange={(e) => { setPage(1); setDateRange(e.target.value) }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select
            className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm"
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>

          <button
            onClick={exportClicks}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Clicks Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Click Records</h3>
          <p className="text-gray-600 text-sm mt-1">Detailed click tracking information</p>
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
          <div className="p-6 text-center">
            <MousePointer className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">No Clicks Found</h4>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Slug</Th>
                  <Th>User</Th>
                  <Th>Store</Th>
                  <Th>IP Address</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(click => (
                  <tr key={click._id} className="hover:bg-gray-50 transition-colors">
                    <Td>
                      <div className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                        {click.customSlug?.substring(0, 12)}...
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {click.user?.email?.split('@')[0] || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {click.user?.email || click.user?._id?.substring(0, 8) || '-'}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Store className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {click.store?.name || '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {click.store?._id?.substring(0, 8) || '-'}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <Globe className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {click.ipAddress || click.ip || '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {click.country || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Clock className="w-3 h-3 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {click.createdAt ? new Date(click.createdAt).toLocaleDateString() : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {click.createdAt ? new Date(click.createdAt).toLocaleTimeString() : '-'}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <button
                        onClick={() => {
                          // View details modal would go here
                          toast.success(`Viewing click ${click._id?.substring(0, 8)}...`)
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> clicks
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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

function StatCard({ title, value, icon, color, description }) {
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
      {description && (
        <div className="text-xs text-gray-400 mt-2">{description}</div>
      )}
    </div>
  )
}