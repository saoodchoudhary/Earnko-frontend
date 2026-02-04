'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Zap, RefreshCw, Copy, ExternalLink, Shield,
  Link as LinkIcon, ListChecks, X, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function AffiliateToolsPage() {
  const [isMulti, setIsMulti] = useState(false);
  const [singleUrl, setSingleUrl] = useState('');
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState(null);

  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  const parsedBulkUrls = useMemo(() => {
    const set = new Set();
    const out = [];
    (bulkText || '').split(/\r?\n/).forEach(line => {
      const u = line.trim();
      if (!u) return;
      let valid = false;
      try {
        const o = new URL(u);
        valid = !!o.protocol && !!o.hostname;
      } catch {}
      if (valid && !set.has(u)) {
        set.add(u);
        out.push(u);
      }
    });
    return out;
  }, [bulkText]);

  const copyText = async (text, msg = 'Copied') => {
    try { await navigator.clipboard.writeText(text); toast.success(msg); }
    catch { toast.error('Copy failed'); }
  };

  const toastApiError = (res, data) => {
    if (res?.status === 409 && data?.code === 'campaign_approval_required') {
      toast.error('Approval required');
      return;
    }
    toast.error(data?.message || `Failed (HTTP ${res?.status || 'ERR'})`);
  };

  const generateSingle = async () => {
    if (!singleUrl.trim()) { toast.error('Please paste a URL'); return; }
    if (!base) { toast.error('Backend URL not configured'); return; }

    setSingleLoading(true);
    setSingleResult(null);
    try {
      const token = getToken();
      const res = await fetch(`${base}/api/affiliate/link-from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ url: singleUrl.trim() })
      });
      const data = await safeJson(res);
      if (!res.ok) { toastApiError(res, data); return; }

      const link = data?.data?.link || null;
      const payload = {
        inputUrl: singleUrl.trim(),
        link,
        shareUrl: link,
        subid: data?.data?.subid || null,
        status: 'ok'
      };
      setSingleResult(payload);
      toast.success('Link generated');
    } catch {
      toast.error('Error generating link');
    } finally {
      setSingleLoading(false);
    }
  };

  const generateMulti = async () => {
    if (parsedBulkUrls.length === 0) { toast.error('Please paste 1 or more valid URLs'); return; }
    if (!base) { toast.error('Backend URL not configured'); return; }

    const MAX_BATCH = 25;
    const urls = parsedBulkUrls.slice(0, MAX_BATCH);

    setBulkLoading(true);
    setBulkResults([]);
    try {
      const token = getToken();
      const res = await fetch(`${base}/api/affiliate/link-from-url/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ urls })
      });
      const data = await safeJson(res);
      if (!res.ok) { toastApiError(res, data); return; }

      const list = Array.isArray(data?.data?.results) ? data.data.results : [];
      const mapped = list.map((r) => {
        if (r.success) {
          const link = r?.data?.link || null;
          return { inputUrl: r.inputUrl, status: 'ok', link, shareUrl: link, subid: r?.data?.subid || null, message: null };
        }
        let msg = r.message || 'Failed to generate';
        if (r.code === 'campaign_approval_required') msg = 'Approval required';
        return { inputUrl: r.inputUrl, status: 'error', link: null, shareUrl: null, subid: null, message: msg };
      });

      setBulkResults(mapped);
      const okCount = mapped.filter(r => r.status === 'ok').length;
      const errCount = mapped.filter(r => r.status === 'error').length;
      const anyApproval = list.some(r => !r.success && r.code === 'campaign_approval_required');
      if (anyApproval) toast.error('Some URLs require approval');
      toast.success(`Done: ${okCount} ok${errCount ? `, ${errCount} failed` : ''}`);
    } catch {
      toast.error('Error generating links');
    } finally {
      setBulkLoading(false);
    }
  };

  const clearAll = () => {
    setSingleUrl(''); setSingleResult(null); setBulkText(''); setBulkResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Affiliate Link Generator</h1>
                <p className="text-blue-100 mt-1">Universal generator (Cuelinks + VCommission + Extrape)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clearAll} className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          <div className="mt-6 inline-flex rounded-xl bg-white/15 p-1">
            <button className={`px-4 py-2 rounded-lg text-sm font-semibold ${!isMulti ? 'bg-white text-blue-700' : 'text-white/90'}`} onClick={() => setIsMulti(false)}>Single</button>
            <button className={`px-4 py-2 rounded-lg text-sm font-semibold ${isMulti ? 'bg-white text-blue-700' : 'text-white/90'} flex items-center gap-2`} onClick={() => setIsMulti(true)}>
              <ListChecks className="w-4 h-4" /> Multi
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {!isMulti && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-blue-600" />Generate Single Link</h2>
              <p className="text-gray-600 text-sm mt-1">Paste any product/store URL</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input placeholder="https://example.com/product/..." value={singleUrl} onChange={(e) => setSingleUrl(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
              <button onClick={generateSingle} disabled={singleLoading} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                {singleLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}{singleLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {singleResult && (
              <div className="mt-6 space-y-4">
                <ResultRow title="Input URL" value={singleResult.inputUrl} />
                <ResultRow title="Affiliate Link" value={singleResult.link} canOpen canCopy />
                <ResultRow title="Share URL (same as link)" value={singleResult.shareUrl} canOpen canCopy emphasis />
                <div className="flex items-center gap-2 text-xs text-gray-600"><Shield className="w-3.5 h-3.5 text-green-600" />Strict mode: if approval is missing, link will not be generated.</div>
              </div>
            )}
          </div>
        )}

        {isMulti && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ListChecks className="w-5 h-5 text-blue-600" />Generate Multiple Links</h2>
                <p className="text-gray-600 text-sm mt-1">Paste one URL per line (max 25 per batch)</p>
              </div>
              <div className="text-sm text-gray-600">{parsedBulkUrls.length} URL(s)</div>
            </div>
            <textarea rows={8} placeholder={`https://example.com/product-1\nhttps://example.com/product-2\n...`} value={bulkText} onChange={(e) => setBulkText(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono text-sm" />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button onClick={generateMulti} disabled={bulkLoading || parsedBulkUrls.length === 0} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                {bulkLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}{bulkLoading ? 'Generating...' : 'Generate Links'}
              </button>
              <button onClick={() => { setBulkText(''); setBulkResults([]); }} className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"><X className="w-4 h-4" />Clear</button>
              {bulkResults.length > 0 && bulkResults.some(r => r.status === 'ok') && (
                <button onClick={() => {
                  const all = bulkResults.filter(r => r.status === 'ok' && r.shareUrl).map(r => r.shareUrl).join('\n');
                  if (all) copyText(all, 'All links copied');
                }} className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Copy className="w-4 h-4" />Copy all Links
                </button>
              )}
            </div>
            <div className="mt-6">
              {bulkLoading && bulkResults.length === 0 && (
                <div className="grid grid-cols-1 gap-3">{[...Array(4)].map((_, i) => (<div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>))}</div>
              )}
              {bulkResults.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {bulkResults.map((r, i) => (
                    <div key={r.inputUrl + i} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] text-gray-500">Input</div>
                          <div className="text-sm text-gray-800 break-all line-clamp-2 sm:line-clamp-1">{r.inputUrl}</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${r.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.status === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}{r.status === 'ok' ? 'OK' : 'Error'}
                        </span>
                      </div>
                      {r.status === 'ok' ? (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <ResultRow title="Affiliate Link" value={r.link} canOpen canCopy compact />
                          <ResultRow title="Share URL (same as link)" value={r.shareUrl} canOpen canCopy compact emphasis />
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-red-600">{r.message || 'Failed to generate'}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-6 text-xs text-gray-500 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />Strict mode: if approval is missing, link will not be generated.
        </div>
      </div>

      <style jsx global>{`
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
      `}</style>
    </div>
  );
}

function ResultRow({ title, value, canCopy, canOpen, emphasis, compact = false }) {
  if (!value) return null;
  return (
    <div className={`rounded-lg ${emphasis ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'} p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-gray-500">{title}</div>
          <div className={`text-sm ${emphasis ? 'text-blue-900' : 'text-gray-800'} ${compact ? 'break-all line-clamp-2 sm:line-clamp-1' : 'break-all'}`}>{value}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canCopy && (
            <button onClick={async () => { try { await navigator.clipboard.writeText(value); toast.success('Copied'); } catch { toast.error('Copy failed'); } }}
              className="px-2 py-1.5 rounded-md hover:bg-white border border-gray-300 text-gray-700 text-xs flex items-center gap-1" title="Copy">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          )}
          {canOpen && (
            <a href={value} target="_blank" rel="noopener noreferrer" className="px-2 py-1.5 rounded-md hover:bg-white border border-gray-300 text-gray-700 text-xs flex items-center gap-1" title="Open">
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          )}
        </div>
      </div>
    </div>
  );
}