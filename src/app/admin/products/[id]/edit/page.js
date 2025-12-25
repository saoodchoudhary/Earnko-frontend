'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, Save, Loader2, Package, 
  Tag, DollarSign, Hash, Image, Link as LinkIcon,
  AlertCircle, ChevronRight, Globe
} from 'lucide-react'
import ProductForm from '../../../../../components/admin/ProductForm'

export default function AdminProductEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products/${id}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load')
        setItem(data?.data?.item || null)
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading product')
      } finally { setLoading(false) }
    }
    load()
    return () => controller.abort()
  }, [id])

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update product')
      toast.success('Product updated successfully!')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err.message || 'Failed to update product')
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you are trying to edit does not exist.</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <button 
                  onClick={() => router.push('/admin')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Admin
                </button>
                <ChevronRight className="w-4 h-4" />
                <button 
                  onClick={() => router.push('/admin/products')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Products
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Edit Product</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product details and information</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/products')}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Product Info Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-700" />
              Product Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Product ID</div>
                <div className="font-mono text-sm font-medium">{id}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Current Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium capitalize">{item.status || 'draft'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Make sure all product information is accurate before saving changes.</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Product Details</h2>
                  <p className="text-gray-600 text-sm">Update product information below</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ProductForm 
                initial={item} 
                onSubmit={handleSubmit} 
                submitting={saving} 
              />
            </div>

            {/* Form Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.push('/admin/products')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </button>
                
                <button
                  type="submit"
                  form="product-form"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {item.createdAt && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Store</div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.store?.name || 'No store'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{Number(item.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}