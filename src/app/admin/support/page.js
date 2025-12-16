'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { MessageSquare } from 'lucide-react'

const STATUS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminSupportPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
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

        const res = await fetch(`${base}/api/admin/support/tickets?${params}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load tickets')
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
  }, [q, status, page, limit])

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Support Tickets
        </h1>
      </div>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            className="input"
            placeholder="Search subject or user email..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value) }}
          />
          <select className="input" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }}>
            {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => setPage(1)}>Apply</button>
          <div />
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Subject</Th>
              <Th>User</Th>
              <Th>Status</Th>
              <Th>Last Update</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No tickets</td></tr>
            ) : items.map(t => (
              <tr key={t._id} className="border-t">
                <Td>
                  <div className="font-medium">{t.subject}</div>
                  <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                </Td>
                <Td>
                  <div className="text-sm">{t.user?.name || '-'}</div>
                  <div className="text-xs text-gray-500">{t.user?.email || '-'}</div>
                </Td>
                <Td><Status status={t.status} /></Td>
                <Td>{new Date(t.updatedAt).toLocaleString()}</Td>
                <Td className="text-right">
                  <Link href={`/admin/support/${t._id}`} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">View</Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages} • {total} tickets</div>
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
function Status({ status }) {
  const map = {
    open: 'bg-sky-50 text-sky-700 border-sky-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-gray-50 text-gray-700 border-gray-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{status || '-'}</span>
}