'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import HomeLoggedIn from '../components/home/HomeLoggedIn';
import HomeMarketing from '../components/home/HomeMarketing';
import '../styles/earnko-home.css';  // ← add this import

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          if (mounted) { setIsLoggedIn(false); setChecking(false); }
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          localStorage.removeItem('token');
          if (mounted) { setIsLoggedIn(false); setChecking(false); }
          return;
        }
        if (mounted) { setIsLoggedIn(true); setChecking(false); }
      } catch {
        localStorage.removeItem('token');
        if (mounted) { setIsLoggedIn(false); setChecking(false); }
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen ek-root">
          <div className="ek-hero" style={{ minHeight: '100vh' }}>
            <div className="ek-container" style={{ paddingTop: '8rem' }}>
              <div style={{ height: '3rem', width: '18rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: '1.5rem', width: '28rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: '1.5rem', width: '22rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-16 md:mt-0">
        {isLoggedIn ? (
          <div className="mb-18 md:mb-0">
            <HomeLoggedIn />
            <Footer />
          </div>
        ) : (
          <>
            <HomeMarketing />
            <Footer />
          </>
        )}
      </div>
    </>
  );
}