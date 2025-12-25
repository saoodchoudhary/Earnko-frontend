'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, Plus, Loader2, Package, 
  AlertCircle, ChevronRight, Save
} from 'lucide-react'
import ProductForm from '../../../../components/admin/ProductForm'

export default function AdminProductCreatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to create product')
      toast.success('Product created successfully!')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err.message || 'Failed to create product')
    } finally { 
      setSaving(false) 
    }
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
                <span className="text-gray-900 font-medium">Create Product</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600 mt-1">Add a new product to your affiliate platform</p>
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
          {/* Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-700" />
              Product Creation
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Information
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>Fill in all required fields marked with *</li>
                  <li>Provide clear product images for better conversions</li>
                  <li>Set appropriate commission rates for affiliates</li>
                  <li>Review all details before saving</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Step 1</div>
                  <div className="text-gray-600">Enter basic product details</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Step 2</div>
                  <div className="text-gray-600">Add images and pricing</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Step 3</div>
                  <div className="text-gray-600">Configure affiliate settings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Form */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Product Details</h2>
                  <p className="text-gray-600 text-sm">Fill in the product information below</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ProductForm 
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-3">Best Practices</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Use high-quality product images (minimum 500x500px)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Write clear, compelling product descriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Set competitive commission rates for affiliates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Include relevant keywords for better searchability</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-3">Required Fields</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span><span className="font-medium text-gray-900">Product Title</span> - Clear, descriptive name</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span><span className="font-medium text-gray-900">Store</span> - Associated store or brand</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span><span className="font-medium text-gray-900">Price</span> - Accurate product pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span><span className="font-medium text-gray-900">Category</span> - Appropriate categorization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}