'use client';

import { useMemo } from 'react';
import { Mail, HelpCircle, Shield, Zap, ArrowRight } from 'lucide-react';

const CONTACT_EMAIL = 'contact@earnko.com';

export default function ContactPage() {
  const subject = useMemo(() => encodeURIComponent('Support Request - Earnko'), []);
  const mailto = useMemo(() => `mailto:${CONTACT_EMAIL}?subject=${subject}`, [subject]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact Us</h1>
              <p className="text-blue-100 mt-1">Email support — we’ll get back as soon as possible</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={mailto}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all"
            >
              Email {CONTACT_EMAIL} <ArrowRight className="w-4 h-4" />
            </a>
         
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-gray-200 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-blue-700" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900">Support Email</h2>
                <p className="text-gray-700 mt-1">
                  Please email us at{' '}
                  <a className="text-blue-700 font-semibold hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>{' '}
                  with details of your issue (screenshots, URLs, and your account email).
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Faster resolution tip: include “Store name”, “Input URL”, and the error message (if any).
                </div>
              </div>
            </div>
          </div>

          <InfoRow />

          <FAQ />
        </div>
      </div>
    </div>
  );
}

function InfoRow() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <InfoCard
        icon={<Zap className="w-5 h-5 text-amber-600" />}
        title="Link Issues"
        body="If a link fails to generate, share the input URL and store name so we can check network rules."
      />
      <InfoCard
        icon={<Shield className="w-5 h-5 text-indigo-600" />}
        title="Account & Security"
        body="Never share passwords or OTPs. For login issues, email from your registered email address."
      />
      <InfoCard
        icon={<HelpCircle className="w-5 h-5 text-blue-600" />}
        title="Payout Questions"
        body="Include your withdrawal request ID (if any) and approximate date/time of request."
      />
    </div>
  );
}

function InfoCard({ icon, title, body }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
    </div>
  );
}

function FAQ() {
  const qa = [
    {
      q: 'Do you provide phone support?',
      a: 'No. Earnko support is email-only for security and faster ticket tracking.'
    },
    {
      q: 'My campaign needs approval — what should I do?',
      a: 'Email us the store name and URL. If the network requires approval, we’ll guide you on the correct process.'
    },
    {
      q: 'My payout is pending. What details should I share?',
      a: 'Email your registered email, withdrawal amount, and approximate request time. If you have a request ID, include it.'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {qa.map((x, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="font-semibold text-gray-900">{x.q}</div>
            <div className="text-sm text-gray-700 mt-1">{x.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}