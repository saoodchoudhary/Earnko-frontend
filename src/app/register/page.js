'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Link from 'next/link';
import {
  Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle,
  ArrowRight, TrendingUp, Sparkles, Gift, Users as UsersIcon,
  Zap, ChevronRight
} from 'lucide-react';

/**
 * FIX: Wrap the component that uses useSearchParams in a <Suspense> boundary.
 * Also, move the referrer setState into a useEffect (side effects in render cause hydration issues).
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setToken, setUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referrer, setReferrer] = useState('');

  // Safely read ?ref=... and set once
  useEffect(() => {
    const code = params?.get('ref') || '';
    if (code) setReferrer(code);
  }, [params]);

  const passwordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    return Math.min(score, 5);
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-emerald-600'];

  const submit = async (e) => {
    e.preventDefault();

    if (!agree) {
      toast.error('Please accept Terms & Privacy Policy');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      };
      if (referrer) payload.ref = referrer;

      const res = await api.post('/api/auth/register', payload);
      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      toast.success('Account created successfully! Welcome to Earnko');
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const googleUrl = () => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirect = encodeURIComponent(`${origin}/oauth/callback`);
    const ref = referrer ? `&ref=${encodeURIComponent(referrer)}` : '';
    return `${base}/api/auth/google?mode=register&redirect=${redirect}${ref}`;
  };

  const features = [
    { icon: <Zap className="w-5 h-5" />, title: 'Instant Link Generation', desc: 'Create affiliate links in seconds' },
    { icon: <Gift className="w-5 h-5" />, title: 'High Commissions', desc: 'Earn up to 40% per sale' },
    { icon: <UsersIcon className="w-5 h-5" />, title: 'Referral Program', desc: 'Earn 10% from referred friends' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Real-time Analytics', desc: 'Track clicks and earnings live' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features & Info */}
          <div className="hidden lg:block">
            <div className="max-w-lg">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 mb-8 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">Earnko</div>
                  <div className="text-sm text-gray-500">Start Earning Today</div>
                </div>
              </Link>

              {/* Main Heading */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Start Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 block">
                  Affiliate Journey
                </span>
              </h1>

              <p className="text-gray-600 text-lg mb-8">
                Join thousands of successful affiliates who are earning by sharing products they love.
                No experience needed - start earning in minutes!
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-2">
                      {feature.icon}
                    </div>
                    <div className="font-medium text-gray-900">{feature.title}</div>
                    <div className="text-sm text-gray-600">{feature.desc}</div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">10K+</div>
                    <div className="text-sm text-blue-100">Active Affiliates</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">₹2.5Cr+</div>
                    <div className="text-sm text-blue-100">Paid Out</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">40%</div>
                    <div className="text-sm text-blue-100">Max Commission</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Earnko</div>
                <div className="text-xs text-gray-500">Create Your Account</div>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              <p className="text-gray-600 mt-1">Sign up to start earning commissions today</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${strength >= 4 ? 'text-green-600' : strength >= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[0,1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength] : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                  <div className="text-red-600 text-xs mt-1">Passwords do not match</div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agree}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Referral Notice */}
              {referrer && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Referral bonus activated! You'll earn extra rewards.
                    </span>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={() => (window.location.href = googleUrl())}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 group"
                  >
                    Sign in here
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>
            </form>

            {/* Security Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Your data is protected with bank-level security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="h-6 w-40 skeleton rounded mb-4" />
          <div className="h-8 w-72 skeleton rounded mb-2" />
          <div className="h-4 w-64 skeleton rounded" />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="h-6 w-40 skeleton rounded mb-4" />
          <div className="h-10 w-full skeleton rounded mb-3" />
          <div className="h-10 w-full skeleton rounded mb-3" />
          <div className="h-10 w-full skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}