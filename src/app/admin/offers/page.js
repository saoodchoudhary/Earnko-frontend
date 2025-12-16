'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function AdminOffersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [storeId, setStoreId] = useState('')
  const [isActive, setIsActive] = useState('')
  const [stores, setStores] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  useEffect(() => {
    const controller = new AbortController()
    async function loadStores() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/stores`, { signal: controller.signal })
        const data = await res.json()
        if (res.ok) setStores(data?.data?.stores || [])
      } catch {}
    }
    loadStores()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (q) params.set('q', q)
        if (storeId) params.set('storeId', storeId)
        if (isActive !== '') params.set('isActive', isActive)
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/category-commissions?${params.toString()}`
        const res = await fetch(url, { signal: controller.signal, headers: { Authorization: token ? `Bearer ${token}` : '' } })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load offers')
        setItems(data?.data?.items || [])
        setTotal(data?.data?.total || 0)
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [q, storeId, isActive, page, limit])

  const removeItem = async (id) => {
    if (!confirm('Delete this offer?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/category-commissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to delete')
      toast.success('Deleted')
      setItems(prev => prev.filter(i => i._id !== id))
      setTotal(t => Math.max(0, t - 1))
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Offers</h1>
        <Link href="/admin/offers/create" className="btn btn-primary">Create Offer</Link>
      </div>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="input" placeholder="Search label or category..." value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
          <select className="input" value={storeId} onChange={(e) => { setPage(1); setStoreId(e.target.value) }}>
            <option value="">All stores</option>
            {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="input" value={isActive} onChange={(e) => { setPage(1); setIsActive(e.target.value) }}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select className="input" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => { setPage(1) }}>Apply</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Store</Th>
              <Th>Category</Th>
              <Th>Label</Th>
              <Th>Rate</Th>
              <Th>Type</Th>
              <Th>Max Cap</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={9} className="p-6 text-center text-gray-500">No offers</td></tr>
            ) : items.map(it => (
              <tr key={it._id} className="border-t">
                <Td>{it.store?.name || '-'}</Td>
                <Td>{it.categoryKey}</Td>
                <Td>{it.label || '-'}</Td>
                <Td>{Number(it.commissionRate || 0)}{it.commissionType === 'percentage' ? '%' : ''}</Td>
                <Td className="capitalize">{it.commissionType}</Td>
                <Td>{it.maxCap != null ? `₹${Number(it.maxCap).toFixed(0)}` : '-'}</Td>
                <Td>{it.isActive ? <span className="px-2 py-0.5 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Active</span> : <span className="px-2 py-0.5 text-xs rounded-full border bg-gray-50 text-gray-700 border-gray-200">Inactive</span>}</Td>
                <Td>{it.updatedAt ? new Date(it.updatedAt).toLocaleDateString() : '-'}</Td>
                <Td className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/offers/${it._id}/edit`} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Edit</Link>
                    <button className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50" onClick={() => removeItem(it._id)}>Delete</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages} • {total} offers</div>
        <div className="flex gap-2">
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
          <button className="btn btn-primary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
    </main>
  )
}

function Th({ children, className = '' }) { return <th className={`px-3 py-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-3 py-2 align-top ${className}`}>{children}</td> }