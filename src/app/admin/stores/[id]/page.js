'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import Link from 'next/link'
import {
  Store, TrendingUp, Eye, CreditCard, Clock, ArrowUpRight,
  Edit, Power, ExternalLink, Users, DollarSign, BarChart3,
  RefreshCw, Calendar, Filter, Download, AlertCircle, CheckCircle
} from 'lucide-react'

export default function AdminStoreDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [store, setStore] = useState(null)
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [recentClicks, setRecentClicks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [range, setRange] = useState('30d') // 7d, 30d, 90d
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const h = { Authorization: token ? `Bearer ${token}` : '' }

        const [r1, r2, r3, r4] = await Promise.all([
          fetch(`${base}/api/admin/stores/${id}`, { signal: controller.signal, headers: h }),
          fetch(`${base}/api/admin/stores/${id}/stats`, { signal: controller.signal, headers: h }),
          fetch(`${base}/api/admin/stores/${id}/trend?range=${range}`, { signal: controller.signal, headers: h }),
          fetch(`${base}/api/admin/stores/${id}/recent?limit=10`, { signal: controller.signal, headers: h }),
        ])
        
        if (!r1.ok || !r2.ok || !r3.ok || !r4.ok) throw new Error('Failed to load store details')

        const d1 = await r1.json(); 
        const d2 = await r2.json(); 
        const d3 = await r3.json(); 
        const d4 = await r4.json()
        
        setStore(d1?.data?.item || null)
        setStats(d2?.data || null)
        setTrend(d3?.data?.daily || [])
        setRecentTx(d4?.data?.recentTransactions || [])
        setRecentClicks(d4?.data?.recentClicks || [])
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading store')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [id, range])

  const toggleActive = async () => {
    try {
      if (!store) return
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/stores/${store._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ isActive: !store.isActive })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update')
      setStore(data.data.item)
      toast.success(store.isActive ? 'Store deactivated' : 'Store activated')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const refreshData = () => {
    const controller = new AbortController()
    async function refresh() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const h = { Authorization: token ? `Bearer ${token}` : '' }
        const res = await fetch(`${base}/api/admin/stores/${id}/stats`, { 
          signal: controller.signal, 
          headers: h 
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data?.data || null)
          toast.success('Stats refreshed')
        }
      } catch (error) {
        console.error('Error refreshing:', error)
      } finally {
        setLoading(false)
      }
    }
    refresh()
    return () => controller.abort()
  }

  const chartData = useMemo(() => Array.isArray(trend) ? trend : [], [trend])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{store?.name || 'Loading...'}</h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    store?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {store?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  {store?.baseUrl ? (
                    <>
                      <a 
                        href={store.baseUrl} 
                        className="hover:underline flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {store.baseUrl.replace('https://', '').replace('http://', '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  ) : 'No URL provided'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link 
                href={`/admin/stores/${id}/edit`}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Store
              </Link>
              <button 
                onClick={toggleActive}
                disabled={saving}
                className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  store?.isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                {saving ? 'Updating...' : store?.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Clicks" 
            value={stats?.clicksTotal || 0}
            icon={<Eye className="w-5 h-5" />}
            color="from-blue-600 to-blue-800"
            description="All-time clicks"
          />
          <StatCard 
            title="Total Transactions" 
            value={stats?.transactions || 0}
            icon={<CreditCard className="w-5 h-5" />}
            color="from-green-600 to-green-800"
            description="Successful orders"
          />
          <StatCard 
            title="Total Commission" 
            value={`₹${Number(stats?.commissionTotal || 0).toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="from-purple-600 to-purple-800"
            description="Earned commission"
          />
          <StatCard 
            title="Pending Amount" 
            value={`₹${Number(stats?.pendingAmount || 0).toLocaleString()}`}
            icon={<Clock className="w-5 h-5" />}
            color="from-amber-600 to-amber-800"
            description="Awaiting approval"
          />
        </div>

        {/* Performance Chart Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-800" />
                Performance Trends
              </h3>
              <p className="text-gray-600 text-sm mt-1">Daily metrics over selected time period</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {['7d', '30d', '90d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setRange(period)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      range === period 
                        ? 'bg-white shadow-sm text-gray-900 border border-gray-300' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
          ) : chartData.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
              <h4 className="text-lg font-medium text-gray-700 mb-1">No Data Available</h4>
              <p className="text-gray-500 text-sm">No performance data for selected time range</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white'
                    }}
                    formatter={(value, name) => {
                      if (name === 'commission') 
                        return [`₹${Number(value).toLocaleString()}`, 'Commission']
                      if (name === 'clicks' || name === 'transactions')
                        return [Number(value).toLocaleString(), name]
                      return [value, name]
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    name="Clicks" 
                    stroke="#3b82f6" 
                    fill="url(#colorClicks)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    name="Transactions" 
                    stroke="#10b981" 
                    fill="url(#colorTransactions)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commission" 
                    name="Commission" 
                    stroke="#8b5cf6" 
                    fill="url(#colorCommission)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                <Link 
                  href="/admin/transactions" 
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-gray-600 text-sm mt-1">Latest transactions from this store</p>
            </div>
            
            {loading ? (
              <div className="p-6">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : recentTx.length === 0 ? (
              <div className="p-6 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentTx.map(tx => (
                  <div key={tx._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.status === 'confirmed' ? 'bg-green-100' :
                          tx.status === 'pending' ? 'bg-amber-100' :
                          'bg-gray-100'
                        }`}>
                          <CreditCard className={`w-4 h-4 ${
                            tx.status === 'confirmed' ? 'text-green-600' :
                            tx.status === 'pending' ? 'text-amber-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tx.orderId?.substring(0, 12) || 'N/A'}...
                          </div>
                          <div className="text-xs text-gray-500">
                            {tx.user?.email?.split('@')[0] || 'User'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          ₹{Number(tx.productAmount || 0).toFixed(0)}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                          tx.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          tx.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {tx.status || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Commission: ₹{Number(tx.commissionAmount || 0).toFixed(0)}</span>
                      <span>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Clicks */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recent Clicks</h3>
              <p className="text-gray-600 text-sm mt-1">Latest click activity on store links</p>
            </div>
            
            {loading ? (
              <div className="p-6">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : recentClicks.length === 0 ? (
              <div className="p-6 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No click activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentClicks.map(click => (
                  <div key={click._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {click.customSlug || 'Direct click'}
                          </div>
                          <div className="text-xs text-gray-500">
                            IP: {click.ipAddress || click.ip || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {click.createdAt ? new Date(click.createdAt).toLocaleTimeString() : '-'}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 truncate" title={click.userAgent || ''}>
                      {click.userAgent?.substring(0, 60) || 'No user agent'}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Store Information Section */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Store Information</h3>
          
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-64 animate-pulse"></div>
            </div>
          ) : store ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Store Name</div>
                  <div className="text-sm font-medium text-gray-900">{store.name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Base URL</div>
                  <div className="text-sm font-medium text-gray-900 break-all">{store.baseUrl || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Description</div>
                  <div className="text-sm text-gray-900">{store.description || 'No description provided'}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      store.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Since {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Commission Rate</div>
                  <div className="text-sm font-medium text-gray-900">
                    {store.commissionRate ? `${store.commissionRate}%` : 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm text-gray-900">
                    {store.updatedAt ? new Date(store.updatedAt).toLocaleString() : '-'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No store information available</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
      {description && (
        <div className="text-xs text-gray-400 mt-2">{description}</div>
      )}
    </div>
  )
}