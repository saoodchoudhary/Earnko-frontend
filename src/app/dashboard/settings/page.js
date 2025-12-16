'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    payout: { upiId: '', bank: { holderName: '', accountNumber: '', ifsc: '', bankName: '' } }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const [r1, r2] = await Promise.all([
          fetch(`${base}/api/auth/me`, { signal: controller.signal, headers: { Authorization: token ? `Bearer ${token}` : '' } }),
          fetch(`${base}/api/user/profile`, { signal: controller.signal, headers: { Authorization: token ? `Bearer ${token}` : '' } })
        ]);
        const d1 = await r1.json(); const d2 = await r2.json();
        if (r2.ok) setForm({
          name: d2?.data?.profile?.name || d1?.data?.user?.name || '',
          phone: d2?.data?.profile?.phone || '',
          payout: d2?.data?.profile?.payout || { upiId: '', bank: { holderName: '', accountNumber: '', ifsc: '', bankName: '' } }
        });
      } catch {} finally { setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update');
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-20 skeleton rounded" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Settings</h1>
      <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-500">Name</label>
          <input className="input mt-1" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Phone</label>
          <input className="input mt-1" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <div className="text-sm font-medium">Payout Info</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-xs text-gray-500">UPI ID</label>
              <input className="input mt-1" value={form.payout?.upiId || ''} onChange={(e) => setForm(f => ({ ...f, payout: { ...f.payout, upiId: e.target.value } }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Account Holder</label>
              <input className="input mt-1" value={form.payout?.bank?.holderName || ''} onChange={(e) => setForm(f => ({ ...f, payout: { ...f.payout, bank: { ...f.payout.bank, holderName: e.target.value } } }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Account Number</label>
              <input className="input mt-1" value={form.payout?.bank?.accountNumber || ''} onChange={(e) => setForm(f => ({ ...f, payout: { ...f.payout, bank: { ...f.payout.bank, accountNumber: e.target.value } } }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500">IFSC</label>
              <input className="input mt-1" value={form.payout?.bank?.ifsc || ''} onChange={(e) => setForm(f => ({ ...f, payout: { ...f.payout, bank: { ...f.payout.bank, ifsc: e.target.value } } }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Bank Name</label>
              <input className="input mt-1" value={form.payout?.bank?.bankName || ''} onChange={(e) => setForm(f => ({ ...f, payout: { ...f.payout, bank: { ...f.payout.bank, bankName: e.target.value } } }))} />
            </div>
          </div>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}