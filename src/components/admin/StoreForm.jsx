'use client'

import { useState } from 'react'

const networks = [
  { value: 'manual', label: 'Manual' },
  { value: 'cuelinks', label: 'Cuelinks' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'flipkart', label: 'Flipkart' },
  { value: 'custom', label: 'Custom' },
]

export default function StoreForm({ initial, onSubmit, submitting }) {
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
  })

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return alert('Name is required')
    onSubmit({
      ...form,
      commissionRate: Number(form.commissionRate || 0),
      maxCommission: form.maxCommission === '' ? null : Number(form.maxCommission),
      cookieDuration: Number(form.cookieDuration || 30),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Store Name</label>
          <input className="input mt-1" value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="e.g., Amazon" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Affiliate Network</label>
          <select className="input mt-1" value={form.affiliateNetwork} onChange={(e) => change('affiliateNetwork', e.target.value)}>
            {networks.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Commission Rate</label>
          <input className="input mt-1" type="number" step="0.01" value={form.commissionRate} onChange={(e) => change('commissionRate', e.target.value)} placeholder="e.g., 8" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Commission Type</label>
          <select className="input mt-1" value={form.commissionType} onChange={(e) => change('commissionType', e.target.value)}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Max Commission (₹)</label>
          <input className="input mt-1" type="number" step="0.01" value={form.maxCommission} onChange={(e) => change('maxCommission', e.target.value)} placeholder="optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Tracking URL (template)</label>
          <input className="input mt-1" value={form.trackingUrl} onChange={(e) => change('trackingUrl', e.target.value)} placeholder="network tracking/deeplink template" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Base URL</label>
          <input className="input mt-1" value={form.baseUrl} onChange={(e) => change('baseUrl', e.target.value)} placeholder="https://example.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Cookie Duration (days)</label>
          <input className="input mt-1" type="number" value={form.cookieDuration} onChange={(e) => change('cookieDuration', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Active</label>
          <select className="input mt-1" value={form.isActive ? 'yes' : 'no'} onChange={(e) => change('isActive', e.target.value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Store'}
        </button>
      </div>
    </form>
  )
}