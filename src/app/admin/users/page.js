'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  Users, Search, RefreshCw,
  CheckCircle, Ban,
  MoreVertical, Eye, Download,
  ChevronLeft, ChevronRight, Clock
} from 'lucide-react'

const roles = [
  { value: '', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'admin', label: 'Admin' },
]

const statuses = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'hold', label: 'On Hold' },
  { value: 'blocked', label: 'Blocked' },
]

export default function AdminUsersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const [selectedUsers, setSelectedUsers] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0
  })

  const envWarned = useRef(false)
  const getBase = () => process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: token ? `Bearer ${token}` : '' }
  }
  const ensureEnvConfigured = () => {
    const base = getBase()
    if (!base && !envWarned.current) {
      envWarned.current = true
      toast.error('Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL')
    }
  }

  const handleHttpError = async (res) => {
    let message = 'Request failed'
    try {
      const data = await res.clone().json()
      if (data?.message) message = data.message
    } catch {}
    if (res.status === 401) message = 'Unauthorized. Please login again.'
    if (res.status === 403) message = 'Forbidden. Admin access required.'
    throw new Error(message)
  }

  const loadUsers = async (signal, showLoading = true) => {
    try {
      ensureEnvConfigured()
      if (showLoading) setLoading(true)
      const base = getBase()
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (q) params.set('q', q)
      if (role) params.set('role', role)
      if (status) params.set('status', status)
      const res = await fetch(`${base}/api/admin/users?${params.toString()}`, {
        signal,
        headers: getHeaders()
      })
      if (!res.ok) await handleHttpError(res)
      const data = await res.json()
      setItems(data?.data?.items || [])
      setTotal(data?.data?.total || 0)
      setSelectedUsers([])
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Error loading users')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  const loadGlobalStats = async () => {
    try {
      ensureEnvConfigured()
      setStatsLoading(true)
      const base = getBase()
      const headers = getHeaders()
      const [rAll, rActive, rBlocked] = await Promise.all([
        fetch(`${base}/api/admin/users?limit=1`, { headers }),
        fetch(`${base}/api/admin/users?status=active&limit=1`, { headers }),
        fetch(`${base}/api/admin/users?status=blocked&limit=1`, { headers }),
      ])
      for (const r of [rAll, rActive, rBlocked]) if (!r.ok) await handleHttpError(r)
      const [jAll, jActive, jBlocked] = await Promise.all([
        rAll.json().catch(() => ({})),
        rActive.json().catch(() => ({})),
        rBlocked.json().catch(() => ({})),
      ])
      setStats({
        totalUsers: Number(jAll?.data?.total || 0),
        activeUsers: Number(jActive?.data?.total || 0),
        blockedUsers: Number(jBlocked?.data?.total || 0),
      })
    } catch (err) {
      toast.error(err?.message || 'Failed to load stats')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadUsers(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role, status, page, limit])

  useEffect(() => {
    loadGlobalStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUserAction = async (id, action, payload) => {
    try {
      ensureEnvConfigured()
      setActionLoadingId(id)
      const base = getBase()
      const headers = { 'Content-Type': 'application/json', ...getHeaders() }

      let url = '', method = 'POST', body
      if (action === 'block') {
        url = `/api/admin/users/${id}/block`
      } else if (action === 'status') {
        url = `/api/admin/users/${id}/status`
        method = 'PATCH'
        body = JSON.stringify(payload) // { accountStatus: 'active'|'hold'|'blocked' }
      } else if (action === 'role') {
        url = `/api/admin/users/${id}/role`
        method = 'PATCH'
        body = JSON.stringify({ role: payload }) // 'user'|'affiliate'|'admin'
      } else {
        throw new Error('Unsupported action')
      }

      const res = await fetch(`${base}${url}`, { method, headers, body })
      if (!res.ok) await handleHttpError(res)
      const data = await res.json()
      const updatedUser = data?.data?.user
      if (!updatedUser) throw new Error('No user returned from backend')

      // Verify persistence: compare requested vs updated
      if (action === 'status') {
        const desired = payload?.accountStatus
        if (updatedUser.accountStatus !== desired) {
          throw new Error('Status update did not persist')
        }
      } else if (action === 'block') {
        if (updatedUser.accountStatus !== 'blocked') {
          throw new Error('Block action did not persist')
        }
      } else if (action === 'role') {
        if (updatedUser.role !== payload) {
          throw new Error('Role update did not persist')
        }
      }

      // Update local list
      setItems(prev => prev.map(u => (u._id === id ? updatedUser : u)))
      toast.success('User updated successfully')

      // Refresh stats
      loadGlobalStats()
    } catch (err) {
      toast.error(err.message || 'Failed to update user')
    } finally {
      setActionLoadingId(null)
    }
  }

  const refreshData = () => {
    setRefreshing(true)
    const controller = new AbortController()
    loadUsers(controller.signal, false)
    loadGlobalStats()
  }

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === items.length) setSelectedUsers([])
    else setSelectedUsers(items.map(u => u._id))
  }

  const exportUsers = () => {
    const dataToExport = items.filter(u => selectedUsers.includes(u._id))
    const dataStr = JSON.stringify(dataToExport, null, 2)
    const uri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const name = `users-export-${new Date().toISOString().split('T')[0]}.json`
    const a = document.createElement('a')
    a.setAttribute('href', uri)
    a.setAttribute('download', name)
    a.click()
    toast.success('Users exported')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage and monitor all user accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {selectedUsers.length > 0 && (
              <button
                onClick={exportUsers}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export ({selectedUsers.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          color="from-gray-700 to-gray-900"
          loading={statsLoading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<CheckCircle className="w-5 h-5" />}
          color="from-green-600 to-green-800"
          loading={statsLoading}
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={<Ban className="w-5 h-5" />}
          color="from-red-600 to-red-800"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value) }}
            />
          </div>
          <select
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={role}
            onChange={(e) => { setPage(1); setRole(e.target.value) }}
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value) }}
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">User Accounts</h3>
          <div className="text-sm text-gray-500">
            Showing {items.length} of {total} users
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">No Users Found</h4>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === items.length && items.length > 0}
                      onChange={selectAllUsers}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleSelectUser(user._id)}
                        className="rounded border-gray-300"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name || 'Anonymous'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>
                          <select
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                            value={user.role || 'user'}
                            onChange={(e) => handleUserAction(user._id, 'role', e.target.value)}
                            disabled={actionLoadingId === user._id}
                          >
                            {roles.filter(r => r.value).map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={user.accountStatus || 'active'} />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Available:</span>
                          <span className="text-sm font-medium">₹{Number(user.wallet?.availableBalance || 0).toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Confirmed:</span>
                          <span className="text-sm font-medium">₹{Number(user.wallet?.confirmedCashback || 0).toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending:</span>
                          <span className="text-sm font-medium">₹{Number(user.wallet?.pendingCashback || 0).toFixed(0)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <div className="relative" onMouseLeave={() => setOpenMenuId(null)}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === user._id}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div
                            className={`absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 z-10 ${
                              openMenuId === user._id ? 'opacity-100 visible' : 'opacity-0 invisible'
                            }`}
                          >
                            <button
                              onClick={async () => {
                                await handleUserAction(user._id, 'status', { accountStatus: 'active' })
                                setOpenMenuId(null)
                              }}
                              disabled={actionLoadingId === user._id}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Activate User
                            </button>
                            <button
                              onClick={async () => {
                                await handleUserAction(user._id, 'status', { accountStatus: 'hold' })
                                setOpenMenuId(null)
                              }}
                              disabled={actionLoadingId === user._id}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <Clock className="w-4 h-4" />
                              Put on Hold
                            </button>
                            <button
                              onClick={async () => {
                                await handleUserAction(user._id, 'block')
                                setOpenMenuId(null)
                              }}
                              disabled={actionLoadingId === user._id}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <Ban className="w-4 h-4" />
                              Block User
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages} • {total} total users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg ${
                          page === pageNum
                            ? 'bg-gray-800 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }
                  return null
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <>
          <div className="h-7 w-24 skeleton rounded mb-2" />
          <div className="h-3 w-32 skeleton rounded" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-500 mt-1">{title}</div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    active: { label: 'Active', color: 'bg-green-100 text-green-600' },
    hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-600' },
    blocked: { label: 'Blocked', color: 'bg-red-100 text-red-600' },
  }
  const { label, color } = config[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
      {label}
    </span>
  )
}