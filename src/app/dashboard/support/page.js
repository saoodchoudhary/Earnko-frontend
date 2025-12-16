'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SupportPage() {
  const [items, setItems] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/support/tickets/me`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const d = await res.json();
      if (res.ok) setItems(d?.data?.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ subject, message })
      });
      const d = await res.json();
      if (res.ok) {
        toast.success('Ticket created');
        setSubject('');
        setMessage('');
        await load();
      } else {
        toast.error(d?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Support</h1>

      <form onSubmit={submit} className="bg-white border rounded p-4 space-y-3 max-w-xl">
        <input className="input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <textarea className="input" rows={4} placeholder="Describe your issue" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Ticket'}</button>
      </form>

      <div className="bg-white border rounded p-3">
        <h2 className="font-medium mb-2">My Tickets</h2>
        {loading ? (
          <div className="space-y-2">
            <div className="h-10 skeleton rounded" />
            <div className="h-10 skeleton rounded" />
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(t => (
              <Link key={t._id} href={`/dashboard/support/${t._id}`} className="block border rounded p-2 hover:bg-gray-50">
                <div className="text-sm font-medium">{t.subject}</div>
                <div className="text-xs text-gray-500">
                  {new Date(t.createdAt).toLocaleString()} • {t.status.replace('_', ' ')}
                </div>
              </Link>
            ))}
            {items.length === 0 && <div className="text-sm text-gray-500">No tickets</div>}
          </div>
        )}
      </div>
    </div>
  );
}