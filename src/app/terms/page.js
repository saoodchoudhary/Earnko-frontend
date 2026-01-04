'use client';

import { useMemo } from 'react';
import { FileText, Handshake, Zap, Wallet, Shield, Ban, Mail, Globe, BadgeCheck } from 'lucide-react';

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
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms & Conditions</h1>
              <p className="text-blue-100 mt-1">Please review the rules of using Earnko</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/90">Last updated: {lastUpdated}</div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <Intro />

          <Section
            icon={<Handshake className="w-5 h-5 text-blue-600" />}
            title="Acceptance of Terms"
            items={[
              'By creating an account or using Earnko, you agree to these Terms.',
              'If you do not agree, do not use the platform.',
            ]}
          />

          <Section
            icon={<BadgeCheck className="w-5 h-5 text-emerald-600" />}
            title="Eligibility & Accounts"
            items={[
              'You must provide accurate information and maintain the security of your account.',
              'You are responsible for all activity under your account.',
            ]}
          />

          <Section
            icon={<Zap className="w-5 h-5 text-amber-600" />}
            title="Affiliate Links & Commissions"
            items={[
              'Earnko enables link generation and tracks clicks/conversions with affiliate networks.',
              'Commissions depend on merchant/network validation, timelines, and policies.',
              'We do not guarantee earnings or approval timelines.',
            ]}
          />

          <Section
            icon={<Wallet className="w-5 h-5 text-purple-600" />}
            title="Payouts & Withdrawals"
            items={[
              'Provide accurate payout details (UPI/bank) in Settings.',
              'Withdrawals are processed subject to minimum thresholds and verification.',
              'We may delay or reject withdrawals in cases of suspected fraud or policy violations.',
            ]}
          />

          <Section
            icon={<Shield className="w-5 h-5 text-indigo-600" />}
            title="Prohibited Activities"
            items={[
              'No fraudulent clicks, bot traffic, or misrepresentation.',
              'No spamming, trademark violations, or misleading content.',
              'Respect merchant terms and applicable laws.',
            ]}
          />

          <Section
            icon={<Globe className="w-5 h-5 text-blue-600" />}
            title="Content & Ownership"
            items={[
              'You own your content. You grant Earnko a limited license to operate your content on the platform.',
              'Partner logos and trademarks remain their respective owners’ property.',
            ]}
          />

          <Section
            icon={<Shield className="w-5 h-5 text-red-600" />}
            title="Termination"
            items={[
              'We may suspend or terminate accounts for violations, fraud, or misuse.',
              'You may request account closure anytime.',
            ]}
          />

          <Section
            icon={<Ban className="w-5 h-5 text-gray-700" />}
            title="Disclaimer & Liability"
            items={[
              'Services are provided “as is”. We disclaim warranties to the fullest extent permitted by law.',
              'We are not liable for indirect, incidental, or consequential damages.',
            ]}
          />

          <Section
            icon={<Mail className="w-5 h-5 text-blue-600" />}
            title="Contact"
            items={[
              'For questions regarding these Terms, email officialearnko@gmail.com.',
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function Intro() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-gray-700 leading-relaxed">
        Earnko is an affiliate platform that helps you create links, track performance, and withdraw commissions.
        These Terms govern your use of Earnko. Please read them carefully. We may update these Terms periodically;
        continued use means you accept the changes.
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
          <li key={i} className="text-sm">{t}</li>
        ))}
      </ul>
    </div>
  );
}