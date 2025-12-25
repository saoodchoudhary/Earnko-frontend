'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStores } from '../../store/slices/storesSlice';
import { fetchOffers } from '../../store/slices/offersSlice';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store, Filter, Search, Grid, List, TrendingUp,
  Zap, Star, ChevronRight, Sparkles, Crown, Award,
  ShoppingBag, Percent, Globe, ExternalLink
} from 'lucide-react';

/**
 * FIX: Next.js requires a Suspense boundary around components using useSearchParams.
 * We wrap the page with <Suspense> and move the hook usage inside the inner component.
 */
export default function StoresPage() {
  return (
    <Suspense fallback={<StoresSkeleton />}>
      <StoresPageInner />
    </Suspense>
  );
}

function StoresPageInner() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();

  const { items: stores, loading: storesLoading } = useAppSelector(s => s.stores);
  const { items: offers, loading: offersLoading } = useAppSelector(s => s.offers);

  const initialStore = params?.get('store') || 'all';
  const [selectedStore, setSelectedStore] = useState(initialStore);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');

  // Keep selectedStore in sync if URL query changes externally (e.g., deep link)
  useEffect(() => {
    if (initialStore !== selectedStore) setSelectedStore(initialStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStore]);

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchOffers());
  }, [dispatch]);

  useEffect(() => {
    const search = new URLSearchParams();
    if (selectedStore && selectedStore !== 'all') search.set('store', selectedStore);
    const qs = search.toString();
    router.replace(`/stores${qs ? `?${qs}` : ''}`);
  }, [selectedStore, router]);

  const filteredOffers = useMemo(() => {
    const baseList = selectedStore === 'all'
      ? offers
      : offers.filter(o => o.store?._id === selectedStore);

    const q = query.trim().toLowerCase();
    const searched = q
      ? baseList.filter(o => {
          const title = String(o.title || o.name || '').toLowerCase();
          const storeName = String(o.store?.name || '').toLowerCase();
          const desc = String(o.description || '').toLowerCase();
          return title.includes(q) || storeName.includes(q) || desc.includes(q);
        })
      : baseList;

    return [...searched].sort((a, b) => {
      switch (sortBy) {
        case 'commission':
          return (b.rate || 0) - (a.rate || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'popular':
          return (b.clicks || 0) - (a.clicks || 0);
        default:
          return 0;
      }
    });
  }, [offers, selectedStore, query, sortBy]);

  const featuredStores = stores.slice(0, 8);
  const selectedStoreData = stores.find(s => s._id === selectedStore);

  const categoryStats = useMemo(() => {
    const categories = {};
    filteredOffers.forEach(offer => {
      const category = offer.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  }, [filteredOffers]);

  const requireLoginToGenerate = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.push('/login?next=/dashboard/affiliate');
    else router.push('/dashboard/affiliate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Stores & Offers</h1>
                <p className="text-blue-100 mt-1">Discover high-commission affiliate programs</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Available Stores</div>
              <div className="text-xl font-bold">{stores.length}+</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filters
              </h3>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search offers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="space-y-2">
                  {[
                    { id: 'popular', label: 'Most Popular', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'commission', label: 'Highest Commission', icon: <Percent className="w-4 h-4" /> },
                    { id: 'newest', label: 'Newest First', icon: <Sparkles className="w-4 h-4" /> }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        sortBy === option.id
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                </div>
              </div>

              {/* Categories */}
              {categoryStats.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedStore('all')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                        selectedStore === 'all'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>All Stores</span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {stores.length}
                      </span>
                    </button>
                    {categoryStats.slice(0, 5).map((cat) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                      >
                        <span>{cat.name}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Store Info */}
              {selectedStoreData && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      {selectedStoreData.logo ? (
                        <img src={selectedStoreData.logo} alt={selectedStoreData.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <Store className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{selectedStoreData.name}</div>
                      <div className="text-xs text-gray-600">{filteredOffers.length} offers</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStore('all')}
                    className="text-sm text-blue-600 hover:text-blue-700 w-full text-center"
                  >
                    View All Stores
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Store Chips */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Featured Stores</h2>
                <Link href="/stores" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                <StoreChip
                  active={selectedStore === 'all'}
                  onClick={() => setSelectedStore('all')}
                  label="All Stores"
                  icon={<Globe className="w-4 h-4" />}
                  isFeatured={true}
                />
                {storesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-32 h-14 bg-gray-200 rounded-xl animate-pulse flex-shrink-0"></div>
                  ))
                ) : (
                  featuredStores.map(store => (
                    <StoreChip
                      key={store._id}
                      active={selectedStore === store._id}
                      onClick={() => setSelectedStore(store._id)}
                      label={store.name}
                      logo={store.logo}
                      isFeatured={store.featured}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Stats & Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatTile
                icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
                label="Available Offers"
                value={filteredOffers.length}
                bg="from-blue-100 to-cyan-100"
              />
              <StatTile
                icon={<Percent className="w-5 h-5 text-green-600" />}
                label="Avg. Commission"
                value={
                  filteredOffers.length > 0
                    ? Math.round(filteredOffers.reduce((sum, o) => sum + (o.rate || 0), 0) / filteredOffers.length)
                    : 0
                }
                suffix="%"
                bg="from-green-100 to-emerald-100"
              />
              <StatTile
                icon={<Zap className="w-5 h-5 text-amber-600" />}
                label="Top Commission"
                value={filteredOffers.length > 0 ? Math.max(...filteredOffers.map(o => o.rate || 0)) : 0}
                suffix="%"
                bg="from-amber-100 to-orange-100"
              />
            </div>

            {/* Offers Grid/List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedStore === 'all' ? 'All Offers' : `${selectedStoreData?.name} Offers`}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {filteredOffers.length} offers available • Sorted by {sortBy}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Click on any offer to generate affiliate link
                </div>
              </div>

              {offersLoading ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`${viewMode === 'grid' ? 'h-48' : 'h-20'} bg-gray-200 rounded-xl animate-pulse`}></div>
                  ))}
                </div>
              ) : filteredOffers.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No Offers Found</h3>
                  <p className="text-gray-600 mb-4">
                    {query ? 'Try adjusting your search terms' : 'No offers available for the selected store'}
                  </p>
                  <button
                    onClick={() => {
                      setQuery('');
                      setSelectedStore('all');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    View All Offers
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOffers.map(offer => (
                    <EnhancedOfferCard key={offer._id} offer={offer} onGenerate={requireLoginToGenerate} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOffers.map(offer => (
                    <EnhancedOfferCard key={offer._id} offer={offer} onGenerate={requireLoginToGenerate} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>

            {/* Featured Section */}
            {filteredOffers.some(o => o.featured) && (
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-bold">Featured Offers</h3>
                    <p className="text-blue-100">Special high-commission opportunities</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOffers.filter(o => o.featured).slice(0, 2).map(offer => (
                    <div key={offer._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {offer.store?.logo ? (
                            <img src={offer.store.logo} alt={offer.store.name} className="w-6 h-6 rounded" />
                          ) : (
                            <Store className="w-5 h-5" />
                          )}
                          <span className="font-medium">{offer.store?.name}</span>
                        </div>
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                          {offer.rate}% Commission
                        </span>
                      </div>
                      <div className="text-sm mb-2">{offer.title || offer.name}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          High Converting
                        </span>
                        <button onClick={requireLoginToGenerate} className="text-white hover:text-blue-100 flex items-center gap-1">
                          Generate Link
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreChip({ label, logo, icon, active, onClick, isFeatured }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-shrink-0 ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-lg'
          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
      } ${isFeatured ? 'border-2 border-amber-300' : ''}`}
    >
      {logo ? (
        <img src={logo} alt={label} className={`w-5 h-5 ${active ? '' : 'grayscale'}`} />
      ) : icon ? (
        <div className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`}>
          {icon}
        </div>
      ) : (
        <Store className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
      )}
      <span className="text-sm font-medium">{label}</span>
      {isFeatured && !active && (
        <Star className="w-3 h-3 text-amber-500 fill-current" />
      )}
    </button>
  );
}

function StatTile({ icon, label, value, suffix = '', bg = 'from-gray-100 to-gray-200' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-lg font-bold text-gray-900">{value}{suffix}</div>
        </div>
      </div>
    </div>
  );
}

function EnhancedOfferCard({ offer, viewMode, onGenerate }) {
  if (viewMode === 'grid') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-gray-200 flex items-center justify-center">
              {offer.store?.logo ? (
                <img src={offer.store.logo} alt={offer.store.name} className="w-6 h-6 object-contain" />
              ) : (
                <Store className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{offer.store?.name}</div>
              <div className="text-xs text-gray-500">Affiliate Program</div>
            </div>
          </div>
          {offer.featured && (
            <Award className="w-4 h-4 text-amber-500" />
          )}
        </div>

        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
          {offer.title || offer.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {offer.description || 'High converting affiliate offer'}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold text-green-600">
            Up to {offer.rate || 0}%
          </div>
          <div className="text-xs text-gray-500">Commission</div>
        </div>

        <button
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105"
          onClick={onGenerate}
        >
          <Zap className="w-4 h-4" />
          Generate Link
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
          {offer.store?.logo ? (
            <img src={offer.store.logo} alt={offer.store.name} className="w-8 h-8 object-contain" />
          ) : (
            <Store className="w-6 h-6 text-blue-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 truncate">
              {offer.title || offer.name}
            </h3>
            {offer.featured && <Award className="w-4 h-4 text-amber-500" />}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Store className="w-3 h-3" />
              {offer.store?.name}
            </span>
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              {offer.rate || 0}% commission
            </span>
            {offer.clicks && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {offer.clicks} clicks
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-1">
            {offer.description || 'High converting affiliate offer'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-lg font-bold text-green-600">
            {offer.rate || 0}%
          </div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm"
            onClick={onGenerate}
          >
            <Zap className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

function StoresSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="h-6 w-48 skeleton rounded" />
          <div className="h-4 w-72 skeleton rounded mt-2" />
        </div>
      </section>
      <section className="container mx-auto px-4 py-6">
        <div className="h-40 skeleton rounded" />
      </section>
    </div>
  );
}