'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Clock, ArrowUpRight, ArrowDownRight,
  Users, Store as StoreIcon, CreditCard, AlertCircle, DollarSign, BarChart3
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('7d') // 7d | 30d | 90d

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setLoading(true)
        setError('')

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const headers = { Authorization: token ? `Bearer ${token}` : '' }

        // Fetch all admin data in parallel (with graceful degradation)
        const requests = [
          fetch(`${base}/api/admin/transactions/stats/overview?range=${range}`, { signal: controller.signal, headers }),
          fetch(`${base}/api/admin/transactions/stats/trend?range=${range}`, { signal: controller.signal, headers }),
          fetch(`${base}/api/admin/transactions/top-stores?range=${range}&limit=5`, { signal: controller.signal, headers }),
          fetch(`${base}/api/admin/transactions/recent?limit=10`, { signal: controller.signal, headers }),
          fetch(`${base}/api/admin/users?limit=1`, { signal: controller.signal, headers }), // total users via total
          fetch(`${base}/api/admin/users?status=active&limit=1`, { signal: controller.signal, headers }), // active users via total
          fetch(`${base}/api/admin/stores?limit=1`, { signal: controller.signal, headers }).catch(() => null), // may not exist
          fetch(`${base}/api/stores?limit=1`, { signal: controller.signal, headers }).catch(() => null), // public fallback
          fetch(`${base}/api/admin/transactions?status=pending&limit=1`, { signal: controller.signal, headers }),
          fetch(`${base}/api/admin/transactions?status=under_review&limit=1`, { signal: controller.signal, headers }),
        ]

        const [
          rOverview, rTrend, rTopStores, rRecent,
          rUsers, rActiveUsers, rAdminStores, rPublicStores,
          rPending, rUnderReview
        ] = await Promise.all(requests)

        const [
          jOverview, jTrend, jTopStores, jRecent,
          jUsers, jActiveUsers, jAdminStores, jPublicStores,
          jPending, jUnderReview
        ] = await Promise.all([
          rOverview?.json().catch(() => ({})),
          rTrend?.json().catch(() => ({})),
          rTopStores?.json().catch(() => ({})),
          rRecent?.json().catch(() => ({})),
          rUsers?.json().catch(() => ({})),
          rActiveUsers?.json().catch(() => ({})),
          rAdminStores ? rAdminStores.json().catch(() => ({})) : {},
          rPublicStores ? rPublicStores.json().catch(() => ({})) : {},
          rPending?.json().catch(() => ({})),
          rUnderReview?.json().catch(() => ({})),
        ])

        const overview = jOverview?.data?.overview || {
          totalTransactions: 0, totalCommission: 0, pendingAmount: 0
        }

        const trendDaily = jTrend?.data?.trend?.daily || []
        const topStores = jTopStores?.data?.topStores || []
        const recentTransactions = jRecent?.data?.recentTransactions || []

        const totalUsers = Number(jUsers?.data?.total || 0)
        const activeUsers = Number(jActiveUsers?.data?.total || 0)

        // totalStores from admin route if present, else from public route
        let totalStores = 0
        if (jAdminStores?.data?.total) totalStores = Number(jAdminStores.data.total)
        else if (jPublicStores?.data?.total) totalStores = Number(jPublicStores.data.total)
        else if (Array.isArray(jPublicStores?.data?.stores)) totalStores = jPublicStores.data.stores.length

        const pendingCount = Number(jPending?.data?.total || 0)
        const underReviewCount = Number(jUnderReview?.data?.total || 0)
        const pendingActions = pendingCount + underReviewCount

        setStats({
          overview,
          trend: { daily: trendDaily },
          topStores,
          recentTransactions,
          counts: {
            totalUsers,
            activeUsers,
            totalStores,
            pendingActions,
          }
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load admin data')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [range])

  const overview = stats?.overview || {}
  const trend = useMemo(() => {
    const series = stats?.trend?.daily || []
    return series.map(d => ({
      date: d.date || d.label,
      transactions: Number(d.transactions || d.count || 0),
      commission: Number(d.commission || 0),
      pending: Number(d.pending || d.pendingAmount || 0),
    }))
  }, [stats])

  // Compute % deltas from last two days in trend
  const { txDeltaPct, commissionDeltaPct } = useMemo(() => {
    if (!trend || trend.length < 2) return { txDeltaPct: 0, commissionDeltaPct: 0 }
    const last = trend[trend.length - 1]
    const prev = trend[trend.length - 2]
    const pct = (cur, prev) => {
      const p = Number(prev || 0)
      const c = Number(cur || 0)
      if (p <= 0) return c > 0 ? 100 : 0
      return ((c - p) / p) * 100
    }
    return {
      txDeltaPct: Math.round(pct(last.transactions, prev.transactions) * 10) / 10,
      commissionDeltaPct: Math.round(pct(last.commission, prev.commission) * 10) / 10,
    }
  }, [trend])

  const topStores = stats?.topStores || []
  const recentTransactions = stats?.recentTransactions || []

  const adminStats = {
    totalUsers: stats?.counts?.totalUsers || 0,
    activeUsers: stats?.counts?.activeUsers || 0,
    totalStores: stats?.counts?.totalStores || 0,
    pendingActions: stats?.counts?.pendingActions || 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of platform performance and operations</p>
      </div>

      {/* Range Selector */}
      <div className="flex items-center gap-2 mb-6">
        {['7d', '30d', '90d'].map((period) => (
          <button
            key={period}
            onClick={() => setRange(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              range === period
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last {period}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Main Stats (real data + real trend %) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={Math.round(overview.totalCommission || 0)}
          prefix="₹"
          icon={<DollarSign className="w-5 h-5" />}
          color="from-gray-700 to-gray-900"
          trend={commissionDeltaPct}
        />
        <StatCard
          title="Total Transactions"
          value={overview.totalTransactions || 0}
          icon={<Activity className="w-5 h-5" />}
          color="from-blue-600 to-blue-800"
          trend={txDeltaPct}
        />
        <StatCard
          title="Active Users"
          value={adminStats.activeUsers}
          icon={<Users className="w-5 h-5" />}
          color="from-green-600 to-green-800"
        />
        <StatCard
          title="Pending Actions"
          value={adminStats.pendingActions}
          icon={<AlertCircle className="w-5 h-5" />}
          color="from-amber-600 to-amber-800"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat
          title="Total Users"
          value={adminStats.totalUsers}
          icon={<Users className="w-4 h-4" />}
        />
        <MiniStat
          title="Total Stores"
          value={adminStats.totalStores}
          icon={<StoreIcon className="w-4 h-4" />}
        />
        <MiniStat
          title="Pending Amount"
          value={`₹${Math.round(overview.pendingAmount || 0).toLocaleString()}`}
          icon={<Clock className="w-4 h-4" />}
        />
        <MiniStat
          title="Available Balance"
          value={`₹${Math.round(overview.availableBalance || 0).toLocaleString()}`}
          icon={<CreditCard className="w-4 h-4" />}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
            <p className="text-gray-600 text-sm mt-1">Daily metrics over selected period</p>
          </div>
          <div className="text-sm text-gray-500">
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
        ) : trend.length === 0 ? (
          <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">No Data Available</h4>
            <p className="text-gray-500 text-sm">No trend data for selected time range</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#374151" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#374151" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white'
                  }}
                  formatter={(value, name) => {
                    if (name === 'commission' || name === 'pending') 
                      return [`₹${Number(value).toLocaleString()}`, name]
                    return [Number(value).toLocaleString(), name]
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="transactions" 
                  name="Transactions" 
                  stroke="#374151" 
                  fill="url(#colorTransactions)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="commission" 
                  name="Commission" 
                  stroke="#059669" 
                  fill="url(#colorCommission)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  name="Pending" 
                  stroke="#d97706" 
                  fill="url(#colorPending)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <p className="text-gray-600 text-sm mt-1">Latest platform transactions</p>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">No recent transactions</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentTransactions.slice(0, 5).map((tx, index) => (
                <div key={tx._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.status === 'confirmed' ? 'bg-green-100' :
                        tx.status === 'pending' || tx.status === 'under_review' ? 'bg-amber-100' :
                        'bg-gray-100'
                      }`}>
                        <CreditCard className={`w-4 h-4 ${
                          tx.status === 'confirmed' ? 'text-green-600' :
                          tx.status === 'pending' || tx.status === 'under_review' ? 'text-amber-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tx.orderId?.substring(0, 12) || 'N/A'}...
                        </div>
                        <div className="text-xs text-gray-500">
                          {tx.user?.email?.split('@')[0] || 'User'} • {tx.store?.name || 'Store'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        ₹{Number(tx.amount || tx.commissionAmount || 0).toFixed(0)}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                        tx.status === 'pending' || tx.status === 'under_review' ? 'bg-amber-100 text-amber-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {tx.status || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recentTransactions.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <a 
                href="/admin/transactions" 
                className="text-sm text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1"
              >
                View All Transactions
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Top Stores */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Top Performing Stores</h3>
            <p className="text-gray-600 text-sm mt-1">Stores by commission generated</p>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : topStores.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">No store data available</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {topStores.slice(0, 5).map((store, index) => (
                <div key={store.storeId || store._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-amber-100' :
                        index === 1 ? 'bg-gray-100' :
                        index === 2 ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <StoreIcon className={`w-4 h-4 ${
                          index === 0 ? 'text-amber-600' :
                          index === 1 ? 'text-gray-600' :
                          index === 2 ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {store.name || store.storeName || 'Store'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {store.transactions || store.count || 0} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        ₹{Number(store.commission || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">commission</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, prefix = '', icon, color, trend }) {
  const hasTrend = typeof trend === 'number'
  const isPositive = (trend || 0) >= 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        {hasTrend && (
          <div className={`text-sm font-medium flex items-center gap-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(Number(trend || 0)).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {prefix}{typeof value === 'number' ? Number(value).toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}

function MiniStat({ title, value, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{title}</div>
        </div>
      </div>
    </div>
  )
}