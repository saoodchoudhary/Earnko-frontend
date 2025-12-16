'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AdminWebhookDetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/webhooks/${id}`, {
          signal: controller.signal, headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load')
        setItem(data?.data?.item || null)
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [id])

  return (
    <main className="min-h-screen space-y-4">
      <h1 className="text-2xl font-semibold">Webhook Event</h1>
      {loading ? (
        <div className="h-20 skeleton rounded" />
      ) : !item ? (
        <div>Not found</div>
      ) : (
        <>
          <div className="bg-white border rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Source:</span> {item.source}</div>
              <div><span className="text-gray-500">Event:</span> {item.eventType || '-'}</div>
              <div><span className="text-gray-500">Status:</span> {item.status}</div>
              <div><span className="text-gray-500">Transaction:</span> {item.transaction || '-'}</div>
              <div><span className="text-gray-500">Created:</span> {new Date(item.createdAt).toLocaleString()}</div>
              <div><span className="text-gray-500">Processed:</span> {item.processedAt ? new Date(item.processedAt).toLocaleString() : '-'}</div>
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Headers</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(item.headers, null, 2)}</pre>
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Payload</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(item.payload, null, 2)}</pre>
          </div>

          {item.error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded p-3 text-sm">
              Error: {item.error}
            </div>
          )}
        </>
      )}
    </main>
  )
}