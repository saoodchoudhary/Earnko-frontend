'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import LinkMaker from '@/components/Affiliate/LinkMaker'
import { 
  Copy, ExternalLink, Link as LinkIcon, BarChart3, 
  Calendar, Filter, Search, TrendingUp, Eye, MousePointer,
  Download, Share2, Edit2, Trash2, MoreVertical, CheckCircle,
  AlertCircle, Clock, DollarSign, Users, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageAffiliate() {
  const [user, setUser] = useState(null)
  const [links, setLinks] = useState([])
  const [filteredLinks, setFilteredLinks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'active', 'inactive'
  const [loading, setLoading] = useState(true)
  const [selectedLinks, setSelectedLinks] = useState([])

  useEffect(() => {
    const u = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
    setUser(u)
    
    // Simulate loading
    setTimeout(() => {
      if (u && u.affiliateInfo && u.affiliateInfo.uniqueLinks) {
        const mockLinks = u.affiliateInfo.uniqueLinks.slice().reverse().map((link, idx) => ({
          id: idx,
          customSlug: link.customSlug,
          metadata: link.metadata || {
            originalUrl: `https://www.amazon.com/dp/B0EXAMPLE${idx}`,
            generatedLink: `https://earnko.com/aff/abc123xyz${idx}`,
            store: ['Amazon', 'Flipkart', 'Myntra'][idx % 3],
            category: ['Electronics', 'Fashion', 'Home'][idx % 3],
            createdAt: new Date(Date.now() - idx * 86400000).toISOString()
          },
          stats: {
            clicks: Math.floor(Math.random() * 1000) + 100,
            conversions: Math.floor(Math.random() * 100) + 10,
            earnings: Math.floor(Math.random() * 5000) + 500,
            conversionRate: Math.random() * 10 + 2
          },
          status: idx % 5 === 0 ? 'inactive' : 'active'
        }))
        setLinks(mockLinks)
        setFilteredLinks(mockLinks)
      }
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let result = links
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(link => 
        link.metadata?.originalUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.metadata?.store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.metadata?.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(link => link.status === filter)
    }
    
    setFilteredLinks(result)
  }, [searchTerm, filter, links])

  const copyLink = (link) => {
    const linkToCopy = link.metadata?.generatedLink || `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/redirect/${link.customSlug}`
    navigator.clipboard.writeText(linkToCopy).then(() => {
      toast.success('Link copied to clipboard!')
    }).catch(() => toast.error('Failed to copy'))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStoreIcon = (store) => {
    switch (store) {
      case 'Amazon': return '🛒'
      case 'Flipkart': return '📦'
      case 'Myntra': return '👕'
      default: return '🛍️'
    }
  }

  const exportLinks = () => {
    const csv = filteredLinks.map(link => ({
      'Link': link.metadata?.generatedLink,
      'Original URL': link.metadata?.originalUrl,
      'Store': link.metadata?.store,
      'Category': link.metadata?.category,
      'Clicks': link.stats?.clicks,
      'Conversions': link.stats?.conversions,
      'Earnings': link.stats?.earnings,
      'Status': link.status,
      'Created': formatDate(link.metadata?.createdAt)
    }))
    
    // Convert to CSV
    const headers = Object.keys(csv[0])
    const csvContent = [
      headers.join(','),
      ...csv.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `affiliate-links-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Links exported successfully!')
  }

  const toggleSelectLink = (linkId) => {
    setSelectedLinks(prev =>
      prev.includes(linkId)
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manage Affiliate Links</h1>
              <p className="text-gray-600 mt-2">Create, organize, and track your affiliate links</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportLinks}
                disabled={filteredLinks.length === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Share2 className="w-4 h-4" />
                Share Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{links.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {links.reduce((sum, link) => sum + (link.stats?.clicks || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{links.reduce((sum, link) => sum + (link.stats?.earnings || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {((links.reduce((sum, link) => sum + (link.stats?.conversionRate || 0), 0) / links.length) || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Link Generator Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Generate New Affiliate Link</h3>
              <p className="text-gray-300 mt-1">Create tracked affiliate links in seconds</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <LinkMaker />
        </div>

        {/* Links List Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search links by URL, store, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  >
                    <option value="all">All Links</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {selectedLinks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{selectedLinks.length} selected</span>
                    <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      <Trash2 className="w-4 h-4 inline-block mr-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your affiliate links...</p>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="p-12 text-center">
                <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No links found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Create your first affiliate link to get started'}
                </p>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Create Link
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-6 text-left">
                      <input
                        type="checkbox"
                        checked={selectedLinks.length === filteredLinks.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLinks(filteredLinks.map(link => link.id))
                          } else {
                            setSelectedLinks([])
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Link Details</th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Performance</th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedLinks.includes(link.id)}
                          onChange={() => toggleSelectLink(link.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getStoreIcon(link.metadata?.store)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{link.metadata?.store || 'Unknown Store'}</span>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                  {link.metadata?.category || 'General'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {link.metadata?.originalUrl}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                <Calendar className="w-3 h-3 inline-block mr-1" />
                                Created {formatDate(link.metadata?.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                            {link.metadata?.generatedLink || `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/redirect/${link.customSlug}`}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{link.stats?.clicks?.toLocaleString() || 0}</div>
                              <div className="text-xs text-gray-500">Clicks</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{link.stats?.conversions?.toLocaleString() || 0}</div>
                              <div className="text-xs text-gray-500">Conversions</div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">₹{link.stats?.earnings?.toLocaleString() || 0}</div>
                            <div className="text-xs text-gray-500">Earnings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-600">
                              {link.stats?.conversionRate?.toFixed(1) || 0}% Conversion Rate
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(link.status)}`}>
                          {link.status === 'active' ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyLink(link)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <a
                            href={link.metadata?.generatedLink || `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/redirect/${link.customSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                          </a>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View analytics"
                          >
                            <BarChart3 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination/Footer */}
          {filteredLinks.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredLinks.length} of {links.length} links
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Previous
                </button>
                <span className="px-3 py-1 bg-gray-900 text-white rounded text-sm">1</span>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}