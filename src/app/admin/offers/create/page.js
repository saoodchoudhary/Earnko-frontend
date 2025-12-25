'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import OfferForm from '../../../../components/admin/OfferForm'
import {
  ArrowLeft, Tag, PlusCircle, AlertCircle, CheckCircle
} from 'lucide-react'

export default function AdminOfferCreatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/category-commissions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to create offer')
      
      toast.success('Offer created successfully!', {
        icon: '🎯',
        duration: 3000
      })
      router.push('/admin/offers')
    } catch (err) {
      toast.error(err.message || 'Failed to create offer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin/offers" 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create New Offer</h1>
                  <p className="text-gray-600 text-sm mt-1">Add a new commission offer to the platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <OfferForm onSubmit={handleSubmit} submitting={saving} />
          </div>

          {/* Right Column - Guidelines */}
          <div className="space-y-6">
            {/* Creation Guidelines */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Creation Guidelines
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Store Selection</div>
                    <div className="text-xs text-gray-600">Select an existing store or enter Store ID manually</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Category Key</div>
                    <div className="text-xs text-gray-600">Use descriptive keys like "electronics", "fashion", "home"</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Commission Rate</div>
                    <div className="text-xs text-gray-600">Enter rate in % or fixed ₹ amount based on type</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Max Cap</div>
                    <div className="text-xs text-gray-600">Optional maximum commission per transaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Best Practices
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-700">Use clear, consistent category keys across stores</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-700">Set competitive commission rates based on industry standards</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-700">Add descriptive labels for better user understanding</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-700">Use metadata for additional tracking and segmentation</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  href="/admin/stores"
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Manage Stores
                </Link>
                <Link
                  href="/admin/offers"
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Offers
                </Link>
              </div>
            </div>

            {/* Creation Status */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Creation Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Form Status</span>
                  <span className={`text-sm font-medium ${
                    saving ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {saving ? 'Processing...' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Validation</span>
                  <span className="text-sm font-medium text-green-600">Required</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className={`text-sm font-medium ${
                    saving ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {saving ? 'Calling API...' : 'Idle'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}