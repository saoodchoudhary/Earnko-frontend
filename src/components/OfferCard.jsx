'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function OfferCard({ offer }) {
  const { token } = useAuth();
  const [genUrl, setGenUrl] = useState(null);
  const [cueUrl, setCueUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCue, setLoadingCue] = useState(false);

  const commissionText = () => {
    const type = offer.commissionType || offer.type || 'percentage';
    const rate = offer.commissionRate ?? offer.rate ?? offer.percentage ?? offer.amount ?? 0;
    const cap = offer.maxCap != null ? ` • Cap ₹${Number(offer.maxCap).toFixed(0)}` : '';
    if (type === 'fixed') return `₹${Number(rate || 0)}${cap}`;
    return `${Number(rate || 0)}%${cap}`;
  };

  const titleText = () => offer.label || offer.title || offer.name || 'Offer';

  const generateTracked = async () => {
    if (!token) return toast.error('Login required');
    setLoading(true);
    try {
      const res = await api.post('/api/links/generate', { offerId: offer._id });
      const url = res.data?.data?.link?.url;
      if (!url) throw new Error('No link generated');
      setGenUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success('Tracked link copied!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const buildSubid = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const rand = Math.random().toString(16).slice(2, 10);
      return user?._id ? `u${user._id}-${rand}` : rand;
    } catch { return Math.random().toString(16).slice(2, 10); }
  };

  const generateCuelinks = async () => {
    if (!token) return toast.error('Login required');
    setLoadingCue(true);
    try {
      const dest = offer.store?.baseUrl || '';
      if (!dest) throw new Error('Offer has no destination URL');
      const res = await api.post('/api/affiliate/cuelinks/deeplink', { url: dest, subid: buildSubid() });
      const short = res.data?.data?.link;
      if (!short) throw new Error('No Cuelinks short URL');
      setCueUrl(short);
      await navigator.clipboard.writeText(short);
      toast.success('Cuelinks link copied!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to generate Cuelinks link');
    } finally {
      setLoadingCue(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500">{offer.store?.name || 'Store'}</div>
            <h3 className="font-semibold truncate">{titleText()}</h3>
            {offer.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{offer.description}</p>
            )}
            <div className="mt-2 text-sm">
              <span className="font-medium">Commission:</span> {commissionText()}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button className="btn btn-outline" onClick={generateTracked} disabled={loading}>
          {loading ? 'Generating...' : 'Tracked Link'}
        </button>
        {genUrl ? (
          <a className="btn btn-primary" href={genUrl} target="_blank" rel="noopener noreferrer">Open</a>
        ) : (
          <button className="btn btn-primary" onClick={generateTracked}>Copy Tracked</button>
        )}
      </div>

      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button className="btn btn-outline" onClick={generateCuelinks} disabled={loadingCue}>
          {loadingCue ? 'Generating...' : 'Cuelinks Link'}
        </button>
        {cueUrl ? (
          <a className="btn btn-primary" href={cueUrl} target="_blank" rel="noopener noreferrer">Open</a>
        ) : (
          <button className="btn btn-primary" onClick={generateCuelinks}>Copy Cuelinks</button>
        )}
      </div>
    </div>
  );
}