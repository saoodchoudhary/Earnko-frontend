'use client'

import { useState } from 'react'
import { Store, Globe, Percent, Clock, Shield, Link as LinkIcon, Save, X } from 'lucide-react'

const networks = [
  { value: 'manual', label: 'Manual', icon: '👨‍💼' },
  { value: 'cuelinks', label: 'Cuelinks', icon: '🔗' },
  { value: 'amazon', label: 'Amazon', icon: '🛒' },
  { value: 'flipkart', label: 'Flipkart', icon: '📦' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
]

export default function StoreForm({ initial, onSubmit, submitting, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    affiliateNetwork: initial?.affiliateNetwork || 'manual',
    commissionRate: initial?.commissionRate ?? 0,
    commissionType: initial?.commissionType || 'percentage',
    maxCommission: initial?.maxCommission ?? '',
    trackingUrl: initial?.trackingUrl || '',
    baseUrl: initial?.baseUrl || '',
    isActive: initial?.isActive ?? true,
    cookieDuration: initial?.cookieDuration ?? 30,
    description: initial?.description || '',
  })

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('Store name is required')
      return
    }
    if (!form.baseUrl.trim() || !form.baseUrl.startsWith('http')) {
      alert('Please enter a valid base URL starting with http/https')
      return
    }
    onSubmit({
      ...form,
      commissionRate: Number(form.commissionRate || 0),
      maxCommission: form.maxCommission === '' ? null : Number(form.maxCommission),
      cookieDuration: Number(form.cookieDuration || 30),
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? 'Edit Store' : 'Create New Store'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Configure affiliate store settings and tracking
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                value={form.name}
                onChange={(e) => change('name', e.target.value)}
                placeholder="e.g., Amazon India"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affiliate Network
              </label>
              <div className="grid grid-cols-5 gap-2">
                {networks.map(n => (
                  <button
                    key={n.value}
                    type="button"
                    onClick={() => change('affiliateNetwork', n.value)}
                    className={`p-2 border rounded-lg text-center transition-all ${
                      form.affiliateNetwork === n.value 
                        ? 'border-gray-800 bg-gray-800 text-white' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-sm">{n.icon}</div>
                    <div className="text-xs mt-1">{n.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              rows={2}
              value={form.description}
              onChange={(e) => change('description', e.target.value)}
              placeholder="Brief description about this store..."
            />
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Commission Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate *
              </label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.commissionRate}
                  onChange={(e) => change('commissionRate', e.target.value)}
                  placeholder="e.g., 8"
                  required
                />
                {form.commissionType === 'percentage' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => change('commissionType', 'percentage')}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    form.commissionType === 'percentage' 
                      ? 'border-gray-800 bg-gray-800 text-white' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">Percentage</div>
                </button>
                <button
                  type="button"
                  onClick={() => change('commissionType', 'fixed')}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    form.commissionType === 'fixed' 
                      ? 'border-gray-800 bg-gray-800 text-white' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">Fixed (₹)</div>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Commission (₹) <span className="text-gray-400">Optional</span>
              </label>
              <input
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                type="number"
                step="0.01"
                min="0"
                value={form.maxCommission}
                onChange={(e) => change('maxCommission', e.target.value)}
                placeholder="e.g., 500"
              />
            </div>
          </div>
        </div>

        {/* Tracking & URLs */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Tracking & URLs
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL *
              </label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-gray-600" />
                </div>
                <input
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  value={form.baseUrl}
                  onChange={(e) => change('baseUrl', e.target.value)}
                  placeholder="https://www.example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking URL Template
              </label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-600" />
                </div>
                <input
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  value={form.trackingUrl}
                  onChange={(e) => change('trackingUrl', e.target.value)}
                  placeholder="https://track.network.com/?aff_id={affiliate_id}&url={product_url}"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use placeholders like {'{affiliate_id}'}, {'{product_url}'}, {'{user_id}'}
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Advanced Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cookie Duration (Days)
              </label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  type="number"
                  min="1"
                  max="365"
                  value={form.cookieDuration}
                  onChange={(e) => change('cookieDuration', e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  days
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                How long affiliate cookies remain valid
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => change('isActive', true)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    form.isActive 
                      ? 'border-green-600 bg-green-50 text-green-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">Active</div>
                </button>
                <button
                  type="button"
                  onClick={() => change('isActive', false)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    !form.isActive 
                      ? 'border-red-600 bg-red-50 text-red-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">Inactive</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Fields marked with * are required
          </div>
          
          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={submitting}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initial ? 'Update Store' : 'Create Store'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}