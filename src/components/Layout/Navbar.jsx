'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, LogOut, User, Zap, ChevronDown,
  Store, Bell, Settings, BarChart3, CreditCard,
  RefreshCw, LayoutDashboardIcon,
  BookOpen, TrendingUp, Tag, Link2, Wallet,
  ArrowRight, Sparkles, Globe, ShoppingBag,
  FileText, HelpCircle, Phone, Gift,
} from 'lucide-react';

/* ─── NAV DATA ─────────────────────────────────────────────── */

const NAV_ITEMS = [
  {
    label: 'Stores',
    href: '/stores',
    mega: true,
    sections: [
      {
        heading: 'Browse',
        links: [
          { label: 'All Stores',      href: '/stores',             icon: <Store className="w-4 h-4" />,       desc: 'Explore all partner stores',        badge: null },
          { label: 'Top Offers',      href: '/stores?tab=offers',  icon: <Tag className="w-4 h-4" />,         desc: 'Highest converting deals',           badge: 'Hot' },
          { label: 'New Partners',    href: '/stores?tab=new',     icon: <Sparkles className="w-4 h-4" />,    desc: 'Recently added stores',              badge: 'New' },
          { label: 'Fashion & Style', href: '/stores?cat=fashion', icon: <ShoppingBag className="w-4 h-4" />, desc: 'Myntra, Ajio, Nykaa & more',        badge: null },
        ],
      },
      {
        heading: 'Top Brands',
        links: [
          { label: 'Ajio',   href: '/stores?brand=ajio',   icon: <Globe className="w-4 h-4" />, desc: 'Fashion & lifestyle',   badge: null },
          { label: 'Flipkart', href: '/stores?brand=flipkart', icon: <Globe className="w-4 h-4" />, desc: 'Best deals guaranteed',       badge: null },
          { label: 'Myntra',   href: '/stores?brand=myntra',   icon: <Globe className="w-4 h-4" />, desc: 'Fashion & lifestyle',         badge: null },
          { label: 'Nykaa',    href: '/stores?brand=nykaa',    icon: <Globe className="w-4 h-4" />, desc: 'Beauty & wellness',           badge: null },
        ],
      },
    ],
    cta: { label: 'View All Stores', href: '/stores', icon: <ArrowRight className="w-3.5 h-3.5" /> },
  },
  {
    label: 'Earn',
    href: '/dashboard/affiliate',
    mega: true,
    sections: [
      {
        heading: 'Your Tools',
        links: [
          { label: 'Generate Link', href: '/dashboard/affiliate', icon: <Zap className="w-4 h-4" />,       desc: 'Create affiliate links instantly', badge: null },
          { label: 'Analytics',     href: '/dashboard/analytics', icon: <BarChart3 className="w-4 h-4" />, desc: 'Track clicks & conversions',       badge: null },
          { label: 'My Wallet',     href: '/dashboard/withdraw',  icon: <Wallet className="w-4 h-4" />,    desc: 'Earnings & withdrawals',           badge: null },
          { label: 'Refer & Earn',  href: '/dashboard/referrals', icon: <Gift className="w-4 h-4" />,      desc: 'Invite friends, earn 10%',         badge: '10%' },
        ],
      },
      {
        heading: 'Resources',
        links: [
          { label: 'How It Works',   href: '/#how-it-works',       icon: <TrendingUp className="w-4 h-4" />, desc: 'Start earning in 4 steps',         badge: null },
          { label: 'Link Checker',   href: '/dashboard/affiliate', icon: <Link2 className="w-4 h-4" />,     desc: 'Validate your affiliate links',    badge: null },
          { label: 'Help & Support', href: '/dashboard/support',   icon: <HelpCircle className="w-4 h-4" />, desc: 'Get help from our team',          badge: null },
        ],
      },
    ],
    cta: { label: 'Start Earning Now', href: '/dashboard/affiliate', icon: <Zap className="w-3.5 h-3.5" /> },
  },
  {
    label: 'Blog',
    href: '/blog',
    mega: true,
    sections: [
      {
        heading: 'Latest Guides',
        links: [
          { label: 'Affiliate Tracking Guide', href: '/blog', icon: <BookOpen className="w-4 h-4" />,    desc: 'Cookies, clicks & conversions',         badge: null },
          { label: 'Earn More Tips',           href: '/blog',                              icon: <TrendingUp className="w-4 h-4" />,  desc: 'Optimize your affiliate strategy',      badge: null },
          { label: 'How to Create a Flipkart Affiliate Link',       href: '/blog/how-to-create-flipkart-affiliate-link',                              icon: <FileText className="w-4 h-4" />,    desc: 'Step-by-step tutorial',        badge: null },
          { label: 'All Articles',             href: '/blog',                              icon: <BookOpen className="w-4 h-4" />,    desc: 'Browse all blog posts',                 badge: null },
        ],
      },
      {
        heading: 'Topics',
        links: [
          { label: 'Tracking & Analytics', href: '/blog?tag=tracking', icon: <BarChart3 className="w-4 h-4" />,  desc: 'Deep-dive into data',       badge: null },
          { label: 'Earning Strategies',   href: '/blog?tag=earning',  icon: <Sparkles className="w-4 h-4" />,   desc: 'Maximize commissions',      badge: null },
          { label: 'SEO Tips',             href: '/blog?tag=seo',      icon: <TrendingUp className="w-4 h-4" />, desc: 'Rank higher, earn more',    badge: null },
        ],
      },
    ],
    cta: { label: 'Read All Articles', href: '/blog', icon: <ArrowRight className="w-3.5 h-3.5" /> },
  },
  {
    label: 'Contact',
    href: '/contact',
    mega: false,
  },
];

const USER_MENU = [
  { href: '/dashboard',           label: 'Dashboard',      icon: <LayoutDashboardIcon className="w-4 h-4" />, color: '#3b82f6' },
  { href: '/dashboard/affiliate', label: 'Generate Links', icon: <Zap className="w-4 h-4" />,                color: '#8b5cf6' },
  { href: '/dashboard/analytics', label: 'Analytics',      icon: <BarChart3 className="w-4 h-4" />,          color: '#06b6d4' },
  { href: '/dashboard/withdraw',  label: 'My Wallet',      icon: <Wallet className="w-4 h-4" />,             color: '#10b981' },
  { href: '/dashboard/referrals', label: 'Refer & Earn',   icon: <Gift className="w-4 h-4" />,               color: '#f59e0b' },
  { href: '/dashboard/support',   label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" />,         color: '#64748b' },
  { href: '/dashboard/settings',  label: 'Settings',       icon: <Settings className="w-4 h-4" />,           color: '#64748b' },
];

/* ─── helpers ─────────────────────────────────────────────── */

function fmtRelative(iso) {
  if (!iso) return '';
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60)    return 'Just now';
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

/* ─── ICON COLORS per section ─────────────────────────────── */
const SECTION_COLORS = [
  { bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', color: '#2563eb' },
  { bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', color: '#16a34a' },
];

/* ─── Mega Menu Panel ─────────────────────────────────────── */

/**
 * KEY FIX: Instead of absolute centering on the trigger button,
 * we use a fixed-position panel calculated from the trigger's
 * getBoundingClientRect — so it never overflows the viewport.
 */
function MegaPanel({ item, visible, triggerRef }) {
  const panelRef   = useRef(null);
  const PANEL_W    = 640;
  const PANEL_GAP  = 8; // gap from viewport edge

  const [pos, setPos]       = useState({ left: 0, arrowLeft: '50%' });
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    if (!visible || !triggerRef?.current) return;

    const rect   = triggerRef.current.getBoundingClientRect();
    const vw     = window.innerWidth;

    // Ideal: center panel under trigger button
    let idealLeft = rect.left + rect.width / 2 - PANEL_W / 2;

    // Clamp so it doesn't overflow either edge
    const clampedLeft = Math.max(
      PANEL_GAP,
      Math.min(idealLeft, vw - PANEL_W - PANEL_GAP)
    );

    // Arrow should point at button center
    const arrowLeftPx = rect.left + rect.width / 2 - clampedLeft;
    const arrowLeftPct = `${Math.min(Math.max(arrowLeftPx, 24), PANEL_W - 24)}px`;

    setPos({ left: clampedLeft, arrowLeft: arrowLeftPct });
    setReady(true);
  }, [visible, triggerRef]);

  // Icon color by section index
  const getIconStyle = (si) =>
    SECTION_COLORS[si % SECTION_COLORS.length];

  return (
    <div
      ref={panelRef}
      className="fixed z-[200]"
      style={{
        top: 62, // navbar height
        left: ready ? pos.left : 0,
        width: PANEL_W,
        opacity: visible && ready ? 1 : 0,
        transform: visible && ready ? 'translateY(0px)' : 'translateY(-8px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 180ms cubic-bezier(0.16,1,0.3,1), transform 180ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Caret / arrow */}
      <div
        className="absolute -top-[5px] w-[10px] h-[10px] rotate-45 bg-white z-10"
        style={{
          left: pos.arrowLeft,
          marginLeft: -5,
          border: '1px solid #e2e8f0',
          borderBottom: 'none',
          borderRight: 'none',
          boxShadow: '-2px -2px 4px rgba(0,0,0,0.03)',
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl bg-white overflow-hidden"
        style={{
          boxShadow: '0 24px 64px rgba(37,99,235,0.11), 0 6px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(226,232,240,0.9)',
        }}
      >
        {/* Top gradient bar */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{ background: 'linear-gradient(90deg,#2563eb 0%,#06b6d4 50%,#8b5cf6 100%)' }}
        />

        <div className="grid grid-cols-2 gap-0 p-5 pb-4">
          {item.sections?.map((section, si) => {
            const iconStyle = getIconStyle(si);
            return (
              <div
                key={si}
                className={si === 0 ? 'pr-5 border-r border-gray-100' : 'pl-5'}
              >
                {/* Section heading */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <p className="text-[9.5px] font-black text-gray-400 uppercase tracking-[0.15em]">
                    {section.heading}
                  </p>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="space-y-[2px]">
                  {section.links.map((link, li) => (
                    <Link
                      key={li}
                      href={link.href}
                      className="flex items-start gap-3 px-2.5 py-2.5 rounded-xl group hover:bg-blue-50/70 transition-all duration-150"
                    >
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150 group-hover:scale-105 group-hover:shadow-sm"
                        style={{ background: iconStyle.bg, color: iconStyle.color }}
                      >
                        {link.icon}
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold line-clamp-1 text-gray-800 group-hover:text-blue-700 leading-tight transition-colors">
                            {link.label}
                          </p>
                          {link.badge && (
                            <span
                              className="text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none"
                              style={{
                                background: link.badge === 'Hot'
                                  ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
                                  : link.badge === 'New'
                                  ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)'
                                  : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                                color: link.badge === 'Hot' ? '#92400e'
                                     : link.badge === 'New' ? '#15803d'
                                     : '#1d4ed8',
                              }}
                            >
                              {link.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{link.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA footer */}
        {item.cta && (
          <div
            className="px-5 py-3 border-t border-gray-100 flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg,#f8faff,#f0f9ff)' }}
          >
            <Link
              href={item.cta.href}
              className="inline-flex items-center gap-2 text-[12px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#dbeafe' }}
              >
                <span className="group-hover:translate-x-0.5 transition-transform inline-flex">
                  {item.cta.icon}
                </span>
              </span>
              {item.cta.label}
            </Link>
            <p className="text-[10px] text-gray-400">
              {item.sections?.reduce((a, s) => a + s.links.length, 0)} options available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Navbar ─────────────────────────────────────────── */

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [activeMenu,   setActiveMenu]   = useState(null);

  const [notifs,       setNotifs]       = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError,   setNotifError]   = useState('');

  const [mobileExpanded, setMobileExpanded] = useState(null);

  const dropdownRef  = useRef(null);
  const notifRef     = useRef(null);
  const mobileRef    = useRef(null);
  const menuTimerRef = useRef(null);

  // One ref per nav item trigger button — used for smart positioning
  const triggerRefs = useRef({});

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  /* scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* auth */
  useEffect(() => {
    try { setIsLoggedIn(!!localStorage.getItem('token')); } catch { setIsLoggedIn(false); }
  }, [pathname]);

  /* outside click */
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdown(false);
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* body lock on mobile */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* auto-load notifs */
  useEffect(() => {
    if (isLoggedIn && base) loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, base]);

  const openMenu  = useCallback((label) => {
    clearTimeout(menuTimerRef.current);
    setActiveMenu(label);
  }, []);

  const closeMenu = useCallback(() => {
    menuTimerRef.current = setTimeout(() => setActiveMenu(null), 120);
  }, []);

  const keepMenu  = useCallback(() => {
    clearTimeout(menuTimerRef.current);
  }, []);

  const gotoGenerate = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    router.push(token ? '/dashboard/affiliate' : '/login?next=/dashboard/affiliate');
    setMobileOpen(false);
    setUserDropdown(false);
    setActiveMenu(null);
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
      if (!token) { setNotifs([]); return; }
      const res  = await fetch(`${base}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ct   = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : null;
      if (!res.ok) { setNotifError(data?.message || 'Failed'); setNotifs([]); return; }
      setNotifs(Array.isArray(data?.data?.items) ? data.data.items : []);
    } catch (err) {
      setNotifError(err?.message || 'Error');
      setNotifs([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const isActive    = (href) =>
    pathname === href ||
    pathname.startsWith(href + '/') ||
    pathname.startsWith(href + '?');

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          DESKTOP NAVBAR
      ══════════════════════════════════════════════════════ */}
      <header
        className="fixed inset-x-0 top-0 z-[100] transition-all duration-200"
        style={{
          background: scrolled
            ? 'rgba(255,255,255,0.98)'
            : 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid #e2e8f0'
            : '1px solid rgba(226,232,240,0.5)',
          boxShadow: scrolled
            ? '0 4px 24px rgba(37,99,235,0.07), 0 1px 3px rgba(0,0,0,0.04)'
            : 'none',
        }}
      >
        <div className="container mx-auto px-5">
          <div className="flex items-center h-[62px] gap-6">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 group"
              onClick={() => { setMobileOpen(false); setActiveMenu(null); }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
               >
                <img
                  src="/images/earnko-logo-round.png"
                  alt="Earnko"
                  className="w-9 h-9 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span style="color:white;font-weight:900;font-size:14px">E</span>';
                  }}
                />
              </div>
              <div className="block">
                <p className="text-[15px] font-black text-gray-900 leading-none tracking-tight">Earnko</p>
                <p className="text-[9px] font-semibold text-gray-400 mt-0.5 tracking-widest uppercase">Earn by Sharing</p>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const open   = activeMenu === item.label;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => item.mega && openMenu(item.label)}
                    onMouseLeave={() => item.mega && closeMenu()}
                  >
                    {item.mega ? (
                      <button
                        ref={(el) => { triggerRefs.current[item.label] = el; }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-150 select-none"
                        style={
                          active || open
                            ? { background: '#eff6ff', color: '#2563eb' }
                            : { color: '#374151' }
                        }
                      >
                        {item.label}
                        <ChevronDown
                          className="w-3.5 h-3.5 transition-transform duration-200"
                          style={{
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: active || open ? '#2563eb' : '#94a3b8',
                          }}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center px-3.5 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-150"
                        style={active ? { background: '#eff6ff', color: '#2563eb' } : { color: '#374151' }}
                      >
                        {item.label}
                      </Link>
                    )}

                    {/* Active indicator dot */}
                    {active && (
                      <div
                        className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: '#2563eb' }}
                      />
                    )}

                    {/* Mega panel — rendered in a portal-like fixed div */}
                    {item.mega && (
                      <div
                        onMouseEnter={keepMenu}
                        onMouseLeave={closeMenu}
                        // This div catches hover to keep panel open
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: open ? 'none' : 'none', zIndex: -1 }}
                      />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* ── Right actions ── */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">

              {/* Generate CTA */}
              <button
                onClick={gotoGenerate}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold text-white transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg,#2563eb,#0891b2)',
                  boxShadow: '0 3px 14px rgba(37,99,235,0.28)',
                }}
              >
                <Zap className="w-3.5 h-3.5" />
                Generate Link
              </button>

              {/* Bell */}
              {isLoggedIn && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(v => !v)}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: notifOpen ? '#eff6ff' : undefined }}
                    onMouseEnter={e => { if (!notifOpen) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!notifOpen) e.currentTarget.style.background = ''; }}
                    aria-label="Notifications"
                  >
                    <Bell className="w-[18px] h-[18px] text-gray-600" />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                        style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notif panel */}
                  {notifOpen && (
                    <div
                      className="absolute right-0 top-full mt-2.5 w-80 bg-white rounded-2xl z-50 overflow-hidden"
                      style={{
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.07)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }} />
                      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100" style={{ background: '#fafafa' }}>
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-[13px] font-extrabold text-gray-900">Notifications</p>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black text-white bg-blue-600">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={loadNotifications}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${notifLoading ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={markAllRead}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Mark all read
                          </button>
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto">
                        {notifLoading ? (
                          <div className="p-4 space-y-2">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                          </div>
                        ) : notifError ? (
                          <p className="px-4 py-5 text-xs text-red-500 text-center">{notifError}</p>
                        ) : notifs.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">No notifications yet</p>
                          </div>
                        ) : notifs.map(n => (
                          <div
                            key={n._id}
                            className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                            style={{ background: !n.read ? 'rgba(239,246,255,0.6)' : undefined }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                              style={{ background: !n.read ? '#3b82f6' : '#d1d5db' }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-semibold text-gray-900 leading-snug">
                                {n.type === 'payout'     ? 'Payout Update'
                                 : n.type === 'conversion' ? 'Conversion Update'
                                 : 'Notification'}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{fmtRelative(n.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth */}
              {!isLoggedIn ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-[13px] font-extrabold text-blue-600 border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all"
                    style={{
                      borderColor: userDropdown ? '#93c5fd' : '#e2e8f0',
                      background:  userDropdown ? '#f0f9ff' : undefined,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[12.5px] font-bold text-gray-800 hidden xl:block">Account</span>
                    <ChevronDown
                      className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
                      style={{ transform: userDropdown ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>

                  {userDropdown && (
                    <div
                      className="absolute right-0 top-full mt-2.5 w-60 bg-white rounded-2xl z-50 overflow-hidden"
                      style={{
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.07)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }} />

                      <div className="px-4 py-3.5 border-b border-gray-100" style={{ background: '#fafafa' }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-extrabold text-gray-900">My Account</p>
                            <p className="text-[10px] text-gray-400">Affiliate Partner</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1.5 px-2">
                        {USER_MENU.map((menuItem, i) => (
                          <Link
                            key={i}
                            href={menuItem.href}
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[12.5px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 group transition-colors"
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                              style={{ background: `${menuItem.color}18`, color: menuItem.color }}
                            >
                              {menuItem.icon}
                            </div>
                            <span className="font-semibold">{menuItem.label}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="px-2 pb-2 border-t border-gray-100 pt-1.5">
                        <button
                          onClick={doLogout}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[12.5px] text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fee2e2' }}>
                            <LogOut className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 ml-auto"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* ── Mega menu panels rendered here (inside header, fixed positioned) ── */}
        {NAV_ITEMS.filter(i => i.mega).map((item) => (
          <div
            key={item.label}
            onMouseEnter={() => { keepMenu(); openMenu(item.label); }}
            onMouseLeave={closeMenu}
          >
            <MegaPanel
              item={item}
              visible={activeMenu === item.label}
              triggerRef={{ current: triggerRefs.current[item.label] }}
            />
          </div>
        ))}
      </header>

      {/* ══════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════ */}
      <div
        className={`lg:hidden fixed inset-0 z-[150] transition-all duration-300 ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            opacity: mobileOpen ? 1 : 0,
            transition: 'opacity 300ms',
          }}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer panel */}
        <div
          ref={mobileRef}
          className="absolute right-0 top-0 h-full flex flex-col bg-white"
          style={{
            width: 'min(320px, 90vw)',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <div className="h-[3px] flex-shrink-0" style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4,#8b5cf6)' }} />

          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                  src="/images/earnko-logo-round.png"
                  alt="Earnko"
                  className="w-9 h-9 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span style="color:white;font-weight:900;font-size:14px">E</span>';
                  }}
              />

              <div>
                <p className="text-[14px] font-black text-gray-900">Earnko</p>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Earn by Sharing</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* Generate CTA */}
            <div className="px-4 py-4 border-b border-gray-100">
              <button
                onClick={gotoGenerate}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-extrabold text-white"
                style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
              >
                <Zap className="w-4 h-4" />
                Generate Affiliate Link
              </button>
            </div>

            {/* Accordion nav */}
            <div className="px-3 py-3 border-b border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.14em] px-2 mb-2">Navigation</p>

              {NAV_ITEMS.map((item) => {
                const active   = isActive(item.href);
                const expanded = mobileExpanded === item.label;

                return (
                  <div key={item.label}>
                    {item.mega ? (
                      <>
                        <button
                          onClick={() => setMobileExpanded(expanded ? null : item.label)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                          style={active ? { background: '#eff6ff', color: '#2563eb' } : { color: '#374151' }}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className="w-4 h-4 transition-transform duration-200"
                            style={{ transform: expanded ? 'rotate(180deg)' : 'none', color: '#94a3b8' }}
                          />
                        </button>

                        <div
                          style={{
                            overflow: 'hidden',
                            maxHeight: expanded ? '600px' : '0',
                            transition: 'max-height 280ms ease',
                          }}
                        >
                          {item.sections?.map((section, si) => (
                            <div key={si} className="ml-3 mt-1 mb-2">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.14em] px-2 mb-1">
                                {section.heading}
                              </p>
                              {section.links.map((link, li) => (
                                <Link
                                  key={li}
                                  href={link.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl group hover:bg-blue-50 transition-colors"
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                      background: SECTION_COLORS[si % SECTION_COLORS.length].bg,
                                      color: SECTION_COLORS[si % SECTION_COLORS.length].color,
                                    }}
                                  >
                                    {link.icon}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-[12.5px] font-semibold text-gray-700 group-hover:text-blue-700 leading-tight">
                                        {link.label}
                                      </p>
                                      {link.badge && (
                                        <span
                                          className="text-[8px] font-black px-1 py-0.5 rounded-full"
                                          style={{
                                            background: link.badge === 'Hot' ? '#fef3c7' : link.badge === 'New' ? '#dcfce7' : '#eff6ff',
                                            color:      link.badge === 'Hot' ? '#92400e' : link.badge === 'New' ? '#15803d' : '#1d4ed8',
                                          }}
                                        >
                                          {link.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-none mt-0.5 truncate">{link.desc}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ))}

                          {item.cta && (
                            <Link
                              href={item.cta.href}
                              onClick={() => setMobileOpen(false)}
                              className="ml-3 mb-2 flex items-center gap-1.5 px-2 py-2 text-[12px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {item.cta.label}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                        style={active ? { background: '#eff6ff', color: '#2563eb' } : { color: '#374151' }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Auth section */}
            <div className="px-3 py-3">
              {!isLoggedIn ? (
                <>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.14em] px-2 mb-2">Get Started</p>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center py-3 rounded-xl text-[13px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 mb-2 transition-colors"
                  >
                    Login to Account
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center py-3 rounded-xl text-[13px] font-extrabold text-white"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)' }}
                  >
                    Create Free Account
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.14em] px-2 mb-2">My Account</p>
                  {USER_MENU.map((menuItem, i) => (
                    <Link
                      key={i}
                      href={menuItem.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 group transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${menuItem.color}18`, color: menuItem.color }}
                      >
                        {menuItem.icon}
                      </div>
                      {menuItem.label}
                    </Link>
                  ))}
                  <button
                    onClick={doLogout}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fee2e2' }}>
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Drawer footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0" style={{ background: '#fafafa' }}>
            <p className="text-[10px] text-gray-400 text-center">
              © {new Date().getFullYear()} Earnko · Affiliate Marketing Platform
            </p>
          </div>
        </div>
      </div>
    </>
  );
}