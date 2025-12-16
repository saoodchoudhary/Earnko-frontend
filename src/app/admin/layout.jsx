'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { Grid, ClipboardList, DollarSign, CreditCard, Users, LogOut, Store as StoreIcon, Tag, MousePointer, Webhook, Settings as SettingsIcon } from 'lucide-react'

export default function AdminLayout({ children }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let mounted = true
    async function verify() {
      try {
        const token = localStorage.getItem('token')
        if (!token) { if (mounted) { setAuthorized(false); setLoading(false); router.push('/login') } return }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          localStorage.removeItem('token'); localStorage.removeItem('user')
          if (mounted) { setAuthorized(false); setLoading(false); router.push('/login') }
          return
        }
        const data = await res.json()
        const user = data?.data?.user || data?.data || null
        if (!user || user.role !== 'admin') {
          localStorage.removeItem('token'); localStorage.removeItem('user')
          if (mounted) { setAuthorized(false); setLoading(false); router.push('/login') }
          return
        }
        if (mounted) { localStorage.setItem('user', JSON.stringify(user)); setAuthorized(true); setLoading(false) }
      } catch {
        localStorage.removeItem('token'); localStorage.removeItem('user')
        if (mounted) { setAuthorized(false); setLoading(false); router.push('/login') }
      }
    }
    verify()
    return () => { mounted = false }
  }, [router, dispatch])

  const handleLogout = () => { dispatch(logout()); router.push('/login') }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <div className="text-sm text-gray-600">Verifying admin access...</div>
        </div>
      </div>
    )
  }
  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <div className="mb-6">
            <Link href="/admin"><h2 className="text-xl font-bold">Earnko Admin</h2></Link>
            <div className="text-xs text-gray-500 mt-1">Admin Panel</div>
          </div>

          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><Grid className="w-4 h-4" /> Dashboard</Link>
            <Link href="/admin/transactions" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><ClipboardList className="w-4 h-4" /> Transactions</Link>
            <Link href="/admin/commissions" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><DollarSign className="w-4 h-4" /> Commissions</Link>
            <Link href="/admin/payouts" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><CreditCard className="w-4 h-4" /> Payouts</Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><Users className="w-4 h-4" /> Users</Link>
            <Link href="/admin/stores" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><StoreIcon className="w-4 h-4" /> Stores</Link>
            <Link href="/admin/offers" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><Tag className="w-4 h-4" /> Offers</Link>
            <Link href="/admin/clicks" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><MousePointer className="w-4 h-4" /> Clicks</Link>
            <Link href="/admin/webhooks" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><Webhook className="w-4 h-4" /> Webhooks</Link>
            <Link href="/admin/settings" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"><SettingsIcon className="w-4 h-4" /> Settings</Link>
          </nav>

          <div className="mt-6">
            <button onClick={handleLogout} className="w-full text-left p-2 bg-red-50 text-red-600 rounded">Logout</button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}