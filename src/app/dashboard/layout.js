'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function DashboardSectionLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function verify() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          if (mounted) { setAuthorized(false); setLoading(false); router.push('/login'); }
          return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          localStorage.removeItem('token');
          if (mounted) { setAuthorized(false); setLoading(false); router.push('/login'); }
          return;
        }
        if (mounted) { setAuthorized(true); setLoading(false); }
      } catch {
        localStorage.removeItem('token');
        if (mounted) { setAuthorized(false); setLoading(false); router.push('/login'); }
      }
    }
    verify();
    return () => { mounted = false; };
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!authorized) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}