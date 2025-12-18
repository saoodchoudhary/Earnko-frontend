'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function OfferCard({ offer }) {
  const { token } = useAuth();
  const [genUrl, setGenUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const commissionText = () => {
    // Try to normalize display across possible shapes (CategoryCommission/Commission)
    const type = offer.commissionType || offer.type || 'percentage';
    const rate = offer.commissionRate ?? offer.rate ?? offer.percentage ?? offer.amount ?? 0;
    const cap = offer.maxCap != null ? ` • Cap ₹${Number(offer.maxCap).toFixed(0)}` : '';
    if (type === 'fixed') return `₹${Number(rate || 0)}${cap}`;
    return `${Number(rate || 0)}%${cap}`;
  };

  const titleText = () => offer.label || offer.title || offer.name || 'Offer';

  const generateLink = async () => {
    if (!token) return toast.error('Login required');
    setLoading(true);
    try {
      const res = await api.post('/api/links/generate', { offerId: offer._id });
      const url = res.data?.data?.link?.url;
      if (!url) throw new Error('No link generated');
      setGenUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success('Link generated & copied!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate link');
    } finally {
      setLoading(false);
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
        <button className="btn btn-outline" onClick={generateLink} disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {genUrl ? (
          <a className="btn btn-primary" href={genUrl} target="_blank" rel="noopener noreferrer">Open</a>
        ) : (
          <button className="btn btn-primary" onClick={generateLink}>Copy Link</button>
        )}
      </div>
    </div>
  );
}