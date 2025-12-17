'use client'

import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, Send, CheckCircle2 } from 'lucide-react'
import { getSocket, reconnectSocket } from '@/lib/socket'

const STATUS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminSupportDetailPage({ params }) {
  const { id } = React.use(params)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('open')
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const mounted = useRef(false)

  const load = async (signal) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/support/tickets/${id}`, {
        signal, headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load ticket')
      setTicket(data?.data?.ticket || null)
      setStatus((data?.data?.ticket?.status) || 'open')
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message || 'Error loading')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    load(controller.signal)

    const sock = getSocket()
    if (!sock.connected) reconnectSocket()

    const onConnect = () => sock.emit('support:join', { ticketId: id })
    const onMessage = (payload) => {
      if (payload?.ticketId !== id) return
      setTicket((prev) => {
        if (!prev) return prev
        const replies = Array.isArray(prev.replies) ? prev.replies.slice() : []
        replies.push(payload.reply)
        return { ...prev, replies, updatedAt: payload.reply?.createdAt || prev.updatedAt }
      })
    }
    const onStatus = (payload) => {
      if (payload?.ticketId !== id) return
      setTicket((prev) => prev ? ({ ...prev, status: payload.status, updatedAt: payload.updatedAt || prev.updatedAt }) : prev)
      setStatus(payload.status)
    }

    sock.on('connect', onConnect)
    sock.on('support:message', onMessage)
    sock.on('support:status', onStatus)

    return () => {
      sock.off('connect', onConnect)
      sock.off('support:message', onMessage)
      sock.off('support:status', onStatus)
      controller.abort()
      mounted.current = false
    }
  }, [id])

  const postReply = async () => {
    if (!message.trim()) return
    const sock = getSocket()
    if (!sock.connected) reconnectSocket()
    setSaving(true)
    sock.emit('support:message', { ticketId: id, message }, (ack) => {
      setSaving(false)
      if (!ack?.ok) return toast.error(ack?.error || 'Failed')
      setMessage('')
    })
  }

  const updateStatus = async () => {
    const sock = getSocket()
    if (!sock.connected) reconnectSocket()
    setSaving(true)
    sock.emit('support:status', { ticketId: id, status }, (ack) => {
      setSaving(false)
      if (!ack?.ok) return toast.error(ack?.error || 'Failed')
      toast.success('Status updated')
    })
  }

  return (
    <main className="min-h-screen space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={updateStatus} disabled={saving} className="btn btn-outline">
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-24 skeleton rounded" />
      ) : !ticket ? (
        <div>Not found</div>
      ) : (
        <>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold">{ticket.subject}</h1>
                <div className="text-sm text-gray-600 mt-1">
                  {ticket.user?.name || '-'} • {ticket.user?.email || '-'}
                </div>
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
              <MessageBubble by="user" name={ticket.user?.name || 'User'} message={ticket.message} date={ticket.createdAt} />
              {(ticket.replies || []).map((r, idx) => (
                <MessageBubble key={idx} by={r.by} name={r.by === 'admin' ? 'Admin' : (ticket.user?.name || 'User')} message={r.message} date={r.createdAt} />
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium mb-2">Reply as Admin</div>
              <div className="flex items-start gap-2">
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Type your reply..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={postReply} disabled={saving || !message.trim()} className="btn btn-primary inline-flex items-center gap-1">
                  <Send className="w-4 h-4" /> {saving ? 'Sending...' : 'Send'}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <CheckCircle2 className="w-4 h-4" />
                User will see replies instantly.
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

function MessageBubble({ by, name, message, date }) {
  const isAdmin = by === 'admin'
  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[720px] rounded-lg border p-3 ${isAdmin ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="text-xs text-gray-500 mb-1">
          {name} • {new Date(date).toLocaleString()}
        </div>
        <div className="whitespace-pre-wrap text-sm">{message}</div>
      </div>
    </div>
  )
}