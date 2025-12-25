// components/Layout/Navbar.js - Enhanced Professional Navbar
'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, X, TrendingUp, LogOut, User, 
  LayoutDashboardIcon, Zap, ChevronDown, Globe,
  Home, Gift, Store, Bell, Settings,
  Sparkles, Search, BarChart3, CreditCard
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const gotoGenerate = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login?next=/dashboard/affiliate');
    } else {
      router.push('/dashboard/affiliate');
    }
    setMobileOpen(false);
    setUserDropdown(false);
  };

  const doLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    setIsLoggedIn(false);
    router.push('/login');
    setUserDropdown(false);
    setMobileOpen(false);
  };

  const navLinks = [
    { href: '/offers', label: 'Top Offers', icon: <Gift className="w-4 h-4" />, active: pathname.startsWith('/offers') },
    { href: '/stores', label: 'Stores', icon: <Store className="w-4 h-4" />, active: pathname.startsWith('/stores') },
    { href: '/products', label: 'Products', icon: <Sparkles className="w-4 h-4" />, active: pathname.startsWith('/products') },
  ];

  const userMenu = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon className="w-4 h-4" /> },
    { href: '/dashboard/affiliate', label: 'Generate Links', icon: <Zap className="w-4 h-4" /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/dashboard/wallet', label: 'My Wallet', icon: <CreditCard className="w-4 h-4" /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-500/5 border-b border-gray-200/50 py-1' 
            : 'bg-white/95 backdrop-blur-lg border-b border-gray-200/30 py-2'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group flex-shrink-0"
              onClick={() => setMobileOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/30">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 tracking-tight">Earnko</div>
                <div className="text-xs text-gray-500 -mt-0.5 hidden sm:block">Earn by Sharing</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {/* <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center px-4">
              {navLinks.map((link) => (
                <div key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={`px-2 py-2.5 text-sm font-medium transition-all duration-300 flex items-center gap-2 rounded-lg mx-1 ${
                      link.active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                  
                  {link.active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
                  )}
                </div>
              ))}
            </nav> */}

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, stores, offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
           

              {/* Notification Bell */}
              {isLoggedIn && (
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notifications}
                    </span>
                  )}
                </button>
              )}

              {/* User Actions */}
              {!isLoggedIn ? (
                <>
                  <div className="relative">
                    <Link
                      href="/login"
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors group"
                    >
                      Login
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Link>
                  </div>
                  <div className="relative">
                    <Link
                      href="/register"
                      className="px-6 py-2.5 text-sm font-semibold rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors group"
                    >
                      Sign Up
                      <div className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 group min-w-[140px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Welcome</div>
                      <div className="text-xs text-gray-500">View profile</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${userDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User Dropdown */}
                  {userDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-3 animate-fade-in z-50 backdrop-blur-sm">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">John Doe</div>
                            <div className="text-xs text-gray-500">Affiliate Partner</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        {userMenu.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                              {item.icon}
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-2" />
                      
                      {/* Logout */}
                      <button
                        onClick={doLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left text-red-600 group transition-colors"
                      >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm group-hover:text-red-700 transition-colors">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Menu Panel */}
        <div 
          ref={mobileMenuRef}
          className={`absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Earnko</div>
                <div className="text-xs text-gray-500">Earn by Sharing</div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="h-[calc(100%-120px)] overflow-y-auto pb-20">
            <nav className="p-4 space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                Navigation
              </div>
              {navLinks.map((link) => (
                <div key={link.href} className="relative">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      link.active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`${link.active ? 'text-blue-600' : 'text-gray-500'}`}>
                      {link.icon}
                    </div>
                    <span className="font-medium">{link.label}</span>
                    {link.active && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                </div>
              ))}
              
              {/* Mobile Generate Button */}
              <div className="relative mt-6 px-4">
                <button
                  onClick={gotoGenerate}
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Generate Affiliate Link
                </button>
                <div className="absolute -bottom-1 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </nav>

            {/* Mobile Auth Section */}
            <div className="p-4 border-t border-gray-200 space-y-3 mt-4">
              {!isLoggedIn ? (
                <>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                    Get Started
                  </div>
                  <div className="relative">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3.5 text-center text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-300"
                    >
                      Login to Account
                    </Link>
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>
                  <div className="relative">
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3.5 text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg"
                    >
                      Create Free Account
                    </Link>
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                    My Account
                  </div>
                  {userMenu.map((item, index) => (
                    <div key={index} className="relative">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl group"
                      >
                        {item.icon}
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </Link>
                      <div className="absolute left-4 right-4 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </div>
                  ))}
                  <div className="relative">
                    <button
                      onClick={doLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl group"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                    <div className="absolute left-4 right-4 bottom-0 h-0.5 bg-gradient-to-r from-red-600 to-pink-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>
                </>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200 mt-4">
              <div className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} Earnko
                <div className="mt-1">Affiliate Marketing Platform</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}