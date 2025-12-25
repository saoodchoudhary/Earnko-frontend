'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Store, Tag, Percent, DollarSign, Hash, ToggleLeft,
  ToggleRight, Globe, BarChart3, AlertCircle, CheckCircle
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

  useEffect(() => {
    const controller = new AbortController()
    async function loadStores() {
      try {
        setLoadingStores(true)
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const res = await fetch(`${base}/api/stores`, { signal: controller.signal })
        const data = await res.json()
        if (res.ok) setStores(data?.data?.stores || [])
      } catch (err) {
        console.error('Error loading stores:', err)
      } finally {
        setLoadingStores(false)
      }
    }
    loadStores()
    return () => controller.abort()
  }, [])

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleMetadataChange = (e) => {
    const value = e.target.value.trim()
    try {
      if (value) {
        const parsed = JSON.parse(value)
        setForm(prev => ({ ...prev, metadata: parsed }))
        setJsonError('')
      } else {
        setForm(prev => ({ ...prev, metadata: {} }))
        setJsonError('')
      }
    } catch (err) {
      setJsonError('Invalid JSON format')
    }
  }

  const submit = (e) => {
    e.preventDefault()
    
    if (!form.store) {
      toast.error('Please select a store')
      return
    }
    
    if (!form.categoryKey) {
      toast.error('Category key is required')
      return
    }
    
    if (form.commissionRate === '' || isNaN(Number(form.commissionRate))) {
      toast.error('Commission rate is required')
      return
    }

    onSubmit({
      ...form,
      commissionRate: Number(form.commissionRate),
      maxCap: form.maxCap === '' ? null : Number(form.maxCap),
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? 'Edit Offer' : 'Create New Offer'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Configure commission rates and offer details</p>
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
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
          ) : (
            <div className="relative">
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                value={form.store} 
                onChange={(e) => change('store', e.target.value)}
              >
                <option value="">Select a store</option>
                {stores.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.domain ? `(${s.domain})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!loadingStores && stores.length === 0 && (
            <div className="mt-2">
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
                placeholder="Enter Store ID manually"
                value={form.store}
                onChange={(e) => change('store', e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">No stores found. Enter Store ID manually.</div>
            </div>
          )}
        </div>

        {/* Category & Label */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Category Key
              </div>
            </label>
            <input 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate
              </label>
              <div className="relative">
                {form.commissionType === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
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
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm"
              value={form.isActive ? 'active' : 'inactive'} 
              onChange={(e) => change('isActive', e.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {form.isActive ? 'This offer will be visible to users' : 'This offer will be hidden from users'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Additional Metadata (JSON)
              </div>
            </label>
            <div className="relative">
              <textarea
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-sm font-mono ${
                  jsonError 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-gray-800 focus:ring-gray-800'
                }`}
                rows={4}
                placeholder='{"tags": ["electronics", "tech"], "priority": 1}'
                defaultValue={JSON.stringify(form.metadata, null, 2)}
                onBlur={handleMetadataChange}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleMetadataChange(e)
                  }
                }}
              />
              {jsonError && (
                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {jsonError}
                </div>
              )}
              {!jsonError && Object.keys(form.metadata).length > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Valid JSON
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Optional additional data. Use CTRL+Enter to validate.
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {form.isActive ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Offer will be active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-600">
                <AlertCircle className="w-4 h-4" />
                Offer will be inactive
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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