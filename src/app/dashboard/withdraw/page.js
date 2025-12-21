'use client';

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function WithdrawPage() {
  const [wallet, setWallet] = useState(null)
  const [requestedAmount, setRequestedAmount] = useState(0)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('bank')
  const [bank, setBank] = useState({ holderName: '', accountNumber: '', ifsc: '', bankName: '' })
  const [upiId, setUpiId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/wallet/me`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (res.ok) {
          setWallet(data?.data?.wallet || null)
          setRequestedAmount(data?.data?.requestedAmount || 0)
        }
      } catch {}
    }
    load()
    return () => controller.abort()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const payload = method === 'bank'
        ? { amount: Number(amount), method, bank }
        : { amount: Number(amount), method, upiId }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to request withdrawal')
      toast.success('Withdrawal requested')
      setAmount('')
      // refresh summary
      const r2 = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/wallet/me`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const d2 = await r2.json()
      if (r2.ok) {
        setWallet(d2?.data?.wallet || null)
        setRequestedAmount(d2?.data?.requestedAmount || 0)
      }
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Withdraw</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat title="Available Balance" value={wallet?.availableBalance || 0} />
        <Stat title="Confirmed Cashback" value={wallet?.confirmedCashback || 0} />
        <Stat title="Pending Cashback" value={wallet?.pendingCashback || 0} />
        <Stat title="Requested (Locked)" value={requestedAmount || 0} />
        <Stat title="Total Withdrawn" value={wallet?.totalWithdrawn || 0} />
      </div>

      <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-3 max-w-md">
        <div>
          <label className="text-xs text-gray-500">Amount (₹)</label>
          <input className="input mt-1" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs text-gray-500">Method</label>
          <select className="input mt-1" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="bank">Bank</option>
            <option value="upi">UPI</option>
          </select>
        </div>
        {method === 'upi' ? (
          <div>
            <label className="text-xs text-gray-500">UPI ID</label>
            <input className="input mt-1" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourupi@bank" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-xs text-gray-500">
              Account Holder
              <input className="input mt-1" value={bank.holderName} onChange={e => setBank({ ...bank, holderName: e.target.value })} />
            </label>
            <label className="text-xs text-gray-500">
              Account Number
              <input className="input mt-1" value={bank.accountNumber} onChange={e => setBank({ ...bank, accountNumber: e.target.value })} />
            </label>
            <label className="text-xs text-gray-500">
              IFSC
              <input className="input mt-1" value={bank.ifsc} onChange={e => setBank({ ...bank, ifsc: e.target.value })} />
            </label>
            <label className="text-xs text-gray-500 md:col-span-2">
              Bank Name
              <input className="input mt-1" value={bank.bankName} onChange={e => setBank({ ...bank, bankName: e.target.value })} />
            </label>
          </div>
        )}
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Request Withdrawal'}</button>
      </form>
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">₹{Number(value || 0).toFixed(0)}</div>
    </div>
  )
}