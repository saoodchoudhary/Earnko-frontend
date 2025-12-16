'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import Link from 'next/link'

export default function AdminStoreDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [store, setStore] = useState(null)
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [recentClicks, setRecentClicks] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')
  const [saving, setSaving] = useState(false)
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const h = { Authorization: token ? `Bearer ${token}` : '' }

        const [r1, r2, r3, r4] = await Promise.all([
          fetch(`${base}/api/admin/stores/${id}`, { signal: controller.signal, headers: h }),
          fetch(`${base}/api/admin/stores/${id}/stats`, { signal: controller.signal, headers: h }),
          fetch(`${base}/api/admin/stores/${id}/trend?range=${range}`, { signal: controller.signal, headers: h }),
          fetch(`${base}/api/admin/stores/${id}/recent?limit=10`, { signal: controller.signal, headers: h }),
        ])
        if (!r1.ok || !r2.ok || !r3.ok || !r4.ok) throw new Error('Failed to load store details')

        const d1 = await r1.json(); const d2 = await r2.json(); const d3 = await r3.json(); const d4 = await r4.json()
        setStore(d1?.data?.item || null)
        setStats(d2?.data || null)
        setTrend(d3?.data?.daily || [])
        setRecentTx(d4?.data?.recentTransactions || [])
        setRecentClicks(d4?.data?.recentClicks || [])
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading store')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [id, range])

  const toggleActive = async () => {
    try {
      if (!store) return
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/stores/${store._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ isActive: !store.isActive })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update')
      setStore(data.data.item)
      toast.success('Updated')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{store?.name || 'Store'}</h1>
          <div className="text-sm text-gray-600">
            {store?.baseUrl ? <a href={store.baseUrl} className="hover:underline" target="_blank">Visit store</a> : '—'}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/stores/${id}/edit`} className="btn btn-outline">Edit</Link>
          <button onClick={toggleActive} disabled={saving} className="btn btn-primary">
            {store?.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi title="Total Clicks" value={stats?.clicksTotal || 0} />
        <Kpi title="Transactions" value={stats?.transactions || 0} />
        <Kpi title="Commission" value={stats ? `₹${Number(stats.commissionTotal || 0).toFixed(0)}` : '₹0'} />
        <Kpi title="Pending" value={stats ? `₹${Number(stats.pendingAmount || 0).toFixed(0)}` : '₹0'} />
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Performance</h3>
            <p className="text-xs text-gray-500">Daily clicks, transactions and commission</p>
          </div>
          <div className="flex gap-2">
            <Range value="7d" active={range === '7d'} onClick={() => setRange('7d')} />
            <Range value="30d" active={range === '30d'} onClick={() => setRange('30d')} />
            <Range value="90d" active={range === '90d'} onClick={() => setRange('90d')} />
          </div>
        </div>
        {loading ? (
          <div className="h-64 skeleton rounded" />
        ) : trend.length === 0 ? (
          <Empty message="No data for selected range." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    if (name === 'commission') return [`₹${Number(value).toFixed(0)}`, name]
                    return [Number(value).toFixed(0), name]
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#2563eb" fill="url(#g1)" />
                <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#059669" fill="url(#g2)" />
                <Area type="monotone" dataKey="commission" name="Commission (₹)" stroke="#d97706" fill="url(#g3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Link className="text-sm text-blue-600 hover:underline" href="/admin/transactions">View all</Link>
          </div>
          {loading ? (
            <div className="h-40 skeleton rounded" />
          ) : recentTx.length === 0 ? (
            <Empty message="No transactions yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Order ID</Th>
                    <Th>User</Th>
                    <Th className="text-right">Amount</Th>
                    <Th className="text-right">Commission</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map(tx => (
                    <tr key={tx._id} className="border-t">
                      <Td>{tx.orderId || '-'}</Td>
                      <Td>{tx.user?.email || tx.user?._id || '-'}</Td>
                      <Td className="text-right">₹{Number(tx.productAmount || 0).toFixed(0)}</Td>
                      <Td className="text-right">₹{Number(tx.commissionAmount || 0).toFixed(0)}</Td>
                      <Td><Status status={tx.status} /></Td>
                      <Td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Clicks</h3>
          </div>
          {loading ? (
            <div className="h-40 skeleton rounded" />
          ) : recentClicks.length === 0 ? (
            <Empty message="No clicks yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Slug</Th>
                    <Th>IP</Th>
                    <Th>User Agent</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentClicks.map(c => (
                    <tr key={c._id} className="border-t">
                      <Td>{c.customSlug || '-'}</Td>
                      <Td>{c.ipAddress || c.ip || '-'}</Td>
                      <Td className="max-w-[260px] truncate" title={c.userAgent || ''}>{c.userAgent || '-'}</Td>
                      <Td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
function Empty({ message }) {
  return <div className="flex items-center justify-center h-40 border border-dashed rounded text-sm text-gray-500 bg-gray-50">{message}</div>
}
function Th({ children, className = '' }) {
  return <th className={`p-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th>
}
function Td({ children, className = '' }) {
  return <td className={`p-2 align-top ${className}`}>{children}</td>
}
function Status({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    under_review: 'bg-sky-50 text-sky-700 border-sky-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{status || '-'}</span>
}