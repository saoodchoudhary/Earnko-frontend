'use client';

import { useMemo } from 'react';
import { Shield, Lock, Database, Cookie, Mail, Eye, FileText, Users } from 'lucide-react';

const CONTACT_EMAIL = 'contact@earnko.com';

export default function PrivacyPolicyPage() {
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
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
              <p className="text-blue-100 mt-1">How Earnko collects and uses information</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/90">Last updated: {lastUpdated}</div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <InfoCard />

          <PolicySection
            icon={<Database className="w-5 h-5 text-blue-600" />}
            title="Information We Collect"
            items={[
              'Account details: name, email, and login identifiers.',
              'Usage data: pages visited, device/browser info, IP address, and analytics events.',
              'Affiliate tracking data: click identifiers and conversion metadata (as provided by networks).',
              'Payout details (when applicable): UPI/bank details for withdrawals.',
            ]}
          />

          <PolicySection
            icon={<Eye className="w-5 h-5 text-emerald-600" />}
            title="How We Use Your Information"
            items={[
              'To operate the platform, generate affiliate links, and track clicks/conversions.',
              'To show reporting (clicks, conversions, earnings) and to process payouts.',
              'To improve performance, prevent abuse/fraud, and maintain security.',
              'To respond to support requests and communicate important updates.',
            ]}
          />

          <PolicySection
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            title="Sharing of Information"
            items={[
              'Affiliate networks/merchants: for link creation, tracking, and reporting.',
              'Service providers: hosting, analytics, email delivery, security tooling.',
              'Legal: if required by law or to enforce our Terms and protect users/platform.',
              'We do not sell your personal information.',
            ]}
          />

          <PolicySection
            icon={<Cookie className="w-5 h-5 text-amber-600" />}
            title="Cookies & Tracking"
            items={[
              'We may use cookies/local storage for login sessions and user preferences.',
              'Affiliate networks may use cookies to attribute conversions according to their policies.',
              'You can control cookies through your browser settings, but some features may not work properly.',
            ]}
          />

          <PolicySection
            icon={<Lock className="w-5 h-5 text-purple-600" />}
            title="Security"
            items={[
              'We use reasonable safeguards to protect data.',
              'No method of transmission/storage is 100% secure; use the platform at your own risk.',
            ]}
          />

          <PolicySection
            icon={<FileText className="w-5 h-5 text-gray-700" />}
            title="Data Retention"
            items={[
              'We retain data as needed for operations, reporting, compliance, and dispute resolution.',
              'You may request deletion/closure by contacting support (subject to legal requirements).',
            ]}
          />

          <ContactCard />
        </div>
      </div>
    </div>
  );
}

function InfoCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-gray-700 leading-relaxed">
        This Privacy Policy explains how Earnko collects, uses, and shares information when you use our services.
        If you have questions, contact us anytime.
      </p>
    </div>
  );
}

function ContactCard() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Contact</h2>
      </div>
      <p className="text-gray-700">
        For privacy questions or requests, email{' '}
        <a className="text-blue-700 font-semibold hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>.
      </p>
    </div>
  );
}

function PolicySection({ icon, title, items }) {
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