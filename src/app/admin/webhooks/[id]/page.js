'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft, ExternalLink, Clock, AlertCircle, 
  CheckCircle, XCircle, RefreshCw, Copy, 
  Shield, FileText, Code, Globe
} from 'lucide-react'

export default function AdminWebhookDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/webhooks/${id}`, {
          signal: controller.signal, 
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load webhook details')
        setItem(data?.data?.item || null)
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading webhook details')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [id])

  const handleRetry = async () => {
    if (!item) return
    try {
      setRetrying(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/webhooks/${id}/retry`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to retry webhook')
      
      toast.success('Webhook retry initiated')
      // Reload the item to show updated status
      setTimeout(() => {
        const controller = new AbortController()
        loadItem(controller)
        return () => controller.abort()
      }, 1000)
    } catch (err) {
      toast.error(err.message || 'Failed to retry webhook')
    } finally {
      setRetrying(false)
    }
  }

  const loadItem = async (controller) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/webhooks/${id}`, {
      signal: controller.signal, 
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
    const data = await res.json()
    if (res.ok) setItem(data?.data?.item || null)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Webhook Not Found</h2>
          <p className="text-gray-600 mb-4">The requested webhook event could not be found.</p>
          <button
            onClick={() => router.push('/admin/webhooks')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Webhooks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/admin/webhooks')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Webhooks
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Webhook Event Details</h1>
            <p className="text-gray-600 mt-1">Detailed view of webhook event #{id}</p>
          </div>
          
          {item.status?.toLowerCase() === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry Webhook'}
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Source</span>
            </div>
            <div className="text-sm font-bold text-gray-900">{item.source || 'N/A'}</div>
          </div>
          <div className="text-xs text-gray-500">Webhook source platform</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Event Type</span>
            </div>
            <div className="text-sm font-bold text-gray-900">{item.eventType || 'N/A'}</div>
          </div>
          <div className="text-xs text-gray-500">Type of webhook event</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status || 'Unknown'}
            </div>
          </div>
          <div className="text-xs text-gray-500">Processing status</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payload Section */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900">Payload Data</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(item.payload, null, 2))}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Raw payload received from source</p>
            </div>
            <div className="p-5 bg-gray-900">
              <pre className="text-sm text-gray-200 overflow-auto max-h-96">
                {JSON.stringify(item.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Headers Section */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900">Request Headers</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(item.headers, null, 2))}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">HTTP headers received with webhook</p>
            </div>
            <div className="p-5">
              <div className="space-y-3 max-h-80 overflow-auto">
                {Object.entries(item.headers || {}).map(([key, value], index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {key}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-600 break-all bg-gray-50 px-3 py-2 rounded">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  </div>
                ))}
                {(!item.headers || Object.keys(item.headers).length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No headers available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Metadata & Actions */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Timeline
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Received</div>
                  <div className="text-xs text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
              
              {item.processedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Processed</div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.processedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              
              {item.attempts > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Attempts</div>
                    <div className="text-xs text-gray-500">
                      {item.attempts || 1} attempt{item.attempts > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Info */}
          {item.transaction && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Linked Transaction</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transaction ID</span>
                  <span className="text-sm font-medium text-gray-900">{item.transaction}</span>
                </div>
                <a
                  href={`/admin/transactions/${item.transaction}`}
                  className="text-sm text-gray-800 hover:text-gray-900 flex items-center gap-1"
                >
                  View Transaction Details
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Error Details */}
          {item.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Error Details
              </h3>
              <div className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded">
                {item.error}
              </div>
              {item.errorDetails && (
                <div className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
                  {JSON.stringify(item.errorDetails, null, 2)}
                </div>
              )}
            </div>
          )}

          {/* System Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">System Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Webhook ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{id}</span>
                  <button
                    onClick={() => copyToClipboard(id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">IP Address</span>
                <span className="text-sm text-gray-900">{item.ipAddress || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Agent</span>
                <span className="text-sm text-gray-900 truncate max-w-[150px]">
                  {item.userAgent || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}