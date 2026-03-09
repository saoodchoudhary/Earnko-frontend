'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import {
  Grid, ShoppingBag, Wallet, Users,
  CreditCard, Settings as SettingsIcon, LogOut, Menu, X,
  TrendingUp, BarChart3, Bell, Zap,
  ChevronRight, DollarSign, RefreshCw,
  Target, ArrowLeft,
  HelpCircle,
  HomeIcon
} from 'lucide-react'

// Organize navigation items by categories
const navCategories = [
  {
    title: 'DASHBOARD',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Grid, color: 'text-blue-600', badge: null },
    ]
  },
  {
    title: 'EARNINGS',
    items: [
      { key: 'affiliate', label: 'Create Link', href: '/dashboard/affiliate', icon: Zap, color: 'text-cyan-600', badge: 'New' },
      { key: 'stores', label: 'Stores', href: '/stores', icon: CreditCard, color: 'text-indigo-600', badge: null },
      { key: 'refer', label: 'Refer & Earn', href: '/dashboard/referrals', icon: Users, color: 'text-pink-600', badge: null },
    ]
  },
  {
    title: 'MANAGE',
    items: [
      { key: 'transactions', label: 'Transactions', href: '/dashboard/transactions', icon: ShoppingBag, color: 'text-orange-600', badge: null },
      { key: 'withdraw', label: 'Withdraw', href: '/dashboard/withdraw', icon: Wallet, color: 'text-green-600', badge: null },
      { key: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'text-purple-600', badge: 'Pro' },
    ]
  },
  {
    title: 'ACCOUNT',
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

  const [loading, setLoading] = useState(true)

  // Backend data
  const [userData, setUserData] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [quickStats, setQuickStats] = useState({
    todayEarnings: 0,
    todayClicks: 0,
    activeCampaigns: 0,
    conversionRate: 0
  })

  // Real-time today analytics (clicks + conversions)
  const [analyticsToday, setAnalyticsToday] = useState({ clicks: 0, conversions: 0 })

  // Notifications
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notificationsList, setNotificationsList] = useState([])
  const notifBtnRef = useRef(null)
  const notifBoxRef = useRef(null)

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { return await res.json() } catch { return null }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Fetch all user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const token = getToken()
        if (!token || !base) return

        // Fetch user profile
        const userRes = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const userDataRes = await safeJson(userRes)
        const userProfile = userDataRes?.data?.user || userDataRes?.data || null
        setUserData(userProfile || null)

        // Fetch wallet data
        const walletRes = await fetch(`${base}/api/wallet/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const walletDataRes = await safeJson(walletRes)
        setWalletData(walletDataRes?.data?.wallet || null)

        // Fetch quick stats (if available)
        const statsRes = await fetch(`${base}/api/user/quick-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (statsRes.ok) {
          const statsData = await safeJson(statsRes)
          if (statsData?.data) setQuickStats(statsData.data)
        }

        // Fetch today's clicks + conversions (real) from analytics daily series
        const analyticsRes = await fetch(`${base}/api/user/analytics?range=1d`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (analyticsRes.ok) {
          const analyticsData = await safeJson(analyticsRes)
          const daily = Array.isArray(analyticsData?.data?.daily) ? analyticsData.data.daily : []
          const today = daily.reduce(
            (acc, d) => ({
              clicks: acc.clicks + Number(d.clicks || 0),
              conversions: acc.conversions + Number(d.conversions || 0),
            }),
            { clicks: 0, conversions: 0 }
          )
          setAnalyticsToday(today)
        }

        // Fetch notifications unread count (keep as-is; if backend differs we can adjust)
        const notifCountRes = await fetch(`${base}/api/user/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const notifCountData = await safeJson(notifCountRes)
        setUnreadCount(Number(notifCountData?.data?.count || 0))
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load notifications list when dropdown opens
  const loadNotifications = async () => {
    try {
      setNotifLoading(true)
      const token = getToken()
      if (!base || !token) {
        setNotificationsList([])
        setNotifLoading(false)
        return
      }
      const res = await fetch(`${base}/api/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await safeJson(res)
      if (!res.ok) {
        setNotificationsList([])
        setNotifLoading(false)
        return
      }
      const list = data?.data?.notifications || data?.data?.items || data?.notifications || data?.items || []
      setNotificationsList(Array.isArray(list) ? list : [])
    } catch {
      setNotificationsList([])
    } finally {
      setNotifLoading(false)
    }
  }

  // Toggle notif dropdown
  const toggleNotif = () => {
    setNotifOpen(prev => {
      const next = !prev
      if (next) loadNotifications()
      return next
    })
  }

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!notifOpen) return
      const btn = notifBtnRef.current
      const box = notifBoxRef.current
      if (btn && btn.contains(e.target)) return
      if (box && box.contains(e.target)) return
      setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  // Determine which user data to display
  const displayUser = user || userData

  const initials = useMemo(() => {
    const name = displayUser?.name || ''
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  }, [displayUser?.name])

  const formatINR = (n) => {
    const num = Number(n || 0)
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
    } catch {
      return `₹${Math.round(num)}`
    }
  }

  // Wallet-derived values
  const availableBalance = walletData?.availableBalance ?? displayUser?.wallet?.availableBalance ?? 0
  const pendingCashback = walletData?.pendingCashback ?? displayUser?.wallet?.pendingCashback ?? 0
  const confirmedCashback = walletData?.confirmedCashback ?? displayUser?.wallet?.confirmedCashback ?? 0
  const referralEarnings = walletData?.referralEarnings ?? displayUser?.wallet?.referralEarnings ?? 0
  const totalWithdrawn = walletData?.totalWithdrawn ?? displayUser?.wallet?.totalWithdrawn ?? 0

  // ✅ Lifetime Total Earnings (best definition)
  const totalEarnings = Number(confirmedCashback || 0) + Number(referralEarnings || 0) + Number(totalWithdrawn || 0)

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
    if (href === '/dashboard') return pathname === '/dashboard'
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

  // ✅ Desktop header stats (add Total Earnings)
  const headerStats = [
    { label: 'Total', value: formatINR(totalEarnings) },
    { label: 'Today', value: `₹${Number(quickStats.todayEarnings || 0).toLocaleString('en-IN')}` },
    { label: 'Clicks', value: Number(analyticsToday.clicks || 0).toLocaleString('en-IN') },
    { label: 'Conversions', value: Number(analyticsToday.conversions || 0).toLocaleString('en-IN') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - replace earning pill with Total Earnings pill */}
      <header className="lg:hidden bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {pathname !== '/dashboard' ? (
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>
              )}

              <Link href="/" className="flex items-center space-x-2">
                <img
                  src="/images/earnko-logo-round.png"
                  alt="earnko logo"
                  className="w-[40px]"
                />
                <span className="text-lg font-bold text-gray-900">Earnko</span>
              </Link>
            </div>

            <div className="relative flex items-center gap-2">
              <button
                ref={notifBtnRef}
                onClick={toggleNotif}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {Math.min(unreadCount, 9)}
                  </span>
                )}
              </button>

              {/* ✅ Total earnings pill (mobile) */}
              <div
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs font-semibold"
                title="Total Earnings (lifetime)"
              >
                Total: {formatINR(totalEarnings)}
              </div>

              {notifOpen && (
                <div
                  ref={notifBoxRef}
                  className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="px-3 py-2 border-b flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">Notifications</div>
                    <button
                      onClick={loadNotifications}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${notifLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifLoading ? (
                      <div className="p-3 space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : notificationsList.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-600">No notifications</div>
                    ) : (
                      notificationsList.map((n, i) => (
                        <div key={n._id || i} className="px-3 py-2 border-b last:border-b-0 hover:bg-gray-50">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {n.title || n.subject || 'Notification'}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {n.message || n.body || n.description || ''}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/images/earnko-logo-round.png"
                alt="earnko logo"
                className="w-[40px]"
              />
              <div>
                <div className="text-lg font-bold text-gray-900">Earnko</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </Link>
          </div>

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
              <img
                src="/images/earnko-logo-round.png"
                alt="earnko logo"
                className="w-[40px]"
              />
              <div>
                <div className="text-lg font-bold text-gray-900">Earnko</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close menu">
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Breadcrumb */}
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-gray-900">Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate max-w-[50vw]">
                    {pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1) || 'Overview'}
                  </span>
                </div>
              </div>

              {/* Right: Stats + Actions */}
              <div className="flex items-center gap-4">
                {/* ✅ Quick Stats: Total, Today, Clicks, Conversions */}
                <div className="flex items-center gap-5">
                  {headerStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-[11px] text-gray-500">{stat.label}</div>
                      <div className={`text-sm font-bold ${stat.label === 'Total' ? 'text-gray-900' : 'text-gray-900'}`}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-px h-6 bg-gray-200" />

                <div className="relative flex items-center gap-2">
                  <button
                    ref={notifBtnRef}
                    onClick={toggleNotif}
                    className="relative p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {Math.min(unreadCount, 99)}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div
                      ref={notifBoxRef}
                      className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    >
                      <div className="px-4 py-2 border-b flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">Notifications</div>
                        <button
                          onClick={loadNotifications}
                          className="p-1.5 rounded hover:bg-gray-100"
                          title="Refresh"
                        >
                          <RefreshCw className={`w-4 h-4 ${notifLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifLoading ? (
                          <div className="p-4 space-y-2">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                            ))}
                          </div>
                        ) : notificationsList.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-600">No notifications</div>
                        ) : (
                          notificationsList.map((n, i) => (
                            <div key={n._id || i} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {n.title || n.subject || 'Notification'}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {n.message || n.body || n.description || ''}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

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

        <main className="min-h-screen pb-24 lg:pb-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="px-4 mb-[60px] lg:mb-0 lg:px-6 py-4">
            {children}
          </div>
        </main>

        {/* Bottom Mobile Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
          <div className="flex items-center justify-around py-2">
            <Link href="/" className="flex flex-col items-center p-2">
              <HomeIcon className="w-5 h-5 text-gray-600" />
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
            <Link href="/dashboard" className="flex flex-col items-center p-2">
              <Grid className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        aside nav {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        aside nav::-webkit-scrollbar { width: 4px; }
        aside nav::-webkit-scrollbar-track { background: #f1f5f9; }
        aside nav::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 2px; }
        * { transition: background-color 0.2s ease, border-color 0.2s ease; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  )
}