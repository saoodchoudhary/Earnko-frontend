// components/home/HowItWorks.tsx
'use client'
import WorkflowStep from '../ui/WorkflowStep'
import { Link as LinkIcon, Globe, DollarSign, Sparkles } from 'lucide-react'

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Simple Process
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">How Earnko Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Start earning in minutes with our streamlined workflow</p>
        </div>

        <div className="mt-20 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent hidden lg:block" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <WorkflowStep 
              number="01"
              title="Create Links"
              description="Generate unique affiliate links from any product URL. Add custom parameters for better tracking."
              icon={<LinkIcon className="w-6 h-6" />}
              delay="0"
            />
            <WorkflowStep 
              number="02"
              title="Share & Engage"
              description="Distribute links across your platforms. Track engagement and optimize your strategy."
              icon={<Globe className="w-6 h-6" />}
              delay="200"
            />
            <WorkflowStep 
              number="03"
              title="Earn & Withdraw"
              description="Receive commissions automatically. Withdraw earnings and scale your affiliate business."
              icon={<DollarSign className="w-6 h-6" />}
              delay="400"
            />
          </div>
        </div>
      </div>
    </section>
  )
}