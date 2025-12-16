'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AffiliateToolsPage() {
  const [url, setUrl] = useState('');
  const [storeId, setStoreId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/affiliate/link-from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ url, storeId: storeId || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to generate link');
      setResult(data?.data);
      toast.success('Link generated');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Affiliate Tools</h1>
      <form onSubmit={generate} className="bg-white border rounded-lg p-4 space-y-3 max-w-2xl">
        <div>
          <label className="text-xs text-gray-500">Product URL</label>
          <input className="input mt-1" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste product URL here" required />
        </div>
        <div>
          <label className="text-xs text-gray-500">Store (optional)</label>
          <input className="input mt-1" value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="Store ID (optional)" />
        </div>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Generating...' : 'Generate Link'}</button>
      </form>

      {result && (
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Your tracked link</div>
          <div className="text-sm break-all">{result?.generatedLink || result?.affiliateLink || result?.url}</div>
        </div>
      )}
    </div>
  );
}