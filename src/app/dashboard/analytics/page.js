'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  BarChart3, DollarSign,
  Download, RefreshCw,
  Link as LinkIcon, Copy, ExternalLink, Shield, CalendarRange, Check
} from 'lucide-react'

function toDateInputValue(d) {
  if (!d) return ''
  const x = new Date(d)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth() + 1).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function todayInput() {
  return toDateInputValue(new Date())
}

function startOfMonth(d = new Date()) {
  const x = new Date(d)
  x.setDate(1)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfLastMonth() {
  const now = new Date()
  const x = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfLastMonth() {
  const now = new Date()
  const x = new Date(now.getFullYear(), now.getMonth(), 0)
  x.setHours(23, 59, 59, 999)
  return x
}

function utcRangeFromInputs(fromStr, toStr) {
  if (!fromStr || !toStr) return null

  const [fy, fm, fd] = fromStr.split('-').map(Number)
  const [ty, tm, td] = toStr.split('-').map(Number)

  if (![fy, fm, fd, ty, tm, td].every(Number.isFinite)) return null

  const from = new Date(Date.UTC(fy, fm - 1, fd, 0, 0, 0, 0))
  const to = new Date(Date.UTC(ty, tm - 1, td, 23, 59, 59, 999))

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null
  if (from.getTime() > to.getTime()) return null

  return { from, to }
}

function daysBetweenInclusiveUTC(from, to) {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
  return Math.floor((b - a) / (1000 * 60 * 60 * 24)) + 1
}

function safeArray(v) {
  return Array.isArray(v) ? v : []
}

function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function UserAnalyticsPage() {
  const [mode, setMode] = useState('current_month')

  const [customFrom, setCustomFrom] = useState(toDateInputValue(startOfMonth()))
  const [customTo, setCustomTo] = useState(toDateInputValue(new Date()))

  const [appliedCustom, setAppliedCustom] = useState(() => ({
    from: toDateInputValue(startOfMonth()),
    to: toDateInputValue(new Date()),
  }))

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [summary, setSummary] = useState({
    clicksTotal: 0,
    conversionsTotal: 0,
    commissionTotal: 0,
    pendingAmount: 0,
    approvedAmount: 0,
  })
  const [daily, setDaily] = useState([])

  // short urls performance
  const [linksLoading, setLinksLoading] = useState(true)
  const [links, setLinks] = useState([])

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const linkPerformanceRef = useRef(null)

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { return await res.json() } catch { return null }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  const copyToClipboard = async (text, msg = 'Copied') => {
    try { await navigator.clipboard.writeText(text); toast.success(msg) }
    catch { toast.error('Failed to copy') }
  }

  const viewLinkPerformance = () => {
    if (!linkPerformanceRef.current) return
    linkPerformanceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function getActiveRange() {
    if (mode === 'current_month') {
      return { from: startOfMonth(), to: new Date() }
    }
    if (mode === 'last_month') {
      return { from: startOfLastMonth(), to: endOfLastMonth() }
    }

    const r = utcRangeFromInputs(appliedCustom.from, appliedCustom.to)
    if (!r) return null

    const days = daysBetweenInclusiveUTC(r.from, r.to)
    if (days > 90) return null

    return { from: r.from, to: r.to }
  }

  function buildAnalyticsQuery(range) {
    const params = new URLSearchParams()
    if (!range?.from || !range?.to) return params
    params.set('from', range.from.toISOString())
    params.set('to', range.to.toISOString())
    return params
  }

  const loadAnalytics = async (signal, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)

      const token = getToken()
      if (!base || !token) {
        setSummary({ clicksTotal: 0, conversionsTotal: 0, commissionTotal: 0, pendingAmount: 0, approvedAmount: 0 })
        setDaily([])
        return
      }

      const range = getActiveRange()
      if (!range) {
        if (mode === 'custom') toast.error('Invalid range (max 90 days)')
        setSummary({ clicksTotal: 0, conversionsTotal: 0, commissionTotal: 0, pendingAmount: 0, approvedAmount: 0 })
        setDaily([])
        return
      }

      const qs = buildAnalyticsQuery(range)
      const res = await fetch(`${base}/api/user/analytics?${qs.toString()}`, {
        signal,
        headers: { Authorization: `Bearer ${token}` }
      })

      const js = await safeJson(res)
      if (!res.ok) throw new Error(js?.message || `Failed to load analytics (HTTP ${res.status})`)

      const data = js?.data || {}
      setSummary({
        clicksTotal: Number(data?.summary?.clicksTotal || 0),
        conversionsTotal: Number(data?.summary?.conversionsTotal || 0),
        commissionTotal: Number(data?.summary?.commissionTotal || 0),
        pendingAmount: Number(data?.summary?.pendingAmount || 0),
        approvedAmount: Number(data?.summary?.approvedAmount || 0),
      })
      setDaily(Array.isArray(data?.daily) ? data.daily : [])
    } catch (err) {
      if (err?.name !== 'AbortError') toast.error(err?.message || 'Error loading analytics')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  /**
   * ✅ Load short links performance for SAME RANGE (server-side)
   */
  const loadLinks = async (signal) => {
    try {
      setLinksLoading(true)
      const token = getToken()
      if (!base || !token) {
        setLinks([])
        return
      }

      const range = getActiveRange()
      if (!range) {
        setLinks([])
        return
      }

      const qs = new URLSearchParams()
      qs.set('from', range.from.toISOString())
      qs.set('to', range.to.toISOString())
      qs.set('limit', '200')

      const res = await fetch(`${base}/api/user/short-urls/performance?${qs.toString()}`, {
        signal,
        headers: { Authorization: `Bearer ${token}` }
      })
      const js = await safeJson(res)
      if (!res.ok) {
        toast.error(js?.message || `Failed to load links (HTTP ${res.status})`)
        setLinks([])
        return
      }

      const list = safeArray(js?.data?.items)
      setLinks(list)
    } catch (err) {
      if (err?.name !== 'AbortError') toast.error('Error loading links')
      setLinks([])
    } finally {
      setLinksLoading(false)
    }
  }

  useEffect(() => {
    if (mode !== 'custom') return
    if (!customFrom || !customTo) return
    if (customFrom > customTo) setCustomTo(customFrom)
  }, [mode, customFrom, customTo])

  useEffect(() => {
    const controller = new AbortController()
    loadAnalytics(controller.signal)
    loadLinks(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, appliedCustom.from, appliedCustom.to])

  const chartData = useMemo(() => safeArray(daily), [daily])

  const downloadReport = () => {
    const range = getActiveRange()
    const report = {
      periodMode: mode,
      customFrom: mode === 'custom' ? appliedCustom.from : null,
      customTo: mode === 'custom' ? appliedCustom.to : null,
      generatedAt: new Date().toISOString(),
      effectiveRange: range ? { from: range.from.toISOString(), to: range.to.toISOString() } : null,
      summary,
      daily,
      shortUrls: links,
    }
    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `analytics-${mode}-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Report downloaded successfully!')
  }

  const refresh = () => {
    setRefreshing(true)
    const controller = new AbortController()
    loadAnalytics(controller.signal, false)
    loadLinks(controller.signal)
  }

  const applyCustomRange = () => {
    const r = utcRangeFromInputs(customFrom, customTo)
    if (!r) {
      toast.error('Invalid date range')
      return
    }
    const days = daysBetweenInclusiveUTC(r.from, r.to)
    if (days > 90) {
      toast.error('Custom range can be maximum 90 days')
      return
    }
    setAppliedCustom({ from: customFrom, to: customTo })
    toast.success('Time range applied')
  }

  const customDaysText = useMemo(() => {
    const r = utcRangeFromInputs(customFrom, customTo)
    if (!r) return ''
    const days = daysBetweenInclusiveUTC(r.from, r.to)
    return `${days} day(s)`
  }, [customFrom, customTo])

  const sortedLinks = useMemo(() => {
    const arr = safeArray(links).slice()
    arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return arr
  }, [links])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
                <p className="text-blue-100 mt-1">Track your performance and earnings</p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={refresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={downloadReport}
                  className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <button
                onClick={viewLinkPerformance}
                className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                View Short Links
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <CalendarRange className="w-5 h-5 text-blue-600" />
                      Select time range
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Current Month, Last Month, or Custom (max 90 days)</p>
                  </div>

                  {mode === 'custom' && (
                    <div className="text-xs text-gray-500 text-right">
                      {customDaysText ? `Selected: ${customDaysText}` : 'Select dates'}
                      <div className="mt-1">
                        Applied: <span className="font-semibold">{appliedCustom.from}</span> → <span className="font-semibold">{appliedCustom.to}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="inline-flex rounded-2xl bg-gray-100 p-1 w-fit">
                    <Chip active={mode === 'current_month'} onClick={() => setMode('current_month')}>Current Month</Chip>
                    <Chip active={mode === 'last_month'} onClick={() => setMode('last_month')}>Last Month</Chip>
                    <Chip active={mode === 'custom'} onClick={() => setMode('custom')}>Custom</Chip>
                  </div>

                  {mode === 'custom' && (
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">From</div>
                        <input
                          type="date"
                          value={customFrom}
                          max={todayInput()}
                          onChange={(e) => setCustomFrom(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">To</div>
                        <input
                          type="date"
                          value={customTo}
                          min={customFrom || undefined}
                          max={todayInput()}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                      </div>

                      <button
                        onClick={applyCustomRange}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                        title="Apply custom range"
                      >
                        <Check className="w-4 h-4" />
                        Apply
                      </button>

                      <div className="text-xs text-gray-500">
                        Max 90 days
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Total Commission" value={fmtINR(summary.commissionTotal || 0)} icon={<DollarSign className="w-5 h-5" />} color="from-purple-500 to-pink-600" />
              <StatCard title="Pending Amount" value={fmtINR(summary.pendingAmount || 0)} icon={<ClockIcon className="w-5 h-5" />} color="from-amber-500 to-orange-600" />
              <StatCard title="Approved Amount" value={fmtINR(summary.approvedAmount || 0)} icon={<CheckCircleIcon className="w-5 h-5" />} color="from-indigo-500 to-purple-600" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
                  <p className="text-gray-600 text-sm mt-1">Daily metrics over time</p>
                </div>
              </div>

              {loading ? (
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
              ) : chartData.length === 0 ? (
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
                  <h4 className="text-lg font-medium text-gray-700 mb-1">No Data Available</h4>
                  <p className="text-gray-500 text-sm">No analytics data for selected time range</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}
                        formatter={(value, name) => {
                          if (name === 'commission') return [`₹${Number(value).toFixed(0)}`, 'Commission']
                          if (name === 'clicks') return [Number(value).toFixed(0), 'Clicks']
                          if (name === 'conversions') return [Number(value).toFixed(0), 'Conversions']
                          return [value, name]
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" fill="url(#colorClicks)" strokeWidth={2} />
                      <Area type="monotone" dataKey="conversions" name="Conversions" stroke="#10b981" fill="url(#colorConversions)" strokeWidth={2} />
                      <Area type="monotone" dataKey="commission" name="Commission" stroke="#8b5cf6" fill="url(#colorCommission)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Short Links performance */}
            <div ref={linkPerformanceRef} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    Your Short Links
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Clicks & earnings for links in selected time range.
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {linksLoading ? 'Loading...' : `${sortedLinks.length} link(s)`}
                </div>
              </div>

              {linksLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (<div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />))}
                </div>
              ) : sortedLinks.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                  <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No short links found in this range</p>
                  <p className="text-xs text-gray-500 mt-1">Try a different time range</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sortedLinks.map((it, idx) => {
                    const url = it.shortUrl || ''
                    const createdAt = it.createdAt ? new Date(it.createdAt) : null

                    return (
                      <div key={it.code || idx} className="border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow bg-gradient-to-b from-white to-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs text-gray-500">Short URL</div>
                            <div className="text-sm text-gray-700 break-all line-clamp-2 sm:line-clamp-1">
                              {url || '-'}
                            </div>
                            <div className="mt-2 text-[11px] text-gray-500">
                              {createdAt ? createdAt.toLocaleString() : ''}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {url && (
                              <>
                                <button
                                  className="px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                  onClick={() => copyToClipboard(url, 'Short URL copied')}
                                  title="Copy Short URL"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </button>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                  title="Open Short URL"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Open
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        {/* ✅ performance rows */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <MiniStat label="Clicks" value={Number(it.clicks || 0).toLocaleString('en-IN')} />
                          <MiniStat label="Conv." value={Number(it.conversionsTotal || 0).toLocaleString('en-IN')} />
                          <MiniStat label="Earning" value={fmtINR(it.commissionTotal || 0)} />
                        </div>

                        {/* <div className="mt-2 grid grid-cols-2 gap-2">
                          <MiniStat label="Approved" value={`${Number(it.approvedConversions || 0)} / ${fmtINR(it.approvedCommission || 0)}`} />
                          <MiniStat label="Pending" value={`${Number(it.pendingConversions || 0)} / ${fmtINR(it.pendingCommission || 0)}`} />
                        </div> */}

                        {/* <div className="mt-2 text-[11px] text-gray-500">
                          Provider: <span className="font-semibold">{it.provider || '-'}</span>
                        </div> */}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Showing link performance only for the selected time range.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={downloadReport}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
                <button
                  onClick={refresh}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </button>
              </div>

              {mode === 'custom' && (
                <div className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  Custom range must be within <span className="font-semibold">90 days</span>.
                  Use <span className="font-semibold">Apply</span> to fetch new data.
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
              <div className="text-sm text-gray-700 font-semibold">Summary</div>
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Clicks" value={Number(summary.clicksTotal || 0).toLocaleString('en-IN')} />
                <Row label="Conversions" value={Number(summary.conversionsTotal || 0).toLocaleString('en-IN')} />
                <Row label="Commission" value={fmtINR(summary.commissionTotal || 0)} />
                <Row label="Approved" value={fmtINR(summary.approvedAmount || 0)} />
                <Row label="Pending" value={fmtINR(summary.pendingAmount || 0)} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
      `}</style>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-sm font-extrabold text-gray-900">{value}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-gray-600">{label}</div>
      <div className="font-bold text-gray-900">{value}</div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-extrabold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}

const ClockIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)