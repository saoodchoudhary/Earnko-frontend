'use client';

import Link from 'next/link';
import {
  Mail, MapPin,
  Shield, Instagram,
  Twitter, Linkedin, CreditCard, Youtube
} from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';

const CONTACT_EMAIL = 'contact@earnko.com';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(900px_500px_at_85%_10%,rgba(99,102,241,0.10),transparent_55%),linear-gradient(180deg,#070B14_0%,#0A1020_45%,#070B14_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.25] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

      {/* Top border highlight */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/images/earnko-logo-round.png"
                  alt="Earnko logo"
                  className="w-10 h-10 rounded-xl"
                />
                <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-white/15 to-transparent blur-md" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Earnko</h2>
                <p className="text-xs text-white/60">Affiliate Platform</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              A professional platform for creators to monetize their influence through affiliate marketing.
              Simple, secure, and profitable.
            </p>

            {/* Social */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Connect
              </p>
              <div className="flex items-center gap-2">
                <SocialLink href="https://www.x.com/earnko_official/" label="X (Twitter)">
                  <Twitter className="w-4 h-4" />
                </SocialLink>
                <SocialLink href="https://www.instagram.com/earnko_official" label="Instagram">
                  <Instagram className="w-4 h-4" />
                </SocialLink>
                <SocialLink href="https://www.linkedin.com/in/earn-ko-65311b3a5" label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </SocialLink>
                <SocialLink href="https://youtube.com/@earnko_official?si=OUtXf7wa29e1NSj6" label="YouTube">
                  <Youtube className="w-4 h-4" />
                </SocialLink>
                <SocialLink href="https://t.me/Earnkoaffiliate" label="Telegram">
                  <FaTelegramPlane className="w-4 h-4" />
                </SocialLink>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Platform
            </h3>
            <ul className="space-y-2.5">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/stores">Stores</FooterLink>
              <FooterLink href="/offers">Offers</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/dashboard/referrals">Refer & Earn</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Company
            </h3>
            <ul className="space-y-2.5">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms & Conditions</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Support
            </h3>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="space-y-3">
                <ContactItem icon={<Mail className="w-4 h-4" />} text={CONTACT_EMAIL} />
                <ContactItem icon={<MapPin className="w-4 h-4" />} text="Mumbai, India" />
              </div>

              <div className="mt-3 text-xs text-white/55">
                Support is available via email only.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge icon={<Shield className="w-4 h-4" />} text="Secure platform" />
              <Badge icon={<CreditCard className="w-4 h-4" />} text="UPI & Bank payouts" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-white/10" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-sm text-white/60">
            © {currentYear} Earnko. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <FooterMiniLink href="/privacy">Privacy</FooterMiniLink>
            <FooterMiniLink href="/terms">Terms</FooterMiniLink>
            <span className="hidden md:inline text-white/20">•</span>
            <span className="text-white/55">
              Trusted by <span className="text-white font-semibold">5,000+</span> affiliates
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-sky-300/80 transition-colors" />
        <span className="leading-6">{children}</span>
      </Link>
    </li>
  );
}

function FooterMiniLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-white/60 hover:text-white transition-colors underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] text-white/75 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function ContactItem({ icon, text }) {
  const isEmail = String(text).includes('@');
  return (
    <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
      <div className="w-5 h-5 text-white/80">{icon}</div>
      {isEmail ? (
        <a className="text-sm hover:underline underline-offset-4" href={`mailto:${text}`}>{text}</a>
      ) : (
        <span className="text-sm">{text}</span>
      )}
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-white/[0.04] border border-white/10 text-white/75">
      <span className="text-white/80">{icon}</span>
      <span>{text}</span>
    </div>
  );
}