'use client'

import { useEffect, useState } from 'react'

export default function ProductForm({ initial, onSubmit, submitting }) {
  const [stores, setStores] = useState([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    images: initial?.images || [],
    price: initial?.price ?? '',
    store: initial?.store?._id || initial?.store || '',
    deeplink: initial?.deeplink || '',
    categoryKey: initial?.categoryKey || '',
    isActive: initial?.isActive ?? true,
    commissionOverride: {
      rate: initial?.commissionOverride?.rate ?? '',
      type: initial?.commissionOverride?.type || '',
      maxCap: initial?.commissionOverride?.maxCap ?? ''
    }
  })

  useEffect(() => {
    const controller = new AbortController()
    async function loadStores() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/stores`, { signal: controller.signal })
        const data = await res.json()
        if (res.ok) setStores(data?.data?.stores || [])
      } finally {
        setLoadingStores(false)
      }
    }
    loadStores()
    return () => controller.abort()
  }, [])

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const changeOverride = (k, v) => setForm(prev => ({ ...prev, commissionOverride: { ...prev.commissionOverride, [k]: v } }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return alert('Title required')
    if (!form.deeplink.trim()) return alert('Product URL required')
    if (!form.store) return alert('Store required')
    onSubmit({
      ...form,
      price: form.price === '' ? 0 : Number(form.price),
      images: Array.isArray(form.images) ? form.images : [],
      commissionOverride: {
        rate: form.commissionOverride.rate === '' ? null : Number(form.commissionOverride.rate),
        type: form.commissionOverride.type || null,
        maxCap: form.commissionOverride.maxCap === '' ? null : Number(form.commissionOverride.maxCap)
      }
    })
  }

  const addImage = () => change('images', [...form.images, ''])
  const updateImage = (idx, val) => {
    const arr = [...form.images]; arr[idx] = val; change('images', arr)
  }
  const removeImage = (idx) => change('images', form.images.filter((_, i) => i !== idx))

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Title</label>
          <input className="input mt-1" value={form.title} onChange={(e) => change('title', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Store</label>
          {loadingStores ? <div className="h-10 skeleton rounded mt-1" /> : (
            <select className="input mt-1" value={form.store} onChange={(e) => change('store', e.target.value)}>
              <option value="">Select store</option>
              {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">Description</label>
        <textarea className="input mt-1" rows={3} value={form.description} onChange={(e) => change('description', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Price (₹)</label>
          <input className="input mt-1" type="number" step="0.01" value={form.price} onChange={(e) => change('price', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Category Key</label>
          <input className="input mt-1" value={form.categoryKey} onChange={(e) => change('categoryKey', e.target.value)} placeholder="optional" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Active</label>
          <select className="input mt-1" value={form.isActive ? 'yes' : 'no'} onChange={(e) => change('isActive', e.target.value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">Product URL (deeplink)</label>
        <input className="input mt-1" value={form.deeplink} onChange={(e) => change('deeplink', e.target.value)} placeholder="https://store.com/product/..." />
      </div>

      <div>
        <label className="text-xs text-gray-500">Images</label>
        <div className="space-y-2 mt-1">
          {form.images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input className="input flex-1" value={img} onChange={(e) => updateImage(idx, e.target.value)} placeholder="https://..." />
              <button type="button" className="btn btn-outline" onClick={() => removeImage(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={addImage}>+ Add Image</button>
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="text-sm font-medium mb-2">Commission Override (optional)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">Rate</label>
            <input className="input mt-1" type="number" step="0.01" value={form.commissionOverride.rate} onChange={(e) => changeOverride('rate', e.target.value)} placeholder="e.g., 8" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Type</label>
            <select className="input mt-1" value={form.commissionOverride.type} onChange={(e) => changeOverride('type', e.target.value)}>
              <option value="">None</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Max Cap (₹)</label>
            <input className="input mt-1" type="number" step="0.01" value={form.commissionOverride.maxCap} onChange={(e) => changeOverride('maxCap', e.target.value)} placeholder="optional" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
      </div>
    </form>
  )
}