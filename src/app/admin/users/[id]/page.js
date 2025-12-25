'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  User, Mail, Calendar, Clock, Shield, CreditCard,
  TrendingUp, DollarSign, Activity, AlertCircle, CheckCircle,
  XCircle, RefreshCw, ArrowLeft, MoreVertical, Edit,
  Save, Lock, Unlock, UserCheck, UserX
} from 'lucide-react'

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
      toast.success('User role updated successfully')
      setData(prev => prev ? ({ ...prev, user: js.data.user }) : prev)
    } catch (err) {
      toast.error(err.message || 'Failed to update role')
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
      toast.success('User status updated successfully')
      setData(prev => prev ? ({ ...prev, user: js.data.user }) : prev)
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const quickAction = async (action) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/users/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to update')
      toast.success(`User ${action}d successfully`)
      setData(prev => prev ? ({ ...prev, user: js.data.user }) : prev)
      setStatus(js.data.user.accountStatus)
      setApproved(js.data.user.isApproved)
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const refreshData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/admin/users/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to load user')
      setData(js.data)
      setRole(js.data.user.role)
      setStatus(js.data.user.accountStatus || 'active')
      setApproved(!!js.data.user.isApproved)
      toast.success('User data refreshed')
    } catch (err) {
      toast.error(err.message || 'Error refreshing')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!data?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button 
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  const u = data.user
  const st = data.stats || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                <p className="text-gray-600 text-sm mt-1">Manage user account and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - User Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{u.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusPill status={u.accountStatus || 'active'} />
                      <RolePill role={u.role} />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>

              {/* Wallet Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard 
                  title="Available Balance" 
                  value={u.wallet?.availableBalance || 0}
                  icon={<DollarSign className="w-5 h-5" />}
                  color="from-blue-600 to-blue-800"
                />
                <StatCard 
                  title="Confirmed Cashback" 
                  value={u.wallet?.confirmedCashback || 0}
                  icon={<CheckCircle className="w-5 h-5" />}
                  color="from-green-600 to-green-800"
                />
                <StatCard 
                  title="Pending Cashback" 
                  value={u.wallet?.pendingCashback || 0}
                  icon={<Clock className="w-5 h-5" />}
                  color="from-amber-600 to-amber-800"
                />
                <StatCard 
                  title="Total Withdrawn" 
                  value={u.wallet?.totalWithdrawn || 0}
                  icon={<CreditCard className="w-5 h-5" />}
                  color="from-purple-600 to-purple-800"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MiniStat 
                  title="Transactions" 
                  value={st.transactions || 0}
                  icon={<Activity className="w-4 h-4" />}
                />
                <MiniStat 
                  title="Commission Total" 
                  value={`₹${Number(st.commissionTotal || 0).toLocaleString()}`}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <MiniStat 
                  title="Pending Amount" 
                  value={`₹${Number(st.pendingAmount || 0).toLocaleString()}`}
                  icon={<AlertCircle className="w-4 h-4" />}
                />
                <MiniStat 
                  title="Payouts" 
                  value={st.payouts || 0}
                  icon={<CreditCard className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Activity History (Placeholder) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Activity history will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            {/* Account Controls */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-800" />
                Account Controls
              </h3>

              {/* Role Update */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <div className="flex gap-2">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={updateRole}
                    disabled={saving || role === u.role}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </div>

              {/* Status Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="hold">On Hold</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Status
                  </label>
                  <select
                    value={approved ? 'yes' : 'no'}
                    onChange={(e) => setApproved(e.target.value === 'yes')}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="yes">Approved</option>
                    <option value="no">Not Approved</option>
                  </select>
                </div>

                <button
                  onClick={updateStatus}
                  disabled={saving || (status === (u.accountStatus || 'active') && approved === !!u.isApproved)}
                  className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Status
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quickAction('approve')}
                  disabled={saving || (u.isApproved && u.accountStatus === 'active')}
                  className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex flex-col items-center justify-center"
                >
                  <UserCheck className="w-5 h-5 mb-1" />
                  <span className="text-sm font-medium">Approve</span>
                </button>
                
                <button
                  onClick={() => quickAction('hold')}
                  disabled={saving || u.accountStatus === 'hold'}
                  className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 flex flex-col items-center justify-center"
                >
                  <Clock className="w-5 h-5 mb-1" />
                  <span className="text-sm font-medium">Hold</span>
                </button>
                
                <button
                  onClick={() => quickAction('block')}
                  disabled={saving || u.accountStatus === 'blocked'}
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex flex-col items-center justify-center"
                >
                  <UserX className="w-5 h-5 mb-1" />
                  <span className="text-sm font-medium">Block</span>
                </button>
                
                <button
                  onClick={() => router.push(`/admin/users/${id}/transactions`)}
                  className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex flex-col items-center justify-center"
                >
                  <Activity className="w-5 h-5 mb-1" />
                  <span className="text-sm font-medium">Transactions</span>
                </button>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">User Information</h3>
              
              <div className="space-y-3">
                <InfoRow label="User ID" value={u._id?.substring(0, 8) + '...'} />
                <InfoRow label="Email Verified" value={u.emailVerified ? 'Yes' : 'No'} />
                <InfoRow label="Phone" value={u.phone || 'Not provided'} />
                <InfoRow label="Last Login" value={u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'} />
                <InfoRow label="Account Created" value={u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'} />
                <InfoRow label="Last Updated" value={u.updatedAt ? new Date(u.updatedAt).toLocaleString() : '-'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">₹{Number(value || 0).toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}

function MiniStat({ title, value, icon }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <div className="text-xs text-gray-500">{title}</div>
      </div>
      <div className="text-lg font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </div>
  )
}

function StatusPill({ status }) {
  const config = {
    active: { color: 'bg-green-100 text-green-600 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
    hold: { color: 'bg-amber-100 text-amber-600 border-amber-200', icon: <Clock className="w-3 h-3" /> },
    blocked: { color: 'bg-red-100 text-red-600 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  }
  
  const { color, icon } = config[status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: null }
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${color}`}>
      {icon}
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  )
}

function RolePill({ role }) {
  const config = {
    admin: { color: 'bg-purple-100 text-purple-600 border-purple-200' },
    affiliate: { color: 'bg-blue-100 text-blue-600 border-blue-200' },
    user: { color: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  
  const { color } = config[role] || { color: 'bg-gray-100 text-gray-600 border-gray-200' }
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${color}`}>
      {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}