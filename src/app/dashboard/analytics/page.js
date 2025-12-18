'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

export default function UserAnalyticsPage() {
  const [range, setRange] = useState('30d') // '7d' | '30d' | '90d'
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    clicksTotal: 0,
    conversionsTotal: 0,
    commissionTotal: 0,
    pendingAmount: 0,
    approvedAmount: 0,
  })
  const [daily, setDaily] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const res = await fetch(`${base}/api/user/analytics?range=${range}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const js = await res.json()
        if (!res.ok) throw new Error(js?.message || 'Failed to load analytics')
        setSummary(js?.data?.summary || {})
        setDaily(js?.data?.daily || [])
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [range])

  const chartData = useMemo(() => Array.isArray(daily) ? daily : [], [daily])

  return (
    <main className="min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex gap-2">
          <Range value="7d" active={range === '7d'} onClick={() => setRange('7d')} />
          <Range value="30d" active={range === '30d'} onClick={() => setRange('30d')} />
          <Range value="90d" active={range === '90d'} onClick={() => setRange('90d')} />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Kpi title="Total Clicks" value={summary?.clicksTotal || 0} />
        <Kpi title="Conversions" value={summary?.conversionsTotal || 0} />
        <Kpi title="Commission (₹)" value={Number(summary?.commissionTotal || 0).toFixed(0)} />
        <Kpi title="Pending (₹)" value={Number(summary?.pendingAmount || 0).toFixed(0)} />
        <Kpi title="Approved (₹)" value={Number(summary?.approvedAmount || 0).toFixed(0)} />
      </section>

      <section className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Performance</h3>
            <p className="text-xs text-gray-500">Daily clicks, conversions and commission</p>
          </div>
        </div>

        {loading ? (
          <div className="h-72 skeleton rounded" />
        ) : chartData.length === 0 ? (
          <div className="h-40 border border-dashed rounded flex items-center justify-center text-sm text-gray-500 bg-gray-50">
            No data for selected range.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
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
                    if (name === 'commission') return [`₹${Number(value).toFixed(0)}`, 'Commission']
                    if (name === 'clicks') return [Number(value).toFixed(0), 'Clicks']
                    if (name === 'conversions') return [Number(value).toFixed(0), 'Conversions']
                    return [value, name]
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#2563eb" fill="url(#g1)" />
                <Area type="monotone" dataKey="conversions" name="Conversions" stroke="#059669" fill="url(#g2)" />
                <Area type="monotone" dataKey="commission" name="Commission (₹)" stroke="#d97706" fill="url(#g3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  )
}

function Kpi({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{typeof value === 'number' ? Number(value).toLocaleString() : value}</div>
    </div>
  )
}
function Range({ value, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
      {value}
    </button>
  )
}