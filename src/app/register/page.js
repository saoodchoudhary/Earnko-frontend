'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setToken, setUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [agree, setAgree] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referrer, setReferrer] = useState('');

  // If already logged in (token in localStorage), redirect to Home
  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // Optional: show a small info toast
        toast.success('You are already logged in');
        router.replace('/'); // redirect to Home page
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    const ref = params?.get('ref') || '';
    if (ref) setReferrer(ref);
  }, [params]);

  const passScore = useMemo(() => {
    const p = form.password || '';
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    return Math.min(score, 4);
  }, [form.password]);

  const submit = async (e) => {
    e.preventDefault();
    if (!agree) return toast.error('Please accept Terms & Privacy');
    setLoading(true);
    try {
      const payload = { ...form };
      if (referrer) payload.ref = referrer; // backend reads body.ref or query ?ref

      const res = await api.post('/api/auth/register', payload);
      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      toast.success('Account created');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-2xl md:text-3xl font-bold">Join Earnko</h1>
          <p className="text-gray-300 mt-2">
            Create your account to start earning via Cuelinks and referrals.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Benefits */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold">Why Earnko?</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Generate affiliate links in one click</li>
                <li>• Track approved commissions in your wallet</li>
                <li>• Earn extra via referral bonuses</li>
                <li>• Withdraw to bank or UPI</li>
              </ul>
              {referrer ? (
                <div className="mt-4 p-3 bg-gray-50 border rounded text-sm">
                  <div className="text-gray-600">Referral detected</div>
                  <div className="font-mono text-xs text-gray-500">ref: {referrer}</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={submit} className="bg-white border rounded-lg p-6 max-w-xl">
              <h2 className="text-xl font-semibold mb-4">Create account</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="text-gray-600">Name</span>
                  <input
                    type="text"
                    className="input mt-1"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Your name"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-gray-600">Email</span>
                  <input
                    type="email"
                    className="input mt-1"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <div className="mt-3">
                <label className="text-sm block">
                  <span className="text-gray-600">Password</span>
                  <div className="flex gap-2 mt-1">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input flex-1"
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowPass(s => !s)}
                    >
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                {/* Strength meter */}
                <div className="mt-2 flex gap-1">
                  {[0,1,2,3].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${i < passScore ? 'bg-green-500' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Use 10+ chars, a number, a symbol, and uppercase for stronger security.
                </div>
              </div>

              {/* Terms */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  id="agree"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <label htmlFor="agree" className="text-sm text-gray-700">
                  I agree to the
                  {' '}
                  <a href="/terms" className="underline" target="_blank">Terms</a>
                  {' '}
                  and
                  {' '}
                  <a href="/privacy" className="underline" target="_blank">Privacy</a>.
                </label>
              </div>

              <button disabled={loading || !agree} className="btn btn-primary w-full mt-4">
                {loading ? 'Creating...' : 'Register'}
              </button>

              <div className="mt-3 text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="underline">Login</a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}