'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import ProductForm from '../../../../../components/admin/ProductForm'

export default function AdminProductEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products/${id}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load')
        setItem(data?.data?.item || null)
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error')
      } finally { setLoading(false) }
    }
    load()
    return () => controller.abort()
  }, [id])

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update')
      toast.success('Product updated')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-4"><div className="h-10 skeleton rounded" /></div>
  if (!item) return <div className="p-4">Not found</div>

  return (
    <main className="min-h-screen max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
      <div className="bg-white border rounded p-4">
        <ProductForm initial={item} onSubmit={handleSubmit} submitting={saving} />
      </div>
    </main>
  )
}