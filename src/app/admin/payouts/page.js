'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const STATUS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'processed', label: 'Processed' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  async function load() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ page, limit })
      if (status) params.append('status', status)
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/payouts?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (res.ok) {
        setPayouts(data.data.payouts || data.data.items || [])
        setTotal(data.data.total || data.data.totalItems || (data.data.payouts || []).length)
      } else toast.error('Failed to load payouts')
    } catch (err) { console.error(err); toast.error('Server error') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [status, page, limit])

  async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/payouts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (res.ok) { toast.success('Updated'); load() } else toast.error(data.message || 'Failed')
    } catch (err) { console.error(err); toast.error('Error') }
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Payouts</h1>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
              <Th>Amount</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th>Requested</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No payouts</td></tr>
            ) : payouts.map(p => (
              <tr key={p._id} className="border-t">
                <Td>
                  {p.affiliate?.name || '-'}
                  <div className="text-xs text-gray-500">{p.affiliate?.email}</div>
                </Td>
                <Td>₹{Number(p.amount || 0).toFixed(0)}</Td>
                <Td className="capitalize">{p.method || '-'}</Td>
                <Td><StatusPill status={p.status} /></Td>
                <Td>{p.requestedAt ? new Date(p.requestedAt).toLocaleString() : '-'}</Td>
                <Td className="space-x-2">
                  {p.status !== 'processed' && (
                    <button onClick={() => updateStatus(p._id, 'processed')} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                      Mark Processed
                    </button>
                  )}
                  {p.status === 'pending' && (
                    <button onClick={() => updateStatus(p._id, 'approved')} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                      Approve
                    </button>
                  )}
                  {p.status !== 'rejected' && (
                    <button onClick={() => updateStatus(p._id, 'rejected')} className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                      Reject
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
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    processed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{status || '-'}</span>
}