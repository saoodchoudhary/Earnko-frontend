'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  Search, Filter, Plus, Edit, Trash2, Eye,
  Tag, Store as StoreIcon, TrendingUp, Calendar,
  ChevronLeft, ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react'

export default function AdminOffersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [storeId, setStoreId] = useState('')
  const [isActive, setIsActive] = useState('')
  const [stores, setStores] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  // Load stores
  useEffect(() => {
    const controller = new AbortController()
    async function loadStores() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/stores`, { 
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (res.ok) setStores(data?.data?.stores || data?.data || [])
      } catch {}
    }
    loadStores()
    return () => controller.abort()
  }, [])

  // Load offers
  const loadOffers = async (signal, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit) 
      })
      if (search) params.set('q', search)
      if (storeId) params.set('storeId', storeId)
      if (isActive !== '') params.set('isActive', isActive)
      
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/category-commissions?${params.toString()}`
      const res = await fetch(url, { 
        signal, 
        headers: { Authorization: token ? `Bearer ${token}` : '' } 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load offers')
      
      setItems(data?.data?.items || [])
      setTotal(data?.data?.total || 0)
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'Error loading offers')
      }
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadOffers(controller.signal)
    return () => controller.abort()
  }, [search, storeId, isActive, page, limit])

  const handleDelete = async (id, label) => {
    if (!confirm(`Are you sure you want to delete offer "${label}"?`)) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/category-commissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to delete offer')
      
      toast.success('Offer deleted successfully')
      setItems(prev => prev.filter(i => i._id !== id))
      setTotal(t => Math.max(0, t - 1))
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const refreshData = () => {
    setRefreshing(true)
    const controller = new AbortController()
    loadOffers(controller.signal, false)
    return () => controller.abort()
  }

  const applyFilters = () => {
    setPage(1)
    refreshData()
  }

  const clearFilters = () => {
    setSearch('')
    setStoreId('')
    setIsActive('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offers Management</h1>
            <p className="text-gray-600 mt-1">Manage commission offers and categories</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/admin/offers/create"
              className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Offer
            </Link>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Offers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by label or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Stores</option>
              {stores.map(store => (
                <option key={store._id} value={store._id}>{store.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per page
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Showing {items.length} of {total} offers
          {search && ` for "${search}"`}
          {storeId && ` in store`}
          {isActive !== '' && ` (${isActive === 'true' ? 'Active' : 'Inactive'})`}
        </div>
        <div className="text-sm font-medium text-gray-900">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Offer Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px 6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Tag className="w-12 h-12 text-gray-400 mb-3" />
                      <h4 className="text-lg font-medium text-gray-700 mb-1">No Offers Found</h4>
                      <p className="text-gray-500 max-w-md">
                        {search || storeId || isActive !== '' 
                          ? 'Try adjusting your filters or search terms' 
                          : 'Get started by creating your first commission offer'}
                      </p>
                      {!search && !storeId && isActive === '' && (
                        <Link
                          href="/admin/offers/create"
                          className="mt-4 px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create First Offer
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <StoreIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {offer.store?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Store ID: {offer.store?._id?.substring(0, 8) || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {offer.categoryKey || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {offer.label || 'Untitled Offer'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {offer.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {Number(offer.commissionRate || 0)}
                            {offer.commissionType === 'percentage' ? '%' : '₹'}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {offer.commissionType}
                            {offer.maxCap != null && ` • Max: ₹${Number(offer.maxCap).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        offer.isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${offer.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {offer.updatedAt ? new Date(offer.updatedAt).toLocaleDateString() : '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {offer.updatedAt ? new Date(offer.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/offers/${offer._id}/edit`}
                          className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          title="Edit Offer"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(offer._id, offer.label)}
                          className="p-2 rounded-lg border border-gray-300 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Offer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/offers?store=${offer.store?._id}`}
                          target="_blank"
                          className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          title="View Public Offer"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} offers
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      page === pageNum
                        ? 'bg-gray-800 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}