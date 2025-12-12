'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactions } from '@/store/slices/transactionSlice'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { 
  TrendingUp, Clock, CheckCircle, XCircle, 
  Filter, Calendar, Download, RefreshCw,
  ShoppingBag, DollarSign, CreditCard, ArrowUpRight,
  ChevronLeft, ChevronRight, Search, BarChart3
} from 'lucide-react'
import { format } from 'date-fns'

export default function TransactionsPage() {
  const dispatch = useDispatch()
  const { transactions, loading, currentPage, totalPages, total } = useSelector(state => state.transactions)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalPaid: 0,
    approved: 0,
    pending: 0
  })

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'confirmed', label: 'Confirmed', color: 'green' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ]

  async function load(pageNumber = 1) {
    try {
      await dispatch(fetchTransactions({ 
        page: pageNumber, 
        limit: 10, 
        status: statusFilter === 'all' ? '' : statusFilter 
      })).unwrap()
      
      // Calculate stats from transactions
      calculateStats(transactions)
    } catch (err) {
      console.error('Failed to load transactions:', err)
    }
  }

  const calculateStats = (transactions) => {
    const calculatedStats = {
      totalEarnings: 0,
      totalPaid: 0,
      approved: 0,
      pending: 0
    }

    transactions.forEach(tx => {
      const amount = tx.commissionAmount || 0
      
      if (tx.status === 'confirmed') {
        calculatedStats.totalEarnings += amount
        calculatedStats.approved += amount
        calculatedStats.totalPaid += amount
      } else if (tx.status === 'pending') {
        calculatedStats.totalEarnings += amount
        calculatedStats.pending += amount
      }
    })

    setStats(calculatedStats)
  }

  useEffect(() => {
    load(1)
  }, [statusFilter])

  useEffect(() => {
    calculateStats(transactions)
  }, [transactions])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      load(newPage)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchQuery || 
      tx.store?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.orderId && tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesDate = dateFilter === 'all' || true // Implement date filtering logic
    
    return matchesSearch && matchesDate
  })

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-600 mt-1">Track your earnings and commission history</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <button
                onClick={() => load(page)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Total confirmed + pending</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalPaid.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Amount transferred to you</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.approved.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Ready for withdrawal</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.pending.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by store or order ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {statusOptions.find(opt => opt.value === statusFilter)?.label}
                <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-gray-900">×</button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {dateOptions.find(opt => opt.value === dateFilter)?.label}
                <button onClick={() => setDateFilter('all')} className="ml-1 hover:text-gray-900">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-gray-900">×</button>
              </span>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No transactions found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{transaction.store?.name || 'Unknown Store'}</div>
                            <div className="text-xs text-gray-500">Product Purchase</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {format(new Date(transaction.orderDate || transaction.createdAt), 'dd MMM yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(transaction.orderDate || transaction.createdAt), 'hh:mm a')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.orderId || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{transaction.commissionAmount || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Commission
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                          <ArrowUpRight className="w-3 h-3" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * 10, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> transactions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || loading}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      
                      return pageNum <= totalPages && (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg ${
                            page === pageNum
                              ? 'bg-gray-900 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6" />
            <h3 className="text-lg font-bold">Transaction Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-gray-300 mt-1">Total Earnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold">₹{stats.totalPaid.toFixed(2)}</div>
              <div className="text-sm text-gray-300 mt-1">Total Paid</div>
            </div>
            <div>
              <div className="text-2xl font-bold">₹{stats.approved.toFixed(2)}</div>
              <div className="text-sm text-gray-300 mt-1">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold">₹{stats.pending.toFixed(2)}</div>
              <div className="text-sm text-gray-300 mt-1">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}