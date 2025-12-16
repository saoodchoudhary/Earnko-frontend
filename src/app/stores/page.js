'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStores } from '../../store/slices/storesSlice';
import StoreCard from '../../components/StoreCard';
import { fetchOffers } from '../../store/slices/offersSlice';
import OfferCard from '../../components/OfferCard';

export default function StoresPage() {
  const dispatch = useAppDispatch();
  const { items: stores, loading: storesLoading } = useAppSelector(s => s.stores);
  const { items: offers, loading: offersLoading } = useAppSelector(s => s.offers);
  const [selectedStore, setSelectedStore] = useState('all');

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchOffers());
  }, [dispatch]);

  const filteredOffers = selectedStore === 'all'
    ? offers
    : offers.filter(o => o.store?._id === selectedStore);

  return (
    <main className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Stores & Offers</h1>

      <div className="flex gap-2 overflow-auto mb-6 no-scrollbar">
        <button
          className={`chip ${selectedStore === 'all' ? 'chip-active' : ''}`}
          onClick={() => setSelectedStore('all')}
        >
          All
        </button>
        {storesLoading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-8 w-24 rounded-full" />)
        ) : (
          stores.map(s => (
            <button
              key={s._id}
              className={`chip ${selectedStore === s._id ? 'chip-active' : ''}`}
              onClick={() => setSelectedStore(s._id)}
            >
              {s.name}
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offersLoading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-lg" />)
        ) : (
          filteredOffers.map(o => <OfferCard key={o._id} offer={o} />)
        )}
      </div>
    </main>
  );
}