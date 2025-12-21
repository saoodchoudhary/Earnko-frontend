'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import ProductForm from '../../../../components/admin/ProductForm'

export default function AdminProductCreatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to create')
      toast.success('Product created')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally { setSaving(false) }
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Product</h1>
      <div className="bg-white border rounded p-4">
        <ProductForm onSubmit={handleSubmit} submitting={saving} />
      </div>
    </main>
  )
}