'use client'

import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { 
  ChevronLeft, Send, CheckCircle2, MessageSquare, User, 
  Calendar, Clock, Tag, AlertCircle, Paperclip, Download,
  RefreshCw, Shield, Mail, Phone, Globe, MoreVertical,
  ArrowUpRight, FileText, Eye, Copy, ExternalLink
} from 'lucide-react'
import { getSocket, reconnectSocket } from '@/lib/socket'

const STATUS = [
  { value: 'open', label: 'Open', color: 'bg-red-100 text-red-600 border-red-200' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-600 border-green-200' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-600 border-gray-200' },
]

export default function AdminSupportDetailPage({ params }) {
  const { id } = React.use(params)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('open')
  const [userDetails, setUserDetails] = useState(null)
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const mounted = useRef(false)
  const messagesEndRef = useRef(null)

  const load = async (signal) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${base}/api/admin/support/tickets/${id}`, {
        signal, headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load ticket')
      const ticketData = data?.data?.ticket || null
      setTicket(ticketData)
      setStatus(ticketData?.status || 'open')
      
      // Load additional user details if available
      if (ticketData?.user?._id) {
        try {
          const userRes = await fetch(`${base}/api/admin/users/${ticketData.user._id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
          })
          if (userRes.ok) {
            const userData = await userRes.json()
            setUserDetails(userData?.data?.user || null)
          }
        } catch (error) {
          console.error('Error loading user details:', error)
        }
      }
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

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.replies])

  const postReply = async () => {
    if (!message.trim()) return
    const sock = getSocket()
    if (!sock.connected) reconnectSocket()
    setSending(true)
    sock.emit('support:message', { ticketId: id, message }, (ack) => {
      setSending(false)
      if (!ack?.ok) return toast.error(ack?.error || 'Failed')
      setMessage('')
      toast.success('Reply sent successfully')
    })
  }

  const updateStatus = async () => {
    const sock = getSocket()
    if (!sock.connected) reconnectSocket()
    setSaving(true)
    sock.emit('support:status', { ticketId: id, status }, (ack) => {
      setSaving(false)
      if (!ack?.ok) return toast.error(ack?.error || 'Failed')
      toast.success('Status updated successfully')
    })
  }

  const refreshTicket = () => {
    const controller = new AbortController()
    load(controller.signal)
  }

  const copyTicketId = () => {
    navigator.clipboard.writeText(id)
    toast.success('Ticket ID copied to clipboard')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin/support" 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Support Ticket</h1>
                <p className="text-gray-600 text-sm mt-1">Manage customer support conversation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refreshTicket}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={copyTicketId}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Copy Ticket ID"
              >
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        ) : !ticket ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Ticket not found</h3>
            <p className="text-gray-600">The requested ticket could not be loaded</p>
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Tickets
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Conversation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Header */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">{ticket.subject}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Tag className="w-3 h-3" />
                            {ticket.category || 'General'}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {formatDate(ticket.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Initial Message:</div>
                      <p className="text-gray-900 whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                      STATUS.find(s => s.value === ticket.status)?.color || 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS.find(s => s.value === ticket.status)?.label || ticket.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-800" />
                    Conversation
                  </h3>
                  <div className="text-sm text-gray-500">
                    {ticket.replies?.length || 0} replies
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {/* Initial Message */}
                  <MessageBubble 
                    by="user" 
                    name={ticket.user?.name || 'User'} 
                    message={ticket.message} 
                    date={ticket.createdAt}
                    isInitial={true}
                  />
                  
                  {/* Replies */}
                  {(ticket.replies || []).map((r, idx) => (
                    <MessageBubble 
                      key={idx} 
                      by={r.by} 
                      name={r.by === 'admin' ? 'Admin' : (ticket.user?.name || 'User')} 
                      message={r.message} 
                      date={r.createdAt}
                    />
                  ))}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-gray-800" />
                    <h4 className="font-medium text-gray-900">Reply as Administrator</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800/30 focus:border-gray-800 resize-none"
                      rows={4}
                      placeholder="Type your response here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={postReply}
                          disabled={sending || !message.trim()}
                          className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {sending ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Paperclip className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        User will see replies instantly
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details & Actions */}
            <div className="space-y-6">
              {/* User Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-800" />
                  User Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-lg font-bold text-gray-800">
                        {ticket.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{ticket.user?.name || 'User'}</div>
                      <div className="text-sm text-gray-500">{ticket.user?.email || 'No email'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{ticket.user?.email || 'Not provided'}</span>
                    </div>
                    
                    {userDetails?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{userDetails.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">User since {new Date(ticket.user?.createdAt || ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/admin/users/${ticket.user?._id}`}
                    className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    View Full Profile
                  </Link>
                </div>
              </div>

              {/* Ticket Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Ticket Actions</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800/30 focus:border-gray-800"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        {STATUS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={updateStatus}
                        disabled={saving}
                        className="px-4 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center">
                      <FileText className="w-5 h-5 text-gray-600 mb-1" />
                      <span className="text-sm font-medium">Export Chat</span>
                    </button>
                    <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center">
                      <Eye className="w-5 h-5 text-gray-600 mb-1" />
                      <span className="text-sm font-medium">View Activity</span>
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Ticket Metadata</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created</span>
                        <span className="font-medium">{formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">{formatDate(ticket.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority</span>
                        <span className="font-medium capitalize">{ticket.priority || 'Normal'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ by, name, message, date, isInitial = false }) {
  const isAdmin = by === 'admin'
  
  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-xl p-4 ${isAdmin ? 'bg-gray-800 text-white' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAdmin ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {isAdmin ? (
                <Shield className="w-3 h-3 text-white" />
              ) : (
                <User className="w-3 h-3 text-gray-600" />
              )}
            </div>
            <span className={`text-sm font-medium ${isAdmin ? 'text-gray-300' : 'text-gray-700'}`}>
              {name} {isAdmin && '(Admin)'}
            </span>
          </div>
          <span className={`text-xs ${isAdmin ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(date).toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        </div>
        
        <div className={`whitespace-pre-wrap ${isAdmin ? 'text-gray-100' : 'text-gray-800'}`}>
          {message}
        </div>
        
        {isInitial && (
          <div className="mt-3 pt-3 border-t border-gray-700/30">
            <div className="text-xs text-gray-400">Initial support request</div>
          </div>
        )}
      </div>
    </div>
  )
}