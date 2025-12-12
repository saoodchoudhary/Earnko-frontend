'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { 
  Copy, Share2, Users, Gift, TrendingUp, Award, 
  ArrowRight, UserPlus, CheckCircle, DollarSign,
  Facebook, Twitter, Linkedin, Mail, MessageCircle,
  Zap, Target
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReferPage() {
  const [refCode, setRefCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({
    totalReferrals: 8,
    activeReferrals: 5,
    totalEarnings: 1250,
    pendingEarnings: 320
  })

  useEffect(() => {
    const u = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
    setRefCode(u?.referralCode || 'REFER' + Math.random().toString(36).substring(2, 8).toUpperCase())
  }, [])

  function copyToClipboard() {
    if (!refCode) return
    navigator.clipboard.writeText(refCode).then(() => {
      setCopied(true)
      toast.success('Referral code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => toast.error('Failed to copy'))
  }

  function shareOnPlatform(platform) {
    const shareText = `Join Earnko using my referral code: ${refCode}. Start earning with affiliate marketing!`
    const shareUrl = `${window.location.origin}/register?ref=${refCode}`
    
    const platforms = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=Join%20Earnko&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    }

    if (platforms[platform]) {
      window.open(platforms[platform], '_blank')
    }
  }

  const referralStats = [
    {
      icon: <Users className="w-6 h-6" />,
      label: "Total Referrals",
      value: stats.totalReferrals,
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      label: "Active Referrals",
      value: stats.activeReferrals,
      color: "text-green-600 bg-green-50"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: "Total Earnings",
      value: `₹${stats.totalEarnings}`,
      color: "text-purple-600 bg-purple-50"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "Pending Earnings",
      value: `₹${stats.pendingEarnings}`,
      color: "text-orange-600 bg-orange-50"
    }
  ]

  const referralSteps = [
    {
      number: "1",
      title: "Share Your Code",
      description: "Copy your unique referral code or share directly via social media",
      icon: <Share2 className="w-5 h-5" />
    },
    {
      number: "2",
      title: "Friends Sign Up",
      description: "Friends use your code when creating their Earnko account",
      icon: <UserPlus className="w-5 h-5" />
    },
    {
      number: "3",
      title: "Start Earning",
      description: "Earn commission when friends make their first successful transaction",
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  const benefits = [
    "Earn 10% commission on friend's earnings for first 3 months",
    "Additional ₹100 bonus when friend completes first transaction",
    "Unlimited referral earnings - no caps or limits",
    "Real-time tracking of referral performance",
    "Instant payouts for confirmed referral earnings"
  ]

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Refer & Earn</h1>
          <p className="text-gray-600 mt-2">Invite friends and earn extra income with every referral</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {referralStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Referral Code & Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Code Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5" />
                    <h3 className="text-xl font-bold">Your Referral Code</h3>
                  </div>
                  <p className="text-gray-300 mb-4">Share this code with friends to start earning</p>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Unique Code</p>
                    <p className="text-2xl font-bold font-mono tracking-wider">{refCode || 'GENERATING...'}</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      copied 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-4 text-sm">
                  <p className="text-gray-300">Share link: {window.location.origin}/register?ref={refCode}</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {referralSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 pt-8">
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-4">
                        {step.icon}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Benefits */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Referral Benefits</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Share Options */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share Instantly</h3>
              <p className="text-gray-600 text-sm mb-4">Share your referral code with one click</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareOnPlatform('whatsapp')}
                  className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={() => shareOnPlatform('facebook')}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => shareOnPlatform('twitter')}
                  className="flex items-center justify-center gap-2 p-3 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span className="text-sm font-medium">Twitter</span>
                </button>
                <button
                  onClick={() => shareOnPlatform('email')}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm font-medium">Email</span>
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Join Earnko',
                        text: `Use my referral code ${refCode} to join Earnko and start earning!`,
                        url: `${window.location.origin}/register?ref=${refCode}`
                      })
                    } else {
                      copyToClipboard()
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <Share2 className="w-5 h-5" />
                  Share with Friends
                </button>
              </div>
            </div>

            {/* Earnings Potential */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Earnings Potential</h4>
                  <p className="text-sm text-gray-600">Maximize your referral income</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">Per Referral</span>
                  <span className="font-bold text-gray-900">₹100 - ₹500</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">Monthly Potential</span>
                  <span className="font-bold text-gray-900">₹5,000+</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">Top Earners</span>
                  <span className="font-bold text-gray-900">₹25,000/mo</span>
                </div>
              </div>

              <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                <Target className="w-5 h-5" />
                Set Referral Goals
              </button>
            </div>

            {/* Tips & Best Practices */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-3">Tips for Success</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>Share on social media with personal success stories</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>Explain how easy it is to start earning</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>Follow up with friends who showed interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>Join our referral community for tips</span>
                </li>
              </ul>
            </div>

            {/* Need Help? */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h4 className="font-bold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-4">Our support team can help with referral questions</p>
              <button className="w-full py-2.5 text-sm bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Add missing Clock icon component
const Clock = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)