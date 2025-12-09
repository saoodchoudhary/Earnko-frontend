// components/Affiliate/RecentLinks.tsx
'use client'
import { Link2, Copy, ExternalLink, TrendingUp, Clock } from 'lucide-react'
import { useState } from 'react'

export default function RecentLinks() {
  // Mock data - replace with actual data from your API
  const recentLinks = [
    {
      id: 1,
      store: 'Amazon',
      product: 'Wireless Earbuds',
      clicks: 124,
      conversions: 8,
      earnings: '₹450',
      status: 'active',
      created: '2 hours ago'
    },
    {
      id: 2,
      store: 'Flipkart',
      product: 'Smart Watch',
      clicks: 89,
      conversions: 5,
      earnings: '₹320',
      status: 'active',
      created: '1 day ago'
    },
    {
      id: 3,
      store: 'Myntra',
      product: 'Running Shoes',
      clicks: 67,
      conversions: 3,
      earnings: '₹210',
      status: 'active',
      created: '2 days ago'
    },
    {
      id: 4,
      store: 'Ajio',
      product: 'Casual Shirt',
      clicks: 45,
      conversions: 2,
      earnings: '₹150',
      status: 'active',
      created: '3 days ago'
    }
  ]

  const [copiedId, setCopiedId] = useState(null)

  const handleCopy = (id, link) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      {recentLinks.map((link) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center">
              <Link2 className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{link.store}</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {link.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{link.product}</div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {link.clicks} clicks
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {link.created}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{link.earnings}</div>
            <div className="text-xs text-gray-500 mt-1">{link.conversions} conversions</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleCopy(link.id, `https://earnko.com/aff/${link.id}`)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors"
              >
                {copiedId === link.id ? 'Copied!' : 'Copy Link'}
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-200 transition-colors">
                Analytics
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}