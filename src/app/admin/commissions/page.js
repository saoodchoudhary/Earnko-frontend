'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/commissions?limit=50`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (res.ok) setCommissions(data.data.commissions || [])
      else toast.error('Failed to load')
    } catch (err) { console.error(err); toast.error('Server error') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Commissions</h1>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Affiliate</th>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-4">Loading...</td></tr> : commissions.length === 0 ? <tr><td colSpan="5" className="p-4">No commissions</td></tr> : commissions.map(c => (
              <tr key={c._id} className="border-t">
                <td className="px-4 py-3">{c.affiliate?.name} <div className="text-xs text-gray-500">{c.affiliate?.email}</div></td>
                <td className="px-4 py-3">{c.transaction?.orderId || '-'}</td>
                <td className="px-4 py-3">₹{c.amount}</td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  {c.status === 'pending' && <button onClick={() => approve(c._id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>}
                  {c.status !== 'reversed' && <button onClick={() => reverse(c._1)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reverse</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}