'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft, Send, XCircle, MessageSquare,
  User, Shield, Clock, CheckCircle, AlertCircle,
  RefreshCw, Paperclip, Download, Copy, ExternalLink, ArrowUpRight
} from 'lucide-react';
import { getSocket, reconnectSocket } from '@/lib/socket';

export default function SupportTicketDetail() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || '');

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reply, setReply] = useState('');

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const messagesEndRef = useRef(null);

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const load = async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        if (typeof window !== 'undefined') router.push('/login?next=/dashboard/support');
        return;
      }
      const res = await fetch(`${base}/api/support/tickets/${id}`, {
        signal,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Failed to load ticket');
      setTicket(data?.data?.ticket || null);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error(err.message || 'Failed to load ticket');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load and wire socket listeners
  useEffect(() => {
    if (!id || !base) return;
    const controller = new AbortController();
    load(controller.signal);

    const sock = getSocket();
    if (!sock.connected) reconnectSocket();

    const onConnect = () => {
      try { sock.emit('support:join', { ticketId: id }); } catch {}
    };
    const onMessage = (payload) => {
      // payload: { ticketId, reply }
      if (!payload?.ticketId || String(payload.ticketId) !== id) return;
      setTicket((prev) => {
        if (!prev) return prev;
        const replies = Array.isArray(prev.replies) ? [...prev.replies] : [];
        // Avoid duplicates by simple matching on message+timestamp if present
        const exists = replies.some(
          (r) => r.message === payload.reply?.message && r.createdAt === payload.reply?.createdAt
        );
        if (!exists && payload.reply) replies.push(payload.reply);
        return { ...prev, replies, updatedAt: payload.reply?.createdAt || prev.updatedAt };
      });
      scrollToBottom();
    };
    const onStatus = (payload) => {
      // payload: { ticketId, status, updatedAt }
      if (!payload?.ticketId || String(payload.ticketId) !== id) return;
      setTicket((prev) => prev ? ({ ...prev, status: payload.status, updatedAt: payload.updatedAt || prev.updatedAt }) : prev);
      toast.success(`Ticket ${payload.status}`);
    };
    const onError = (err) => {
      console.error('Socket error:', err);
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
      controller.abort();
    };
  }, [id, base]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.replies]);

  const sendReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/support/tickets/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: reply.trim() })
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Failed to send reply');
      // Backend returns updated ticket; prefer that to avoid duplicates
      setTicket(data?.data?.ticket || ticket);
      setReply('');
      toast.success('Message sent');
      scrollToBottom();
    } catch (err) {
      toast.error(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return;
    try {
      setClosing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/support/tickets/${id}/close`, {
        method: 'PATCH',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Failed to close ticket');
      setTicket(data?.data?.ticket || { ...(ticket || {}), status: 'closed' });
      toast.success('Ticket closed successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to close ticket');
    } finally {
      setClosing(false);
    }
  };

  const refreshTicket = () => {
    const controller = new AbortController();
    load(controller.signal);
    toast.success('Ticket refreshed');
  };

  const getStatusIcon = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'closed') return <CheckCircle className="w-4 h-4" />;
    if (s === 'pending' || s === 'under_review') return <Clock className="w-4 h-4" />;
    if (s === 'open') return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'closed') return 'bg-green-100 text-green-600';
    if (s === 'pending' || s === 'under_review') return 'bg-amber-100 text-amber-600';
    if (s === 'open') return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyTicketId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id)
      .then(() => toast.success('Ticket ID copied to clipboard'))
      .catch(() => toast.error('Copy failed'));
  };

  const exportChat = () => {
    if (!ticket) return;
    const payload = {
      id: ticket._id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      message: ticket.message,
      replies: ticket.replies || []
    };
    const dataStr = JSON.stringify(payload, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const filename = `ticket-${String(ticket._id || id).slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    a.click();
  };

  const onTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sending && reply.trim()) sendReply();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/support"
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Support Ticket</h1>
                <p className="text-blue-100 text-sm">Ticket ID: {String(id).substring(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshTicket}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={copyTicketId}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Copy Ticket ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Ticket Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ticket Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Ticket Information
              </h3>

              {loading ? (
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              ) : !ticket ? (
                <div className="text-sm text-gray-600">Ticket not found</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className={`mt-1 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1 ${getStatusColor(ticket?.status)}`}>
                      {getStatusIcon(ticket?.status)}
                      {String(ticket?.status || 'open')[0].toUpperCase() + String(ticket?.status || 'open').slice(1)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Category</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {ticket?.category || 'General'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {ticket?.createdAt ? formatDate(ticket.createdAt) : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Last Updated</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {ticket?.updatedAt ? formatDate(ticket.updatedAt) : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-3">
                {ticket?.status !== 'closed' && (
                  <button
                    onClick={closeTicket}
                    disabled={closing}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {closing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Closing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Close Ticket
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={exportChat}
                  className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Chat
                </button>

                <Link
                  href="/dashboard/support"
                  className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Back to Tickets
                </Link>
              </div>
            </div>

            {/* Attachments (if backend includes them on ticket) */}
            {Array.isArray(ticket?.attachments) && ticket.attachments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-blue-600" />
                  Attachments ({ticket.attachments.length})
                </h3>

                <div className="space-y-2">
                  {ticket.attachments.slice(0, 5).map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="text-sm text-gray-700 truncate">
                        {attachment.name || attachment.url}
                      </div>
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{ticket?.subject || 'Loading...'}</h2>
                    <div className="text-sm text-gray-600 mt-1">
                      Ticket #{String(id).substring(0, 8)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket?.createdAt ? `Created ${formatDate(ticket.createdAt)}` : ''}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded-xl animate-pulse ml-8"></div>
                    <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ) : !ticket ? (
                  <div className="text-center text-sm text-gray-600">Ticket not found</div>
                ) : (
                  <div className="space-y-6">
                    {/* Initial Message */}
                    <MessageBubble
                      by="user"
                      name="You"
                      message={ticket?.message || ''}
                      date={ticket?.createdAt}
                      isInitial={true}
                    />

                    {/* Replies */}
                    {(ticket?.replies || []).map((r, idx) => (
                      <MessageBubble
                        key={`${r.createdAt || idx}-${idx}`}
                        by={r.by}
                        name={r.by === 'admin' ? 'Support Team' : 'You'}
                        message={r.message}
                        date={r.createdAt}
                      />
                    ))}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {ticket?.status !== 'closed' && (
                <div className="p-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Reply
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        placeholder="Type your response here..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={onTextareaKeyDown}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Press Enter to send, Shift+Enter for new line
                      </div>
                      <button
                        onClick={sendReply}
                        disabled={sending || !reply.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {sending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {ticket?.status === 'closed' && (
                <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Ticket Closed</h3>
                    <p className="text-gray-600">
                      This ticket has been resolved and closed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ by, name, message, date, isInitial = false }) {
  const isAdmin = by === 'admin';
  return (
    <div className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${isAdmin ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : 'bg-gradient-to-r from-gray-50 to-gray-100'} border ${isAdmin ? 'border-blue-100' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-gradient-to-br from-blue-500 to-cyan-400' : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}>
            {isAdmin ? (
              <Shield className="w-4 h-4 text-white" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-500">
              {date ? new Date(date).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short'
              }) : ''}
            </div>
          </div>
        </div>

        <div className="whitespace-pre-wrap text-gray-800">
          {message}
        </div>

        {isInitial && (
          <div className="mt-3 pt-3 border-t border-gray-200 border-dashed">
            <div className="text-xs text-gray-500">Initial request</div>
          </div>
        )}
      </div>
    </div>
  );
}