'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'processed', label: 'Processed' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminPayoutsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const params = new URLSearchParams()
        if (status) params.set('status', status)

        const res = await fetch(`${base}/api/admin/payouts?${params.toString()}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const js = await res.json()
        if (!res.ok) throw new Error(js?.message || 'Failed to load payouts')
        setItems(js?.data?.payouts || [])
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading payouts')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [status])

  const updateStatus = async (id, nextStatus) => {
    try {
      setBusyId(id)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/payouts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ status: nextStatus })
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to update')
      toast.success('Updated')
      setItems(prev => prev.map(p => (p._id === id ? { ...p, status: nextStatus } : p)))
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Payouts</h1>
        <div className="flex items-center gap-2">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Affiliate</Th>
              <Th className="text-right">Amount</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No payouts</td></tr>
            ) : items.map(p => (
              <tr key={p._id} className="border-t">
                <Td>
                  <div className="text-sm">{p.affiliate?.name || '-'}</div>
                  <div className="text-xs text-gray-500">{p.affiliate?.email || '-'}</div>
                </Td>
                <Td className="text-right">₹{Number(p.amount || 0).toFixed(0)}</Td>
                <Td className="capitalize">{p.method || '-'}</Td>
                <Td className="capitalize">{p.status}</Td>
                <Td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</Td>
                <Td className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/payouts/${p._id}`} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Details</Link>
                    {p.status !== 'approved' && p.status !== 'processed' && (
                      <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50" onClick={() => updateStatus(p._id, 'approved')} disabled={busyId === p._id}>
                        {busyId === p._id ? '...' : 'Approve'}
                      </button>
                    )}
                    {p.status !== 'processed' && p.status !== 'rejected' && (
                      <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50" onClick={() => updateStatus(p._id, 'processed')} disabled={busyId === p._id}>
                        {busyId === p._id ? '...' : 'Mark Processed'}
                      </button>
                    )}
                    {p.status !== 'rejected' && (
                      <button className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50" onClick={() => updateStatus(p._id, 'rejected')} disabled={busyId === p._id}>
                        {busyId === p._id ? '...' : 'Reject'}
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

function Th({ children, className = '' }) { return <th className={`px-3 py-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-3 py-2 align-top ${className}`}>{children}</td> }