'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import LinkMaker from '@/components/Affiliate/LinkMaker'

export default function ManageAffiliate() {
  const [user, setUser] = useState(null)
  const [links, setLinks] = useState([])

  useEffect(() => {
    const u = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
    setUser(u)
    if (u && u.affiliateInfo && u.affiliateInfo.uniqueLinks) {
      setLinks(u.affiliateInfo.uniqueLinks.slice().reverse())
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Affiliate Links</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-3">Create Link</h3>
          <LinkMaker />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-3">Your Links</h3>
          {links.length === 0 ? (
            <div className="text-gray-500">You have no links yet. Create one above.</div>
          ) : (
            <div className="space-y-3">
              {links.map((l, idx) => (
                <div key={idx} className="flex items-center justify-between border rounded p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium break-words">{l.metadata?.generatedLink || `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/redirect/${l.customSlug}`}</div>
                    <div className="text-xs text-gray-500 mt-1">{l.metadata?.originalUrl || ''}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a href={l.metadata?.generatedLink || `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/redirect/${l.customSlug}`} target="_blank" rel="noreferrer" className="text-sm text-primary-600">Open</a>
                    <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm" onClick={() => navigator.clipboard.writeText(l.metadata?.generatedLink || `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/redirect/${l.customSlug}`)}>Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}