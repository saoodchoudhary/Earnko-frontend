'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const STATUS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reversed', label: 'Reversed' },
  { value: 'under_review', label: 'Under Review' },
]

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  async function load() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ page, limit })
      if (status) params.append('status', status)
      if (q) params.append('q', q)
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/commissions?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (res.ok) {
        setCommissions(data.data.commissions || data.data.items || [])
        setTotal(data.data.total || data.data.totalItems || (data.data.commissions || []).length)
      } else toast.error(data.message || 'Failed to load')
    } catch (err) { console.error(err); toast.error('Server error') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [status, page, limit]) // q on submit

  async function approve(id) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/commissions/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (res.ok) { toast.success('Approved'); load() }
      else toast.error(data.message || 'Failed')
    } catch (err) { console.error(err); toast.error('Error') }
  }

  async function reverse(id) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/commissions/${id}/reverse`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ reason: 'manual_admin_reversal' })
      })
      const data = await res.json()
      if (res.ok) { toast.success('Reversed'); load() }
      else toast.error(data.message || 'Failed')
    } catch (err) { console.error(err); toast.error('Error') }
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Commissions</h1>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="Search order or email..."
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load() } }}
          />
          <select className="input" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }}>
            {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
          <button onClick={() => { setPage(1); load() }} className="btn btn-primary">Apply</button>
        </div>
      </div>

      <div className="bg-white rounded border overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Affiliate</Th>
              <Th>Order</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-center">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : commissions.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No commissions</td></tr>
            ) : commissions.map(c => (
              <tr key={c._id} className="border-t">
                <Td>
                  {c.affiliate?.name || '-'}
                  <div className="text-xs text-gray-500">{c.affiliate?.email}</div>
                </Td>
                <Td>{c.transaction?.orderId || '-'}</Td>
                <Td>₹{Number(c.amount || 0).toFixed(0)}</Td>
                <Td><StatusPill status={c.status} /></Td>
                <Td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</Td>
                <Td className="text-center space-x-2">
                  {c.status === 'pending' && (
                    <button onClick={() => approve(c._id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                      Approve
                    </button>
                  )}
                  {c.status !== 'reversed' && (
                    <button onClick={() => reverse(c._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                      Reverse
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
    </div>
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