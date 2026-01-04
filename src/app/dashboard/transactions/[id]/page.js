'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, CreditCard, Calendar,
  Package, DollarSign, CheckCircle, Clock,
  AlertCircle, ShoppingBag, TrendingUp, Copy,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TransactionDetail() {
  const params = useParams();
  const id = params?.id;
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  // Normalize backend statuses (pending | confirmed | cancelled | under_review) to UI buckets
  const normalizeStatus = (s) => {
    const x = String(s || '').toLowerCase();
    if (['approved', 'confirmed', 'valid', 'paid', 'completed'].includes(x)) return 'approved';
    if (['pending', 'under_review', 'processing'].includes(x)) return 'pending';
    if (['rejected', 'cancelled', 'invalid', 'void', 'failed'].includes(x)) return 'rejected';
    return 'pending';
  };

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          if (typeof window !== 'undefined') window.location.href = '/login?next=/dashboard/transactions';
          return;
        }
        if (!base) {
          toast.error('Backend URL not configured');
          return;
        }
        // Use user transaction detail endpoint
        const res = await fetch(`${base}/api/conversions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await safeJson(res);
        if (res.ok) {
          const t = data?.data?.transaction || data?.data || null;
          if (t) {
            setTx({ ...t, __normStatus: normalizeStatus(t.status) });
          } else {
            setTx(null);
          }
        } else {
          toast.error(data?.message || 'Failed to load transaction');
          setTx(null);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading transaction');
      } finally { setLoading(false); }
    }
    load();
  }, [id, base]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) return toast.error('Nothing to copy');
    navigator.clipboard.writeText(String(text))
      .then(() => toast.success(`${label} copied!`))
      .catch(() => toast.error('Failed to copy'));
  };

  const copyDetailsJson = () => {
    if (!tx) return;
    const payload = {
      id: tx._id,
      orderId: tx.orderId,
      orderDate: tx.orderDate,
      productAmount: tx.productAmount,
      commissionRate: tx.commissionRate,
      commissionAmount: tx.commissionAmount,
      status: tx.status,
      store: tx.store?.name,
      clickId: tx.clickId,
      trackingData: tx.trackingData || null,
      affiliateData: tx.affiliateData || null,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      .then(() => toast.success('Details JSON copied'))
      .catch(() => toast.error('Copy failed'));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Transactions
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Transaction Details</h1>
              <p className="text-blue-100 mt-1">Transaction ID: {String(id || '').substring(0, 8)}...</p>
            </div>

            {tx && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(tx.__normStatus)}`}>
                {getStatusIcon(tx.__normStatus)}
                <span className="font-medium capitalize">{tx.__normStatus || 'Unknown'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        ) : !tx ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Transaction Not Found</h3>
            <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist or you don't have access.</p>
            <button
              onClick={() => router.push('/dashboard/transactions')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              View All Transactions
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Transaction Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Transaction Summary</h2>
                    <p className="text-gray-600 text-sm mt-1">Detailed information about this transaction</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Order ID</div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg flex-1">
                          {tx.orderId || 'N/A'}
                        </code>
                        <button
                          onClick={() => copyToClipboard(tx.orderId, 'Order ID')}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Copy Order ID"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Store</div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{tx.store?.name || 'Unknown Store'}</div>
                          <div className="text-sm text-gray-500">{tx.store?.category || 'General'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Order Date</div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div className="text-sm text-gray-900">
                          {formatDate(tx.orderDate || tx.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">Fraud Status</div>
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                        tx.fraudFlags?.isSuspicious
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {tx.fraudFlags?.isSuspicious ? 'Suspicious Activity' : 'Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Product Amount</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{Number(tx.productAmount || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Total value of the product purchase</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Commission Earned</div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{Number(tx.commissionAmount || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Your earnings from this transaction</div>
                  </div>
                </div>

                {tx.commissionRate != null && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Commission Rate</div>
                      <div className="text-sm font-bold text-gray-900">{Number(tx.commissionRate)}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tracking Data */}
              {tx.trackingData && Object.keys(tx.trackingData || {}).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tracking Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Raw Tracking Data</div>
                    <pre className="text-xs bg-white p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(tx.trackingData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Affiliate Data */}
              {tx.affiliateData && Object.keys(tx.affiliateData || {}).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Affiliate Data</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs bg-white p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(tx.affiliateData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {tx.trackingData?.product_url && (
                    <a
                      href={tx.trackingData.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Product
                    </a>
                  )}

                  <button
                    onClick={copyDetailsJson}
                    className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Details JSON
                  </button>

                  <button
                    onClick={() => toast.success('Issue reported. Our team will review this transaction.')}
                    className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Report Issue
                  </button>
                </div>
              </div>

              {/* Transaction Timeline */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Transaction Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Order Placed</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(tx.orderDate || tx.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Commission Approved</div>
                      <div className="text-xs text-gray-500">
                        {tx.__normStatus === 'approved'
                          ? formatDate(tx.updatedAt || tx.createdAt)
                          : 'Pending approval'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.__normStatus === 'approved'
                        ? 'bg-green-100'
                        : tx.__normStatus === 'rejected'
                        ? 'bg-red-100'
                        : 'bg-amber-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        tx.__normStatus === 'approved'
                          ? 'bg-green-600'
                          : tx.__normStatus === 'rejected'
                          ? 'bg-red-600'
                          : 'bg-amber-600'
                      }`}></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Current Status</div>
                      <div className="text-xs text-gray-500 capitalize">{tx.__normStatus || 'Processing'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="text-sm font-mono text-gray-900">{String(id || '').substring(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Click ID</span>
                    <span className="text-sm text-gray-900">{tx.clickId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notes</span>
                    <span className="text-sm text-gray-900">{tx.notes || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Currency</span>
                    <span className="text-sm text-gray-900">INR (₹)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}