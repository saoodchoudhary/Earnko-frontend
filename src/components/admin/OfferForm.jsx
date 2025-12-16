'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

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
        // ignore
      } finally {
        setLoadingStores(false)
      }
    }
    loadStores()
    return () => controller.abort()
  }, [])

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.store) return toast.error('Select a store or enter its ID')
    if (!form.categoryKey) return toast.error('Category key is required')
    if (form.commissionRate === '' || isNaN(Number(form.commissionRate))) return toast.error('Commission rate is required')

    onSubmit({
      ...form,
      commissionRate: Number(form.commissionRate),
      maxCap: form.maxCap === '' ? null : Number(form.maxCap),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs text-gray-500">Store</label>
        {loadingStores ? (
          <div className="h-10 skeleton rounded mt-1" />
        ) : (
          <select className="input mt-1" value={form.store} onChange={(e) => change('store', e.target.value)}>
            <option value="">Select store</option>
            {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        )}
        {!loadingStores && stores.length === 0 && (
          <input
            className="input mt-2"
            placeholder="Enter Store ID (no stores found)"
            value={form.store}
            onChange={(e) => change('store', e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Category Key</label>
          <input className="input mt-1" value={form.categoryKey} onChange={(e) => change('categoryKey', e.target.value)} placeholder="e.g., electronics" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Label</label>
          <input className="input mt-1" value={form.label} onChange={(e) => change('label', e.target.value)} placeholder="e.g., Electronics up to 8%" />
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
          <label className="text-xs text-gray-500">Max Cap (₹)</label>
          <input className="input mt-1" type="number" step="0.01" value={form.maxCap} onChange={(e) => change('maxCap', e.target.value)} placeholder="optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Active</label>
          <select className="input mt-1" value={form.isActive ? 'yes' : 'no'} onChange={(e) => change('isActive', e.target.value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Metadata (JSON)</label>
          <textarea
            className="input mt-1"
            rows={3}
            placeholder='{"example":true}'
            value={JSON.stringify(form.metadata || {}, null, 0)}
            onChange={(e) => {
              try {
                const val = e.target.value.trim() ? JSON.parse(e.target.value) : {}
                change('metadata', val)
              } catch {
                // ignore live parse errors (user-friendly)
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Offer'}
        </button>
      </div>
    </form>
  )
}