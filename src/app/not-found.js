'use client';

import Link from 'next/link';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { Home, Search, Zap, Store } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Card */}
            <div className="relative overflow-hidden bg-white border border-gray-200 rounded-3xl shadow-sm">
              {/* Top accent */}
              <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

              {/* Decorative background */}
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-100 blur-3xl opacity-60" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-100 blur-3xl opacity-60" />

              <div className="relative p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 text-xs font-bold">
                  404 • Page not found
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                  This page doesn&apos;t exist
                </h1>

                <p className="mt-3 text-gray-600 text-base leading-relaxed">
                  The link may be broken, the page may have been removed, or you may have entered the wrong URL.
                  If you were trying to open a short link, try visiting the homepage and generating a new one.
                </p>

                {/* Quick actions */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg transition"
                  >
                    <Home className="w-5 h-5" />
                    Go to Home
                  </Link>

                  <Link
                    href="/dashboard/affiliate"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-blue-600 text-blue-700 font-bold hover:bg-blue-50 transition"
                  >
                    <Zap className="w-5 h-5" />
                    Generate Link
                  </Link>

                  <Link
                    href="/stores"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
                  >
                    <Store className="w-5 h-5 text-gray-600" />
                    Browse Stores
                  </Link>

                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                    Read Blog
                  </Link>
                </div>

                {/* Extra help */}
                <div className="mt-8 text-sm text-gray-500">
                  Need help? Visit{' '}
                  <Link href="/contact" className="text-blue-600 font-semibold hover:underline">
                    Contact Us
                  </Link>
                  .
                </div>
              </div>
            </div>

            {/* Optional: small note */}
            <div className="mt-6 text-center text-xs text-gray-400">
              Tip: If you expected a short link to open, make sure the code is correct.
            </div>
          </div>
        </div>

        {/* <Footer /> */}
      </main>
    </div>
  );
}