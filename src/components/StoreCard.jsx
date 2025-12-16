'use client';

import Link from 'next/link';

export default function StoreCard({ store }) {
  return (
    <div className="card">
      <div className="p-4">
        <div className="flex items-center gap-3">
          {store.logo && <img src={store.logo} alt={store.name} className="h-10 w-10 rounded" />}
          <div>
            <h3 className="font-semibold">{store.name}</h3>
            {store.baseUrl && <a className="text-sm text-muted hover:underline" href={store.baseUrl} target="_blank">Visit</a>}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Link href={`/stores`} className="btn btn-outline w-full">View offers</Link>
      </div>
    </div>
  );
}