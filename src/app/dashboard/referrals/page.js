'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState('');
  const [referred, setReferred] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [totals, setTotals] = useState({ totalRewards: 0, totalAmount: 0 });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const res = await fetch(`${base}/api/user/referrals`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const js = await res.json();
        if (!res.ok) throw new Error(js?.message || 'Failed to load referrals');
        setLink(js?.data?.referralLink || '');
        setReferred(js?.data?.referred || []);
        setRewards(js?.data?.rewards || []);
        setTotals(js?.data?.totals || { totalRewards: 0, totalAmount: 0 });
      } catch (err) {
        if (err.name !== 'AbortError') toast.error(err.message || 'Error loading');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Referral link copied!');
    } catch { toast.error('Copy failed'); }
  };

  return (
    <main className="min-h-screen space-y-6">
      <h1 className="text-2xl font-semibold">Referrals</h1>

      {loading ? (
        <div className="h-24 skeleton rounded" />
      ) : (
        <>
          <section className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500">Your referral link</div>
            <div className="flex items-center gap-2 mt-2">
              <input className="input flex-1" readOnly value={link} />
              <button className="btn btn-primary" onClick={copy}>Copy</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Stat title="Total Rewards" value={totals.totalRewards} />
              <Stat title="Referral Earnings (₹)" value={Number(totals.totalAmount || 0).toFixed(0)} />
              <Stat title="Referred Users" value={referred.length} />
            </div>
          </section>

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Referred Users</h2>
            {referred.length === 0 ? (
              <div className="text-sm text-gray-600">No referrals yet.</div>
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
                    {referred.map(u => (
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

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Referral Rewards</h2>
            {rewards.length === 0 ? (
              <div className="text-sm text-gray-600">No rewards yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Referred</Th>
                      <Th>Order</Th>
                      <Th className="text-right">Bonus (₹)</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map(r => (
                      <tr key={r._id} className="border-t">
                        <Td>{r.referred?.name || '-'} ({r.referred?.email || '-'})</Td>
                        <Td>{r.transaction?.orderId || '-'}</Td>
                        <Td className="text-right">₹{Number(r.amount || 0).toFixed(0)}</Td>
                        <Td className="capitalize">{r.status || '-'}</Td>
                        <Td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</Td>
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
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{typeof value === 'number' ? Number(value).toLocaleString() : value}</div>
    </div>
  );
}
function Th({ children, className = '' }) { return <th className={`px-3 py-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-3 py-2 align-top ${className}`}>{children}</td> }