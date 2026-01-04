'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Plus, Trash2, Link as LinkIcon, CheckCircle, AlertCircle,
  Search, Shield, Globe, Tag, DollarSign, Image as ImageIcon,
  Calendar, RefreshCw, ExternalLink
} from 'lucide-react'

export default function ProductForm({ initial, onSubmit, submitting }) {
  const [stores, setStores] = useState([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [campaigns, setCampaigns] = useState([])
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [validation, setValidation] = useState({
    ok: false,
    link: '',
    message: '',
    code: '',
    host: '',
    suggestions: []
  })

  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    images: Array.isArray(initial?.images) ? initial.images : [],
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
    cuelinksChannelId: initial?.cuelinksChannelId || '',
    cuelinksCampaignId: initial?.cuelinksCampaignId || '',
    cuelinksCountryId: initial?.cuelinksCountryId || '',
  })

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
        if (!ignore) {
          if (res.ok) {
            setStores(data?.data?.stores || [])
          } else {
            const msg = data?.message || `Failed to load stores (HTTP ${res.status})`
            if ((data?.message || '').startsWith('<!DOCTYPE') || (data?.message || '').includes('<html')) {
              toast.error('Stores API returned HTML. Check NEXT_PUBLIC_BACKEND_URL/backend.')
            } else {
              toast.error(msg)
            }
            setStores([])
          }
        }
      } catch (err) {
        if (err?.name !== 'AbortError' && !ignore) {
          toast.error('Error loading stores')
          console.error('Error loading stores:', err)
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

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false
    async function lookupCampaigns() {
      const url = form.deeplink.trim()
      if (!url) { if (!ignore) setCampaigns([]); return }
      let host = ''
      try { host = new URL(url).hostname.replace(/^www\./, '') } catch { if (!ignore) setCampaigns([]); return }
      try {
        setCampaignLoading(true)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const qs = new URLSearchParams({ search_term: host, per_page: '30' })
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        if (!base) {
          toast.error('NEXT_PUBLIC_BACKEND_URL not set')
          setCampaigns([])
          return
        }
        const res = await fetch(`${base}/api/admin/cuelinks/campaigns?${qs.toString()}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await safeJson(res)
        if (!ignore) {
          if (res.ok) {
            setCampaigns(data?.data?.campaigns || data?.data?.data || [])
          } else {
            const msg = data?.message || `Failed campaigns load (HTTP ${res.status})`
            if ((data?.message || '').startsWith('<!DOCTYPE') || (data?.message || '').includes('<html')) {
              toast.error('Campaigns API returned HTML. Check NEXT_PUBLIC_BACKEND_URL/backend.')
            } else {
              toast.error(msg)
            }
            setCampaigns([])
          }
        }
      } catch (err) {
        if (err?.name !== 'AbortError' && !ignore) {
          toast.error('Error loading campaigns')
          console.error('Campaign lookup error:', err)
        }
      } finally {
        if (!ignore) setCampaignLoading(false)
      }
    }
    lookupCampaigns()
    return () => {
      ignore = true
      controller.abort()
    }
  }, [form.deeplink])

  const change = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const changeOverride = (k, v) => setForm(prev => ({
    ...prev,
    commissionOverride: { ...prev.commissionOverride, [k]: v }
  }))

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

  const addImage = () => change('images', [...(Array.isArray(form.images) ? form.images : []), ''])
  const updateImage = (idx, val) => {
    const arr = Array.isArray(form.images) ? [...form.images] : []
    arr[idx] = val
    change('images', arr)
  }
  const removeImage = (idx) => change('images', (Array.isArray(form.images) ? form.images : []).filter((_, i) => i !== idx))

  const validateCuelinks = async () => {
    // Reset while keeping suggestions as an array to avoid undefined
    setValidation({
      ok: false,
      link: '',
      message: '',
      code: '',
      host: '',
      suggestions: []
    })
    try {
      if (!form.deeplink.trim()) return toast.error('Enter product URL to validate')
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      if (!base) {
        toast.error('NEXT_PUBLIC_BACKEND_URL not set')
        return
      }
      const res = await fetch(`${base}/api/admin/cuelinks/validate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          url: form.deeplink,
          channel_id: form.cuelinksChannelId || undefined
        })
      })
      const data = await safeJson(res)
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
        const msg = data?.message || `Validation failed (HTTP ${res.status})`
        if ((data?.message || '').startsWith('<!DOCTYPE') || (data?.message || '').includes('<html')) {
          toast.error('Received HTML from API. Check NEXT_PUBLIC_BACKEND_URL/backend.')
        } else {
          toast.error(msg)
        }
        // Ensure validation object keeps suggestions array to avoid undefined in UI
        setValidation(v => ({ ...v, suggestions: Array.isArray(v.suggestions) ? v.suggestions : [] }))
        return
      }
      // Success: include suggestions as an empty array to keep UI safe
      setValidation({
        ok: true,
        link: data?.data?.link || '',
        message: 'Valid Cuelinks URL generated',
        code: '',
        host: '',
        suggestions: []
      })
      toast.success('Cuelinks validation successful')
    } catch (err) {
      toast.error(err.message || 'Validation failed')
      // Keep suggestions defined
      setValidation(v => ({ ...v, suggestions: Array.isArray(v.suggestions) ? v.suggestions : [] }))
    }
  }

  return (
    <div className="">
      <form id="product-form" onSubmit={submit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Basic Information</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Enter product details and select store</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  value={form.title}
                  onChange={(e) => change('title', e.target.value)}
                  placeholder="Enter product title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store *
                </label>
                {loadingStores ? (
                  <div className="h-11 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                ) : (
                  <select
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                    value={form.store}
                    onChange={(e) => change('store', e.target.value)}
                    required
                  >
                    <option value="">Select a store</option>
                    {stores.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                rows={3}
                value={form.description}
                onChange={(e) => change('description', e.target.value)}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    className="w-full pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => change('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Key
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  value={form.categoryKey}
                  onChange={(e) => change('categoryKey', e.target.value)}
                  placeholder="e.g., electronics, fashion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) => change('isActive', e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product URL *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 break-all"
                  value={form.deeplink}
                  onChange={(e) => change('deeplink', e.target.value)}
                  placeholder="https://example.com/product/..."
                  required
                />
                {form.deeplink && (
                  <a
                    href={form.deeplink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Images Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Product Images</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Add product image URLs</p>
            </div>
          </div>

          <div className="space-y-3">
            {(Array.isArray(form.images) ? form.images : []).map((img, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                <input
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 break-all"
                  value={img}
                  onChange={(e) => updateImage(idx, e.target.value)}
                  placeholder="https://image-url.com/product.jpg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addImage}
              className="w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Image URL
            </button>
          </div>
        </div>

        {/* Commission Override Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Commission Override</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Optional custom commission settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                <input
                  className="w-full pr-8 sm:pr-10 pl-3 sm:pl-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  type="number"
                  step="0.01"
                  value={form.commissionOverride.rate}
                  onChange={(e) => changeOverride('rate', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Type
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                value={form.commissionOverride.type}
                onChange={(e) => changeOverride('type', e.target.value)}
              >
                <option value="">Select type</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Cap (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  className="w-full pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  type="number"
                  step="0.01"
                  value={form.commissionOverride.maxCap}
                  onChange={(e) => changeOverride('maxCap', e.target.value)}
                  placeholder="Maximum commission"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cuelinks Integration Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Cuelinks Integration</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Connect with Cuelinks for tracking</p>
              </div>
            </div>
            <button
              type="button"
              onClick={validateCuelinks}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 self-start sm:self-auto"
            >
              <Shield className="w-4 h-4" />
              Validate with Cuelinks
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel ID
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  value={form.cuelinksChannelId}
                  onChange={(e) => change('cuelinksChannelId', e.target.value)}
                  placeholder="e.g., 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign ID
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  value={form.cuelinksCampaignId}
                  onChange={(e) => change('cuelinksCampaignId', e.target.value)}
                  placeholder="Campaign reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country ID
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  value={form.cuelinksCountryId}
                  onChange={(e) => change('cuelinksCountryId', e.target.value)}
                  placeholder="Country code"
                />
              </div>
            </div>

            {/* Validation Result */}
            {validation.message && (
              <div className={`border rounded-lg p-4 ${
                validation.ok
                  ? 'border-green-200 bg-green-50'
                  : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={validation.ok ? 'text-green-600' : 'text-yellow-600'}>
                    {validation.ok ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${validation.ok ? 'text-green-800' : 'text-yellow-800'}`}>
                      {validation.message}
                    </div>
                    {validation.link && (
                      <div className="text-sm text-gray-700 mt-2 break-all">
                        {validation.link}
                      </div>
                    )}
                    {Array.isArray(validation.suggestions) && validation.suggestions.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-yellow-800 mb-2">
                          Available campaigns for approval:
                        </div>
                        <div className="space-y-1">
                          {validation.suggestions.map((s, i) => (
                            <div key={i} className="text-sm text-yellow-700 break-words">
                              • {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Campaign Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-gray-900">
                  Campaign Suggestions
                </div>
                {campaignLoading && (
                  <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
                )}
              </div>

              {campaignLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-11 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No matching campaigns found</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Enter a valid product URL to see campaigns</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-medium text-gray-700">
                            Campaign Name
                          </th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-medium text-gray-700">
                            Status
                          </th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-medium text-gray-700">
                            App Status
                          </th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-medium text-gray-700">
                            Country
                          </th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-medium text-gray-700">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {campaigns.map((c, i) => (
                          <tr key={c.id || i} className="hover:bg-white transition-colors">
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                              <div className="font-medium text-gray-900 break-words">
                                {c.name || c.campaign_name || '-'}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                c.status === 'approved_for_selected' ? 'bg-green-100 text-green-800' :
                                c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {c.status || '-'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                c.application_status === 'approved' ? 'bg-green-100 text-green-800' :
                                c.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                c.application_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {c.application_status || 'not_applied'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-gray-500" />
                                <span className="break-words">
                                  {Array.isArray(c.countries)
                                    ? c.countries.join(', ')
                                    : (c.country || '-')}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                              <button
                                type="button"
                                onClick={() => change('cuelinksCampaignId', String(c.id || c.campaign_id || ''))}
                                className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded hover:bg-gray-900 transition-colors"
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <Calendar className="w-3 h-3 mt-0.5" />
                  <span>Campaigns with status "approved_for_selected" or "approved_for_selected_and_hidden" require application. Application status can be "not_applied", "pending", "approved", or "rejected".</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 sm:px-8 py-2.5 sm:py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving Product...
              </>
            ) : (
              'Save Product'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}