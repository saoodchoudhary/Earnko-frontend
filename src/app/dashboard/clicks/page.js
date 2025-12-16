'use client';

import { useEffect, useState } from 'react';

export default function MyClicksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/user/clicks`, {
          signal: controller.signal,
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (res.ok) setItems(data?.data?.items || []);
      } catch {} finally { setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Clicks</h1>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Slug</Th>
              <Th>Store</Th>
              <Th>IP</Th>
              <Th>User Agent</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4"><div className="h-10 skeleton rounded" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No clicks</td></tr>
            ) : items.map(c => (
              <tr key={c._id} className="border-t">
                <Td>{c.customSlug || '-'}</Td>
                <Td>{c.store?.name || '-'}</Td>
                <Td>{c.ipAddress || c.ip || '-'}</Td>
                <Td className="max-w-[300px] truncate" title={c.userAgent || ''}>{c.userAgent || '-'}</Td>
                <Td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = '' }) { return <th className={`px-3 py-2 text-left text-xs font-medium text-gray-500 ${className}`}>{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>; }