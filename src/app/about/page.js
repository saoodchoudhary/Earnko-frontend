'use client';

import { Zap, BarChart3, Users, Gift, Mail, CheckCircle, Target, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">About Earnko</h1>
              <p className="text-blue-100 mt-1">Helping creators monetize with smarter affiliate tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            icon={<Target className="w-6 h-6 text-blue-600" />}
            title="Our Mission"
            body="Empower creators and marketers to earn more from the products they love by simplifying affiliate link generation, tracking, and payouts."
          />
          <Card
            icon={<BarChart3 className="w-6 h-6 text-emerald-600" />}
            title="What We Offer"
            body="Generate links in seconds, monitor clicks and conversions, discover top offers, and withdraw commissions securely — all in one dashboard."
          />
          <Card
            icon={<Shield className="w-6 h-6 text-indigo-600" />}
            title="Trust & Transparency"
            body="We prioritize security, accurate tracking, and clear reporting so your earnings reflect real performance — no guesswork."
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <FeatureList
            title="Why Earnko"
            points={[
              'Fast, reliable link generation for major stores and networks',
              'Performance insights with clear click and conversion analytics',
              'Curated high-commission offers to maximize earnings',
              'Secure withdrawals with UPI and bank transfer options',
            ]}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          />
          <FeatureList
            title="Built for Growth"
            points={[
              'Mobile-friendly dashboard for on-the-go management',
              'Referral program that rewards community growth',
              'Continuous improvements based on real user feedback',
              'Privacy-first approach with minimal required data',
            ]}
            icon={<Users className="w-5 h-5 text-blue-600" />}
          />
        </div>

        <div className="mt-10 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">Get Started</h3>
          </div>
          <p className="text-gray-700">
            Join Earnko and turn everyday product shares into real earnings.
            Create your first link, explore top offers, and track results — all in minutes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/affiliate"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Create a Link
            </Link>
            <Link
              href="/offers"
              className="px-5 py-2.5 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              Explore Offers
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Contact</h3>
          </div>
          <p className="text-gray-700">
            We’d love to hear from you. For support or partnership inquiries, email us at
            {' '}
            <a className="text-blue-600 font-medium" href="mailto:officialearnko@gmail.com">officialearnko@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, body }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-gray-700">{body}</p>
    </div>
  );
}

function FeatureList({ title, points, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5">{icon}</span>
            <span className="text-gray-700">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}