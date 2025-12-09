// components/Layout/Footer.tsx
'use client'
import Link from 'next/link'
import { 
  Twitter, Linkedin, Instagram, Facebook, Mail, Globe,  TrendingUp, Phone,
  Shield, Zap, CheckCircle, Users, Download
} from 'lucide-react'

export default function Footer() {


  return (
    <footer className="bg-gray-900 text-white">
     

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-gray-300 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">Earnko</div>
                <div className="text-gray-400">Professional Affiliate Platform</div>
              </div>
            </div>
            
            <p className="text-gray-400 leading-relaxed max-w-md">
              Empowering creators and businesses with enterprise-grade affiliate marketing tools. 
              Generate revenue, track performance, and grow your earnings with confidence.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <SocialIcon href="#" ariaLabel="Twitter" icon={<Twitter className="w-5 h-5" />} />
              <SocialIcon href="#" ariaLabel="LinkedIn" icon={<Linkedin className="w-5 h-5" />} />
              <SocialIcon href="#" ariaLabel="Instagram" icon={<Instagram className="w-5 h-5" />} />
              <SocialIcon href="#" ariaLabel="Facebook" icon={<Facebook className="w-5 h-5" />} />
            </div>

          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-800">Resources</h4>
            <ul className="space-y-3">
              <FooterLink href="/blog">Blog & Insights</FooterLink>
              <FooterLink href="/guides">Affiliate Guides</FooterLink>
              <FooterLink href="/case-studies">Success Stories</FooterLink>
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/community">Community</FooterLink>
              <FooterLink href="/webinars">Webinars</FooterLink>
            </ul>
          </div>

          {/* Company & Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-800">Company</h4>
            <ul className="space-y-3 mb-6">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/contact">Contact Sales</FooterLink>
              <FooterLink href="/press">Press & Media</FooterLink>
              <FooterLink href="/partners">Partners</FooterLink>
            </ul>
        
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Earnko. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              <LegalLink href="/privacy">Privacy Policy</LegalLink>
              <LegalLink href="/terms">Terms of Service</LegalLink>
              <LegalLink href="/cookies">Cookie Policy</LegalLink>
              <LegalLink href="/security">Security</LegalLink>
              <LegalLink href="/sitemap">Sitemap</LegalLink>
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children, icon }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm"
      >
        {icon && <span className="group-hover:translate-x-1 transition-transform">{icon}</span>}
        <span>{children}</span>
      </Link>
    </li>
  )
}

function SocialIcon({ href, ariaLabel, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
    >
      {icon}
    </a>
  )
}

function LegalLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-gray-500 hover:text-white transition-colors text-sm"
    >
      {children}
    </Link>
  )
}