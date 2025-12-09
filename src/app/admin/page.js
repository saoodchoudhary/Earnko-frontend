'use client'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/transactions/stats/overview`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (res.ok) setStats(data.data)
      } catch (err) { console.error(err) }
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Transactions</div>
          <div className="text-2xl font-bold">{stats?.overview?.totalTransactions || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Commission</div>
          <div className="text-2xl font-bold">₹{Math.round(stats?.overview?.totalCommission || 0)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Pending Amount</div>
          <div className="text-2xl font-bold">₹{Math.round(stats?.overview?.pendingAmount || 0)}</div>
        </div>
      </div>
    </div>
  )
}