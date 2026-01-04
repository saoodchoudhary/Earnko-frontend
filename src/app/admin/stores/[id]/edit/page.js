'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import StoreForm from '../../../../../components/admin/StoreForm';
import { ArrowLeft, Store, Save, Loader2, AlertCircle, Shield, Tag } from 'lucide-react';

export default function AdminStoreEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    clicksTotal: 0,
    transactions: 0,
    commissionTotal: 0,
    pendingAmount: 0,
  });
  const envWarned = useRef(false);

  const getBase = () => process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { Authorization: token ? `Bearer ${token}` : '' };
  };
  const ensureEnvConfigured = () => {
    const base = getBase();
    if (!base && !envWarned.current) {
      envWarned.current = true;
      toast.error('Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL');
    }
  };
  const handleHttpError = async (res) => {
    let message = 'Request failed';
    try {
      const js = await res.clone().json();
      if (js?.message) message = js.message;
    } catch {}
    if (res.status === 401) message = 'Unauthorized. Please login again.';
    if (res.status === 403) message = 'Forbidden. Admin access required.';
    throw new Error(message);
  };

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    async function load() {
      try {
        ensureEnvConfigured();
        setLoading(true);
        const base = getBase();

        // Load store details
        const res = await fetch(`${base}/api/admin/stores/${id}`, {
          signal: controller.signal,
          headers: getHeaders(),
        });
        if (!res.ok) await handleHttpError(res);
        const data = await res.json();
        setItem(data?.data?.item || null);

        // Load store statistics
        const statsRes = await fetch(`${base}/api/admin/stores/${id}/stats`, {
          signal: controller.signal,
          headers: getHeaders(),
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const s = statsData?.data || {};
          setStats({
            clicksTotal: Number(s.clicksTotal || 0),
            transactions: Number(s.transactions || 0),
            commissionTotal: Number(s.commissionTotal || 0),
            pendingAmount: Number(s.pendingAmount || 0),
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error(err.message || 'Error loading store details');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const uploadLogo = async (storeId, file) => {
    const base = getBase();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const fd = new FormData();
    fd.append('logo', file);
    const res = await fetch(`${base}/api/admin/stores/${storeId}/logo`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: fd
    });
    if (!res.ok) await handleHttpError(res);
    return res.json();
  };

  const handleSubmit = async (payload, logoFile) => {
    try {
      ensureEnvConfigured();
      setSaving(true);
      const base = getBase();
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${base}/api/admin/stores/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) await handleHttpError(res);
      await res.json();

      // Upload logo if provided
      if (logoFile) {
        await uploadLogo(id, logoFile);
      }

      toast.success('Store updated successfully!');
      router.push('/admin/stores');
    } catch (err) {
      toast.error(err.message || 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/stores')}
            className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/stores')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-6 h-6 text-gray-700" />
                Edit Store
              </h1>
              <p className="text-gray-600 text-sm mt-1">Update store details and configuration</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Store Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-700" />
                Store Statistics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Clicks</span>
                  <span className="text-sm font-bold text-gray-900">{stats.clicksTotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transactions</span>
                  <span className="text-sm font-bold text-gray-900">{stats.transactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Commission Total</span>
                  <span className="text-sm font-bold text-gray-900">₹{stats.commissionTotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Amount</span>
                  <span className="text-sm font-bold text-gray-900">₹{stats.pendingAmount}</span>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-700" />
                Store Information
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Store ID</div>
                  <div className="text-sm font-mono text-gray-900 truncate">{item._id}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="text-sm text-gray-900">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm text-gray-900">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    item.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Store className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{item.name || 'Store'}</h2>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Update store details below. Changes save on submit.
                </div>
              </div>

              <div className="p-6">
                <StoreForm initial={item} onSubmit={handleSubmit} submitting={saving} />
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => router.push('/admin/stores')}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="store-form"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}