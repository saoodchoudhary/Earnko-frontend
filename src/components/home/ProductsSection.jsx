'use client';

import { Filter, Package, ShoppingBag, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) { try { return res.json(); } catch { return null; } }
  return { success: false };
}

function normalizeList(obj) {
  return (
    (obj?.data?.items && Array.isArray(obj.data.items) && obj.data.items) ||
    (obj?.data  && Array.isArray(obj.data)  && obj.data)  ||
    (obj?.items && Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj) && obj) || []
  );
}

function StarRating({ rating = 4.5 }) {
  const full = Math.floor(rating);
  return (
    <span className="product-stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3 h-3"
          fill={i < full ? '#f59e0b' : 'none'}
          stroke={i < full ? '#f59e0b' : '#d1d5db'} />
      ))}
      <span className="product-rating-text">({rating})</span>
    </span>
  );
}

function ProductCard({ product, base }) {
  const [copied, setCopied] = useState(false);

  const name  = product?.name  || product?.title || 'Product';
  const desc  = product?.description || product?.desc || '';
  const price = product?.price != null
    ? `₹${Number(product.price).toLocaleString('en-IN')}` : null;
  const comm  = product?.commissionRate ?? product?.commission ?? null;
  const store = product?.storeName || product?.store?.name || '';
  const cat   = product?.category || '';
  const img   = product?.imageUrl  || product?.image || product?.thumbnail || '';

  async function handleGenerate() {
    const link = `${base}/r/${product._id || product.id}`;
    try { await navigator.clipboard.writeText(link); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        {img ? (
          <img src={img} alt={name} className="product-card-image"
            loading="lazy" width={320} height={200} />
        ) : (
          <div className="product-card-image-placeholder">
            <Package className="w-10 h-10" style={{ color:'#bfdbfe' }} />
          </div>
        )}
        {store && <span className="product-badge-store">{store}</span>}
        {comm  != null && <span className="product-badge-commission">{comm}% CB</span>}
      </div>

      <div className="product-card-body">
        {cat   && <p className="product-category">{cat}</p>}
        <p className="product-name">{name}</p>
        {desc  && <p className="product-description">{desc}</p>}
        <div className="product-meta">
          {price
            ? <span className="product-price">{price}</span>
            : <span className="product-price-empty">Price on site</span>}
          <StarRating rating={product?.rating ?? 4.5} />
        </div>
        <button className="btn-generate" onClick={handleGenerate}>
          {copied
            ? <><span>✓</span> Link Copied!</>
            : <><Filter className="w-3.5 h-3.5" /> Get Affiliate Link</>}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="product-card">
      <div style={{
        height: 200,
        background: 'linear-gradient(90deg,#f1f5fb 25%,#e4eaf6 50%,#f1f5fb 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-load 1.6s ease-in-out infinite',
      }} />
      <div style={{ padding:'1rem 1.1rem' }}>
        {[100,72,148].map(w => (
          <div key={w} style={{
            height: 11, width: w, background: '#f1f5fb', borderRadius: 6, marginBottom: 10,
            animation: 'skeleton-load 1.6s ease-in-out infinite', backgroundSize: '200% 100%',
          }} />
        ))}
        <div style={{ height:36, background:'#eff6ff', borderRadius:12, marginTop:14 }} />
      </div>
    </div>
  );
}

export default function ProductsSection({ base, stores = [] }) {
  const [storeId,  setStoreId]  = useState('');
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!base) { setLoading(false); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ sort:'popular', limit:'12', ...(storeId && { storeId }) });
    fetch(`${base}/api/products?${params}`, { signal: ctrl.signal })
      .then(r  => safeJson(r))
      .then(js => setProducts(normalizeList(js)))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [base, storeId]);

  const list = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  return (
    <section className="home-section home-section-white">
      <div className="site-container">
        <div className="section-header">
          <span className="badge badge-blue">
            <Sparkles className="w-3 h-3" /> Flash Deals
          </span>
          <h2 className="section-title">
            Top Selling <span className="gradient-text">Products</span>
          </h2>
          <p className="section-subtitle">
            Curated deals — copy the affiliate link and earn on every purchase.
          </p>
        </div>

        {/* Store filter row */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:12, marginBottom:24, padding:14,
          borderRadius:'var(--radius-2xl)', background:'var(--color-surface)',
          border:'1px solid var(--color-border)', boxShadow:'var(--shadow-sm)',
        }}>
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'.85rem', color:'#0f172a' }}>
              Filter by Store
            </p>
            <p style={{ fontSize:'.72rem', color:'#94a3b8', marginTop:2 }}>
              Select a partner to narrow results
            </p>
          </div>
          <div style={{ position:'relative', width:220, flexShrink:0 }}>
            <Filter style={{
              position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
              width:14, height:14, color:'#2563eb', pointerEvents:'none',
            }} />
            <select
              style={{
                width:'100%', paddingLeft:36, paddingRight:32, paddingTop:10, paddingBottom:10,
                borderRadius:'var(--radius-lg)', outline:'none', appearance:'none',
                background:'#f8fafc', border:'1.5px solid #e2e8f0',
                fontFamily:'var(--font-body)', fontWeight:600, fontSize:'.82rem', color:'#0f172a',
                transition:'border-color 160ms',
              }}
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; }}
              onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; }}
            >
              <option value="">All Stores</option>
              {stores.map(s => (
                <option key={s._id || s.id || s.name} value={s._id || s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div style={{
              position:'absolute', right:12, top:'50%',
              width:6, height:6,
              borderRight:'2px solid #94a3b8', borderBottom:'2px solid #94a3b8',
              transform:'translateY(-65%) rotate(45deg)', pointerEvents:'none',
            }} />
          </div>
        </div>

        {/* Product list */}
        {loading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag className="empty-state-icon w-14 h-14" />
            <p className="empty-state-title">No Products Found</p>
            <p className="empty-state-text">
              Try selecting a different store or check back later for new deals.
            </p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {list.map(p => (
                <ProductCard key={p._id || p.id} product={p} base={base} />
              ))}
            </div>
            <div style={{ textAlign:'center', marginTop:'2.5rem' }}>
              <Link href="/products" className="btn-outline">View All Products</Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}