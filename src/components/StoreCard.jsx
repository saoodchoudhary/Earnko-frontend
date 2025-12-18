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
            {store.baseUrl && (
              <a className="text-sm text-gray-600 hover:underline" href={store.baseUrl} target="_blank" rel="noopener noreferrer">
                Visit
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <Link href={`/stores?store=${store._id}`} className="btn btn-outline w-full">View offers</Link>
        {store.baseUrl ? (
          <a href={store.baseUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">Open Store</a>
        ) : (
          <button className="btn btn-primary w-full" disabled>Open Store</button>
        )}
      </div>
    </div>
  );
}