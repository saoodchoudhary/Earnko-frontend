'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Store, Tag, Percent, DollarSign, Hash, ToggleLeft,
  ToggleRight, BarChart3, AlertCircle, CheckCircle
} from 'lucide-react'

export default function OfferForm({ initial, onSubmit, submitting }) {
  const [stores, setStores] = useState([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [form, setForm] = useState({
    store: initial?.store?._id || initial?.store || '',
    categoryKey: initial?.categoryKey || '',
    label: initial?.label || '',
    commissionRate: initial?.commissionRate ?? '',
    commissionType: initial?.commissionType || 'percentage',
    maxCap: initial?.maxCap ?? '',
    isActive: initial?.isActive ?? true,
    metadata: initial?.metadata || {}
  })

  const [jsonError, setJsonError] = useState('')

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { return await res.json() } catch { return null }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function loadStores() {
      try {
        setLoadingStores(true)
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        if (!base) {
          toast.error('NEXT_PUBLIC_BACKEND_URL not set')
          setStores([])
          return
        }

        const res = await fetch(`${base}/api/stores`, { signal: controller.signal })
        const data = await safeJson(res)

        if (ignore) return

        if (res.ok) {
          setStores(data?.data?.stores || [])
        } else {
          const msg = data?.message || `Failed to load stores (HTTP ${res.status})`
          // avoid HTML confusion
          if (String(msg).startsWith('<!DOCTYPE') || String(msg).includes('<html')) {
            toast.error('Stores API returned HTML. Check NEXT_PUBLIC_BACKEND_URL/backend.')
          } else {
            toast.error(msg)
          }
          setStores([])
        }
      } catch (err) {
        if (err?.name !== 'AbortError' && !ignore) {
          console.error('Error loading stores:', err)
          toast.error('Error loading stores')
        }
      } finally {
        if (!ignore) setLoadingStores(false)
      }
    }

    loadStores()
    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleMetadataChange = (e) => {
    const value = String(e.target.value || '').trim()
    try {
      if (value) {
        const parsed = JSON.parse(value)
        setForm(prev => ({ ...prev, metadata: parsed }))
        setJsonError('')
      } else {
        setForm(prev => ({ ...prev, metadata: {} }))
        setJsonError('')
      }
    } catch {
      setJsonError('Invalid JSON format')
    }
  }

  const submit = (e) => {
    e.preventDefault()

    if (!form.store) return toast.error('Please select a store')
    if (!form.categoryKey) return toast.error('Category key is required')
    if (form.commissionRate === '' || isNaN(Number(form.commissionRate))) return toast.error('Commission rate is required')
    if (jsonError) return toast.error('Please fix metadata JSON')

    onSubmit({
      ...form,
      commissionRate: Number(form.commissionRate),
      maxCap: form.maxCap === '' ? null : Number(form.maxCap),
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {initial ? 'Edit Offer' : 'Create New Offer'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Configure commission rates and offer details
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Store Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Store
            </div>
          </label>

          {loadingStores ? (
            <div className="h-11 sm:h-12 bg-gray-100 rounded-lg animate-pulse"></div>
          ) : (
            <div className="relative">
              <select
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                value={form.store}
                onChange={(e) => change('store', e.target.value)}
              >
                <option value="">Select a store</option>
                {stores.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!loadingStores && stores.length === 0 && (
            <div className="mt-2">
              <input
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                placeholder="Enter Store ID manually"
                value={form.store}
                onChange={(e) => change('store', e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">
                No stores found. Enter Store ID manually.
              </div>
            </div>
          )}
        </div>

        {/* Category & Label */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Category Key
              </div>
            </label>
            <input
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
              value={form.categoryKey}
              onChange={(e) => change('categoryKey', e.target.value)}
              placeholder="e.g., electronics, fashion, home"
              required
            />
            <div className="text-xs text-gray-500 mt-1">Internal identifier for this offer category</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Display Label
              </div>
            </label>
            <input
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
              value={form.label}
              onChange={(e) => change('label', e.target.value)}
              placeholder="e.g., Electronics up to 8%"
            />
            <div className="text-xs text-gray-500 mt-1">Visible name for this offer</div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Commission Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate
              </label>
              <div className="relative">
                {form.commissionType === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                <input
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                  type="number"
                  step="0.01"
                  value={form.commissionRate}
                  onChange={(e) => change('commissionRate', e.target.value)}
                  placeholder={form.commissionType === 'percentage' ? 'e.g., 8.5' : 'e.g., 50'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Type
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                value={form.commissionType}
                onChange={(e) => change('commissionType', e.target.value)}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Cap (₹)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                  type="number"
                  step="0.01"
                  value={form.maxCap}
                  onChange={(e) => change('maxCap', e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">Maximum commission per transaction</div>
            </div>
          </div>
        </div>

        {/* Status & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                {form.isActive ? (
                  <ToggleRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                )}
                Status
              </div>
            </label>
            <select
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
              value={form.isActive ? 'active' : 'inactive'}
              onChange={(e) => change('isActive', e.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Additional Metadata (JSON)
              </div>
            </label>

            <textarea
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm font-mono ${
                jsonError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-gray-800 focus:ring-gray-800'
              }`}
              rows={4}
              placeholder='{"tags":["electronics"],"priority":1}'
              defaultValue={JSON.stringify(form.metadata, null, 2)}
              onBlur={handleMetadataChange}
            />

            {jsonError ? (
              <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                <AlertCircle className="w-3 h-3" />
                {jsonError}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <CheckCircle className="w-3 h-3" />
                Valid JSON (or empty)
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {initial ? 'Update Offer' : 'Create Offer'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}