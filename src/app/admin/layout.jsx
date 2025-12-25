// app/admin/layout.js
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { 
  Grid, ClipboardList, DollarSign, CreditCard, Users, LogOut, 
  Store as StoreIcon, Tag, MousePointer, Webhook, Settings as SettingsIcon,
  Home, TrendingUp, Shield, BarChart3, AlertCircle, FileText,
  ChevronRight, Menu, X, Bell, Search, User
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    async function verify() {
      try {
        const token = localStorage.getItem('token')
        if (!token) { 
          if (mounted) { 
            setAuthorized(false); 
            setLoading(false); 
            router.push('/login') 
          } 
          return 
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        
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
        
        const data = await res.json()
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
  }, [router, dispatch])

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
        // { label: 'Reports', href: '/admin/reports', icon: <FileText className="w-4 h-4" /> },
      ]
    },
  ]

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

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
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
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
        <header className="hidden lg:block bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Admin</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
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
                
                <button className="relative p-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
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

        {/* Main Content Area */}
        <main className="min-h-screen">
          <div className="px-4 lg:px-6 py-6">
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