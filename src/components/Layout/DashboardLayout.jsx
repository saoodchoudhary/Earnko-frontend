'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import {
  Grid, Link as LinkIcon, ShoppingBag, Wallet, Users,
  CreditCard, Settings as SettingsIcon, LogOut, Menu, X, User,
  TrendingUp, BarChart3, Bell, Search, Zap, Home,
  ChevronRight, Award, DollarSign, ExternalLink,
  PieChart, TrendingUp as TrendingIcon, Gift, Shield,
  HelpCircle, MessageSquare, FileText, Calendar,
  ChevronDown, Globe, Shield as ShieldIcon,
  Target, Clock, Star
} from 'lucide-react'

// Organize navigation items by categories
const navCategories = [
  {
    title: "DASHBOARD",
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Grid, color: 'text-blue-600', badge: null },
    ]
  },
  {
    title: "EARNINGS",
    items: [
      { key: 'affiliate', label: 'Create Link', href: '/dashboard/affiliate', icon: Zap, color: 'text-cyan-600', badge: 'New' },
      { key: 'stores', label: 'Stores', href: '/stores', icon: CreditCard, color: 'text-indigo-600', badge: null },
      { key: 'offers', label: 'Top Offers', href: '/dashboard/#', icon: Gift, color: 'text-amber-600', badge: 'Hot' },
      { key: 'refer', label: 'Refer & Earn', href: '/dashboard/referrals', icon: Users, color: 'text-pink-600', badge: null },
    ]
  },
  {
    title: "MANAGE",
    items: [
      { key: 'transactions', label: 'Transactions', href: '/dashboard/transactions', icon: ShoppingBag, color: 'text-orange-600', badge: null },
      { key: 'withdraw', label: 'Withdraw', href: '/dashboard/withdraw', icon: Wallet, color: 'text-green-600', badge: null },
      { key: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'text-purple-600', badge: 'Pro' },
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { key: 'settings', label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, color: 'text-gray-600', badge: null },
      { key: 'support', label: 'Support', href: '/dashboard/support', icon: HelpCircle, color: 'text-red-600', badge: null },
    ]
  }
]

export default function DashboardLayout({ children }) {
  const authState = useSelector((state) => state?.auth) || {}
  const user = authState.user || null

  const dispatch = useDispatch()
  const pathname = usePathname()
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [notifications, setNotifications] = useState(0)
  
  // State for data from backend
  const [userData, setUserData] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [quickStats, setQuickStats] = useState({
    todayEarnings: 0,
    todayClicks: 0,
    activeCampaigns: 0,
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Fetch all user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) return

        // Fetch user profile
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const userDataRes = await userRes.json()
        const userProfile = userDataRes?.data?.user || userDataRes?.data || null
        setUserData(userProfile)

        // Fetch wallet data
        const walletRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/wallet/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const walletDataRes = await walletRes.json()
        setWalletData(walletDataRes?.data?.wallet || null)

        // Fetch quick stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/user/quick-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setQuickStats(statsData.data || {
            todayEarnings: 1250,
            todayClicks: 342,
            activeCampaigns: 8,
            conversionRate: 4.2
          })
        }

        // Fetch notifications count
        const notifRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/user/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (notifRes.ok) {
          const notifData = await notifRes.json()
          setNotifications(notifData.data?.count || 0)
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Determine which user data to display
  const displayUser = user || userData

  const initials = (() => {
    const name = displayUser?.name || ''
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  })()

  const formatINR = (n) => {
    const num = Number(n || 0)
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
    } catch {
      return `₹ ${Math.round(num)}`
    }
  }

  // Get wallet data from multiple sources
  const availableBalance = walletData?.availableBalance ?? displayUser?.wallet?.availableBalance ?? 0
  const pendingCashback = walletData?.pendingCashback ?? displayUser?.wallet?.pendingCashback ?? 0
  const confirmedCashback = walletData?.confirmedCashback ?? displayUser?.wallet?.confirmedCashback ?? 0
  const referralEarnings = walletData?.referralEarnings ?? displayUser?.wallet?.referralEarnings ?? 0

  const handleLogout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch {}
    if (typeof dispatch === 'function') {
      try { dispatch(logout()) } catch {}
    }
    router.push('/login')
  }

  const isActiveHref = (href) => {
    if (!isMounted) return false
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (pathname === href) return true
    const normalized = href.endsWith('/') ? href : href + '/'
    return pathname.startsWith(normalized)
  }

  const linkClasses = (href, color) => {
    const active = isActiveHref(href)
    const baseClass = 'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group'
    if (active) {
      return `${baseClass} bg-gradient-to-r from-blue-50 to-blue-50/50 text-gray-900 border-l-4 border-blue-500 shadow-sm`
    }
    return `${baseClass} text-gray-600 hover:bg-gray-50 hover:text-gray-900`
  }

  const quickActions = [
    { icon: <Zap className="w-4 h-4" />, label: 'Generate Link', href: '/dashboard/affiliate', color: 'from-blue-500 to-cyan-500' },
    { icon: <DollarSign className="w-4 h-4" />, label: 'Withdraw', href: '/dashboard/withdraw', color: 'from-green-500 to-emerald-500' },
    { icon: <Gift className="w-4 h-4" />, label: 'Top Offers', href: '/offers', color: 'from-amber-500 to-orange-500' },
    { icon: <TrendingIcon className="w-4 h-4" />, label: 'Analytics', href: '/dashboard/analytics', color: 'from-purple-500 to-pink-500' },
  ]

  // Header stats items
  const headerStats = [
    { label: 'Today', value: `₹${quickStats.todayEarnings}`, change: '+12.5%', icon: <DollarSign className="w-4 h-4" />, color: 'text-green-600' },
    { label: 'Clicks', value: quickStats.todayClicks, change: '+8.2%', icon: <TrendingIcon className="w-4 h-4" />, color: 'text-blue-600' },
    { label: 'Conversion', value: `${quickStats.conversionRate}%`, change: '+1.4%', icon: <Target className="w-4 h-4" />, color: 'text-purple-600' },
    { label: 'Active', value: quickStats.activeCampaigns, change: null, icon: <Zap className="w-4 h-4" />, color: 'text-amber-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Compact Design */}
      <header className="lg:hidden bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">Earnko</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <button className="relative p-2">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Slim Design */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          {/* Logo Section - Compact */}
          <div className="px-4 py-5 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">Earnko</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </Link>
          </div>

          {/* User Profile - Compact */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{displayUser?.name || 'User'}</div>
                <div className="text-xs text-gray-500 truncate">Affiliate Partner</div>
              </div>
            </div>
          </div>

          {/* Navigation - Organized by Categories */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {navCategories.map((category, index) => (
              <div key={index} className="mb-6">
                <div className="px-3 mb-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category.title}
                  </div>
                </div>
                <ul className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon
                    const active = isActiveHref(item.href)
                    return (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={linkClasses(item.href, item.color)}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            active ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            <Icon className={`w-4 h-4 ${active ? item.color : 'text-gray-500'}`} />
                          </div>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.badge === 'New' ? 'bg-blue-100 text-blue-600' :
                              item.badge === 'Hot' ? 'bg-red-100 text-red-600' :
                              item.badge === 'Pro' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Quick Balance - Compact */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
              <div className="text-sm font-medium text-gray-300">Available</div>
              {loading ? (
                <div className="h-6 w-24 rounded bg-white/20 animate-pulse mt-1" />
              ) : (
                <div className="text-xl font-bold mt-1">
                  {formatINR(availableBalance)}
                </div>
              )}
              <Link
                href="/dashboard/withdraw"
                className="mt-3 w-full inline-flex items-center justify-center gap-1 py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:shadow-md transition-all"
              >
                Withdraw
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="px-4 py-5 border-b flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">Earnko</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {navCategories.map((category, index) => (
              <div key={index} className="mb-4">
                <div className="px-3 mb-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category.title}
                  </div>
                </div>
                <ul className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon
                    const active = isActiveHref(item.href)
                    return (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={linkClasses(item.href, item.color)}
                        >
                          <Icon className={`w-5 h-5 ${active ? item.color : 'text-gray-500'}`} />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.badge === 'New' ? 'bg-blue-100 text-blue-600' :
                              item.badge === 'Hot' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
          
          <div className="px-4 py-4 border-t">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Desktop Header - Clean and Functional */}
        <header className="hidden lg:block bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Breadcrumb and Search */}
              <div className="flex items-center gap-6 flex-1">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1) || 'Overview'}
                  </span>
                </div>

                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search anything..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Stats and Actions */}
              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <div className="flex items-center gap-3">
                  {headerStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500">{stat.label}</div>
                      <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                      {stat.change && (
                        <div className="text-[10px] font-semibold text-green-600">{stat.change}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="w-px h-6 bg-gray-200"></div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => router.push('/dashboard/affiliate')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Create Link
                  </button>
                  
                  <button className="relative p-2 rounded-lg hover:bg-gray-100">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </button>

                  <Link 
                    href="/dashboard/settings" 
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <SettingsIcon className="w-5 h-5 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Maximum Space */}
        <main className="min-h-screen">
          <div className="px-4 lg:px-6 py-4">
            {children}
          </div>
        </main>

        {/* Bottom Mobile Nav - Essential Items Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
          <div className="flex items-center justify-around py-2">
            <Link href="/dashboard" className="flex flex-col items-center p-2">
              <Grid className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Home</span>
            </Link>
          
            <Link href="/dashboard/analytics" className="flex flex-col items-center p-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Analytics</span>
            </Link>  
            <Link href="/dashboard/affiliate" className="flex flex-col items-center p-2">
              <Zap className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Create</span>
            </Link>
            
            
            <Link href="/dashboard/withdraw" className="flex flex-col items-center p-2">
              <Wallet className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Wallet</span>
            </Link>
            
            <Link href="/dashboard/settings" className="flex flex-col items-center p-2">
              <SettingsIcon className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">More</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx global>{`
        /* Custom scrollbar for sidebar */
        aside nav {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        aside nav::-webkit-scrollbar {
          width: 4px;
        }
        
        aside nav::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        aside nav::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 2px;
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        
        /* Animation for pulse */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}