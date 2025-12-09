// frontend-earnko/src/app/dashboard/transactions/[id]/page.js
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import Link from 'next/link'

export default function TransactionDetail() {
  const params = useParams()
  const id = params?.id
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/transactions/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (res.ok) setTx(data.data.transaction || data.data)
        else {
          console.error(data)
        }
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="text-sm text-primary-600 mb-4">← Back</button>
        {loading ? (
          <div className="p-8">Loading...</div>
        ) : !tx ? (
          <div className="p-6 text-gray-500">Transaction not found</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div><strong>Order ID:</strong> {tx.orderId}</div>
              <div><strong>Store:</strong> {tx.store?.name || 'N/A'}</div>
              <div><strong>Order Date:</strong> {new Date(tx.orderDate || tx.createdAt).toLocaleString()}</div>
              <div><strong>Product Amount:</strong> ₹{tx.productAmount || 0}</div>
              <div><strong>Commission Amount:</strong> ₹{tx.commissionAmount || 0}</div>
              <div><strong>Status:</strong> <span className="font-medium">{tx.status}</span></div>
              {tx.fraudFlags && (
                <div><strong>Fraud Flags:</strong> {tx.fraudFlags.isSuspicious ? 'Suspicious' : 'Clean'}</div>
              )}
              <div><strong>Tracking Data:</strong> <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(tx.trackingData || {}, null, 2)}</pre></div>
            </div>
            <div className="mt-4">
              <Link href={tx.trackingData?.product_url || '#'}><a target="_blank" className="text-primary-600">Open product</a></Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}