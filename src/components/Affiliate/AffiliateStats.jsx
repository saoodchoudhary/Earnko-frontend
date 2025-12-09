// components/Affiliate/AffiliateStats.tsx
'use client'
import { TrendingUp, Users, MousePointer, DollarSign } from 'lucide-react'

export default function AffiliateStats() {
  // Mock data - replace with actual data from your store
  const stats = [
    {
      title: 'Total Clicks',
      value: '1,248',
      change: '+12%',
      icon: MousePointer,
      color: 'blue'
    },
    {
      title: 'Conversions',
      value: '48',
      change: '+8%',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Conversion Rate',
      value: '3.8%',
      change: '+0.2%',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Total Earnings',
      value: '₹2,450',
      change: '+15%',
      icon: DollarSign,
      color: 'orange'
    }
  ]

  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change.startsWith('+')
          
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex p-3 rounded-lg mb-3 ${colors[stat.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.title}</div>
              <div className={`text-xs font-medium mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last week
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}