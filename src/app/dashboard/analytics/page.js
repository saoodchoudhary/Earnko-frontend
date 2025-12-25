'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  TrendingUp, BarChart3, Target, DollarSign, Eye, Calendar,
  Filter, Download, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

export default function UserAnalyticsPage() {
  const [range, setRange] = useState('30d') // '7d' | '30d' | '90d'
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary] = useState({
    clicksTotal: 0,
    conversionsTotal: 0,
    commissionTotal: 0,
    pendingAmount: 0,
    approvedAmount: 0,
  })
  const [daily, setDaily] = useState([])
  const [prevPeriod, setPrevPeriod] = useState({
    clicksTotal: 0,
    conversionsTotal: 0,
    commissionTotal: 0,
  })

  const loadAnalytics = async (signal, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const token = localStorage.getItem('token')
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      
      // Load current period analytics
      const res = await fetch(`${base}/api/user/analytics?range=${range}`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to load analytics')
      
      const data = js?.data || {}
      setSummary(data.summary || {})
      setDaily(data.daily || [])

      // Load previous period for comparison
      let prevRange = '30d'
      if (range === '7d') prevRange = '7d'
      else if (range === '30d') prevRange = '30d'
      else if (range === '90d') prevRange = '90d'

      const prevRes = await fetch(`${base}/api/user/analytics?range=${prevRange}&offset=1`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      if (prevRes.ok) {
        const prevData = await prevRes.json()
        setPrevPeriod(prevData.data?.summary || {
          clicksTotal: 0,
          conversionsTotal: 0,
          commissionTotal: 0,
        })
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'Error loading analytics')
      }
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadAnalytics(controller.signal)
    return () => controller.abort()
  }, [range])

  const chartData = useMemo(() => Array.isArray(daily) ? daily : [], [daily])

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const growth = {
    clicks: calculateGrowth(summary.clicksTotal, prevPeriod.clicksTotal),
    conversions: calculateGrowth(summary.conversionsTotal, prevPeriod.conversionsTotal),
    commission: calculateGrowth(summary.commissionTotal, prevPeriod.commissionTotal),
  }

  const downloadReport = () => {
    const report = {
      period: range,
      generatedAt: new Date().toISOString(),
      summary: summary,
      daily: daily,
      growth: growth
    }
    
    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `analytics-${range}-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Report downloaded successfully!')
  }

  const refresh = () => {
    setRefreshing(true)
    const controller = new AbortController()
    loadAnalytics(controller.signal, false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
                <p className="text-blue-100 mt-1">Track your performance and earnings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Performance Overview</h2>
                  <p className="text-gray-600 text-sm mt-1">Select time range to view analytics</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {['7d', '30d', '90d'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setRange(period)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                          range === period 
                            ? 'bg-white shadow-sm text-blue-600' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {period.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard 
                title="Total Clicks" 
                value={summary.clicksTotal || 0}
                icon={<Eye className="w-5 h-5" />}
                color="from-blue-500 to-blue-600"
                growth={growth.clicks}
              />
              <StatCard 
                title="Conversions" 
                value={summary.conversionsTotal || 0}
                icon={<Target className="w-5 h-5" />}
                color="from-green-500 to-emerald-600"
                growth={growth.conversions}
              />
              <StatCard 
                title="Total Commission" 
                value={`₹${Number(summary.commissionTotal || 0).toLocaleString()}`}
                icon={<DollarSign className="w-5 h-5" />}
                color="from-purple-500 to-pink-600"
                growth={growth.commission}
              />
              <StatCard 
                title="Pending Amount" 
                value={`₹${Number(summary.pendingAmount || 0).toLocaleString()}`}
                icon={<ClockIcon className="w-5 h-5" />}
                color="from-amber-500 to-orange-600"
              />
              <StatCard 
                title="Approved Amount" 
                value={`₹${Number(summary.approvedAmount || 0).toLocaleString()}`}
                icon={<CheckCircle className="w-5 h-5" />}
                color="from-indigo-500 to-purple-600"
              />
              <StatCard 
                title="Conversion Rate" 
                value={`${summary.conversionsTotal > 0 ? ((summary.conversionsTotal / summary.clicksTotal) * 100).toFixed(1) : 0}%`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="from-cyan-500 to-blue-500"
              />
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
                  <p className="text-gray-600 text-sm mt-1">Daily metrics over time</p>
                </div>
                <div className="text-sm text-gray-500">
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </div>
              </div>

              {loading ? (
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
              ) : chartData.length === 0 ? (
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
                  <h4 className="text-lg font-medium text-gray-700 mb-1">No Data Available</h4>
                  <p className="text-gray-500 text-sm">No analytics data for selected time range</p>
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
                        <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
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
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white'
                        }}
                        formatter={(value, name) => {
                          if (name === 'commission') return [`₹${Number(value).toFixed(0)}`, 'Commission']
                          if (name === 'clicks') return [Number(value).toFixed(0), 'Clicks']
                          if (name === 'conversions') return [Number(value).toFixed(0), 'Conversions']
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
                        dataKey="conversions" 
                        name="Conversions" 
                        stroke="#10b981" 
                        fill="url(#colorConversions)"
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Period</span>
                  <span className="font-medium text-gray-900">
                    {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Days</span>
                  <span className="font-medium text-gray-900">{chartData.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Daily Clicks</span>
                  <span className="font-medium text-gray-900">
                    {chartData.length > 0 ? Math.round(summary.clicksTotal / chartData.length) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Daily Commission</span>
                  <span className="font-medium text-gray-900">
                    ₹{chartData.length > 0 ? Math.round(summary.commissionTotal / chartData.length) : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Growth Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Clicks Growth</span>
                  <div className={`flex items-center gap-1 ${growth.clicks > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growth.clicks > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span className="font-medium">{Math.abs(growth.clicks)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Conversions Growth</span>
                  <div className={`flex items-center gap-1 ${growth.conversions > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growth.conversions > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span className="font-medium">{Math.abs(growth.conversions)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Revenue Growth</span>
                  <div className={`flex items-center gap-1 ${growth.commission > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growth.commission > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span className="font-medium">{Math.abs(growth.commission)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={downloadReport}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
                <button 
                  onClick={refresh}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, growth }) {
  const isPositive = growth > 0
  const hasGrowth = growth !== undefined

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        {hasGrowth && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? '+' : ''}{growth}%
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  )
}

// Custom icons
const ClockIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)