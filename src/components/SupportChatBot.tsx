'use client'

import { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function SupportChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m the KDP Cover AI support bot. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ticketCreated, setTicketCreated] = useState<string | null>(null)
  const [showTicketBtn, setShowTicketBtn] = useState(false)
  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userMessageCount = messages.filter(m => m.role === 'user').length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    if (userMessageCount >= 3 && !showTicketBtn && !ticketCreated) {
      setShowTicketBtn(true)
    }
  }, [userMessageCount, showTicketBtn, ticketCreated])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const isEscalate = /human|ticket|help me|escalate|create ticket/i.test(text)
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)

    if (isEscalate) {
      setShowTicketBtn(true)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sure! I\'ll help you create a support ticket so a human can assist you. Please enter your email address below.' },
      ])
      setShowEmailInput(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I couldn\'t respond.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  async function createTicket() {
    setLoading(true)
    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createTicket: true,
          email: email || undefined,
          subject: 'Chat support escalation',
          messages,
        }),
      })
      const data = await res.json()
      if (data.ticketId) {
        setTicketCreated(data.ticketId)
        setShowTicketBtn(false)
        setShowEmailInput(false)
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Ticket created! Your ticket ID is ${data.ticketId}. Our team will respond within 24 hours.` },
        ])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to create ticket. Please email support@kdpcoverai.com directly.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 rounded-full shadow-lg shadow-violet-900/50 flex items-center justify-center transition-all"
        aria-label="Support chat"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-violet-600 px-4 py-3 flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">K</div>
            <div>
              <p className="text-white font-semibold text-sm">KDP Cover AI Support</p>
              <p className="text-violet-200 text-xs">AI-powered · Always available</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Ticket creation prompts */}
          {showEmailInput && !ticketCreated && (
            <div className="px-3 py-2 border-t border-gray-800 bg-gray-900/80 shrink-0">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email (optional)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs mb-2 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={createTicket}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition"
              >
                Create Support Ticket
              </button>
            </div>
          )}

          {showTicketBtn && !ticketCreated && !showEmailInput && (
            <div className="px-3 py-2 border-t border-gray-800 shrink-0">
              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 rounded-lg transition"
              >
                Create Support Ticket (Talk to human)
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-800 shrink-0 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-8 h-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-xl flex items-center justify-center transition shrink-0"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
