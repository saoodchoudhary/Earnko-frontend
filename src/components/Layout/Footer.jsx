'use client';

import Link from 'next/link';
import {
  Mail, Phone, MapPin, ArrowRight,
  Shield, TrendingUp, Instagram,
  Twitter, Linkedin, CreditCard
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1220] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {/* Logo: gradient removed, solid background */}
              {/* <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center ring-1 ring-white/20 shadow-sm">
                <TrendingUp className="w-6 h-6 text-[#0B1220]" />
              </div> */}

              <img 
               src='/images/earnko-logo-round.png'
               alt='earnko logo'
               className='w-[40px]'
               />
              <div>
                <h2 className="text-xl font-bold tracking-tight">Earnko</h2>
                <p className="text-sm text-gray-300">Affiliate Platform</p>
              </div>
            </div>

            <p className="text-gray-300/90 text-sm leading-relaxed">
              A professional platform for creators to monetize their influence
              through affiliate marketing. Simple, secure, and profitable.
            </p>

            {/* Social Links */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Connect with us</p>
              <div className="flex items-center gap-2">
                <SocialLink href="#" label="Twitter">
                  <Twitter className="w-4 h-4" />
                </SocialLink>
                <SocialLink href="#" label="Instagram">
                  <Instagram className="w-4 h-4" />
                </SocialLink>
                <SocialLink href="#" label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </SocialLink>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Platform
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/stores">Stores</FooterLink>
              <FooterLink href="/login">Login</FooterLink>
              <FooterLink href="/register">Sign Up</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Company
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              {/* <FooterLink href="/contact">Contact</FooterLink> */}
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms & Conditions</FooterLink>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Support
            </h3>
            <div className="space-y-4">
              <ContactItem icon={<Mail className="w-4 h-4" />} text="officialearnko@gmail.com" />
              <ContactItem icon={<MapPin className="w-4 h-4" />} text="Mumbai, India" />
            </div>
          </div>
        </div>

        {/* Trust & Security Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <Badge icon={<Shield className="w-4 h-4" />} text="Secure Platform" color="green" />
              <Badge icon={<CreditCard className="w-4 h-4" />} text="UPI & Bank Payouts" color="indigo" />
            </div>

            <div className="text-sm text-gray-300">
              Trusted by <span className="font-semibold text-white">5,000+</span> affiliates across India
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-gray-300 text-sm text-center md:text-left">
              © {currentYear} Earnko. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-cyan-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-cyan-300 hover:text-white transition-colors">
                Terms
              </Link>
              {/* <Link href="/cookies" className="text-cyan-300 hover:text-white transition-colors">
                Cookies
              </Link> */}
            </div>
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
        className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-cyan-300 hover:text-white hover:bg-white/5 transition-all"
      >
        <span>{children}</span>
        <ArrowRight className="w-3.5 h-3.5 text-cyan-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </Link>
    </li>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white ring-1 ring-white/10 flex items-center justify-center transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function ContactItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
      <div className="w-5 h-5 text-white/90">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function Badge({ icon, text, color = 'indigo' }) {
  const map = {
    indigo: 'bg-indigo-500/10',
    green: 'bg-emerald-500/10',
    violet: 'bg-violet-500/10',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${map[color]} ring-1 ring-white/15`}>
      <span className="text-white/90">{icon}</span>
      <span className="text-white/90">{text}</span>
    </div>
  );
}