'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft, CreditCard, User, Calendar, DollarSign, 
  CheckCircle, Clock, XCircle, AlertCircle, ExternalLink,
  TrendingUp, Users, Link as LinkIcon, Store, RefreshCw,
  FileText, Shield, Download, Copy, Check
} from 'lucide-react'

export default function AdminPayoutDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [payout, setPayout] = useState(null)
  const [perf, setPerf] = useState([])
  const [referrals, setReferrals] = useState([])
  const [refEarn, setRefEarn] = useState(0)
  const [status, setStatus] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''

  const load = async (signal) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/payouts/${id}`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to load payout')
      setPayout(js?.data?.payout || null)
      setPerf(js?.data?.linkPerformance || [])
      setReferrals(js?.data?.referrals || [])
      setRefEarn(Number(js?.data?.referralEarnings || 0))
      setStatus(js?.data?.payout?.status || 'pending')
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Error loading payout details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [id])

  const updateStatus = async () => {
    if (!status || status === payout?.status) {
      toast.error('Please select a different status')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/payouts/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ 
          status, 
          transactionReference: reference, 
          adminNotes: notes 
        })
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to update payout status')
      toast.success('Payout status updated successfully')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processed': return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-amber-500" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'processed': return 'bg-blue-100 text-blue-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const exportData = () => {
    const data = {
      payout,
      linkPerformance: perf,
      referrals,
      referralEarnings: refEarn,
      exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `payout-${id}-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Data exported successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin/payouts" 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payout Details</h1>
                <p className="text-gray-600 text-sm mt-1">Manage and review payout information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => load()}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        ) : !payout ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Payout Not Found</h3>
            <p className="text-gray-600">The requested payout could not be loaded</p>
            <Link
              href="/admin/payouts"
              className="inline-block mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Back to Payouts
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Payout Details & Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payout Information Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    Payout Information
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payout.status)}`}>
                    {payout.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Affiliate</div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{payout.affiliate?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{payout.affiliate?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Amount</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{Number(payout.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Payment Method</div>
                    <div className="font-medium text-gray-900">{payout.method?.toUpperCase() || 'N/A'}</div>
                    {payout.methodDetails && (
                      <div className="text-sm text-gray-600 mt-1">
                        {payout.method === 'bank' ? 
                          `${payout.methodDetails?.bankName || ''} • ${payout.methodDetails?.accountNumber?.slice(-4) || ''}` :
                          payout.methodDetails?.upiId || ''
                        }
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Created Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div className="font-medium text-gray-900">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {payout.methodDetails && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(payout.methodDetails, null, 2)}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(payout.methodDetails, null, 2))}
                        className="mt-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy details'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Link Performance Card */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    Top Earning Links
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Performance of affiliate links for this payout</p>
                </div>

                {perf.length === 0 ? (
                  <div className="p-6 text-center">
                    <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No link performance data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Clicks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Conversions</th>
                          <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {perf.map((row, index) => (
                          <tr key={row.slug || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-900">{row.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-900">{row.storeName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">{row.clicks}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-green-600 font-medium">{row.conversions}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-bold text-gray-900">₹{Number(row.commission || 0).toLocaleString()}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Actions & Referrals */}
            <div className="space-y-6">
              {/* Update Status Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  Update Status
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="processed">Processed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Reference
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Bank/UPI transaction ID"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes or remarks..."
                      rows="3"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
                    />
                  </div>

                  <button
                    onClick={updateStatus}
                    disabled={saving || status === payout.status}
                    className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Referrals Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    Referrals
                  </h3>
                  <div className="text-sm font-bold text-green-600">
                    ₹{Number(refEarn || 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  Earnings from referred users
                </div>

                {referrals.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No referrals found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {referrals.map((user) => (
                      <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.name || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email || 'No email'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/admin/users/${payout.affiliate?._id}`)}
                    className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Affiliate Profile
                  </button>
                  
                  <button className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Generate Invoice
                  </button>
                  
                  <button className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Transaction History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}