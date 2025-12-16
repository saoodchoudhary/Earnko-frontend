'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'under_review', label: 'Under Review' },
]

export default function AdminTransactionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [range, setRange] = useState('7d')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (q) params.set('q', q)
        if (status) params.set('status', status)
        if (range) params.set('range', range)

        const res = await fetch(`${base}/api/admin/transactions?${params.toString()}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load transactions')

        setItems(data?.data?.items || [])
        setTotal(data?.data?.total || 0)
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [q, status, range, page, limit])

  const updateStatus = async (id, next) => {
    try {
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/transactions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ status: next })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update')
      toast.success('Status updated')
      // refresh current page
      const copy = items.map(i => (i._id === id ? { ...i, status: next } : i))
      setItems(copy)
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Transactions</h1>
      </div>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="Search order id..."
            className="input"
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value) }}
          />
          <select className="input" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }}>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="flex gap-2">
            <RangePill label="7d" active={range === '7d'} onClick={() => { setPage(1); setRange('7d') }} />
            <RangePill label="30d" active={range === '30d'} onClick={() => { setPage(1); setRange('30d') }} />
            <RangePill label="90d" active={range === '90d'} onClick={() => { setPage(1); setRange('90d') }} />
          </div>
          <select className="input" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Order ID</Th>
              <Th>User</Th>
              <Th>Store</Th>
              <Th className="text-right">Amount</Th>
              <Th className="text-right">Commission</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-500">No transactions</td></tr>
            ) : items.map(tx => (
              <tr key={tx._id} className="border-t">
                <Td>{tx.orderId || '-'}</Td>
                <Td>{tx.user?.email || tx.user?._id || '-'}</Td>
                <Td>{tx.store?.name || '-'}</Td>
                <Td className="text-right">₹{Number(tx.productAmount || 0).toFixed(0)}</Td>
                <Td className="text-right">₹{Number(tx.commissionAmount || 0).toFixed(0)}</Td>
                <Td><StatusPill status={tx.status} /></Td>
                <Td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}</Td>
                <Td>
                  <div className="flex gap-2">
                    {['pending','under_review','cancelled','confirmed'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(tx._id, s)}
                        className={`px-2 py-1 rounded text-xs border ${tx.status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages} • {total} items
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
          <button className="btn btn-primary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
    </main>
  )
}

function Th({ children, className = '' }) {
  return <th className={`px-3 py-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th>
}
function Td({ children, className = '' }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>
}
function RangePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
    >
      {label}
    </button>
  )
}
function StatusPill({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    under_review: 'bg-sky-50 text-sky-700 border-sky-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{status || '-'}</span>
}