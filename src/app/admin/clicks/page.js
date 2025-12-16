'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function AdminClicksPage() {
  const [items, setItems] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [storeId, setStoreId] = useState('')
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/clicks?${params.toString()}`, {
          signal: controller.signal, headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load clicks')
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
  }, [q, storeId, page, limit])

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Clicks</h1>
      </div>

      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Search slug / ip / user agent" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} />
          <select className="input" value={storeId} onChange={(e) => { setPage(1); setStoreId(e.target.value) }}>
            <option value="">All stores</option>
            {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="input" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => setPage(1)}>Apply</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Slug</Th>
              <Th>User</Th>
              <Th>Store</Th>
              <Th>IP</Th>
              <Th>User Agent</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No clicks</td></tr>
            ) : items.map(c => (
              <tr key={c._id} className="border-t">
                <Td>{c.customSlug || '-'}</Td>
                <Td>{c.user?.email || c.user?._id || '-'}</Td>
                <Td>{c.store?.name || '-'}</Td>
                <Td>{c.ipAddress || c.ip || '-'}</Td>
                <Td className="max-w-[320px] truncate" title={c.userAgent || ''}>{c.userAgent || '-'}</Td>
                <Td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages} • {total} clicks</div>
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