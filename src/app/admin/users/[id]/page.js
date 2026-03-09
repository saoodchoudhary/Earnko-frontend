'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  User, Mail, Calendar, Clock, Shield, CreditCard,
  TrendingUp, DollarSign, Activity, AlertCircle, CheckCircle,
  XCircle, RefreshCw, ArrowLeft, Save, Ban, Info, Settings2
} from 'lucide-react'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [tab, setTab] = useState('overview') // overview | controls | audit
  const [data, setData] = useState(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [savingRole, setSavingRole] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const [role, setRole] = useState('user')
  const [status, setStatus] = useState('active')

  const [confirm, setConfirm] = useState(null) // { title, message, confirmText, danger, onConfirm }
  const envWarned = useRef(false)
  const abortRef = useRef(null)

  const getBase = () => process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return { Authorization: token ? `Bearer ${token}` : '' }
  }

  const ensureEnvConfigured = () => {
    const base = getBase()
    if (!base && !envWarned.current) {
      envWarned.current = true
      toast.error('Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL')
    }
    return base
  }

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { return await res.json() } catch { return null }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  const handleHttpError = async (res) => {
    let message = 'Request failed'
    try {
      const js = await safeJson(res)
      if (js?.message) message = js.message
    } catch {}
    if (res.status === 401) message = 'Unauthorized. Please login again.'
    if (res.status === 403) message = 'Forbidden. Admin access required.'
    throw new Error(message)
  }

  const u = data?.user || null
  const st = data?.stats || {}

  const hasUnsavedChanges = useMemo(() => {
    if (!u) return false
    return role !== (u.role || 'user') || status !== (u.accountStatus || 'active')
  }, [u, role, status])

  // warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (!hasUnsavedChanges) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  const load = async ({ showToast = false } = {}) => {
    if (!id) return
    const base = ensureEnvConfigured()
    if (!base) return

    // cancel previous
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      if (loading === false) setRefreshing(true)
      else setLoading(true)

      const res = await fetch(`${base}/api/admin/users/${id}`, {
        signal: controller.signal,
        headers: getHeaders()
      })
      if (!res.ok) await handleHttpError(res)
      const js = await safeJson(res)

      const payload = js?.data || js
      if (!payload?.user) throw new Error('User payload missing')

      setData(payload)
      setRole(payload.user.role || 'user')
      setStatus(payload.user.accountStatus || 'active')

      if (showToast) toast.success('User data refreshed')
    } catch (err) {
      if (err?.name !== 'AbortError') toast.error(err?.message || 'Error loading user')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const refreshData = () => load({ showToast: true })

  const updateRole = async () => {
    try {
      const base = ensureEnvConfigured()
      if (!base) return
      if (!u) return

      setSavingRole(true)
      const res = await fetch(`${base}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ role })
      })
      if (!res.ok) await handleHttpError(res)
      const js = await safeJson(res)

      const updatedUser = js?.data?.user || js?.user || js?.data
      if (!updatedUser) throw new Error('No user returned from backend')
      if ((updatedUser.role || 'user') !== role) throw new Error('Role update did not persist')

      setData(prev => prev ? ({ ...prev, user: { ...prev.user, ...updatedUser } }) : prev)
      toast.success('User role updated')
    } catch (err) {
      toast.error(err?.message || 'Failed to update role')
    } finally {
      setSavingRole(false)
    }
  }

  const updateStatus = async () => {
    try {
      const base = ensureEnvConfigured()
      if (!base) return
      if (!u) return

      setSavingStatus(true)
      const res = await fetch(`${base}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ accountStatus: status })
      })
      if (!res.ok) await handleHttpError(res)
      const js = await safeJson(res)

      const updatedUser = js?.data?.user || js?.user || js?.data
      if (!updatedUser) throw new Error('No user returned from backend')
      if ((updatedUser.accountStatus || 'active') !== status) throw new Error('Status update did not persist')

      setData(prev => prev ? ({ ...prev, user: { ...prev.user, ...updatedUser } }) : prev)
      toast.success('User status updated')
    } catch (err) {
      toast.error(err?.message || 'Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  const quickHold = async () => {
    try {
      const base = ensureEnvConfigured()
      if (!base) return
      if (!u) return

      const res = await fetch(`${base}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ accountStatus: 'hold' })
      })
      if (!res.ok) await handleHttpError(res)
      const js = await safeJson(res)

      const updatedUser = js?.data?.user || js?.user || js?.data
      if (!updatedUser || (updatedUser.accountStatus || '') !== 'hold') throw new Error('Hold action did not persist')

      setData(prev => prev ? ({ ...prev, user: { ...prev.user, ...updatedUser } }) : prev)
      setStatus('hold')
      toast.success('User put on hold')
    } catch (err) {
      toast.error(err?.message || 'Failed to hold user')
    }
  }

  const quickBlock = async () => {
    try {
      const base = ensureEnvConfigured()
      if (!base) return
      if (!u) return

      const res = await fetch(`${base}/api/admin/users/${id}/block`, {
        method: 'POST',
        headers: getHeaders()
      })
      if (!res.ok) await handleHttpError(res)
      const js = await safeJson(res)

      const updatedUser = js?.data?.user || js?.user || js?.data
      if (!updatedUser || (updatedUser.accountStatus || '') !== 'blocked') throw new Error('Block action did not persist')

      setData(prev => prev ? ({ ...prev, user: { ...prev.user, ...updatedUser } }) : prev)
      setStatus('blocked')
      toast.success('User blocked')
    } catch (err) {
      toast.error(err?.message || 'Failed to block user')
    }
  }

  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-56 animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-72 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
            <div className="h-72 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!u) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <button
                onClick={() => {
                  if (!hasUnsavedChanges || confirm('You have unsaved changes. Leave anyway?')) {
                    router.push('/admin/users')
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">User Details</h1>
                  <StatusPill status={u.accountStatus || 'active'} />
                  <RolePill role={u.role || 'user'} />
                </div>
                <div className="text-xs md:text-sm text-gray-600 mt-1 truncate">
                  {u.name} • {u.email} • ID: {String(u._id || '').slice(0, 8)}...
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex items-center gap-2">
            <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={<Info className="w-4 h-4" />}>
              Overview
            </TabButton>
            <TabButton active={tab === 'controls'} onClick={() => setTab('controls')} icon={<Settings2 className="w-4 h-4" />}>
              Controls
            </TabButton>
            <TabButton active={tab === 'audit'} onClick={() => setTab('audit')} icon={<Activity className="w-4 h-4" />}>
              Activity
            </TabButton>

            {hasUnsavedChanges && (
              <div className="ml-auto text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                Unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 truncate">{u.name}</h2>
                      <div className="flex items-center gap-2 mt-1 text-gray-600 min-w-0">
                        <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="text-xs text-gray-500 inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-xs text-gray-500 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Updated {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <StatCard title="Available" value={u.wallet?.availableBalance || 0} icon={<DollarSign className="w-5 h-5" />} color="from-blue-600 to-blue-800" />
                  <StatCard title="Confirmed" value={u.wallet?.confirmedCashback || 0} icon={<CheckCircle className="w-5 h-5" />} color="from-green-600 to-green-800" />
                  <StatCard title="Pending" value={u.wallet?.pendingCashback || 0} icon={<Clock className="w-5 h-5" />} color="from-amber-600 to-amber-800" />
                  <StatCard title="Withdrawn" value={u.wallet?.totalWithdrawn || 0} icon={<CreditCard className="w-5 h-5" />} color="from-purple-600 to-purple-800" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <MiniStat title="Transactions" value={st.transactions || 0} icon={<Activity className="w-4 h-4" />} />
                  <MiniStat title="Commission Total" value={fmtINR(st.commissionTotal || 0)} icon={<TrendingUp className="w-4 h-4" />} />
                  <MiniStat title="Pending Amount" value={fmtINR(st.pendingAmount || 0)} icon={<AlertCircle className="w-4 h-4" />} />
                  <MiniStat title="Payouts" value={st.payouts || 0} icon={<CreditCard className="w-4 h-4" />} />
                </div>
              </div>

              {/* Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">User Information</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <InfoRow label="User ID" value={String(u._id || '')} mono />
                  <InfoRow label="Phone" value={u.phone || 'Not provided'} />
                  <InfoRow label="Role" value={u.role || 'user'} />
                  <InfoRow label="Account Status" value={u.accountStatus || 'active'} />
                </div>
              </div>
            </div>

            {/* Right side quick actions */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-800" />
                  Quick Actions
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfirm({
                      title: 'Put user on hold?',
                      message: 'User will not be able to use the platform normally (depending on backend enforcement).',
                      confirmText: 'Hold User',
                      danger: false,
                      onConfirm: async () => { setConfirm(null); await quickHold(); }
                    })}
                    disabled={u.accountStatus === 'hold'}
                    className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50 flex flex-col items-center justify-center"
                  >
                    <Clock className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Hold</span>
                  </button>

                  <button
                    onClick={() => setConfirm({
                      title: 'Block user?',
                      message: 'This action can restrict access immediately. Use carefully.',
                      confirmText: 'Block User',
                      danger: true,
                      onConfirm: async () => { setConfirm(null); await quickBlock(); }
                    })}
                    disabled={u.accountStatus === 'blocked'}
                    className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 flex flex-col items-center justify-center"
                  >
                    <Ban className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Block</span>
                  </button>

                  <button
                    onClick={() => router.push(`/admin/users/${id}/transactions`)}
                    className="col-span-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Activity className="w-5 h-5" />
                    View Transactions
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Tip: Use Controls tab to update role/status with audit-safe actions.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {tab === 'controls' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Account Controls</h3>
                <p className="text-sm text-gray-600 mb-5">Update role and account status. Changes are saved immediately.</p>

                {/* Role */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="sm:flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="affiliate">Affiliate</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={updateRole}
                      disabled={savingRole || role === (u.role || 'user')}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingRole ? 'Saving...' : 'Update Role'}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Changing role affects permissions. Be careful when granting admin.
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="sm:flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="hold">On Hold</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    <button
                      onClick={() => setConfirm({
                        title: 'Update account status?',
                        message: `Set status to "${status}" for this user.`,
                        confirmText: 'Update Status',
                        danger: status === 'blocked',
                        onConfirm: async () => { setConfirm(null); await updateStatus(); }
                      })}
                      disabled={savingStatus || status === (u.accountStatus || 'active')}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingStatus ? 'Saving...' : 'Update Status'}
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Hold = temporary restriction. Block = hard restriction.
                  </div>
                </div>
              </div>

              {/* Safety note */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <div className="font-semibold">Safety</div>
                    <div className="text-sm mt-1">
                      Role/status changes should be used carefully. Consider keeping a separate audit log on backend if needed.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side summary */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Current Settings</h3>
                <div className="space-y-3">
                  <InfoRow label="Role" value={u.role || 'user'} />
                  <InfoRow label="Status" value={u.accountStatus || 'active'} />
                  <InfoRow label="Available" value={fmtINR(u.wallet?.availableBalance || 0)} />
                  <InfoRow label="Referral Earnings" value={fmtINR(u.wallet?.referralEarnings || 0)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity (UI placeholder but nicer) */}
        {tab === 'audit' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-800" />
              Recent Activity
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This section can show admin actions, logins, payouts, transactions etc. (needs backend support).
            </p>

            <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No activity feed endpoint connected yet.</p>
              <p className="text-xs mt-2">If you want, I can add a backend endpoint like: <span className="font-mono">GET /api/admin/users/:id/activity</span>.</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom action bar for unsaved changes */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94vw] max-w-3xl z-40">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-3 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              You have unsaved changes.
              <span className="text-xs text-gray-500 ml-2">
                Role: {u.role} → {role}, Status: {u.accountStatus || 'active'} → {status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setRole(u.role || 'user'); setStatus(u.accountStatus || 'active'); toast.success('Changes discarded') }}
                className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={async () => {
                  // save both if needed
                  if (role !== (u.role || 'user')) await updateRole()
                  if (status !== (u.accountStatus || 'active')) await updateStatus()
                }}
                className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-950"
              >
                Save All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmText={confirm.confirmText}
          danger={confirm.danger}
          onClose={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}

      <StyleTag />
    </div>
  )
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors inline-flex items-center gap-2 ${
        active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">₹{Number(value || 0).toLocaleString('en-IN')}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}

function MiniStat({ title, value, icon }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <div className="text-xs text-gray-500">{title}</div>
      </div>
      <div className="text-lg font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const config = {
    active: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
    hold: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> },
    blocked: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  }
  const { color, icon } = config[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null }

  return (
    <span className={`px-2 py-1 text-xs rounded-full border inline-flex items-center gap-1 ${color}`}>
      {icon}
      {String(status || 'unknown').charAt(0).toUpperCase() + String(status || 'unknown').slice(1)}
    </span>
  )
}

function RolePill({ role }) {
  const config = {
    admin: { color: 'bg-purple-100 text-purple-700 border-purple-200' },
    affiliate: { color: 'bg-blue-100 text-blue-700 border-blue-200' },
    user: { color: 'bg-gray-100 text-gray-700 border-gray-200' },
  }
  const { color } = config[role] || { color: 'bg-gray-100 text-gray-700 border-gray-200' }

  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${color}`}>
      {String(role || 'user').charAt(0).toUpperCase() + String(role || 'user').slice(1)}
    </span>
  )
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-3 py-2 bg-white">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono text-xs md:text-sm break-all text-right' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function ConfirmModal({ title, message, confirmText, danger, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="text-lg font-bold text-gray-900">{title}</div>
            <div className="text-sm text-gray-600 mt-1">{message}</div>
          </div>
          <div className="p-4 flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-950'}`}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = `
  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`
const StyleTag = () => <style dangerouslySetInnerHTML={{ __html: styles }} />