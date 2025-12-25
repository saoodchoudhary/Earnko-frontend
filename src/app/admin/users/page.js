'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  Users, Search, Filter, RefreshCw, User, 
  Shield, DollarSign, Clock, CheckCircle, XCircle,
  MoreVertical, Eye, Edit, Ban, Download,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const roles = [
  { value: '', label: 'All Roles', color: 'gray' },
  { value: 'user', label: 'User', color: 'blue' },
  { value: 'affiliate', label: 'Affiliate', color: 'green' },
  { value: 'admin', label: 'Admin', color: 'red' },
]

const statuses = [
  { value: '', label: 'All Status', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'hold', label: 'On Hold', color: 'amber' },
  { value: 'blocked', label: 'Blocked', color: 'red' },
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
  const [selectedUsers, setSelectedUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    blockedUsers: 0
  })

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const loadUsers = async (signal, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit) 
      })
      if (q) params.set('q', q)
      if (role) params.set('role', role)
      if (status) params.set('status', status)
      
      const res = await fetch(`${base}/api/admin/users?${params.toString()}`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load users')
      
      setItems(data?.data?.items || [])
      setTotal(data?.data?.total || 0)

      // Calculate stats from current data
      const userItems = data?.data?.items || []
      setStats({
        totalUsers: data?.data?.total || 0,
        activeUsers: userItems.filter(u => u.accountStatus === 'active').length,
        pendingUsers: userItems.filter(u => !u.isApproved).length,
        blockedUsers: userItems.filter(u => u.accountStatus === 'blocked').length
      })

    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'Error loading users')
      }
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadUsers(controller.signal)
    return () => controller.abort()
  }, [q, role, status, page, limit])

  const handleUserAction = async (id, action, payload) => {
    try {
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      let url = '', method = 'POST', body
      
      if (action === 'approve') url = `/api/admin/users/${id}/approve`
      else if (action === 'hold') url = `/api/admin/users/${id}/hold`
      else if (action === 'block') url = `/api/admin/users/${id}/block`
      else if (action === 'role') { 
        url = `/api/admin/users/${id}/role`
        method = 'PATCH'
        body = JSON.stringify({ role: payload }) 
      }
      else if (action === 'status') { 
        url = `/api/admin/users/${id}/status`
        method = 'PATCH'
        body = JSON.stringify(payload) 
      }

      const res = await fetch(`${base}${url}`, {
        method,
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Action failed')
      
      toast.success('User updated successfully')
      // Update local state
      setItems(prev => prev.map(u => (u._id === id ? (data.data?.user || u) : u)))
    } catch (err) {
      toast.error(err.message || 'Failed to update user')
    }
  }

  const refreshData = () => {
    setRefreshing(true)
    const controller = new AbortController()
    loadUsers(controller.signal, false)
  }

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === items.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(items.map(user => user._id))
    }
  }

  const exportUsers = () => {
    const dataToExport = items.filter(user => selectedUsers.includes(user._id))
    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `users-export-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Users exported successfully!')
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          color="from-gray-700 to-gray-900"
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers}
          icon={<CheckCircle className="w-5 h-5" />}
          color="from-green-600 to-green-800"
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pendingUsers}
          icon={<Clock className="w-5 h-5" />}
          color="from-amber-600 to-amber-800"
        />
        <StatCard 
          title="Blocked Users" 
          value={stats.blockedUsers}
          icon={<Ban className="w-5 h-5" />}
          color="from-red-600 to-red-800"
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">User Accounts</h3>
          <div className="text-sm text-gray-500">
            Showing {items.length} of {total} users
          </div>
        </div>

        {/* Table Content */}
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
                    
                    {/* User Info */}
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

                    {/* Role & Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>
                          <select
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                            value={user.role || 'user'}
                            onChange={(e) => handleUserAction(user._id, 'role', e.target.value)}
                          >
                            {roles.filter(r => r.value).map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={user.accountStatus || 'active'} />
                          <div className={`text-xs px-2 py-0.5 rounded ${
                            user.isApproved 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Wallet Info */}
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

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        <div className="relative group">
                          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={() => handleUserAction(user._id, user.accountStatus === 'active' ? 'hold' : 'approve')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              {user.accountStatus === 'active' ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              {user.accountStatus === 'active' ? 'Put on Hold' : 'Approve User'}
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'block')}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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

        {/* Pagination */}
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

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
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