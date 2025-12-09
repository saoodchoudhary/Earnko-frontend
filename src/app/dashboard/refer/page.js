'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import toast from 'react-hot-toast'

export default function ReferPage() {
  const [refCode, setRefCode] = useState('')

  useEffect(() => {
    const u = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
    setRefCode(u?.referralCode || '')
  }, [])

  function copy() {
    if (!refCode) return
    navigator.clipboard.writeText(refCode).then(() => toast.success('Copied referral code')).catch(() => toast.error('Copy failed'))
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Refer & Earn</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-700">Share your referral code with friends and earn when they sign up.</p>
          <div className="mt-4 flex items-center space-x-3">
            <div className="px-4 py-3 bg-gray-100 rounded text-lg font-mono">{refCode || '—'}</div>
            <button onClick={copy} className="px-3 py-2 bg-primary-600 text-white rounded">Copy</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}