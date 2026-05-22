'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type SupportMessage = {
  id: string
  sender: string
  content: string
  createdAt: string
}

type Ticket = {
  id: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: string
  messages: SupportMessage[]
  userInfo: { email: string; name: string | null; plan: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-yellow-900/50 text-yellow-400',
  IN_PROGRESS: 'bg-blue-900/50 text-blue-400',
  RESOLVED: 'bg-green-900/50 text-green-400',
  CLOSED: 'bg-gray-800 text-gray-500',
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [replyText, setReplyText] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('ALL')

  async function load() {
    setLoading(true)
    try {
      const url = filter !== 'ALL' ? `/api/admin/support?status=${filter}` : '/api/admin/support'
      const res = await fetch(url)
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function sendReply() {
    if (!selected) return
    setSending(true)
    try {
      await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selected.id,
          content: replyText || undefined,
          status: newStatus || undefined,
        }),
      })
      setReplyText('')
      setNewStatus('')
      await load()
      // Refresh selected
      const refreshed = tickets.find(t => t.id === selected.id)
      if (refreshed) setSelected(refreshed)
    } catch {}
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
        <h1 className="text-white font-bold">Support Tickets</h1>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Left: ticket list */}
        <div className="w-80 shrink-0">
          {/* Filter */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                  filter === s ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => { setSelected(ticket); setNewStatus(ticket.status) }}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selected?.id === ticket.id
                      ? 'border-violet-500 bg-violet-900/20'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-semibold truncate max-w-[160px]">{ticket.subject}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                      {ticket.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{ticket.email}</p>
                  <p className="text-gray-600 text-xs mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </button>
              ))}
              {tickets.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No tickets found.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: ticket detail */}
        {selected ? (
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{selected.subject}</h2>
                <p className="text-gray-500 text-xs mt-0.5">{selected.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[selected.status]}`}>
                {selected.status.replace('_', ' ')}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {/* Original message */}
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">User · {new Date(selected.createdAt).toLocaleString()}</p>
                <p className="text-gray-200 text-sm">{selected.message}</p>
              </div>

              {/* Thread messages */}
              {selected.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3 ${
                    msg.sender === 'admin' ? 'bg-violet-900/30 border border-violet-800/40' :
                    msg.sender === 'ai' ? 'bg-blue-900/20 border border-blue-800/30' :
                    'bg-gray-800'
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1 capitalize">{msg.sender} · {new Date(msg.createdAt).toLocaleString()}</p>
                  <p className="text-gray-200 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Reply area */}
            <div className="px-5 py-4 border-t border-gray-800 space-y-3">
              <div className="flex gap-2 items-center">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500"
                >
                  <option value="">Keep status</option>
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                <span className="text-gray-600 text-xs">Change ticket status</span>
              </div>

              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
              />

              <button
                onClick={sendReply}
                disabled={sending || (!replyText.trim() && !newStatus)}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a ticket to view
          </div>
        )}
      </div>
    </div>
  )
}
