'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function OfferCard({ offer }) {
  const { token } = useAuth();
  const [genUrl, setGenUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    if (!token) return toast.error('Login required');
    setLoading(true);
    try {
      const res = await api.post('/api/links/generate', { offerId: offer._id });
      setGenUrl(res.data.data.link.url);
      toast.success('Link generated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="p-4">
        <h3 className="font-semibold">{offer.title || offer.name || 'Offer'}</h3>
        <p className="text-sm text-muted">{offer.description || 'Earn cashback on this offer.'}</p>
        <div className="mt-2 text-sm">
          <span className="font-medium">Commission:</span> {offer.rate || offer.percentage || offer.amount || 'Varies'}
        </div>
        {offer.store && (
          <div className="mt-1 text-sm">
            <span className="font-medium">Store:</span> {offer.store.name}
          </div>
        )}
      </div>
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button className="btn btn-outline" onClick={generateLink} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Link'}
        </button>
        {genUrl ? (
          <a className="btn btn-primary" href={genUrl} target="_blank">Open</a>
        ) : (
          <button className="btn btn-primary" onClick={generateLink}>Get Link</button>
        )}
      </div>
    </div>
  );
}