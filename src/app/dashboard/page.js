'use client'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { fetchDashboardStats } from '@/store/slices/dashboardSlice'
import { fetchTransactions } from '@/store/slices/transactionSlice'
import { getAffiliateStats } from '@/store/slices/affiliateSlice'
import {
  TrendingUp, Clock, Wallet, Users, Link2, ShoppingBag, AlertCircle,
  DollarSign, BarChart3, Target, TrendingUp as TrendingUpIcon, Calendar,
  ArrowUpRight, ArrowDownRight, Eye, MousePointer, Zap
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, loading }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">₹{loading ? '--' : value || 0}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend.direction]}`}>
                {trend.direction === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {trend.value}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

const QuickAction = ({ title, description, icon: Icon, href, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  }

  return (
    <Link href={href} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 group">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { stats, loading: statsLoading } = useSelector(state => state.dashboard)
  const { transactions } = useSelector(state => state.transactions)
  const { stats: affiliateStats } = useSelector(state => state.affiliate)
  const dispatch = useDispatch()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('week')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      const token = localStorage.getItem('token')
      if (token) dispatch({ type: 'auth/currentUser/pending' })
      else router.push('/login')
    }
  }, [isAuthenticated, router, dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchTransactions({ limit: 5 })),
        dispatch(getAffiliateStats())
      ]).finally(() => setIsLoading(false))
    }
  }, [isAuthenticated, dispatch])

  const earningsData = [
    { date: 'Mon', earnings: 1200 },
    { date: 'Tue', earnings: 1900 },
    { date: 'Wed', earnings: 1500 },
    { date: 'Thu', earnings: 2200 },
    { date: 'Fri', earnings: 1800 },
    { date: 'Sat', earnings: 2500 },
    { date: 'Sun', earnings: 2000 }
  ]

  const storePerformanceData = [
    { store: 'Amazon', commission: 2200, clicks: 1240 },
    { store: 'Flipkart', commission: 1800, clicks: 980 },
    { store: 'Myntra', commission: 1500, clicks: 750 },
    { store: 'Ajio', commission: 900, clicks: 520 },
    { store: 'Nykaa', commission: 600, clicks: 420 }
  ]

  const quickActions = [
    {
      title: 'Generate Affiliate Link',
      description: 'Create new affiliate links in seconds',
      icon: Link2,
      href: '/dashboard/affiliate',
      color: 'blue'
    },
    {
      title: 'Withdraw Earnings',
      description: 'Transfer funds to your bank account',
      icon: Wallet,
      href: '/dashboard/withdraw',
      color: 'green'
    },
    {
      title: 'View Analytics',
      description: 'Detailed performance insights',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'purple'
    },
    {
      title: 'Browse Stores',
      description: 'Explore partner stores',
      icon: ShoppingBag,
      href: '/stores',
      color: 'orange'
    }
  ]

  const conversionStats = [
    { label: 'Total Clicks', value: '1,248', change: '+12%' },
    { label: 'Conversion Rate', value: '4.8%', change: '+0.3%' },
    { label: 'Avg. Commission', value: '₹18.50', change: '+₹1.20' }
  ]

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="text-gray-600 mt-1">Here's your affiliate and cashback performance summary</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <Calendar className="w-4 h-4 inline-block mr-2" />
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Earnings"
          value={stats?.totalEarnings}
          subtitle="Lifetime earnings"
          icon={TrendingUp}
          color="blue"
          trend={{ direction: 'up', value: 12 }}
          loading={statsLoading}
        />
        <StatCard
          title="Available Balance"
          value={stats?.availableBalance}
          subtitle="Ready to withdraw"
          icon={Wallet}
          color="green"
          trend={{ direction: 'up', value: 8 }}
          loading={statsLoading}
        />
        <StatCard
          title="Pending Cashback"
          value={stats?.pendingCashback}
          subtitle="Awaiting confirmation"
          icon={Clock}
          color="purple"
          loading={statsLoading}
        />
        <StatCard
          title="Referral Earnings"
          value={user?.wallet?.referralEarnings}
          subtitle="From your referrals"
          icon={Users}
          color="orange"
          trend={{ direction: 'up', value: 15 }}
          loading={statsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Earnings Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Earnings Overview</h3>
              <p className="text-sm text-gray-600 mt-1">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Earnings
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Earnings']}
                  labelFormatter={(label) => `Day: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Performing Stores</h3>
              <p className="text-sm text-gray-600 mt-1">By commission earned</p>
            </div>
            <Link href="/stores" className="text-sm text-gray-900 font-medium hover:text-gray-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="store" 
                  stroke="#6b7280" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value, name) => [name === 'commission' ? `₹${value}` : value, name === 'commission' ? 'Commission' : 'Clicks']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="commission" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  name="Commission"
                />
                <Bar 
                  dataKey="clicks" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                  name="Clicks"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <span className="text-sm text-gray-600">Take action, earn more</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </div>

          {/* Conversion Stats */}
          {user?.affiliateInfo?.isAffiliate && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>
                  <p className="text-sm text-gray-600 mt-1">Affiliate link performance</p>
                </div>
                <Link href="/dashboard/affiliate" className="text-sm text-gray-900 font-medium hover:text-gray-700 flex items-center gap-1">
                  Manage Links <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {conversionStats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                    <div className="text-xs text-green-600 font-medium mt-2 flex items-center justify-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> {stat.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-600 mt-1">Latest earnings activity</p>
            </div>
            <Link href="/dashboard/transactions" className="text-sm text-gray-900 font-medium hover:text-gray-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start earning to see transactions here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{tx.store?.name || 'Unknown Store'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.orderDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">₹{tx.commissionAmount || 0}</div>
                    <div className={`text-xs font-medium mt-1 px-2 py-1 rounded-full inline-block ${
                      tx.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : tx.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Affiliate Stats Section */}
      {user?.affiliateInfo?.isAffiliate && affiliateStats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Affiliate Performance</h3>
              <p className="text-sm text-gray-600 mt-1">Detailed affiliate metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Last updated: Just now</span>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {affiliateStats.affiliateInfo?.uniqueLinks?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Links</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ₹{affiliateStats.overallStats?.find(s => s._id === 'confirmed')?.totalAmount || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Confirmed Earnings</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ₹{affiliateStats.overallStats?.find(s => s._id === 'pending')?.totalAmount || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending Earnings</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {affiliateStats.linkStats?.reduce((a, c) => a + (c.conversions || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Conversions</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}