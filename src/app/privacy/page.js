'use client';

import { useMemo } from 'react';
import { Shield, Lock, FileText, Mail, Database, Cookie, User, Eye } from 'lucide-react';

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
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
              <p className="text-blue-100 mt-1">Your privacy matters at Earnko</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/90">Last updated: {lastUpdated}</div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <IntroCard />

          <Section
            icon={<User className="w-5 h-5 text-blue-600" />}
            title="Information We Collect"
            items={[
              { head: 'Account Details', body: 'Name and email to create and manage your Earnko account.' },
              { head: 'Profile & Payout', body: 'Optional UPI ID and bank account details you provide for withdrawals.' },
              { head: 'Usage & Analytics', body: 'Clicks, conversions, and affiliate link activity to power dashboards and performance insights.' },
              { head: 'Technical Data', body: 'Browser, device, and IP information to secure our platform and improve reliability.' },
            ]}
          />

          <Section
            icon={<Database className="w-5 h-5 text-green-600" />}
            title="How We Use Your Information"
            items={[
              { head: 'Provide Services', body: 'Operate core features such as link generation, tracking, wallet management, and withdrawals.' },
              { head: 'Improve Performance', body: 'Analyze aggregated metrics to refine offers, optimize analytics, and enhance user experience.' },
              { head: 'Security & Fraud Prevention', body: 'Detect suspicious activity to protect you and merchants, and to maintain platform integrity.' },
              { head: 'Legal Compliance', body: 'Meet obligations under applicable laws and respond to lawful requests from authorities.' },
            ]}
          />

          <Section
            icon={<Cookie className="w-5 h-5 text-amber-600" />}
            title="Cookies & Tracking"
            items={[
              { head: 'Functional', body: 'Essential cookies keep you signed in and enable core features.' },
              { head: 'Analytics', body: 'Anonymous metrics help us understand usage and performance.' },
              { head: 'Affiliate Tracking', body: 'Parameters such as click IDs allow attribution and commission calculation.' },
            ]}
          />

          <Section
            icon={<Eye className="w-5 h-5 text-purple-600" />}
            title="Sharing & Disclosure"
            items={[
              { head: 'Affiliate Networks & Merchants', body: 'We may share non-personal tracking data required for validating conversions.' },
              { head: 'Service Providers', body: 'Trusted infrastructure, analytics, and payment partners under strict confidentiality.' },
              { head: 'Legal', body: 'We may disclose information if required by law or to protect rights, safety, and security.' },
            ]}
          />

          <Section
            icon={<Lock className="w-5 h-5 text-emerald-600" />}
            title="Security & Retention"
            items={[
              { head: 'Safeguards', body: 'Industry-standard controls protect account and payout information.' },
              { head: 'Retention', body: 'We retain data only as long as necessary for services, legal, and accounting requirements.' },
            ]}
          />

          <Section
            icon={<FileText className="w-5 h-5 text-indigo-600" />}
            title="Your Rights"
            items={[
              { head: 'Access & Update', body: 'View and update your profile and payout details in Settings.' },
              { head: 'Delete & Withdraw Consent', body: 'Request account deletion or consent withdrawal where applicable.' },
              { head: 'Opt-Out', body: 'Disable non-essential cookies via your browser settings.' },
            ]}
          />

          <Section
            icon={<Mail className="w-5 h-5 text-blue-600" />}
            title="Contact"
            items={[
              { head: 'Questions or requests', body: 'Email us at officialearnko@gmail.com and we’ll get back within 24–48 hours.' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function IntroCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-gray-700 leading-relaxed">
        Earnko is an affiliate-focused platform that helps creators and marketers generate and manage affiliate links,
        track performance, and withdraw commissions. This Privacy Policy explains what information we collect, how we use it,
        and the choices you have. By using Earnko, you agree to this policy.
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
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-1 text-sm font-medium text-gray-900">{it.head}</div>
            <div className="sm:col-span-3 text-sm text-gray-700">{it.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}