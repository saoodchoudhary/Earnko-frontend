'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { Grid, ClipboardList, DollarSign, CreditCard, Users, LogOut } from 'lucide-react'

export default function AdminLayout({ children }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Verify admin on mount
  useEffect(() => {
    let mounted = true

    async function verify() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          // Not logged in
          if (mounted) {
            setAuthorized(false)
            setLoading(false)
            router.push('/login')
          }
          return
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          // invalid token or server error -> redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (mounted) {
            setAuthorized(false)
            setLoading(false)
            router.push('/login')
          }
          return
        }

        const data = await res.json()
        const user = data?.data?.user || data?.data || null

        // If not admin -> redirect to /login
        if (!user || user.role !== 'admin') {
          // optionally clear any existing auth to avoid confusion
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (mounted) {
            setAuthorized(false)
            setLoading(false)
            router.push('/login')
          }
          return
        }

        // authorized admin
        if (mounted) {
          // keep user in localStorage so other parts can use it
          localStorage.setItem('user', JSON.stringify(user))
          setAuthorized(true)
          setLoading(false)
        }
      } catch (err) {
        console.error('Admin verify error', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (mounted) {
          setAuthorized(false)
          setLoading(false)
          router.push('/login')
        }
      }
    }

    verify()
    return () => { mounted = false }
  }, [router, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  // while verifying show full-screen loader
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

  // if not authorized we already redirected to /login
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
            <Link href="/admin" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <Grid className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/admin/transactions" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <ClipboardList className="w-4 h-4" /> Transactions
            </Link>
            <Link href="/admin/commissions" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <DollarSign className="w-4 h-4" /> Commissions
            </Link>
            <Link href="/admin/payouts" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <CreditCard className="w-4 h-4" /> Payouts
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <Users className="w-4 h-4" /> Users
            </Link>
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