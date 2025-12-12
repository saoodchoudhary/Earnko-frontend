// app/dashboard/affiliate/page.tsx
'use client'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import LinkMaker from '@/components/Affiliate/LinkMaker'
import PopularStores from '@/components/Affiliate/PopularStores'
import AffiliateStats from '@/components/Affiliate/AffiliateStats'
import RecentLinks from '@/components/Affiliate/RecentLinks'
import { Link2, Zap, TrendingUp, HelpCircle, Copy, ExternalLink } from 'lucide-react'

export default function AffiliatePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Affiliate Links</h1>
              <p className="text-gray-600 mt-2">
                Create affiliate links, track performance, and maximize your earnings
              </p>
            </div>
            <button className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">How it works</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Link Generator & Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Link Generator Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Generate Affiliate Links</h2>
                  <p className="text-sm text-gray-600">Create affiliate links from any product URL</p>
                </div>
              </div>
              <LinkMaker />
            </div>

            {/* Affiliate Stats */}
            <AffiliateStats />

            {/* Recent Links */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Links</h3>
                <button className="text-sm text-gray-900 font-medium hover:text-gray-700">
                  View all
                </button>
              </div>
              <RecentLinks />
            </div>
          </div>

          {/* Right Column - Popular Stores & Tips */}
          <div className="space-y-8">
            {/* Popular Stores */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Popular Stores</h3>
                  <p className="text-sm text-gray-600">High commission rates</p>
                </div>
              </div>
              <PopularStores />
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-lg font-bold">Maximize Earnings</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div className="text-sm">Share links on social media during peak shopping hours</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div className="text-sm">Use product reviews and tutorials to embed links naturally</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div className="text-sm">Track performance and optimize top-performing links</div>
                </li>
              </ul>
            </div>

            {/* FAQ/Support */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <a href="/help/affiliate" className="block text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded">
                  How to share affiliate links effectively?
                </a>
                <a href="/help/commission" className="block text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded">
                  When do commissions get credited?
                </a>
                <a href="/help/tracking" className="block text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded">
                  How does link tracking work?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}