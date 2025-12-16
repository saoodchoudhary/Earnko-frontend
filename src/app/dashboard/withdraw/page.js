'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function WithdrawPage() {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/wallet/me`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (res.ok) setWallet(data?.data?.wallet || null);
      } catch {}
    }
    load();
    return () => controller.abort();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ amount: Number(amount), method, upiId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to request withdrawal');
      toast.success('Withdrawal requested');
      setAmount('');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Withdraw</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="Available Balance" value={wallet?.availableBalance || 0} />
        <Stat title="Confirmed Cashback" value={wallet?.confirmedCashback || 0} />
        <Stat title="Pending Cashback" value={wallet?.pendingCashback || 0} />
        <Stat title="Total Withdrawn" value={wallet?.totalWithdrawn || 0} />
      </div>

      <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-3 max-w-md">
        <div>
          <label className="text-xs text-gray-500">Amount (₹)</label>
          <input className="input mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs text-gray-500">Method</label>
          <select className="input mt-1" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="upi">UPI</option>
            <option value="bank" disabled>Bank (coming soon)</option>
          </select>
        </div>
        {method === 'upi' && (
          <div>
            <label className="text-xs text-gray-500">UPI ID</label>
            <input className="input mt-1" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourupi@bank" />
          </div>
        )}
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Request Withdrawal'}</button>
      </form>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">₹{Number(value || 0).toFixed(0)}</div>
    </div>
  );
}