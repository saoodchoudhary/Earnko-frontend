'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import OfferForm from '../../../../components/admin/OfferForm'
import { ArrowLeft, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminOfferCreatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { return await res.json() } catch { return null }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      if (!base) {
        toast.error('NEXT_PUBLIC_BACKEND_URL not set')
        return
      }

      const res = await fetch(`${base}/api/admin/category-commissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      })

      const data = await safeJson(res)
      if (!res.ok) throw new Error(data?.message || `Failed to create offer (HTTP ${res.status})`)

      toast.success('Offer created successfully!', { icon: '🎯', duration: 3000 })
      router.push('/admin/offers')
    } catch (err) {
      toast.error(err.message || 'Failed to create offer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/admin/offers" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Create New Offer</h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Add a new commission offer to the platform</p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Fill the form carefully and submit
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OfferForm onSubmit={handleSubmit} submitting={saving} />
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Creation Guidelines
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">Store Selection</div>
                    <div className="text-gray-600">Select an existing store or enter Store ID manually</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">Category Key</div>
                    <div className="text-gray-600">Use keys like "electronics", "fashion", "home"</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">Commission Rate</div>
                    <div className="text-gray-600">Enter % or fixed ₹ based on type</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Best Practices
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-700">Use consistent category keys across stores</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/admin/stores" className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                  Manage Stores
                </Link>
                <Link href="/admin/offers" className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Offers
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}