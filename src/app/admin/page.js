'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, TrendingUp, Clock, IndianRupee, ArrowUpRight, ArrowDownRight,
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
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/transactions/stats/overview?range=${range}`
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || 'Failed to load admin stats')
        }
        const data = await res.json()
        setStats(data?.data || null)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Something went wrong')
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
    // Normalize to recharts-friendly array
    const series = stats?.trend?.daily || stats?.trend?.series || []
    return series.map(d => ({
      date: d.date || d.label,
      transactions: Number(d.transactions || d.count || 0),
      commission: Number(d.commission || 0),
      pending: Number(d.pending || d.pendingAmount || 0),
    }))
  }, [stats])

  const topStores = stats?.topStores || []
  const recentTransactions = stats?.recentTransactions || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of platform performance and operations</p>
        </div>

        <div className="flex items-center gap-2">
          <RangePill value="7d" active={range === '7d'} onClick={() => setRange('7d')} />
          <RangePill value="30d" active={range === '30d'} onClick={() => setRange('30d')} />
          <RangePill value="90d" active={range === '90d'} onClick={() => setRange('90d')} />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Transactions"
          value={overview.totalTransactions || 0}
          icon={<Activity className="w-5 h-5 text-blue-600" />}
          trendLabel="vs prev"
          trendDir={Number(overview.deltaTransactions || 0) >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(Number(overview.deltaTransactions || 0))}
        />
        <KpiCard
          title="Total Commission"
          value={Math.round(overview.totalCommission || 0)}
          prefix="₹"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          trendLabel="vs prev"
          trendDir={Number(overview.deltaCommission || 0) >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(Number(overview.deltaCommission || 0))}
        />
        <KpiCard
          title="Pending Amount"
          value={Math.round(overview.pendingAmount || 0)}
          prefix="₹"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          trendLabel="in review"
          trendDir="neutral"
        />
        <KpiCard
          title="Approved (Balance)"
          value={Math.round(overview.availableBalance || 0)}
          prefix="₹"
          icon={<IndianRupee className="w-5 h-5 text-violet-600" />}
          trendLabel="ready to payout"
          trendDir="neutral"
        />
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Performance</h3>
            <p className="text-xs text-gray-500">Daily transactions, commission and pending amounts</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 skeleton rounded-md" />
        ) : trend.length === 0 ? (
          <EmptyState message="No trend data available for the selected range." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="c3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                  formatter={(value, name) => {
                    if (name === 'commission' || name === 'pending') return [`₹${Number(value).toFixed(0)}`, name]
                    return [Number(value).toFixed(0), name]
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#2563eb" fill="url(#c1)" />
                <Area type="monotone" dataKey="commission" name="Commission (₹)" stroke="#059669" fill="url(#c2)" />
                <Area type="monotone" dataKey="pending" name="Pending (₹)" stroke="#d97706" fill="url(#c3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Transactions</h3>
            <a href="/admin/transactions" className="text-sm text-blue-600 hover:underline">View all</a>
          </div>
          {loading ? (
            <div className="h-40 skeleton rounded-md" />
          ) : recentTransactions.length === 0 ? (
            <EmptyState message="No recent transactions." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Order ID</Th>
                    <Th>User</Th>
                    <Th>Store</Th>
                    <Th className="text-right">Amount</Th>
                    <Th className="text-right">Commission</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx._id} className="border-t">
                      <Td>{tx.orderId || '-'}</Td>
                      <Td>{tx.user?.email || tx.user?._id || '-'}</Td>
                      <Td>{tx.store?.name || '-'}</Td>
                      <Td className="text-right">₹{Number(tx.amount || 0).toFixed(0)}</Td>
                      <Td className="text-right">₹{Number(tx.commission || 0).toFixed(0)}</Td>
                      <Td><StatusPill status={tx.status} /></Td>
                      <Td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Stores */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Top Stores</h3>
          </div>
          {loading ? (
            <div className="h-40 skeleton rounded-md" />
          ) : topStores.length === 0 ? (
            <EmptyState message="No top stores data." />
          ) : (
            <div className="space-y-2">
              {topStores.map((s, idx) => (
                <div key={s._id || s.storeId || idx} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{s.name || s.storeName || 'Store'}</div>
                    <div className="text-xs text-gray-500">{s.count || s.transactions || 0} transactions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{Number(s.commission || 0).toFixed(0)}</div>
                    <div className="text-xs text-gray-500">commission</div>
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

/* UI subcomponents */

function RangePill({ value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
    >
      {value}
    </button>
  )
}

function KpiCard({ title, value, prefix = '', icon, trendLabel, trendDir = 'neutral', trendValue }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-semibold mt-1">{prefix}{Number(value || 0).toLocaleString()}</div>
        </div>
        <div className="p-2 rounded-md bg-gray-50 border">{icon}</div>
      </div>
      {trendLabel && (
        <div className="flex items-center gap-1 text-xs mt-2">
          {trendDir === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-600" />}
          {trendDir === 'down' && <ArrowDownRight className="w-4 h-4 text-rose-600" />}
          <span className={trendDir === 'up' ? 'text-emerald-700' : trendDir === 'down' ? 'text-rose-700' : 'text-gray-500'}>
            {trendValue ? `${trendValue}%` : ''} {trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center h-40 border border-dashed rounded-md text-sm text-gray-500 bg-gray-50">
      {message}
    </div>
  )
}

function Th({ children, className = '' }) {
  return <th className={`p-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th>
}

function Td({ children, className = '' }) {
  return <td className={`p-2 align-top ${className}`}>{children}</td>
}