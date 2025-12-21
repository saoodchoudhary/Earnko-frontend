'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AffiliateToolsPage() {
  const [url, setUrl] = useState('');
  const [subidEnabled, setSubidEnabled] = useState(true);
  const [siteId, setSiteId] = useState(''); // optional Cuelinks site_id if you use multiple sites
  const [campaignId, setCampaignId] = useState(''); // optional campaign_id
  const [cuelinksUrl, setCuelinksUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const buildSubid = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const rand = Math.random().toString(16).slice(2, 10);
      return user?._id ? `u${user._id}-${rand}` : rand;
    } catch { return Math.random().toString(16).slice(2, 10); }
  };

  const generateCuelinks = async (e) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Enter a destination URL');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const body = {
        url,
        subid: subidEnabled ? buildSubid() : undefined,
        site_id: siteId || undefined,
        campaign_id: campaignId || undefined
      };
      const res = await fetch(`${base}/api/affiliate/cuelinks/deeplink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to generate Cuelinks link');
      setCuelinksUrl(data?.data?.link || null);
      if (data?.data?.link) {
        await navigator.clipboard.writeText(data.data.link);
        toast.success('Cuelinks link copied!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen space-y-4">
      <h1 className="text-xl font-semibold">Affiliate Tools</h1>

      <section className="bg-white border rounded p-4 space-y-3 max-w-2xl">
        <h2 className="font-medium">Generate Cuelinks Deeplink</h2>
        <form onSubmit={generateCuelinks} className="space-y-3">
          <label className="text-sm">
            <div className="text-gray-500 mb-1">Destination URL</div>
            <input className="input" placeholder="https://merchant.com/product/..." value={url} onChange={(e) => setUrl(e.target.value)} required />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm">
              <div className="text-gray-500 mb-1">Include subid</div>
              <select className="input" value={subidEnabled ? 'yes' : 'no'} onChange={(e) => setSubidEnabled(e.target.value === 'yes')}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label className="text-sm">
              <div className="text-gray-500 mb-1">site_id (optional)</div>
              <input className="input" placeholder="e.g., 12345" value={siteId} onChange={(e) => setSiteId(e.target.value)} />
            </label>
            <label className="text-sm">
              <div className="text-gray-500 mb-1">campaign_id (optional)</div>
              <input className="input" placeholder="e.g., 67890" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
            </label>
          </div>

          <button className="btn btn-primary" disabled={loading}>{loading ? 'Generating...' : 'Generate & Copy'}</button>
        </form>

        {cuelinksUrl && (
          <div className="mt-3">
            <div className="text-sm text-gray-500">Your Cuelinks short URL:</div>
            <div className="text-sm break-all">{cuelinksUrl}</div>
            <a className="btn btn-outline mt-2" href={cuelinksUrl} target="_blank" rel="noopener noreferrer">Open</a>
          </div>
        )}
      </section>
    </main>
  );
}