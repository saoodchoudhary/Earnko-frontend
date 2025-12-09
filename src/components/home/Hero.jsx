// components/home/Hero.tsx
'use client'
import Link from 'next/link'
import { ArrowRight, Play, CheckCircle, Lock, Zap, Sparkles, Shield, BarChart3, Users } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Hero() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(null)


  return (
    <section className="relative overflow-hidden pt-20 lg:pt-28 pb-16 lg:pb-24">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/30 rounded-full mix-blend-multiply filter blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-100/30 rounded-full mix-blend-multiply filter blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-100/20 rounded-full mix-blend-multiply filter blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-700">No technical skills required</span>
            </div>
            
            {/* Main Heading */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Turn Links Into
                <span className="block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">
                  Real Earnings
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mt-6 leading-relaxed max-w-2xl">
                Create affiliate links in seconds, share them anywhere, and get paid automatically. 
                Enterprise-grade tracking, smart commission rules, and fast payouts for serious creators.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:shadow-xl transition-all duration-300 font-medium shadow-lg hover:scale-[1.02]"
              >
                Start Earning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/demo"
                className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all duration-300 font-medium bg-white"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">12.5K+</div>
                <div className="text-xs text-gray-500 mt-1">Active Creators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">500+</div>
                <div className="text-xs text-gray-500 mt-1">Store Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">$8.2M</div>
                <div className="text-xs text-gray-500 mt-1">Paid Out</div>
              </div>
            </div>
          </div>

          {/* Right Content - Link Generator Card */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 relative overflow-hidden">
              {/* Accent Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900" />
              
              {/* Card Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full mb-3">
                  <Sparkles className="w-3 h-3 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700">TRY IT FREE</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Generate Your First Link</h2>
                <p className="text-gray-600 mt-2">Paste any product URL to create a tracked affiliate link</p>
              </div>

              {/* Link Generator Form */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      aria-label="Product URL"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition text-sm placeholder-gray-400 bg-white"
                      placeholder="https://www.flipkart.com/dp/B0EXAMPLE..."
                    />
                  </div>
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px]"
                  >
                    
                      Generate Link
                  </Link>
                </div>

                {/* Supported Stores */}
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Supports Flipkart, Myntra, Nykaa and 500+ partner stores</span>
                </div>

                {/* Generated Link Preview */}
                {generated && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 animate-in fade-in">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-1">Your Affiliate Link</div>
                        <div className="text-sm text-gray-900 font-medium truncate">{generated}</div>
                      </div>
                      <button
                        className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Real-time Tracking</div>
                        <div className="text-xs text-gray-500 mt-0.5">Monitor clicks and conversions live</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Fraud Protected</div>
                        <div className="text-xs text-gray-500 mt-0.5">AI-powered security system</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-700" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Trusted by creators worldwide</div>
                    <div className="text-xs text-gray-500">Join thousands earning with Earnko</div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Features */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Instant Links</div>
                    <div className="text-xs text-gray-500">One-click generation</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Secure Payouts</div>
                    <div className="text-xs text-gray-500">Automated & reliable</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </section>
  )
}