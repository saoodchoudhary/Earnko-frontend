'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { 
  Grid, ClipboardList, DollarSign, CreditCard, Users, LogOut, 
  Store as StoreIcon, Tag, MousePointer, Webhook, Settings as SettingsIcon,
  Shield, AlertCircle, ChevronRight, Menu, X, Bell, Search, User, ArrowLeft, RefreshCw
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
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

  useEffect(() => {
    let mounted = true
    async function verify() {
      try {
        const token = getToken()
        if (!token) { 
          if (mounted) { 
            setAuthorized(false); 
            setLoading(false); 
            router.push('/login') 
          } 
          return 
        }
        const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await safeJson(res)
        if (!res.ok) {
          localStorage.removeItem('token'); 
          localStorage.removeItem('user')
          if (mounted) { 
            setAuthorized(false); 
            setLoading(false); 
            router.push('/login') 
          }
          return
        }
        const userData = data?.data?.user || data?.data || null
        if (!userData || userData.role !== 'admin') {
          localStorage.removeItem('token'); 
          localStorage.removeItem('user')
          if (mounted) { 
            setAuthorized(false); 
            setLoading(false); 
            router.push('/login') 
          }
          return
        }
        if (mounted) { 
          localStorage.setItem('user', JSON.stringify(userData)); 
          setUser(userData);
          setAuthorized(true); 
          setLoading(false) 
        }
      } catch {
        localStorage.removeItem('token'); 
        localStorage.removeItem('user')
        if (mounted) { 
          setAuthorized(false); 
          setLoading(false); 
          router.push('/login') 
        }
      }
    }
    verify()
    return () => { mounted = false }
  }, [router, dispatch, base])

  // Load notifications when dropdown opens
  const loadNotifications = async () => {
    try {
      setNotifLoading(true)
      const token = getToken()
      if (!base || !token) {
        setNotifications([])
        setNotifLoading(false)
        return
      }
      const res = await fetch(`${base}/api/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await safeJson(res)
      if (!res.ok) {
        setNotifications([])
        setNotifLoading(false)
        return
      }
      const list = data?.data?.notifications || data?.data?.items || data?.notifications || data?.items || []
      setNotifications(Array.isArray(list) ? list : [])
    } catch {
      setNotifications([])
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

  const handleLogout = () => { 
    dispatch(logout()); 
    router.push('/login') 
  }

  const navItems = [
    { 
      title: 'Dashboard', 
      items: [
        { label: 'Overview', href: '/admin', icon: <Grid className="w-4 h-4" /> }
      ]
    },
    { 
      title: 'Transactions', 
      items: [
        { label: 'All Transactions', href: '/admin/transactions', icon: <ClipboardList className="w-4 h-4" /> },
        { label: 'Commissions', href: '/admin/commissions', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Payouts', href: '/admin/payouts', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Clicks Tracking', href: '/admin/clicks', icon: <MousePointer className="w-4 h-4" /> },
      ]
    },
    { 
      title: 'Content Management', 
      items: [
        { label: 'Stores', href: '/admin/stores', icon: <StoreIcon className="w-4 h-4" /> },
        { label: 'Products', href: '/admin/products', icon: <Grid className="w-4 h-4" /> },
        { label: 'Offers', href: '/admin/offers', icon: <Tag className="w-4 h-4" /> },
      ]
    },
    { 
      title: 'User Management', 
      items: [
        { label: 'All Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Support Tickets', href: '/admin/support', icon: <AlertCircle className="w-4 h-4" /> },
      ]
    },
    { 
      title: 'System', 
      items: [
        { label: 'Webhooks', href: '/admin/webhooks', icon: <Webhook className="w-4 h-4" /> },
        { label: 'Settings', href: '/admin/settings', icon: <SettingsIcon className="w-4 h-4" /> },
      ]
    },
  ]

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n =>
    n.read === false || n.isRead === false || n.status === 'unread'
  ).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
          <div className="text-sm text-gray-600">Verifying admin access...</div>
        </div>
      </div>
    )
  }
  
  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {pathname !== '/admin' ? (
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
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Admin</span>
            </Link>
          </div>
          <div className="relative flex items-center space-x-2">
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
            {/* Mobile notif dropdown */}
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
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-600">No notifications</div>
                  ) : (
                    notifications.map((n, i) => (
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
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Earnko Admin</div>
                <div className="text-xs text-gray-500">Administration Panel</div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {navItems.map((section, index) => (
              <div key={index} className="mb-6">
                <div className="px-3 mb-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          isActive(item.href)
                            ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-800'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className={isActive(item.href) ? 'text-gray-800' : 'text-gray-500'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {isActive(item.href) && (
                          <ChevronRight className="w-4 h-4 ml-auto text-gray-600" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
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
          <div className="px-6 py-6 border-b flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Earnko Admin</div>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {navItems.map((section, index) => (
              <div key={index} className="mb-4">
                <div className="px-3 mb-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg ${
                          isActive(item.href)
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-900">Admin</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate max-w-[50vw]">
                  {pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1) || 'Dashboard'}
                </span>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search admin..."
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm w-64"
                  />
                </div>
                
                <div className="relative">
                  <button
                    ref={notifBtnRef}
                    onClick={toggleNotif}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {Math.min(unreadCount, 99)}
                      </span>
                    )}
                  </button>
                  {/* Desktop notif dropdown */}
                  {notifOpen && (
                    <div
                      ref={notifBoxRef}
                      className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
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
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-600">No notifications</div>
                        ) : (
                          notifications.map((n, i) => (
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
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area with extra bottom padding to avoid overlapping bottom nav on mobile */}
        <main className="min-h-screen pb-24 lg:pb-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="px-4 lg:px-6 py-6 mb-[60px] lg:mb-0">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
          <div className="flex items-center justify-around py-2">
            <Link href="/admin" className="flex flex-col items-center p-2">
              <Grid className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link href="/admin/transactions" className="flex flex-col items-center p-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Transactions</span>
            </Link>
            <Link href="/admin/users" className="flex flex-col items-center p-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Users</span>
            </Link>
            <Link href="/admin/stores" className="flex flex-col items-center p-2">
              <StoreIcon className="w-5 h-5 text-gray-600" />
              <span className="text-xs mt-1">Stores</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}