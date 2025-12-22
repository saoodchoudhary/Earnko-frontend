'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SimpleLinkGeneratorPage() {
  const [url, setUrl] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    setLink('');
    try {
      if (!url.trim()) return toast.error('Please paste a URL');
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Please login');

      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const res = await fetch(`${base}/api/affiliate/cuelinks/deeplink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data?.code === 'campaign_approval_required') {
          toast.error('Campaign needs approval. Please apply in Cuelinks.');
        } else {
          toast.error(data?.message || 'Failed to generate');
        }
        return;
      }
      const got = data?.data?.link;
      if (!got) throw new Error('No link returned');
      setLink(got);
      await navigator.clipboard.writeText(got);
      toast.success('Link copied!');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen space-y-6">
      <h1 className="text-2xl font-semibold">Generate Affiliate Link</h1>
      <section className="bg-white border rounded p-4 max-w-2xl">
        <form onSubmit={generate} className="space-y-3">
          <label className="text-sm">
            <div className="text-gray-500 mb-1">Paste any product/store URL</div>
            <input
              className="input"
              placeholder="https://merchant.com/product/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate & Copy'}
          </button>
        </form>

        {link && (
          <div className="mt-4">
            <div className="text-sm text-gray-500">Generated link:</div>
            <div className="text-sm break-all">{link}</div>
            <a className="btn btn-outline mt-2" href={link} target="_blank" rel="noopener noreferrer">
              Open
            </a>
          </div>
        )}
      </section>
    </main>
  );
}