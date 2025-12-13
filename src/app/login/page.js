'use client'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser, clearError, getCurrentUser } from '@/store/slices/authSlice'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (error) setLocalError(error)
  }, [error])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (localError) setLocalError(null)
    if (error) dispatch(clearError())
  }

  const validate = () => {
    if (!formData.email) return 'Email is required'
    if (!formData.password) return 'Password is required'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setLocalError(v)
      return
    }

    const res = await dispatch(loginUser(formData))
    if (res.type === 'auth/login/fulfilled') {
      // Optionally refresh user profile
      // try { await dispatch(getCurrentUser()) } catch (err) { /* ignore */ }
      router.push('/dashboard')
    } else {
      setLocalError(res.payload || 'Login failed')
    }
  }

  // Robust Google OAuth popup handler using postMessage + polling fallback
  const handleGoogleSignIn = () => {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    if (!API_URL) {
      setLocalError('OAuth is not configured.')
      return
    }

    setOauthLoading(true)

    // The backend should accept a redirect param where it will redirect the popup after completing OAuth.
    // That frontend redirect page must postMessage token back to opener (see notes below).
    const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectTo = encodeURIComponent(`${frontendOrigin}/auth/success`)
    const oauthUrl = `${API_URL}/api/auth/google?redirect=${redirectTo}`

    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2.5

    const popup = window.open(
      oauthUrl,
      'oauth_google',
      `popup=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`
    )

    if (!popup) {
      setLocalError('Popup blocked. Please allow popups and try again.')
      setOauthLoading(false)
      return
    }

    let handled = false
    const timeoutMs = 60_000 // 60 seconds

    function handleMessage(event) {
      try {
        if (event.origin !== window.location.origin) return
        const data = event.data
        if (!data || data.type !== 'oauth' || data.provider !== 'google') return
        const token = data.token
        if (token) {
          handled = true
          localStorage.setItem('token', token)
          // Optionally let authSlice fetch user
          dispatch(getCurrentUser()).catch(() => {})
          try { popup.close() } catch (e) {}
          window.removeEventListener('message', handleMessage)
          setOauthLoading(false)
          toast.success('Signed in successfully')
          router.push('/dashboard')
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('message', handleMessage, false)

    // Polling fallback in case postMessage isn't used by the redirect page
    const pollInterval = 700
    let elapsed = 0
    const poller = setInterval(() => {
      if (handled) {
        clearInterval(poller)
        return
      }
      try {
        const token = localStorage.getItem('token')
        if (token) {
          handled = true
          clearInterval(poller)
          try { popup.close() } catch (e) {}
          window.removeEventListener('message', handleMessage)
          setOauthLoading(false)
          // Fetch user info if needed
          dispatch(getCurrentUser()).catch(()=>{})
          toast.success('Signed in successfully')
          router.push('/dashboard')
        }
      } catch (err) {
        // cross-origin until redirect completes — ignore
      }
      elapsed += pollInterval
      if (elapsed >= timeoutMs) {
        clearInterval(poller)
        window.removeEventListener('message', handleMessage)
        try { if (popup && !popup.closed) popup.close() } catch (e) {}
        if (!handled) {
          setOauthLoading(false)
          setLocalError('OAuth timed out. Please try again.')
        }
      }
    }, pollInterval)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Earnko account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {localError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-700">{localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 outline-none transition"
                  placeholder="you@example.com"
                  aria-label="Email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 outline-none transition"
                  placeholder="Enter your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-gray-900 border-gray-300 rounded"
                  aria-label="Remember me"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-gray-900 font-medium hover:underline">Forgot password?</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-500">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            disabled={oauthLoading}
            aria-label="Sign in with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-gray-900 font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer help */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <Link href="/help" className="text-gray-700 hover:underline">
              Visit Help Center
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}