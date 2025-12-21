'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ProductForm({ initial, onSubmit, submitting }) {
  const [stores, setStores] = useState([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [campaigns, setCampaigns] = useState([])
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [validation, setValidation] = useState({ ok: false, link: '', message: '', code: '', host: '', suggestions: [] })

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
    },
    // Cuelinks integration fields
    cuelinksChannelId: initial?.cuelinksChannelId || '',
    cuelinksCampaignId: initial?.cuelinksCampaignId || '',
    cuelinksCountryId: initial?.cuelinksCountryId || '',
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

  useEffect(() => {
    // Auto-fetch campaigns by deeplink host when deeplink changes
    const controller = new AbortController()
    async function lookupCampaigns() {
      const url = form.deeplink.trim()
      if (!url) { setCampaigns([]); return }
      let host = ''
      try { host = new URL(url).hostname.replace(/^www\./, '') } catch { setCampaigns([]); return }
      try {
        setCampaignLoading(true)
        const token = localStorage.getItem('token')
        const qs = new URLSearchParams({ search_term: host, per_page: '30' })
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/cuelinks/campaigns?${qs.toString()}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (res.ok) setCampaigns(data?.data?.campaigns || data?.data?.data || [])
      } catch {} finally { setCampaignLoading(false) }
    }
    lookupCampaigns()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.deeplink])

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const changeOverride = (k, v) => setForm(prev => ({ ...prev, commissionOverride: { ...prev.commissionOverride, [k]: v } }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title required')
    if (!form.deeplink.trim()) return toast.error('Product URL required')
    if (!form.store) return toast.error('Store required')
    onSubmit({
      ...form,
      price: form.price === '' ? 0 : Number(form.price),
      images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
      commissionOverride: {
        rate: form.commissionOverride.rate === '' ? null : Number(form.commissionOverride.rate),
        type: form.commissionOverride.type || null,
        maxCap: form.commissionOverride.maxCap === '' ? null : Number(form.commissionOverride.maxCap)
      },
      cuelinksChannelId: form.cuelinksChannelId || '',
      cuelinksCampaignId: form.cuelinksCampaignId || '',
      cuelinksCountryId: form.cuelinksCountryId || '',
    })
  }

  const addImage = () => change('images', [...form.images, ''])
  const updateImage = (idx, val) => { const arr = [...form.images]; arr[idx] = val; change('images', arr) }
  const removeImage = (idx) => change('images', form.images.filter((_, i) => i !== idx))

  const validateCuelinks = async () => {
    setValidation({ ok: false, link: '', message: '', code: '', host: '', suggestions: [] })
    try {
      if (!form.deeplink.trim()) return toast.error('Enter product URL to validate')
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/cuelinks/validate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ url: form.deeplink, channel_id: form.cuelinksChannelId || undefined })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409 && data?.code === 'campaign_approval_required') {
          setValidation({
            ok: false,
            link: '',
            message: data?.message || 'Campaign needs approval',
            code: data?.code,
            host: data?.data?.host || '',
            suggestions: Array.isArray(data?.data?.suggestions) ? data.data.suggestions : []
          })
          toast.error('Campaign needs approval. See suggestions below.')
          return
        }
        throw new Error(data?.message || 'Validation failed')
      }
      setValidation({ ok: true, link: data?.data?.link || '', message: 'Valid' })
      toast.success('Cuelinks validated')
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Basic */}
      <section className="bg-white border rounded p-4 space-y-3">
        <h3 className="font-semibold">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">
            Title
            <input className="input mt-1" value={form.title} onChange={(e) => change('title', e.target.value)} />
          </label>
          <label className="text-xs text-gray-500">
            Store
            {loadingStores ? (
              <div className="h-10 skeleton rounded mt-1" />
            ) : (
              <select className="input mt-1" value={form.store} onChange={(e) => change('store', e.target.value)}>
                <option value="">Select store</option>
                {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            )}
          </label>
        </div>
        <label className="text-xs text-gray-500">
          Description
          <textarea className="input mt-1" rows={3} value={form.description} onChange={(e) => change('description', e.target.value)} />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-gray-500">
            Price (₹)
            <input className="input mt-1" type="number" step="0.01" value={form.price} onChange={(e) => change('price', e.target.value)} />
          </label>
          <label className="text-xs text-gray-500">
            Category Key
            <input className="input mt-1" value={form.categoryKey} onChange={(e) => change('categoryKey', e.target.value)} placeholder="optional" />
          </label>
          <label className="text-xs text-gray-500">
            Active
            <select className="input mt-1" value={form.isActive ? 'yes' : 'no'} onChange={(e) => change('isActive', e.target.value === 'yes')}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
        <label className="text-xs text-gray-500">
          Product URL (merchant page)
          <input className="input mt-1" value={form.deeplink} onChange={(e) => change('deeplink', e.target.value)} placeholder="https://merchant.com/product/..." />
        </label>
      </section>

      {/* Media */}
      <section className="bg-white border rounded p-4 space-y-3">
        <h3 className="font-semibold">Media</h3>
        <div className="space-y-2">
          {form.images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input className="input flex-1" value={img} onChange={(e) => updateImage(idx, e.target.value)} placeholder="https://image-url..." />
              <button type="button" className="btn btn-outline" onClick={() => removeImage(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={addImage}>+ Add Image</button>
        </div>
      </section>

      {/* Commission Override */}
      <section className="bg-white border rounded p-4 space-y-3">
        <h3 className="font-semibold">Commission Override (optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-gray-500">
            Rate
            <input className="input mt-1" type="number" step="0.01" value={form.commissionOverride.rate} onChange={(e) => changeOverride('rate', e.target.value)} placeholder="e.g., 8" />
          </label>
          <label className="text-xs text-gray-500">
            Type
            <select className="input mt-1" value={form.commissionOverride.type} onChange={(e) => changeOverride('type', e.target.value)}>
              <option value="">None</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Max Cap (₹)
            <input className="input mt-1" type="number" step="0.01" value={form.commissionOverride.maxCap} onChange={(e) => changeOverride('maxCap', e.target.value)} placeholder="optional" />
          </label>
        </div>
      </section>

      {/* Cuelinks Integration */}
      <section className="bg-white border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Cuelinks Integration</h3>
          <button type="button" className="btn btn-outline" onClick={validateCuelinks}>Validate with Cuelinks</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-gray-500">
            channel_id (optional)
            <input className="input mt-1" value={form.cuelinksChannelId} onChange={(e) => change('cuelinksChannelId', e.target.value)} placeholder="e.g., 101" />
          </label>
          <label className="text-xs text-gray-500">
            campaign_id (optional)
            <input className="input mt-1" value={form.cuelinksCampaignId} onChange={(e) => change('cuelinksCampaignId', e.target.value)} placeholder="for reference" />
          </label>
          <label className="text-xs text-gray-500">
            country_id (optional)
            <input className="input mt-1" value={form.cuelinksCountryId} onChange={(e) => change('cuelinksCountryId', e.target.value)} placeholder="defaults to account country" />
          </label>
        </div>

        {/* Validation result */}
        {validation.message && (
          <div className={`border rounded p-3 ${validation.ok ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="text-sm">{validation.message}</div>
            {validation.link && <div className="text-xs break-all mt-1">{validation.link}</div>}
          </div>
        )}

        {/* Campaign suggestions */}
        <div>
          <div className="text-sm font-medium mb-2">Campaign suggestions</div>
          {campaignLoading ? (
            <div className="h-10 skeleton rounded" />
          ) : campaigns.length === 0 ? (
            <div className="text-sm text-gray-500">No matching campaigns found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>App Status</Th>
                    <Th>Country</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={c.id || i} className="border-t">
                      <Td>{c.name || c.campaign_name || '-'}</Td>
                      <Td>{c.status || '-'}</Td>
                      <Td>{c.application_status || '-'}</Td>
                      <Td>{Array.isArray(c.countries) ? c.countries.join(', ') : (c.country || '-')}</Td>
                      <Td>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                          onClick={() => change('cuelinksCampaignId', String(c.id || c.campaign_id || ''))}
                        >
                          Select
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Tip: Status approved_for_selected / approved_for_selected_and_hidden require application. Application status shows not_applied / pending / approved / rejected.
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
      </div>
    </form>
  )
}

function Th({ children, className = '' }) { return <th className={`px-3 py-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-3 py-2 align-top ${className}`}>{children}</td> }