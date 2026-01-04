'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, TrendingUp, LogOut, User,
  LayoutDashboardIcon, Zap, ChevronDown,
  Gift, Store, Bell, Settings,
  Sparkles, BarChart3, CreditCard, RefreshCw
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [userDropdown, setUserDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Notifications from backend
  const [notifs, setNotifs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

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
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
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

  useEffect(() => {
    // Auto-load notifications on initial mount (if logged in)
    if (isLoggedIn && base) {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, base]);

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

  const loadNotifications = async () => {
    try {
      setNotifLoading(true);
      setNotifError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifs([]);
        return;
      }
      const res = await fetch(`${base}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : null;
      if (!res.ok) {
        setNotifError(data?.message || `Failed to load notifications (HTTP ${res.status})`);
        setNotifs([]);
        return;
      }
      const items = Array.isArray(data?.data?.items) ? data.data.items : [];
      setNotifs(items);
    } catch (err) {
      setNotifError(err?.message || 'Error loading notifications');
      setNotifs([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllReadLocal = () => {
    // Backend doesn't expose a mark-as-read route in the attached context;
    // update locally for now.
    setNotifs(items => items.map(n => ({ ...n, read: true })));
  };

  const navLinks = [
    // { href: '/offers', label: 'Top Offers', icon: <Gift className="w-4 h-4" />, active: pathname.startsWith('/offers') },
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

  const fmtRelative = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    return `${day}d ago`;
  };

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
              <img 
               src='/images/earnko-logo-round.png'
               alt='earnko logo'
               className='w-[40px]'
               />
              {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/30">
                <TrendingUp className="w-5 h-5 text-white" />
              </div> */}

              <div>
                <div className="text-xl font-bold text-gray-900 tracking-tight">Earnko</div>
                <div className="text-xs text-gray-500 -mt-0.5 hidden sm:block">Earn by Sharing</div>
              </div>
            </Link>

            {/* Desktop Actions (search bar removed) */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {/* Notification Bell */}
              {isLoggedIn && (
                <div className="relative" ref={notifRef}>
                  <button
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                    onClick={() => {
                      setNotifOpen(v => !v);
                      if (!notifOpen && !notifs.length && !notifLoading) {
                        loadNotifications();
                      }
                    }}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50">
                      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">Notifications</div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={loadNotifications}
                            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${notifLoading ? 'animate-spin' : ''}`} />
                            Refresh
                          </button>
                          <button
                            onClick={markAllReadLocal}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all as read
                          </button>
                        </div>
                      </div>

                      <div className="max-h-72 overflow-auto">
                        {notifLoading ? (
                          <div className="px-4 py-4">
                            <div className="space-y-3">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                              ))}
                            </div>
                          </div>
                        ) : notifError ? (
                          <div className="px-4 py-4 text-sm text-red-600">
                            {notifError}
                          </div>
                        ) : notifs.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-600">No notifications</div>
                        ) : (
                          notifs.map((n) => (
                            <div
                              key={n._id}
                              className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                                !n.read ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-2 ${!n.read ? 'bg-blue-600' : 'bg-gray-300'}`} />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {n.type === 'payout' ? 'Payout Update' : n.type === 'conversion' ? 'Conversion Update' : 'Notification'}
                                </div>
                                <div className="text-xs text-gray-600 break-words">
                                  {n.message}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-1">
                                  {fmtRelative(n.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* <div className="px-4 py-2 border-t border-gray-100">
                        <Link
                          href="/dashboard/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          View all notifications
                        </Link>
                      </div> */}
                    </div>
                  )}
                </div>
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
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-3 z-50">
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

              <img 
               src='/images/earnko-logo-round.png'
               alt='earnko logo'
               className='w-[40px]'
               />
              {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div> */}

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
                  </div>
                  <div className="relative">
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3.5 text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg"
                    >
                      Create Free Account
                    </Link>
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