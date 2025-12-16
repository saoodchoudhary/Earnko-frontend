'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

/**
 * Admin Commissions Page
 * - Robust error handling (shows server message)
 * - Fixed reverse button bug (was using c._1 instead of c._id)
 * - Defensive parsing of API response (supports different shapes)
 * - Abortable fetch to avoid state updates on unmounted
 * - Basic filters and pagination
 */

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reversed', label: 'Reversed' },
  { value: 'under_review', label: 'Under Review' },
]

export default function AdminCommissionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [busyId, setBusyId] = useState(null)

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (status) params.set('status', status)
        if (q) params.set('q', q)

        const res = await fetch(`${base}/api/admin/commissions?${params.toString()}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })

        let data
        try {
          data = await res.json()
        } catch {
          data = null
        }

        if (!res.ok) {
          const msg = data?.message || `Failed to load commissions (HTTP ${res.status})`
          throw new Error(msg)
        }

        // Defensive parsing: support various backend shapes
        const list =
          data?.data?.commissions ||
          data?.data?.items ||
          data?.commissions ||
          data?.items ||
          []

        const totalCount =
          data?.data?.total ??
          data?.data?.totalItems ??
          (Array.isArray(list) ? list.length : 0)

        setItems(Array.isArray(list) ? list : [])
        setTotal(Number(totalCount) || 0)
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error(err.message || 'Server error while loading commissions')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [status, q, page, limit])

  const refreshCurrentPage = async () => {
    // Trigger effect to reload
    setPage(p => p)
  }

  const approve = async (id) => {
    try {
      setBusyId(id)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/commissions/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `Approve failed (HTTP ${res.status})`)
      toast.success('Commission approved')
      // Optimistic update: mark item as approved
      setItems(prev => prev.map(c => (c._id === id ? { ...c, status: 'approved' } : c)))
    } catch (err) {
      toast.error(err.message || 'Error approving commission')
    } finally {
      setBusyId(null)
    }
  }

  const reverse = async (id) => {
    try {
      setBusyId(id)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/commissions/${id}/reverse`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ reason: 'manual_admin_reversal' })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `Reverse failed (HTTP ${res.status})`)
      toast.success('Commission reversed')
      // Optimistic update: mark item as reversed
      setItems(prev => prev.map(c => (c._id === id ? { ...c, status: 'reversed' } : c)))
    } catch (err) {
      toast.error(err.message || 'Error reversing commission')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Commissions</h1>
        <div className="flex gap-2">
          <Link href="/admin/offers" className="btn btn-outline">Manage Offers</Link>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            className="input"
            placeholder="Search order ID or affiliate email..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value) }}
          />
          <select
            className="input"
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value) }}
          >
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            className="input"
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
          <button className="btn btn-outline" onClick={refreshCurrentPage}>Refresh</button>
          <div />
        </div>
      </div>

      <div className="bg-white rounded border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Affiliate</Th>
              <Th>Order</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-center">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No commissions</td></tr>
            ) : items.map(c => (
              <tr key={c._id} className="border-t">
                <Td>
                  {c.affiliate?.name || '-'}
                  <div className="text-xs text-gray-500">{c.affiliate?.email}</div>
                </Td>
                <Td>{c.transaction?.orderId || '-'}</Td>
                <Td className="text-right">₹{Number(c.amount || 0).toFixed(0)}</Td>
                <Td><StatusPill status={c.status} /></Td>
                <Td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</Td>
                <Td className="text-center space-x-2">
                  {c.status === 'pending' && (
                    <button
                      onClick={() => approve(c._id)}
                      disabled={busyId === c._id}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                    >
                      {busyId === c._id ? '...' : 'Approve'}
                    </button>
                  )}
                  {c.status !== 'reversed' && (
                    <button
                      onClick={() => reverse(c._id)}
                      disabled={busyId === c._id}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      {busyId === c._id ? '...' : 'Reverse'}
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages} • {total} items</div>
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

function StatusPill({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    reversed: 'bg-rose-50 text-rose-700 border-rose-200',
    under_review: 'bg-sky-50 text-sky-700 border-sky-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{status || '-'}</span>
}