'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import StoreForm from '../../../../components/admin/StoreForm'
import { ArrowLeft, Store, Plus } from 'lucide-react'

export default function AdminStoreCreatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const envWarned = useRef(false)

  const getBase = () => process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    }
  }
  const ensureEnvConfigured = () => {
    const base = getBase()
    if (!base && !envWarned.current) {
      envWarned.current = true
      toast.error('Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL')
    }
  }
  const handleHttpError = async (res) => {
    let message = 'Request failed'
    try {
      const js = await res.clone().json()
      if (js?.message) message = js.message
    } catch {}
    if (res.status === 401) message = 'Unauthorized. Please login again.'
    if (res.status === 403) message = 'Forbidden. Admin access required.'
    throw new Error(message)
  }

  const handleSubmit = async (payload) => {
    try {
      ensureEnvConfigured()
      setSaving(true)
      const base = getBase()
      const res = await fetch(`${base}/api/admin/stores`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) await handleHttpError(res)
      await res.json()

      toast.success('Store created successfully!')
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
                onClick={() => document.getElementById('store-form')?.requestSubmit()}
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
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <StoreForm onSubmit={handleSubmit} submitting={saving} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    </div>
  )
}