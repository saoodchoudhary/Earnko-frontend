'use client';

import { ShoppingBag, Zap, Star } from 'lucide-react';

export default function ProductCard({ product, onGenerate }) {
  const id = product._id || product.id;
  const name = product.title || product.name || 'Product Name';
  const img = product.images?.[0];
  const store = product.store?.name || 'Store';
  const category = product.category || 'Product';
  const price = product.price;
  const desc = product.description || 'Premium product with high conversion rate.';

  return (
    <article className="ek-product-card group">
      {/* ── Image ── */}
      <div className="ek-product-img-wrap">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={name}
            className="ek-product-img"
            loading="lazy"
            width={400}
            height={300}
          />
        ) : (
          <div className="ek-product-img-placeholder">
            <ShoppingBag className="w-10 h-10 text-slate-500" />
          </div>
        )}

        {/* badges */}
        <div className="ek-badge-store">{store}</div>
        <div className="ek-badge-commission">Up to 40%</div>
      </div>

      {/* ── Body ── */}
      <div className="ek-product-body">
        <p className="ek-product-category">{category}</p>
        <h3 className="ek-product-name">{name}</h3>
        <p className="ek-product-desc">{desc}</p>

        <div className="ek-product-meta">
          {price ? (
            <span className="ek-product-price">₹{Number(price).toLocaleString()}</span>
          ) : (
            <span className="ek-product-price-na">Price varies</span>
          )}
          <span className="ek-product-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5" />
            ))}
            <span className="ek-product-rating-val">(4.8)</span>
          </span>
        </div>

        <button className="ek-btn-product" onClick={() => onGenerate(id)}>
          <Zap className="w-4 h-4" />
          Generate Affiliate Link
        </button>
      </div>
    </article>
  );
}
