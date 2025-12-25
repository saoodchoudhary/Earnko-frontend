'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

export default function OAuthCallbackPage() {
  // Wrap the component that uses useSearchParams in Suspense to satisfy Next.js requirement
  return (
    <Suspense fallback={<CallbackSkeleton />}>
      <OAuthCallbackInner />
    </Suspense>
  );
}

function OAuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setToken, setUser } = useAuth();
  const [msg] = useState('Signing you in...');

  useEffect(() => {
    async function run() {
      try {
        const token = params?.get('token');
        const error = params?.get('error');
        if (error || !token) {
          toast.error('Google sign-in failed');
          router.replace('/login');
          return;
        }

        // Save token and fetch user
        setToken(token);

        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const js = await res.json();
        if (!res.ok) throw new Error(js?.message || 'Failed to fetch user');

        setUser(js?.data?.user);
        toast.success('Signed in with Google');
        router.replace('/dashboard');
      } catch (err) {
        toast.error(err?.message || 'Sign-in failed');
        router.replace('/login');
      }
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">{msg}</div>
    </main>
  );
}

function CallbackSkeleton() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="h-6 w-40 skeleton rounded" />
    </main>
  );
}