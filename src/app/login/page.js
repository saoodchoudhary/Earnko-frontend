'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      toast.success('Logged in successfully');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm p-6 border rounded-lg bg-white">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </label>
        <button disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}