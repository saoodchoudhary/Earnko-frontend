'use client';

import { useMemo } from 'react';
import { FileText, Handshake, Zap, Wallet, Shield, Ban, Mail, Globe, BadgeCheck } from 'lucide-react';

const CONTACT_EMAIL = 'contact@earnko.com';

export default function TermsPage() {
  const lastUpdated = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms & Conditions</h1>
              <p className="text-blue-100 mt-1">Rules for using Earnko services</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/90">Last updated: {lastUpdated}</div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <IntroCard />

          <Section
            icon={<Handshake className="w-5 h-5 text-blue-600" />}
            title="Acceptance of Terms"
            items={[
              'By accessing or using Earnko, you agree to these Terms & Conditions.',
              'If you do not agree, please discontinue use of the platform.',
            ]}
          />

          <Section
            icon={<BadgeCheck className="w-5 h-5 text-emerald-600" />}
            title="Eligibility & Account Security"
            items={[
              'You must provide accurate information and keep your account credentials secure.',
              'You are responsible for any activity performed under your account.',
              'You must not share your login or attempt to access other users’ accounts.',
            ]}
          />

          <Section
            icon={<Zap className="w-5 h-5 text-amber-600" />}
            title="Affiliate Links, Tracking & Earnings"
            items={[
              'Earnko helps generate affiliate links and tracks clicks/conversions using third-party networks.',
              'Earnings depend on merchants/networks validating conversions and may be delayed, rejected, or adjusted by them.',
              'Earnko does not guarantee any minimum earnings, approval rate, or approval timeline.',
            ]}
          />

          <Section
            icon={<Wallet className="w-5 h-5 text-purple-600" />}
            title="Payouts & Withdrawals"
            items={[
              'You must provide correct payout details (UPI/bank) when requested by the platform.',
              'Withdrawals may require verification and are subject to minimum thresholds and internal checks.',
              'We may hold or deny withdrawals in cases of fraud, abuse, chargebacks, invalid traffic, or policy violations.',
            ]}
          />

          <Section
            icon={<Shield className="w-5 h-5 text-indigo-600" />}
            title="Prohibited Activities"
            items={[
              'No fraudulent clicks, bot traffic, incentivized/forced clicks, or misrepresentation.',
              'No spam, trademark misuse, misleading promotions, or harmful content.',
              'Follow applicable laws and each merchant/network’s terms.',
            ]}
          />

          <Section
            icon={<Globe className="w-5 h-5 text-blue-600" />}
            title="Content & Intellectual Property"
            items={[
              'Earnko and its UI/branding are protected by applicable IP laws.',
              'Merchant logos and trademarks belong to their respective owners.',
              'You retain ownership of content you submit, but grant Earnko a license to display it for platform operations.',
            ]}
          />

          <Section
            icon={<Ban className="w-5 h-5 text-gray-700" />}
            title="Suspension & Termination"
            items={[
              'We may suspend/terminate access for violations, suspicious activity, fraud, or misuse.',
              'You can request account closure by emailing support.',
            ]}
          />

          <Section
            icon={<Shield className="w-5 h-5 text-red-600" />}
            title="Disclaimer & Limitation of Liability"
            items={[
              'The service is provided “as is” without warranties, to the fullest extent permitted by law.',
              'We are not responsible for losses due to third-party merchant/network issues, tracking changes, or downtime.',
              'We are not liable for indirect or consequential damages.',
            ]}
          />

          <ContactCard />
        </div>
      </div>
    </div>
  );
}

function IntroCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-gray-700 leading-relaxed">
        Earnko is an affiliate platform that helps you create links, track performance, and withdraw commissions.
        These Terms govern your use of Earnko. We may update these Terms periodically; continued use means you accept
        the changes.
      </p>
      <div className="mt-4 text-xs text-gray-500">
        Tip: Keep a copy of these Terms for your reference.
      </div>
    </div>
  );
}

function ContactCard() {
  const email = 'contact@earnko.com';
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Contact</h2>
      </div>
      <p className="text-gray-700">
        For questions about these Terms, please email{' '}
        <a className="text-blue-700 font-semibold hover:underline" href={`mailto:${email}`}>
          {email}
        </a>.
      </p>
    </div>
  );
}

function Section({ icon, title, items }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <ul className="space-y-2 list-disc pl-6 text-gray-700">
        {items.map((t, i) => (
          <li key={i} className="text-sm leading-relaxed">{t}</li>
        ))}
      </ul>
    </div>
  );
}