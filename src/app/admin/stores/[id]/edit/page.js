'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import StoreForm from '../../../../../components/admin/StoreForm'
import {
  ArrowLeft, Store, Save, Loader2, AlertCircle, Shield,
  Globe, Tag, Settings, Package
} from 'lucide-react'

export default function AdminStoreEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [storeStats, setStoreStats] = useState({
    totalProducts: 0,
    totalTransactions: 0,
    totalCommission: 0,
    activeOffers: 0
  })

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        // Load store details
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/stores/${id}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load store')
        setItem(data?.data?.item || null)

        // Load store statistics
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/stores/${id}/stats`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStoreStats(statsData.data || {
            totalProducts: 0,
            totalTransactions: 0,
            totalCommission: 0,
            activeOffers: 0
          })
        }

      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error(err.message || 'Error loading store details')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [id])

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/stores/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update store')
      
      toast.success('Store updated successfully!')
      router.push('/admin/stores')
    } catch (err) {
      toast.error(err.message || 'Failed to update store')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/stores')}
            className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stores
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/stores')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-6 h-6 text-gray-700" />
                Edit Store
              </h1>
              <p className="text-gray-600 text-sm mt-1">Update store details and configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/admin/stores/${id}/preview`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Preview
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Store Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Store Stats */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-700" />
                Store Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600">Total Products</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{storeStats.totalProducts}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Store className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600">Active Offers</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{storeStats.activeOffers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-600">Total Transactions</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{storeStats.totalTransactions}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm text-gray-600">Total Commission</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₹{storeStats.totalCommission}</span>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-700" />
                Store Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Store ID</div>
                  <div className="text-sm font-mono text-gray-900 truncate">{item._id}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="text-sm text-gray-900">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm text-gray-900">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    item.status === 'active' ? 'bg-green-100 text-green-600' :
                    item.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {item.status || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <a 
                  href={`/admin/stores/${id}/products`}
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Manage Products
                </a>
                <a 
                  href={`/admin/stores/${id}/offers`}
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Manage Offers
                </a>
                <a 
                  href={`/admin/stores/${id}/analytics`}
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  View Analytics
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Form Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Store className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{item.name || 'Store'}</h2>
                    <div className="text-sm text-gray-600">{item.description?.substring(0, 100)}...</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Update store details below. All changes are saved immediately upon submission.
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <StoreForm 
                  initial={item} 
                  onSubmit={handleSubmit} 
                  submitting={saving} 
                />
              </div>

              {/* Form Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>All store data is secured and backed up</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push('/admin/stores')}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="store-form"
                      disabled={saving}
                      className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Important Notes
              </h3>
              
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>Store name and URL changes may affect existing affiliate links</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>Commission rate changes apply to new transactions only</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>Store status changes may take a few minutes to reflect</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>Always verify store URLs before saving changes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}