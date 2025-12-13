// components/Affiliate/PopularStores.tsx
'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Store, TrendingUp, Clock, Zap } from 'lucide-react'

const presetStores = [
  { 
    key: 'amazon', 
    name: 'Amazon', 
    cashback: '5%', 
    commission: 'Up to 10%',
    color: 'from-orange-50 to-yellow-50',
    iconColor: 'text-orange-600'
  },
  { 
    key: 'flipkart', 
    name: 'Flipkart', 
    cashback: '7.5%', 
    commission: 'Up to 12%',
    color: 'from-blue-50 to-cyan-50',
    iconColor: 'text-blue-600'
  },
  { 
    key: 'myntra', 
    name: 'Myntra', 
    cashback: '6%', 
    commission: 'Up to 15%',
    color: 'from-pink-50 to-rose-50',
    iconColor: 'text-pink-600'
  },
  { 
    key: 'ajio', 
    name: 'Ajio', 
    cashback: '6%', 
    commission: 'Up to 14%',
    color: 'from-purple-50 to-indigo-50',
    iconColor: 'text-purple-600'
  },
  { 
    key: 'campus', 
    name: 'Campus', 
    cashback: '10.5%', 
    commission: 'Up to 18%',
    color: 'from-green-50 to-emerald-50',
    iconColor: 'text-green-600'
  }
]

export default function PopularStores() {
  const [loadingKey, setLoadingKey] = useState(null)

  async function handleCreateForStore(storeKey) {
    try {
      setLoadingKey(storeKey)
      const homepage = getHomepageFor(storeKey)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/affiliate/link-from-url`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            ...(token ? { Authorization: `Bearer ${token}` } : {}) 
          },
          body: JSON.stringify({ url: homepage })
        }
      )
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.message || 'Failed to create link')
      } else {
        toast.success(`Amazon affiliate link created! Check your dashboard.`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Server error')
    } finally {
      setLoadingKey(null)
    }
  }

  function getHomepageFor(key) {
    switch (key) {
      case 'amazon': return 'https://www.amazon.in'
      case 'flipkart': return 'https://www.flipkart.com'
      case 'myntra': return 'https://www.myntra.com'
      case 'ajio': return 'https://www.ajio.com'
      case 'campus': return 'https://www.campus.com'
      default: return 'https://www.example.com'
    }
  }

  return (
    <div className="space-y-3">
      {presetStores.map((store) => (
        <div
          key={store.key}
          className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${store.color} flex items-center justify-center`}>
                <Store className={`w-6 h-6 ${store.iconColor}`} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{store.name}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {store.cashback} cashback
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {store.commission}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleCreateForStore(store.key)}
              disabled={loadingKey === store.key}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingKey === store.key ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Link'
              )}
            </button>
          </div>
        </div>
      ))}
      
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Commission rates may vary by product category and season</span>
        </div>
      </div>
    </div>
  )
}