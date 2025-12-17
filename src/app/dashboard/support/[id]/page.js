'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Send, XCircle } from 'lucide-react';
import { getSocket, reconnectSocket } from '@/lib/socket';

export default function SupportTicketDetail({ params }) {
  const { id } = React.use(params);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reply, setReply] = useState('');
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const mountedRef = useRef(false);

  const load = async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/support/tickets/${id}`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load ticket');
      setTicket(data?.data?.ticket || null);
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    load(controller.signal);

    const sock = getSocket();
    if (!sock.connected) reconnectSocket();

    const onConnect = () => {
      sock.emit('support:join', { ticketId: id });
    };
    const onMessage = (payload) => {
      if (payload?.ticketId !== id) return;
      setTicket((prev) => {
        if (!prev) return prev;
        const replies = Array.isArray(prev.replies) ? prev.replies.slice() : [];
        replies.push(payload.reply);
        return { ...prev, replies, updatedAt: payload.reply?.createdAt || prev.updatedAt };
      });
    };
    const onStatus = (payload) => {
      if (payload?.ticketId !== id) return;
      setTicket((prev) => prev ? ({ ...prev, status: payload.status, updatedAt: payload.updatedAt || prev.updatedAt }) : prev);
    };
    const onError = (err) => {
      // Optional: show once
      // toast.error(err?.message || 'Socket error');
    };

    sock.on('connect', onConnect);
    sock.on('support:message', onMessage);
    sock.on('support:status', onStatus);
    sock.on('support:error', onError);

    return () => {
      sock.off('connect', onConnect);
      sock.off('support:message', onMessage);
      sock.off('support:status', onStatus);
      sock.off('support:error', onError);
      mountedRef.current = false;
      controller.abort();
    };
  }, [id]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    const sock = getSocket();
    if (!sock.connected) reconnectSocket();
    setSending(true);
    sock.emit('support:message', { ticketId: id, message: reply }, (ack) => {
      setSending(false);
      if (!ack?.ok) {
        toast.error(ack?.error || 'Failed');
        return;
      }
      setReply('');
      // We also get the broadcast event which appends the reply
    });
  };

  const closeTicket = async () => {
    const sock = getSocket();
    if (!sock.connected) reconnectSocket();
    setClosing(true);
    sock.emit('support:status', { ticketId: id, status: 'closed' }, (ack) => {
      setClosing(false);
      if (!ack?.ok) {
        toast.error(ack?.error || 'Failed to close');
        return;
      }
      toast.success('Ticket closed');
      // Broadcast updates ticket state
    });
  };

  return (
    <main className="min-h-screen space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/support" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        {ticket && ticket.status !== 'closed' && (
          <button onClick={closeTicket} disabled={closing} className="btn btn-outline inline-flex items-center gap-1">
            <XCircle className="w-4 h-4" /> {closing ? 'Closing...' : 'Close Ticket'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-24 skeleton rounded" />
      ) : !ticket ? (
        <div>Ticket not found</div>
      ) : (
        <>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold">{ticket.subject}</h1>
                <div className="text-xs text-gray-500 mt-1">
                  Created: {new Date(ticket.createdAt).toLocaleString()} • Updated: {new Date(ticket.updatedAt).toLocaleString()}
                </div>
              </div>
              <span className="px-2 py-0.5 text-xs rounded-full border">
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Conversation</h3>
            <div className="space-y-3">
              <MessageBubble by="user" name="You" message={ticket.message} date={ticket.createdAt} />
              {(ticket.replies || []).map((r, idx) => (
                <MessageBubble key={idx} by={r.by} name={r.by === 'admin' ? 'Admin' : 'You'} message={r.message} date={r.createdAt} />
              ))}
            </div>

            {ticket.status !== 'closed' && (
              <div className="mt-4 border-t pt-4">
                <div className="text-sm font-medium mb-2">Your reply</div>
                <div className="flex items-start gap-2">
                  <textarea
                    className="input w-full"
                    rows={3}
                    placeholder="Type your message..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button onClick={sendReply} disabled={sending || !reply.trim()} className="btn btn-primary inline-flex items-center gap-1">
                    <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function MessageBubble({ by, name, message, date }) {
  const isAdmin = by === 'admin';
  return (
    <div className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[720px] rounded-lg border p-3 ${isAdmin ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="text-xs text-gray-500 mb-1">
          {name} • {new Date(date).toLocaleString()}
        </div>
        <div className="whitespace-pre-wrap text-sm">{message}</div>
      </div>
    </div>
  );
}