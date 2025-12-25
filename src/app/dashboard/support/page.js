'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  MessageSquare, HelpCircle, FileText, Clock,
  CheckCircle, AlertCircle, Send, Plus,
  Search, Filter, RefreshCw, Calendar,
  User, Tag, ArrowUpRight, Phone, Mail
} from 'lucide-react';

export default function SupportPage() {
  const [items, setItems] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [faqs, setFaqs] = useState([
    { question: 'How long does withdrawal take?', answer: 'Withdrawals are processed within 24-48 hours.' },
    { question: 'How do I generate affiliate links?', answer: 'Go to Create Link page and paste any product URL.' },
    { question: 'When are commissions credited?', answer: 'Commissions are credited after 30 days of conversion.' },
    { question: 'What is the minimum withdrawal amount?', answer: 'Minimum withdrawal amount is ₹500.' }
  ]);

  const loadTickets = async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/support/tickets/me`, {
        signal,
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const d = await res.json();
      if (res.ok) setItems(d?.data?.items || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadTickets(controller.signal);
    return () => controller.abort();
  }, []);

  const submitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/support/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ 
          subject: subject.trim(), 
          message: message.trim(),
          category: 'general'
        })
      });
      
      const d = await res.json();
      if (res.ok) {
        toast.success('Support ticket created successfully!');
        setSubject('');
        setMessage('');
        await loadTickets();
      } else {
        toast.error(d?.message || 'Failed to create ticket');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const refreshTickets = () => {
    const controller = new AbortController();
    loadTickets(controller.signal);
  };

  const filteredTickets = items.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'open') return matchesSearch && ticket.status === 'open';
    if (activeFilter === 'closed') return matchesSearch && ticket.status === 'closed';
    if (activeFilter === 'pending') return matchesSearch && ticket.status === 'pending';
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-600';
      case 'closed': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-3 h-3" />;
      case 'closed': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Support Center</h1>
                <p className="text-blue-100 mt-1">Get help with your account and earnings</p>
              </div>
            </div>
            <button
              onClick={refreshTickets}
              className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Create Ticket & FAQs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Ticket Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Create New Ticket</h2>
                  <p className="text-gray-600 text-sm mt-1">Describe your issue in detail</p>
                </div>
              </div>

              <form onSubmit={submitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What is your issue about?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                    placeholder="Please describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Our team typically responds within 24 hours
                  </div>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Create Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
                  <p className="text-gray-600 text-sm mt-1">Quick answers to common questions</p>
                </div>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{faq.question}</h3>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tickets & Contact */}
          <div className="space-y-6">
            {/* My Tickets */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    My Tickets
                  </h2>
                  <div className="text-xs text-gray-500">
                    {filteredTickets.length} of {items.length}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search tickets..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Tickets List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Tickets Found</h3>
                    <p className="text-gray-600 text-sm">
                      {searchQuery || activeFilter !== 'all' 
                        ? 'No tickets match your search' 
                        : 'You haven\'t created any tickets yet'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <Link
                        key={ticket._id}
                        href={`/dashboard/support/${ticket._id}`}
                        className="block p-4 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                              {ticket.subject}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {ticket.message?.substring(0, 60)}...
                            </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {ticket.category}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone Support</div>
                    <div className="text-sm text-gray-600">+91 98765 43210</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email Support</div>
                    <div className="text-sm text-gray-600">support@earnko.com</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Response Time</div>
                    <div className="text-sm text-gray-600">Within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Tips</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Be Specific</div>
                    <div className="text-xs text-gray-600">Provide detailed information about your issue</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Include Screenshots</div>
                    <div className="text-xs text-gray-600">Add screenshots when creating tickets</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Check FAQs First</div>
                    <div className="text-xs text-gray-600">Many questions are answered in FAQs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}