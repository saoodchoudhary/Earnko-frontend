// components/Layout/DashboardLayout.jsx (Safe redux usage + improved UX)
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import {
  Grid, Link as LinkIcon, ShoppingBag, Wallet, Users,
  CreditCard, Settings as SettingsIcon, LogOut, Menu, X, User,
  TrendingUp, BarChart3, Bell, Search
} from 'lucide-react'

/**
 * WHY THIS CHANGE:
 * - You got: "Cannot destructure property 'user' ... useSelector(...)" which means state.auth is undefined.
 * - We now read auth state safely with optional chaining and provide fallbacks.
 * - This component will work whether you have auth slice wired or not.
 */

const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Grid },
  { key: 'affiliate', label: 'Create Link', href: '/dashboard/affiliate', icon: LinkIcon },
  { key: 'transactions', label: 'Transactions', href: '/dashboard/transactions', icon: ShoppingBag },
  { key: 'withdraw', label: 'Withdraw', href: '/dashboard/withdraw', icon: Wallet },
  { key: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { key: 'stores', label: 'Stores', href: '/stores', icon: CreditCard },
  { key: "support", label: "Support", href: "/dashboard/support", icon: CreditCard },
  { key: 'refer', label: 'Refer & Earn', href: '/dashboard/referrals', icon: Users },
  { key: 'settings', label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon }
]

export default function DashboardLayout({ children }) {
  // SAFE: do not destructure from possibly undefined slice
  const authState = useSelector((state) => state?.auth) || {}
  const user = authState.user || null

  const dispatch = useDispatch()
  const pathname = usePathname()
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [notifications] = useState(0)

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // If redux authState is not available, try token-based fallback for showing name/email
  const [fallbackUser, setFallbackUser] = useState(null)
  useEffect(() => {
    let active = true
    async function loadMe() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        const me = data?.data?.user || data?.data || null
        if (active) setFallbackUser(me)
      } catch {}
    }
    // Only fetch if user from redux is missing
    if (!user) loadMe()
    return () => { active = false }
  }, [user])

  const displayUser = user || fallbackUser
  const initials = (() => {
    const name = displayUser?.name || ''
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  })()

  const handleLogout = () => {
    // Clear both redux and token fallback
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch {}
    // If authSlice exists, dispatch; otherwise just navigate
    if (typeof dispatch === 'function') {
      try { dispatch(logout()) } catch {}
    }
    router.push('/login')
  }

  const activeClass = (href) => {
    if (!isMounted) return 'text-gray-700'
    if (href === '/dashboard' && pathname === '/dashboard') {
      return 'bg-gray-900 text-white'
    }
    return pathname.startsWith(href)
      ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Earnko</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
          {/* Logo */}
          <div className="px-6 py-6 border-b">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Earnko</div>
                <div className="text-xs text-gray-500">Affiliate Platform</div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeClass(item.href)}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Quick Stats (fallback static, can wire to wallet) */}
            <div className="mt-8 px-4">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white">
                <div className="text-sm font-medium">Available Balance</div>
                <div className="text-xl font-bold mt-1">₹—</div>
                <div className="text-xs text-gray-300 mt-1">Ready to withdraw</div>
                <Link href="/dashboard/withdraw" className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:text-gray-200">
                  Withdraw Now <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{displayUser?.name || 'User'}</div>
                <div className="text-xs text-gray-500 truncate">{displayUser?.email || ''}</div>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg" title="Logout">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-6 border-b flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Earnko</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${activeClass(item.href)}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Desktop Topbar */}
        <header className="hidden lg:block bg-white border-b shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search transactions, stores, or reports..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <button className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
                <Link href="/dashboard/settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <User className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="py-6">
          <div className="px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Small arrow icon
const ArrowUpRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" />
  </svg>
)