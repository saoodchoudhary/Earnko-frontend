// components/Affiliate/LinkMaker.tsx
'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link2, Copy, ExternalLink, Sparkles, Globe } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default function LinkMaker() {
  const [inputUrl, setInputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  function normalizeUrl(url) {
    try {
      if (!/^https?:\/\//i.test(url)) return 'https://' + url
      return url
    } catch (e) {
      return url
    }
  }

  function validateUrl(url) {
    try { new URL(url); return true } catch (e) { return false }
  }

  async function handleMakeLink(e) {
    e.preventDefault()
    setError(null)
    setResult(null)
    const normalized = normalizeUrl(inputUrl.trim())
    
    if (!normalized) {
      setError('Please enter a URL')
      return
    }
    
    if (!validateUrl(normalized)) {
      setError('Please enter a valid URL (include https://)')
      return
    }

    setLoading(true)
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`${API_URL}/api/affiliate/link-from-url`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify({ url: normalized })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.message || 'Failed to create link')
        setLoading(false)
        return
      }
      
      setResult(data.data || data)
      toast.success('Affiliate link created!')
      setInputUrl('')
    } catch (err) {
      console.error('Link creation error', err)
      setError('Server error while creating link')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result?.link) return
    navigator.clipboard.writeText(result.link)
      .then(() => {
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => toast.error('Copy failed'))
  }

  return (
    <div>
      <form onSubmit={handleMakeLink} className="space-y-4">
        {/* URL Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste any product URL (Amazon, Flipkart, Myntra, etc.)"
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition"
            disabled={loading}
          />
        </div>

        {/* Helper Text */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Sparkles className="w-4 h-4" />
          <span>Supports 500+ partner stores with competitive commission rates</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading || !inputUrl.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Link...</span>
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              <span>Generate Affiliate Link</span>
            </>
          )}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Your Affiliate Link</span>
              </div>
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Ready to share
              </span>
            </div>

            {/* Generated Link */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Copy this link and share anywhere:</div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-900 break-all">
                  {result.link}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Open Link</span>
              </a>
              
              <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Share on Social</span>
              </button>
              
              {result.productId && (
                <div className="text-xs text-gray-500 mt-2">
                  Product ID: <span className="font-medium text-gray-900">{result.productId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}