// components/home/Features.tsx
'use client'
import { BarChart3, Shield, Smartphone, Target, Users, Zap, Globe, CreditCard } from 'lucide-react'
import FeatureCard from '../ui/FeatureCard'

export default function Features() {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: "Advanced Analytics",
      description: "Real-time tracking with detailed insights on clicks, conversions, and earnings performance",
      gradient: "from-blue-50 to-white"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Fraud Protection",
      description: "AI-powered detection system to ensure fair commissions and protect your earnings",
      gradient: "from-green-50 to-white"
    },
    {
      icon: <Smartphone className="w-6 h-6 text-purple-600" />,
      title: "Mobile Dashboard",
      description: "Manage your links and track earnings on the go with our dedicated mobile app",
      gradient: "from-purple-50 to-white"
    },
    {
      icon: <Target className="w-6 h-6 text-orange-600" />,
      title: "Smart Recommendations",
      description: "Personalized product suggestions based on your audience and performance data",
      gradient: "from-orange-50 to-white"
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
      title: "Team Collaboration",
      description: "Invite team members, assign roles, and manage campaigns together efficiently",
      gradient: "from-red-50 to-white"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Automated Workflows",
      description: "Set up automatic commission calculations, reports, and payout schedules",
      gradient: "from-yellow-50 to-white"
    }
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
            <Globe className="w-4 h-4 mr-2" />
            Platform Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Everything You Need to Succeed</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Advanced tools designed for serious affiliate marketers and content creators</p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}