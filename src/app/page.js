// app/page.js - Main Home Page
'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import HomeLoggedIn from '../components/home/HomeLoggedIn';
import HomeMarketing from '../components/home/HomeMarketing';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) { 
          if (mounted) { 
            setIsLoggedIn(false); 
            setChecking(false); 
          } 
          return; 
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          localStorage.removeItem('token');
          if (mounted) { 
            setIsLoggedIn(false); 
            setChecking(false); 
          }
          return;
        }
        
        if (mounted) { 
          setIsLoggedIn(true); 
          setChecking(false); 
        }
      } catch {
        localStorage.removeItem('token');
        if (mounted) { 
          setIsLoggedIn(false); 
          setChecking(false); 
        }
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Navbar />
      <div className="mt-16 md:mt-0">
        {checking ? (
          <main className="min-h-[60vh]">
            <section className="bg-gradient-to-r from-blue-900 to-cyan-800 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="md:w-1/2">
                    <div className="h-8 bg-white/20 rounded w-64 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-80 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-72 animate-pulse"></div>
                  </div>
                  <div className="md:w-1/2">
                    <div className="h-48 bg-white/10 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            </section>
            <section className="container mx-auto px-4 py-8">
              <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
            </section>
          </main>
        ) : isLoggedIn ? (
          <div className='mb-18 md:mb-0'>
          <HomeLoggedIn />
      <Footer />
      </div>
        ) : (
          <div>
          <HomeMarketing />
      <Footer />
          </div>
        )}
      </div>
    </>
  );
}