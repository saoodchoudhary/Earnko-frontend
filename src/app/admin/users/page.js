'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const roles = [
  { value: '', label: 'All roles' },
  { value: 'user', label: 'User' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'admin', label: 'Admin' },
]

const statuses = [
  { value: '', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'hold', label: 'On Hold' },
  { value: 'blocked', label: 'Blocked' },
]

export default function AdminUsersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
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
        if (role) params.set('role', role)
        if (status) params.set('status', status)
        const res = await fetch(`${base}/api/admin/users?${params.toString()}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load users')
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
  }, [q, role, status, page, limit])

  const act = async (id, action, payload) => {
    try {
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      let url = '', method = 'POST', body
      if (action === 'approve') url = `/api/admin/users/${id}/approve`
      else if (action === 'hold') url = `/api/admin/users/${id}/hold`
      else if (action === 'block') url = `/api/admin/users/${id}/block`
      else if (action === 'role') { url = `/api/admin/users/${id}/role`; method = 'PATCH'; body = JSON.stringify({ role: payload }) }
      else if (action === 'status') { url = `/api/admin/users/${id}/status`; method = 'PATCH'; body = JSON.stringify(payload) }

      const res = await fetch(`${base}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Action failed')
      toast.success('Updated')
      // update local state
      setItems(prev => prev.map(u => (u._id === id ? (data.data?.user || u) : u)))
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
      </div>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="Search name or email..."
            className="input"
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value) }}
          />
          <select className="input" value={role} onChange={(e) => { setPage(1); setRole(e.target.value) }}>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select className="input" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }}>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Approved</Th>
              <Th className="text-right">Available</Th>
              <Th className="text-right">Confirmed</Th>
              <Th className="text-right">Pending</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-500">No users</td></tr>
            ) : items.map(u => (
              <tr key={u._id} className="border-t">
                <Td>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                  <Link className="text-xs text-blue-600 hover:underline" href={`/admin/users/${u._id}`}>View details</Link>
                </Td>
                <Td>
                  <select
                    className="input"
                    value={u.role}
                    onChange={(e) => act(u._id, 'role', e.target.value)}
                  >
                    {roles.filter(r => r.value).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </Td>
                <Td><StatusPill status={u.accountStatus || 'active'} /></Td>
                <Td>{u.isApproved ? 'Yes' : 'No'}</Td>
                <Td className="text-right">₹{Number(u.wallet?.availableBalance || 0).toFixed(0)}</Td>
                <Td className="text-right">₹{Number(u.wallet?.confirmedCashback || 0).toFixed(0)}</Td>
                <Td className="text-right">₹{Number(u.wallet?.pendingCashback || 0).toFixed(0)}</Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50" onClick={() => act(u._id, 'approve')}>Approve</button>
                    <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50" onClick={() => act(u._id, 'hold')}>Hold</button>
                    <button className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50" onClick={() => act(u._id, 'block')}>Block</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages} • {total} users</div>
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
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hold: 'bg-amber-50 text-amber-700 border-amber-200',
    blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{status || '-'}</span>
}