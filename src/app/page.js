'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [stores, setStores] = useState([])
  const [storeId, setStoreId] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) {
          if (mounted) { setIsLoggedIn(false); setChecking(false) }
          return
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          localStorage.removeItem('token')
          if (mounted) { setIsLoggedIn(false); setChecking(false) }
          return
        }
        if (mounted) { setIsLoggedIn(true); setChecking(false) }
      } catch {
        localStorage.removeItem('token')
        if (mounted) { setIsLoggedIn(false); setChecking(false) }
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const sRes = await fetch(`${base}/api/stores`, { signal: controller.signal })
        const sData = await sRes.json()
        if (sRes.ok) setStores(sData?.data?.stores || [])

        const params = new URLSearchParams()
        if (storeId) params.set('storeId', storeId)
        const pRes = await fetch(`${base}/api/products?${params.toString()}`, { signal: controller.signal })
        const pData = await pRes.json()
        if (pRes.ok) setProducts(pData?.data?.items || [])
      } catch {} finally { setLoading(false) }
    }
    load()
    return () => controller.abort()
  }, [storeId])

  const generate = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to generate link')
        return
      }
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${base}/api/links/generate-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to generate link')
      const url = data?.data?.link?.url
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    } catch (err) {
      toast.error(err.message || 'Failed to generate')
    }
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>
  }

  return (
    <main className="min-h-screen">
      <section className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Discover Products</h1>
          <p className="text-gray-300 mt-1">Share links and earn commission when purchases are approved.</p>
          {!isLoggedIn && (
            <div className="mt-4">
              <a href="/login" className="btn btn-primary">Login</a>
              <a href="/register" className="btn btn-outline ml-2">Register</a>
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">All stores</option>
            {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="bg-white border rounded-lg">
          {loading ? (
            <div className="p-6">
              <div className="h-10 skeleton rounded mb-2" />
              <div className="h-10 skeleton rounded mb-2" />
              <div className="h-10 skeleton rounded" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-gray-600">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {products.map(p => (
                <div key={p._id} className="border rounded-lg p-3 flex flex-col">
                  {Array.isArray(p.images) && p.images[0] && (
                    <img src={p.images[0]} alt={p.title} className="w-full h-40 object-cover rounded mb-2" />
                  )}
                  <div className="text-xs text-gray-500">{p.store?.name || '-'}</div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{p.description}</div>
                  <div className="mt-2 font-semibold">₹{Number(p.price || 0).toFixed(0)}</div>
                  <div className="mt-auto pt-3">
                    {isLoggedIn ? (
                      <button className="btn btn-primary w-full" onClick={() => generate(p._id)}>Generate & Copy Link</button>
                    ) : (
                      <a className="btn btn-outline w-full" href="/login">Login to Share</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}