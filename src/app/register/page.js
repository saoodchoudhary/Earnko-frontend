'use client'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser, clearError } from '@/store/slices/authSlice'
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react'

export default function Register() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (error) {
      setLocalError(error)
    }
  }, [error])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (localError) setLocalError(null)
    if (error) dispatch(clearError())
  }

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required'
    if (!formData.email.trim()) return 'Email is required'
    const re = /\S+@\S+\.\S+/
    if (!re.test(formData.email)) return 'Enter a valid email'
    if (!formData.password || formData.password.length < 6) return 'Password must be at least 6 characters'
    if (!agree) return 'You must agree to terms'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setLocalError(v)
      return
    }
    const res = await dispatch(registerUser(formData))
    if (res.type === 'auth/register/fulfilled') {
      router.push('/dashboard')
    } else if (res.payload) {
      setLocalError(res.payload)
    }
  }

  // Robust Google OAuth popup handler using postMessage
  const handleGoogleSignIn = () => {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    // The backend should support redirecting to a frontend page that posts the token
    // Example flow:
    // 1) Open popup to `${API_URL}/api/auth/google?redirect=${frontendOrigin}/auth/success`
    // 2) After OAuth completes backend redirects the popup to /auth/success on your frontend
    // 3) /auth/success page script reads token (from query or cookie) and does:
    //    window.opener.postMessage({ type: 'oauth', provider: 'google', token }, window.origin)
    //    window.close()
    const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectTo = encodeURIComponent(`${frontendOrigin}/auth/success`)
    const oauthUrl = `${API_URL}/api/auth/google?redirect=${redirectTo}`

    // Open popup
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
      return
    }

    let handled = false
    const timeoutMs = 60_000 // 60s

    function handleMessage(event) {
      try {
        // Only accept messages from same origin (frontend) where the popup will redirect
        if (event.origin !== window.location.origin) return
        const data = event.data
        if (!data || data.type !== 'oauth' || data.provider !== 'google') return
        const token = data.token
        if (token) {
          handled = true
          // Save token and optionally fetch user (your authSlice already handles storage on login)
          localStorage.setItem('token', token)
          // Optionally, you may fetch user info here or let auth flow handle it
          // Close popup and navigate to dashboard
          try { popup.close() } catch (e) {}
          window.removeEventListener('message', handleMessage)
          router.push('/dashboard')
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('message', handleMessage, false)

    // Fallback polling in case postMessage isn't used by backend redirect page
    const pollInterval = 700
    let elapsed = 0
    const poller = setInterval(() => {
      if (handled) {
        clearInterval(poller)
        return
      }
      try {
        // If backend sets token in localStorage (redirect page), detect it
        const token = localStorage.getItem('token')
        if (token) {
          handled = true
          try { popup.close() } catch (e) {}
          window.removeEventListener('message', handleMessage)
          clearInterval(poller)
          router.push('/dashboard')
        }
      } catch (err) {
        // ignore cross-origin until redirect completes
      }
      elapsed += pollInterval
      if (elapsed >= timeoutMs) {
        // timeout
        clearInterval(poller)
        window.removeEventListener('message', handleMessage)
        try { if (popup && !popup.closed) popup.close() } catch (e) {}
        if (!handled) setLocalError('OAuth timed out. Please try again.')
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
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-2">Start earning with affiliate marketing</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {localError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-700">{localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 outline-none transition"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
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
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 outline-none transition"
                  placeholder="Create a password"
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="mt-1 h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900/20"
              />
              <label htmlFor="agree" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-gray-900 font-medium hover:underline">Terms</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-gray-900 font-medium hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-gray-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}