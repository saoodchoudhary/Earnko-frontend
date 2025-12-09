'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/payouts?limit=50`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (res.ok) setPayouts(data.data.payouts || [])
      else toast.error('Failed to load payouts')
    } catch (err) { console.error(err); toast.error('Server error') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Payouts</h1>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Affiliate</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Requested</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-4">Loading...</td></tr> : payouts.length === 0 ? <tr><td colSpan="5" className="p-4">No payouts</td></tr> : payouts.map(p => (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-3">{p.affiliate?.name} <div className="text-xs text-gray-500">{p.affiliate?.email}</div></td>
                <td className="px-4 py-3">₹{p.amount}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{new Date(p.requestedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  {p.status !== 'processed' && <button onClick={() => updateStatus(p._id, 'processed')} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Mark Processed</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}