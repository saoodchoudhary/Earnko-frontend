'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchStores } from '../store/slices/storesSlice';
import StoreCard from '../components/StoreCard';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(s => s.stores);

  useEffect(() => {
    dispatch(fetchStores());
  }, [dispatch]);

  return (
    <main className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <section className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Trending Stores</h1>
        <div className="flex gap-3">
          <Link href="/login" className="btn btn-outline">Login</Link>
          <Link href="/register" className="btn btn-primary">Register</Link>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(store => (
            <StoreCard key={store._id} store={store} />
          ))}
        </div>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Explore Offers</h2>
          <Link href="/stores" className="text-primary hover:underline">View all</Link>
        </div>
      </section>
    </main>
  );
}