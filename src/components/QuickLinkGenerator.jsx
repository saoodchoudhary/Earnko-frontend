'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * QuickLinkGenerator
 * - Minimal generator: paste URL -> generates Cuelinks URL + Share URL.
 * - Shows both URLs and copies Share URL by default.
 * - Optional onGenerated callback to refresh parent list.
 */
export default function QuickLinkGenerator({ className = '', onGenerated }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [cuelinksUrl, setCuelinksUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [subid, setSubid] = useState('');

  const run = async () => {
    try {
      if (!url.trim()) return toast.error('Paste a URL');
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Please login');

      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      if (!base) {
        toast.error('Backend URL not configured (NEXT_PUBLIC_BACKEND_URL)');
        return;
      }

      const endpoint = `${base}/api/affiliate/cuelinks/deeplink`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url }) // minimal payload
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 && data?.code === 'campaign_approval_required') {
          toast.error('Campaign needs approval. Please apply in Cuelinks.');
        } else if (res.status === 404) {
          toast.error('Endpoint not found. Check backend URL and route.');
        } else {
          toast.error(data?.message || `Failed (${res.status})`);
        }
        return;
      }
      const gotLink = data?.data?.link;
      const gotShare = data?.data?.shareUrl;
      const gotSubid = data?.data?.subid;
      if (!gotLink || !gotShare) throw new Error('No link returned');

      setCuelinksUrl(gotLink);
      setShareUrl(gotShare);
      setSubid(gotSubid || '');

      await navigator.clipboard.writeText(gotShare);
      toast.success('Share URL copied!');
      setUrl('');

      if (typeof onGenerated === 'function') {
        try { onGenerated({ link: gotLink, shareUrl: gotShare, subid: gotSubid }); } catch {}
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, msg = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Paste any product/store URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn btn-primary" onClick={run} disabled={loading}>
          {loading ? '...' : 'Generate'}
        </button>
      </div>

      {(shareUrl || cuelinksUrl) && (
        <div className="border rounded p-3 bg-gray-50">
          {subid ? (
            <div className="text-xs text-gray-500 mb-2">SubID: <span className="font-mono">{subid}</span></div>
          ) : null}

          {shareUrl ? (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Share URL (tracks clicks)</div>
              <div className="text-xs break-all">{shareUrl}</div>
              <div className="mt-1 flex gap-2">
                <button className="btn btn-outline btn-xs" onClick={() => copy(shareUrl, 'Share URL copied!')}>Copy</button>
                <a className="btn btn-outline btn-xs" href={shareUrl} target="_blank" rel="noopener noreferrer">Open</a>
              </div>
            </div>
          ) : null}

          {cuelinksUrl ? (
            <div>
              <div className="text-xs text-gray-500">Cuelinks URL (direct)</div>
              <div className="text-xs break-all">{cuelinksUrl}</div>
              <div className="mt-1 flex gap-2">
                <button className="btn btn-outline btn-xs" onClick={() => copy(cuelinksUrl, 'Cuelinks URL copied!')}>Copy</button>
                <a className="btn btn-outline btn-xs" href={cuelinksUrl} target="_blank" rel="noopener noreferrer">Open</a>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}