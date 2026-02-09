'use client';

import { useMemo, useState } from 'react';
import { Copy, ShoppingBag, ExternalLink, Check, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

function firstImage(p) {
  if (Array.isArray(p?.images) && p.images[0]) return p.images[0];
  if (typeof p?.image === 'string') return p.image;
  return '';
}

function getStoreNetwork(p) {
  const s = p?.store || {};
  return (s.affiliateNetwork || s.network || p?.affiliateNetwork || p?.network || 'cuelinks');
}

async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  const txt = await res.text().catch(() => '');
  return { success: false, message: txt };
}

export default function ProductCard({ product, base }) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const img = useMemo(() => firstImage(product), [product]);
  const storeName = product?.store?.name || 'Store';
  const title = product?.title || product?.name || 'Product';

  const priceText = useMemo(() => {
    const price = product?.price;
    if (price === null || price === undefined || price === '') return '';
    const n = Number(price);
    if (Number.isNaN(n)) return '';
    return `₹${n.toLocaleString()}`;
  }, [product]);

  const discountText = useMemo(() => {
    const d = product?.discount;
    if (!d) return '';
    return typeof d === 'number' ? `${d}% OFF` : String(d);
  }, [product]);

  const generateAffiliateLink = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Please login to generate affiliate links');

      const productId = product?._id || product?.id;
      if (!productId) return toast.error('Invalid product');

      setCopying(true);

      const network = getStoreNetwork(product);
      const endpoint =
        network === 'extrape'
          ? '/api/links/generate-extrape-product'
          : '/api/links/generate-cuelinks-product';

      const res = await fetch(`${base}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        if (res.status === 409 && data?.code === 'campaign_approval_required') {
          toast.error('Campaign approval required. Please apply in network panel.');
          return;
        }
        throw new Error(data?.message || 'Failed to generate link');
      }

      const link = data?.data?.link || data?.link;
      if (!link) throw new Error('No link returned');

      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Affiliate link copied!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error(err?.message || 'Failed to generate link');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition">
      <div className="relative h-52 bg-gray-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={title} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingBag className="w-14 h-14" />
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-800 max-w-[70%] truncate">
            {storeName}
          </div>
          {discountText ? (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow">
              {discountText}
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="p-4">
        <div className="font-extrabold text-gray-900 text-[15px] leading-snug line-clamp-2 min-h-[44px]">
          {title}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            {priceText ? (
              <>
                <div className="text-xl font-extrabold text-gray-900">{priceText}</div>
                <div className="text-xs text-gray-500">Starting price</div>
              </>
            ) : (
              <div className="text-sm font-semibold text-gray-600">Price on request</div>
            )}
          </div>

          <div className="text-right">
            <div className="text-sm font-extrabold text-emerald-600">High Commission</div>
            <div className="text-xs text-gray-500">Earn on every order</div>
          </div>
        </div>

        <button
          onClick={generateAffiliateLink}
          disabled={copying}
          className="mt-4 w-full rounded-xl px-4 py-3 font-extrabold text-white shadow-sm hover:shadow-md transition bg-gradient-to-r from-blue-600 to-cyan-500 active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              LINK COPIED
            </>
          ) : copying ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              COPY AFFILIATE LINK
              <ExternalLink className="w-4 h-4 opacity-80" />
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Instant approval
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Hot deals
          </span>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
}