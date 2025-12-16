'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, Send, CheckCircle2 } from 'lucide-react'

const STATUS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminSupportDetailPage({ params }) {

  const { id } = React.use(params);
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('open')

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''

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
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [id])

  const postReply = async () => {
    if (!message.trim()) return
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/support/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ message })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to reply')
      setMessage('')
      toast.success('Reply sent')
      await load()
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/support/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update status')
      toast.success('Status updated')
      await load()
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSaving(false)
    }
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
              <div className="shrink-0">
                <StatusPill status={ticket.status} />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Conversation</h3>
            <div className="space-y-3">
              <MessageBubble
                by="user"
                name={ticket.user?.name || 'User'}
                message={ticket.message}
                date={ticket.createdAt}
              />
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
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <CheckCircle2 className="w-4 h-4" />
                Customer will be notified when you reply.
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

function StatusPill({ status }) {
  const map = {
    open: 'bg-sky-50 text-sky-700 border-sky-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-gray-50 text-gray-700 border-gray-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{status}</span>
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