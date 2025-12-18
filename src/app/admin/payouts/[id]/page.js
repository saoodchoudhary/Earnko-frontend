'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function AdminPayoutDetailPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [payout, setPayout] = useState(null)
  const [perf, setPerf] = useState([])
  const [referrals, setReferrals] = useState([])
  const [refEarn, setRefEarn] = useState(0)
  const [status, setStatus] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''

  const load = async (signal) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/payouts/${id}`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to load payout')
      setPayout(js?.data?.payout || null)
      setPerf(js?.data?.linkPerformance || [])
      setReferrals(js?.data?.referrals || [])
      setRefEarn(Number(js?.data?.referralEarnings || 0))
      setStatus((js?.data?.payout?.status) || 'pending')
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Error loading')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [id])

  const updateStatus = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/payouts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ status, transactionReference: reference, adminNotes: notes })
      })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.message || 'Failed to update')
      toast.success('Updated')
      await load()
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/payouts" className="text-sm text-gray-600 hover:text-gray-900">← Back</Link>
        <div className="flex items-center gap-2">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['pending','approved','processed','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="input" placeholder="Transaction reference" value={reference} onChange={(e) => setReference(e.target.value)} />
          <input className="input" placeholder="Admin notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="btn btn-outline" onClick={updateStatus} disabled={saving}>{saving ? 'Updating...' : 'Update'}</button>
        </div>
      </div>

      {loading ? (
        <div className="h-24 skeleton rounded" />
      ) : !payout ? (
        <div>Not found</div>
      ) : (
        <>
          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Payout</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Affiliate:</span> {payout.affiliate?.name} ({payout.affiliate?.email})</div>
              <div><span className="text-gray-500">Amount:</span> ₹{Number(payout.amount || 0).toFixed(0)}</div>
              <div><span className="text-gray-500">Method:</span> {payout.method}</div>
              <div><span className="text-gray-500">Status:</span> {payout.status}</div>
              <div><span className="text-gray-500">Created:</span> {new Date(payout.createdAt).toLocaleString()}</div>
              <div><span className="text-gray-500">Processed:</span> {payout.processedAt ? new Date(payout.processedAt).toLocaleString() : '-'}</div>
            </div>
            {payout.methodDetails && (
              <div className="mt-3 text-sm">
                <span className="text-gray-500">Method details:</span>
                <pre className="text-xs bg-gray-50 border rounded p-2 mt-1 overflow-auto">{JSON.stringify(payout.methodDetails, null, 2)}</pre>
              </div>
            )}
          </section>

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Top Earning Links</h2>
            {perf.length === 0 ? (
              <div className="text-sm text-gray-600">No link performance yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Slug</Th>
                      <Th>Store</Th>
                      <Th className="text-right">Clicks</Th>
                      <Th className="text-right">Conversions</Th>
                      <Th className="text-right">Commission (₹)</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {perf.map(row => (
                      <tr key={row.slug} className="border-t">
                        <Td className="font-mono">{row.slug}</Td>
                        <Td>{row.storeName}</Td>
                        <Td className="text-right">{row.clicks}</Td>
                        <Td className="text-right">{row.conversions}</Td>
                        <Td className="text-right">₹{Number(row.commission || 0).toFixed(0)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Referrals</h2>
            <div className="text-sm mb-2">Referral Earnings: ₹{Number(refEarn || 0).toFixed(0)}</div>
            {referrals.length === 0 ? (
              <div className="text-sm text-gray-600">No referrals found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Joined</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map(u => (
                      <tr key={u._id} className="border-t">
                        <Td>{u.name || '-'}</Td>
                        <Td>{u.email || '-'}</Td>
                        <Td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

function Th({ children, className = '' }) { return <th className={`px-3 py-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-3 py-2 align-top ${className}`}>{children}</td> }