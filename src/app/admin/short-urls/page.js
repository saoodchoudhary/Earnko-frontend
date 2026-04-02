'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Link as LinkIcon,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  CalendarRange,
  TrendingUp
} from 'lucide-react'

function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function safeArray(v) {
  return Array.isArray(v) ? v : []
}

export default function AdminShortUrlsPage() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // filters
  const [q, setQ] = useState('')
  const [range, setRange] = useState('30d') // all|7d|30d|90d
  const [sort, setSort] = useState('new') // new|clicks|earnings

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try {
        return await res.json()
      } catch {
        return null
      }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  const copyToClipboard = async (text, msg = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(msg)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const load = async () => {
    try {
      setLoading(true)
      const token = getToken()
      if (!base || !token) {
        setItems([])
        setTotal(0)
        return
      }

      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      params.set('range', range)
      params.set('sort', sort)
      if (q.trim()) params.set('q', q.trim())

      const res = await fetch(`${base}/api/admin/short-urls/performance?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const js = await safeJson(res)
      if (!res.ok) throw new Error(js?.message || `Failed (HTTP ${res.status})`)

      const data = js?.data || {}
      setItems(safeArray(data.items))
      setTotal(Number(data.total || 0))
    } catch (err) {
      toast.error(err?.message || 'Failed to load')
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // reload on changes
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, range, sort])

  // when searching, reset page
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      load()
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header (improved) */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center shadow-sm">
                <LinkIcon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                  Short URL Performance
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Global ranking by clicks/earnings with time range filters.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={load}
                disabled={loading}
                className="px-4 py-2.5 border border-gray-300 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MiniStat
              icon={<Filter className="w-4 h-4 text-gray-700" />}
              label="Range"
              value={range === 'all' ? 'All time' : range.toUpperCase()}
            />
            <MiniStat
              icon={<TrendingUp className="w-4 h-4 text-gray-700" />}
              label="Sort"
              value={sort === 'new' ? 'Newly generated' : sort === 'clicks' ? 'Most clicks' : 'Most earnings'}
            />
            <MiniStat
              icon={<CalendarRange className="w-4 h-4 text-gray-700" />}
              label="Total links"
              value={Number(total || 0).toLocaleString('en-IN')}
            />
          </div>
        </div>
      </div>

      {/* Filters Card (improved layout) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <CalendarRange className="w-4.5 h-4.5 text-gray-700" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Filters</div>
              <div className="text-xs text-gray-500">Search + time range + sort</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* search */}
          <Field label="Search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="code / slug / provider / user..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
              />
            </div>
          </Field>

          {/* range */}
          <Field label="Time range">
            <select
              value={range}
              onChange={(e) => {
                setPage(1)
                setRange(e.target.value)
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </Field>

          {/* sort */}
          <Field label="Sort by">
            <select
              value={sort}
              onChange={(e) => {
                setPage(1)
                setSort(e.target.value)
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
            >
              <option value="new">Newly generated</option>
              <option value="clicks">Most clicks</option>
              <option value="earnings">Most earnings</option>
            </select>
          </Field>

          {/* hint */}
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 flex items-start gap-2">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gray-700" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">Global Top</div>
              <div className="text-xs text-gray-500">
                Sort works on the whole dataset (not just current page).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-gray-800" />
              Links
            </h3>
            <div className="text-sm text-gray-600">
              Showing {items.length ? (page - 1) * limit + 1 : 0} - {(page - 1) * limit + items.length} of {total}
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <CalendarRange className="w-4 h-4" />
            Metrics within selected time range
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">No Links Found</h4>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Short URL</Th>
                  <Th>User</Th>
                  <Th>Provider</Th>
                  <Th className="text-right">Clicks</Th>
                  <Th className="text-right">Conversions</Th>
                  <Th className="text-right">Earnings</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((it, idx) => (
                  <tr key={it.code || idx} className="hover:bg-gray-50 transition-colors">
                    <Td>
                      <div className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block break-all">
                        {it.shortUrl || '-'}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">slug: {it.slug || '-'}</div>
                    </Td>

                    <Td>
                      <div className="text-sm font-medium text-gray-900">{it.user?.name || '-'}</div>
                      <div className="text-xs text-gray-500">{it.user?.email || ''}</div>
                    </Td>

                    <Td>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {it.provider || '-'}
                      </span>
                    </Td>

                    <Td className="text-right font-semibold text-gray-900">
                      {Number(it.clicks || 0).toLocaleString('en-IN')}
                    </Td>

                    <Td className="text-right text-gray-900">
                      {Number(it.conversions || 0).toLocaleString('en-IN')}
                    </Td>

                    <Td className="text-right font-bold text-gray-900">
                      {fmtINR(it.commissionTotal || 0)}
                      <div className="text-[11px] text-gray-500 font-normal">
                        Approved: {fmtINR(it.approvedCommission || 0)} • Pending: {fmtINR(it.pendingCommission || 0)}
                      </div>
                    </Td>

                    <Td>
                      <div className="text-sm text-gray-700">
                        {it.createdAt ? new Date(it.createdAt).toLocaleString() : '-'}
                      </div>
                    </Td>

                    <Td>
                      <div className="flex items-center gap-2">
                        {it.shortUrl && (
                          <>
                            <button
                              onClick={() => copyToClipboard(it.shortUrl, 'Copied')}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </button>
                            <a
                              href={it.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-1"
                              title="Open"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open
                            </a>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
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

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      {children}
    </div>
  )
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-gray-500">{label}</div>
        <div className="text-sm font-bold text-gray-900 truncate">{value}</div>
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
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}