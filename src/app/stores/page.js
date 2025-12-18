'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStores } from '../../store/slices/storesSlice';
import { fetchOffers } from '../../store/slices/offersSlice';
import OfferCard from '../../components/OfferCard';
import { useSearchParams, useRouter } from 'next/navigation';

export default function StoresPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();

  const { items: stores, loading: storesLoading } = useAppSelector(s => s.stores);
  const { items: offers, loading: offersLoading } = useAppSelector(s => s.offers);

  // Read selected store from URL (?store=<id>) so links are shareable
  const initialStore = params?.get('store') || 'all';
  const [selectedStore, setSelectedStore] = useState(initialStore);

  // Optional local UI states
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchOffers());
  }, [dispatch]);

  useEffect(() => {
    // Keep URL in sync with selected store
    const search = new URLSearchParams();
    if (selectedStore && selectedStore !== 'all') search.set('store', selectedStore);
    const qs = search.toString();
    router.replace(`/stores${qs ? `?${qs}` : ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore]);

  const filteredOffers = useMemo(() => {
    let list = selectedStore === 'all'
      ? offers
      : offers.filter(o => o.store?._id === selectedStore);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(o => {
        const title = String(o.title || o.name || '').toLowerCase();
        const storeName = String(o.store?.name || '').toLowerCase();
        return title.includes(q) || storeName.includes(q);
      });
    }
    return list;
  }, [offers, selectedStore, query]);

  return (
    <main className="min-h-screen">
      {/* Header section */}
      <section className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Stores & Offers</h1>
          <p className="text-gray-300 mt-2">Browse store-specific offers and generate your tracked link.</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white border rounded-lg p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <input
                className="input w-full"
                placeholder="Search offers by name or store..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 text-sm rounded border ${viewMode === 'grid' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`px-3 py-1 text-sm rounded border ${viewMode === 'list' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Store chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          <StoreChip
            active={selectedStore === 'all'}
            onClick={() => setSelectedStore('all')}
            label="All"
          />
          {storesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-9 w-28 rounded-full shrink-0" />
            ))
          ) : (
            stores.map(s => (
              <StoreChip
                key={s._id}
                active={selectedStore === s._id}
                onClick={() => setSelectedStore(s._id)}
                label={s.name}
                logo={s.logo}
              />
            ))
          )}
        </div>

        {/* Result stats */}
        <div className="text-sm text-gray-600 mb-2">
          {offersLoading ? 'Loading offers...' : `${filteredOffers.length} offer(s)`}
          {selectedStore !== 'all' && (
            <> • {stores.find(st => st._id === selectedStore)?.name || 'Store'}</>
          )}
        </div>

        {/* Offers grid/list */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {offersLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))
          ) : filteredOffers.length === 0 ? (
            <div className="bg-white border rounded-lg p-6 text-gray-600">
              No offers found. Try selecting a different store or clearing your search.
            </div>
          ) : (
            filteredOffers.map(o => (
              <OfferCard key={o._id} offer={o} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function StoreChip({ label, logo, active, onClick }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border shrink-0 transition ${
        active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {logo ? <img src={logo} alt={label} className="h-5 w-5 rounded" /> : <span className="h-5 w-5 rounded bg-gray-200" />}
      <span className="text-sm">{label}</span>
    </button>
  );
}