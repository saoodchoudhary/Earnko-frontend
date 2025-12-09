// components/Layout/Navbar.tsx
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, Sparkles, TrendingUp } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">Earnko</div>
              <div className="text-xs text-gray-500 -mt-1 hidden sm:block">Affiliate Platform</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link 
              href="/" 
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            >
              Home
            </Link>
            
            <div className="relative group">
              <button className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1">
                Features
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-lg border border-gray-200 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="space-y-2">
                  <DropdownLink href="/features#analytics" icon={<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Sparkles className="w-4 h-4 text-blue-600" /></div>}>
                    <div className="text-sm font-medium text-gray-900">Advanced Analytics</div>
                    <div className="text-xs text-gray-500">Real-time performance insights</div>
                  </DropdownLink>
                  <DropdownLink href="/features#tracking" icon={<div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Sparkles className="w-4 h-4 text-green-600" /></div>}>
                    <div className="text-sm font-medium text-gray-900">Smart Tracking</div>
                    <div className="text-xs text-gray-500">Reliable click & conversion tracking</div>
                  </DropdownLink>
                  <DropdownLink href="/features#security" icon={<div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Sparkles className="w-4 h-4 text-purple-600" /></div>}>
                    <div className="text-sm font-medium text-gray-900">Fraud Protection</div>
                    <div className="text-xs text-gray-500">AI-powered security system</div>
                  </DropdownLink>
                </div>
              </div>
            </div>

            <Link 
              href="/stores" 
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            >
              Stores
            </Link>
            
            <Link 
              href="/resources" 
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            >
              Resources
            </Link>
            
            <Link 
              href="/affiliates" 
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            >
              For Affiliates
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            
            <Link
              href="/register"
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
            >
              Register Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-5">
          <div className="px-4 py-3 space-y-1">
            <MobileLink href="/">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-gray-700" />
                </div>
                <span>Home</span>
              </div>
            </MobileLink>
            
            <MobileLink href="/features">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <span>Features</span>
              </div>
            </MobileLink>
            
            <MobileLink href="/stores">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <span>Stores</span>
              </div>
            </MobileLink>
            
            <MobileLink href="/resources">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <span>Resources</span>
              </div>
            </MobileLink>
            
            <MobileLink href="/affiliates">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                </div>
                <span>For Affiliates</span>
              </div>
            </MobileLink>
            
            <div className="pt-4 space-y-3 border-t border-gray-100 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-center border border-gray-200 rounded-lg text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors font-medium text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 text-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function DropdownLink({ href, icon, children }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      {icon}
      <div className="flex-1">
        {children}
      </div>
    </Link>
  )
}

function MobileLink({ href, children }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </Link>
  )
}

// Helper function to set mobileOpen state
const setMobileOpen = (open) => {}