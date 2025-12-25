'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  Search, Filter, Plus, Edit2, Trash2, Eye,
  Package, Store, IndianRupee, CheckCircle, XCircle,
  Calendar, MoreVertical, Download, RefreshCw,
  ChevronLeft, ChevronRight, Grid, List
} from 'lucide-react'

export default function AdminProductsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [q, setQ] = useState('')
  const [isActive, setIsActive] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
  const [selectedItems, setSelectedItems] = useState([])

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const load = async (signal, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit) 
      })
      if (q) params.set('q', q)
      if (isActive) params.set('isActive', isActive)
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products?${params.toString()}`, {
        signal, 
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load products')
      
      setItems(data?.data?.items || [])
      setTotal(data?.data?.total || 0)
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Error loading products')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [q, isActive, page, limit])

  const refresh = () => {
    setRefreshing(true)
    const controller = new AbortController()
    load(controller.signal, false)
  }

  const removeItem = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/products/${id}`, {
        method: 'DELETE', 
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to delete product')
      
      toast.success('Product deleted successfully')
      setItems(prev => prev.filter(i => i._id !== id))
      setTotal(t => Math.max(0, t - 1))
    } catch (err) { 
      toast.error(err.message || 'Failed to delete') 
    }
  }

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item._id))
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `products-${new Date().toISOString().split('T')[0]}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast.success('Products data exported successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage and organize all platform products</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportData}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link 
              href="/admin/products/create"
              className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Product
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800/30 focus:border-gray-800"
                placeholder="Search products..."
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value) }}
              />
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800/30 focus:border-gray-800 appearance-none"
                value={isActive}
                onChange={(e) => { setPage(1); setIsActive(e.target.value) }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800/30 focus:border-gray-800"
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={refreshing}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedItems.length} product{selectedItems.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  Activate Selected
                </button>
                <button className="px-3 py-1.5 border border-gray-300 text-red-600 text-sm rounded-lg hover:bg-red-50">
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuelinks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No products found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleSelectItem(item._id)}
                          className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.images?.[0] && (
                            <img 
                              src={item.images[0]} 
                              alt={item.title}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-xs text-gray-500">
                              {item.category || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{item.store?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {Number(item.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.lastCuelinksValidatedAt 
                            ? 'bg-blue-100 text-blue-800' 
                            : item.cuelinksChannelId || item.cuelinksCampaignId 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.lastCuelinksValidatedAt 
                            ? 'Validated' 
                            : (item.cuelinksChannelId || item.cuelinksCampaignId 
                              ? 'Configured' 
                              : 'Not set')
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {item.updatedAt 
                            ? new Date(item.updatedAt).toLocaleDateString() 
                            : '-'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${item._id}/edit`}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/products/${item._id}`}
                            target="_blank"
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="h-40 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {item.images?.[0] ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      item.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{item.store?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                      <IndianRupee className="w-4 h-4" />
                      {Number(item.price || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">
                      Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/products/${item._id}/edit`}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">
            {(page - 1) * limit + 1} - {Math.min(page * limit, total)}
          </span> of <span className="font-semibold text-gray-900">{total}</span> products
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = page <= 3 
                ? i + 1 
                : page >= totalPages - 2 
                ? totalPages - 4 + i 
                : page - 2 + i
              
              if (pageNumber < 1 || pageNumber > totalPages) return null
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                    page === pageNumber
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}