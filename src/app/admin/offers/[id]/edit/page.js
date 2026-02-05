'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ArrowLeft, Tag, Clock, User, Store } from 'lucide-react'
import OfferForm from '../../../../../components/admin/OfferForm'

export default function AdminOfferEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { return await res.json() } catch { return null }
    }
    const txt = await res.text().catch(() => '')
    return { success: false, message: txt }
  }

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()

    async function loadData() {
      try {
        setLoading(true)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        if (!base) {
          toast.error('NEXT_PUBLIC_BACKEND_URL not set')
          return
        }

        const res = await fetch(`${base}/api/admin/category-commissions/${id}`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })

        const data = await safeJson(res)
        if (!res.ok) throw new Error(data?.message || 'Failed to load offer')
        setItem(data?.data?.item || null)

        // Optional audit logs: ignore failures
        try {
          const logsRes = await fetch(`${base}/api/admin/audit-logs?entityId=${id}&entityType=offer`, {
            signal: controller.signal,
            headers: { Authorization: token ? `Bearer ${token}` : '' }
          })
          if (logsRes.ok) {
            const logsData = await safeJson(logsRes)
            setAuditLogs(logsData?.data?.logs || [])
          }
        } catch {}
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading offer details')
      } finally {
        setLoading(false)
      }
    }

    loadData()
    return () => controller.abort()
  }, [id])

  const handleSubmit = async (payload) => {
    try {
      setSaving(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      if (!base) {
        toast.error('NEXT_PUBLIC_BACKEND_URL not set')
        return
      }

      const res = await fetch(`${base}/api/admin/category-commissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      })

      const data = await safeJson(res)
      if (!res.ok) throw new Error(data?.message || 'Failed to update offer')

      toast.success('Offer updated successfully')
      router.push('/admin/offers')
    } catch (err) {
      toast.error(err.message || 'Failed to update offer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) return

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      if (!base) {
        toast.error('NEXT_PUBLIC_BACKEND_URL not set')
        return
      }

      const res = await fetch(`${base}/api/admin/category-commissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })

      const data = await safeJson(res)
      if (!res.ok) throw new Error(data?.message || 'Failed to delete offer')

      toast.success('Offer deleted successfully')
      router.push('/admin/offers')
    } catch (err) {
      toast.error(err.message || 'Failed to delete offer')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Offer Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">The offer doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/offers')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Offers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <button
              onClick={() => router.push('/admin/offers')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Offers</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                Delete Offer
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Offer</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Update commission rates and offer configuration</p>
            </div>

            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OfferForm initial={item} onSubmit={handleSubmit} submitting={saving} />
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Offer Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Category Key</div>
                    <div className="text-sm font-medium text-gray-900 break-all">{item.categoryKey}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Store className="w-4 h-4 text-gray-600" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Store</div>
                    <div className="text-sm font-medium text-gray-900 break-all">{item.store?.name || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Last Updated</div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Created By</div>
                    <div className="text-sm font-medium text-gray-900 break-all">
                      {item.createdBy?.name || 'System'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              {auditLogs.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">No activity logged</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 break-words">{log.action}</div>
                        <div className="text-xs text-gray-500">
                          by {log.user?.name || 'System'} • {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/admin/offers')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">All Offers</div>
                    <div className="text-xs text-gray-500">Back to offers list</div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}