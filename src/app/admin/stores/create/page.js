'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import StoreForm from '../../../../components/admin/StoreForm'
import { ArrowLeft, Store, Plus } from 'lucide-react'

export default function AdminStoreCreatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/stores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to create store')
      
      toast.success('Store created successfully!', {
        icon: '✅',
        duration: 3000
      })
      
      router.push('/admin/stores')
    } catch (err) {
      toast.error(err.message || 'Failed to create store')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/stores')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create New Store</h1>
                  <p className="text-gray-600 text-sm mt-1">Add a new affiliate store to the platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                Cancel
              </button>
              <button
                onClick={() => document.querySelector('form')?.requestSubmit()}
                disabled={saving}
                className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {saving ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Information Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 text-blue-600">i</div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Store Setup Guide</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Fill in the store details including base URL and tracking information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Set appropriate commission rates based on the affiliate network</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Configure cookie duration for proper attribution tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Test the tracking URL before making the store active</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Store Form */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <StoreForm 
              onSubmit={handleSubmit} 
              submitting={saving}
              onCancel={handleCancel}
            />
          </div>

          {/* Quick Tips */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Network Selection</div>
              <div className="text-xs text-gray-600">
                Choose the appropriate affiliate network for proper tracking and reporting
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Commission Rates</div>
              <div className="text-xs text-gray-600">
                Set competitive rates while maintaining platform profitability
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Cookie Duration</div>
              <div className="text-xs text-gray-600">
                Match with network standards for consistent attribution (typically 30-90 days)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}