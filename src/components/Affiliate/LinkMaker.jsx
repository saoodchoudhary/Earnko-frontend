'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link2, Copy, ExternalLink, Sparkles, Globe } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

export default function LinkMaker() {
  const [inputUrl, setInputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  function normalizeUrl(raw) {
    let url = String(raw || '').trim()
    url = url.replace(/&amp;/gi, '&')
    url = url.replace(/[\r\n\t]+/g, '')
    url = url.replace(/\s+/g, '') // remove spaces inside URL (WhatsApp wrap issue)
    if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url
    return url
  }

  function validateUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  async function handleMakeLink(e) {
    e.preventDefault()
    setError(null)
    setResult(null)

    const normalized = normalizeUrl(inputUrl)

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

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.message || 'Failed to create link')
        return
      }

      setResult(data?.data || data)
      toast.success('Affiliate link created!')
      setInputUrl('')
    } catch (err) {
      console.error('Link creation error', err)
      setError('Server error while creating link')
    } finally {
      setLoading(false)
    }
  }

  const affiliateLink = result?.link || ''

  async function copyText(text, msg = 'Copied!') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(msg)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <div>
      <form onSubmit={handleMakeLink} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste any product URL"
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Sparkles className="w-4 h-4" />
          <span>Tip: Paste the website product link (not app link).</span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !inputUrl.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Link2 className="w-5 h-5" />
          <span>{loading ? 'Creating...' : 'Generate Link'}</span>
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-white border rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-2">Affiliate Link:</div>

            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 border rounded-lg p-3 text-sm font-medium break-all">
                {affiliateLink}
              </div>

              <button
                onClick={() => copyText(affiliateLink, 'Affiliate link copied')}
                disabled={!affiliateLink}
                className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg disabled:opacity-60"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-3">
              <a
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Open</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}