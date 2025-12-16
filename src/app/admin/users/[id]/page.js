'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState('user')
  const [status, setStatus] = useState('active')
  const [approved, setApproved] = useState(true)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const res = await fetch(`${base}/api/admin/users/${id}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const js = await res.json()
        if (!res.ok) throw new Error(js?.message || 'Failed to load user')
        setData(js.data)
        setRole(js.data.user.role)
        setStatus(js.data.user.accountStatus || 'active')
        setApproved(!!js.data.user.isApproved)
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [id])

  const updateRole = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ role })
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to update role')
      toast.success('Role updated')
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ accountStatus: status, isApproved: approved })
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to update status')
      toast.success('Status updated')
      setData(prev => prev ? ({ ...prev, user: js.data.user }) : prev)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const quick = async (path) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/users/${id}/${path}`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed')
      toast.success('Updated')
      setData(prev => prev ? ({ ...prev, user: js.data.user }) : prev)
      setStatus(js.data.user.accountStatus)
      setApproved(js.data.user.isApproved)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen p-6"><div className="h-20 skeleton rounded" /></div>
  }
  if (!data?.user) {
    return <div className="min-h-screen p-6">User not found</div>
  }

  const u = data.user
  const st = data.stats || {}

  return (
    <main className="min-h-screen p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{u.name}</h1>
          <div className="text-sm text-gray-600">{u.email}</div>
        </div>
        <button className="btn btn-outline" onClick={() => history.back()}>Back</button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Available Balance" value={u.wallet?.availableBalance || 0} prefix="₹" />
        <Card title="Confirmed Cashback" value={u.wallet?.confirmedCashback || 0} prefix="₹" />
        <Card title="Pending Cashback" value={u.wallet?.pendingCashback || 0} prefix="₹" />
        <Card title="Total Withdrawn" value={u.wallet?.totalWithdrawn || 0} prefix="₹" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Account Controls</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-500">Role</label>
              <select className="input mt-1" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="affiliate">Affiliate</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn btn-primary w-full mt-2" onClick={updateRole} disabled={saving}>Update Role</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="hold">On Hold</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Approved</label>
                <select className="input mt-1" value={approved ? 'yes' : 'no'} onChange={(e) => setApproved(e.target.value === 'yes')}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="col-span-2">
                <button className="btn btn-primary w-full" onClick={updateStatus} disabled={saving}>Update Status</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="btn btn-outline" onClick={() => quick('approve')} disabled={saving}>Approve</button>
              <button className="btn btn-outline" onClick={() => quick('hold')} disabled={saving}>Hold</button>
              <button className="btn btn-outline" onClick={() => quick('block')} disabled={saving}>Block</button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 md:col-span-2">
          <h3 className="font-semibold mb-3">Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Mini title="Transactions" value={st.transactions || 0} />
            <Mini title="Commission Total" value={`₹${Number(st.commissionTotal || 0).toFixed(0)}`} />
            <Mini title="Pending Amount" value={`₹${Number(st.pendingAmount || 0).toFixed(0)}`} />
            <Mini title="Payouts" value={st.payouts || 0} />
          </div>

          <div className="mt-4 text-sm">
            <div><span className="text-gray-500">Account status:</span> <StatusPill status={u.accountStatus || 'active'} /></div>
            <div className="mt-1"><span className="text-gray-500">Approved:</span> {u.isApproved ? 'Yes' : 'No'}</div>
            <div className="mt-1"><span className="text-gray-500">Role:</span> {u.role}</div>
            <div className="mt-1"><span className="text-gray-500">Joined:</span> {u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</div>
            <div className="mt-1"><span className="text-gray-500">Updated:</span> {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : '-'}</div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Card({ title, value, prefix }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{prefix}{Number(value || 0).toLocaleString()}</div>
    </div>
  )
}
function Mini({ title, value }) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
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