'use client'

import { useEffect, useState } from 'react'

type Code = {
  id: string; code: string; description: string | null; discountPct: number
  maxUses: number | null; usedCount: number; planRestriction: string | null
  expiresAt: string | null; isActive: boolean; createdAt: string
  _count: { redemptions: number }
}

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', description: '', discountPct: '20', maxUses: '', planRestriction: '', expiresAt: '' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')
  const [aiContext, setAiContext] = useState('')
  const [aiExpiry, setAiExpiry] = useState('24')
  const [aiPct, setAiPct] = useState('20')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMsg, setAiMsg] = useState('')

  async function load() {
    const res = await fetch('/api/admin/discounts')
    if (res.ok) setCodes(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create() {
    setCreating(true); setMsg('')
    const res = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code, description: form.description || null,
        discountPct: Number(form.discountPct), maxUses: form.maxUses ? Number(form.maxUses) : null,
        planRestriction: form.planRestriction || null, expiresAt: form.expiresAt || null,
      }),
    })
    if (res.ok) { setMsg('Code created!'); setForm({ code: '', description: '', discountPct: '20', maxUses: '', planRestriction: '', expiresAt: '' }); load() }
    else { const d = await res.json(); setMsg(d.error || 'Failed') }
    setCreating(false)
  }

  async function generateAI() {
    setAiLoading(true); setAiMsg('')
    const res = await fetch('/api/admin/discounts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: aiContext, discountPct: Number(aiPct), expiresInHours: aiExpiry ? Number(aiExpiry) : null }),
    })
    const data = await res.json()
    if (res.ok) { setAiMsg(`✓ Created "${data.code}" — expires in ${aiExpiry}h`); load() }
    else setAiMsg(data.error || 'Failed')
    setAiLoading(false)
  }

  async function deactivate(id: string) {
    await fetch('/api/admin/discounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  return (
    <div className="flex-1 py-8 px-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">Discount Codes</h1>

      {/* AI Generator */}
      <div className="bg-gray-900 border border-violet-700/40 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-1">🤖 AI Code Generator</h2>
        <p className="text-xs text-gray-500 mb-4">AI creates the code name, auto-deactivates at your set time</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Context / reason</label>
            <input value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder="e.g. Black Friday, launch..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">% Discount</label>
            <input value={aiPct} onChange={e => setAiPct(e.target.value)} placeholder="20" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Auto-expire in (hours)</label>
            <input value={aiExpiry} onChange={e => setAiExpiry(e.target.value)} placeholder="24" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
          </div>
          <div className="flex items-end">
            <button onClick={generateAI} disabled={aiLoading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-xl text-sm transition">
              {aiLoading ? '✨ Generating…' : '✨ Generate Code'}
            </button>
          </div>
        </div>
        {aiMsg && <p className={`text-xs mt-3 ${aiMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{aiMsg}</p>}
      </div>

      {/* Create form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">Create New Code</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'code', label: 'Code', placeholder: 'LAUNCH20' },
            { key: 'description', label: 'Description', placeholder: 'Launch discount' },
            { key: 'discountPct', label: '% Discount', placeholder: '20' },
            { key: 'maxUses', label: 'Max Uses (blank=∞)', placeholder: '100' },
            { key: 'expiresAt', label: 'Expires (blank=never)', placeholder: '' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
              <input
                type={f.key === 'expiresAt' ? 'date' : 'text'}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: f.key === 'code' ? e.target.value.toUpperCase() : e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Plan Restriction</label>
            <select
              value={form.planRestriction}
              onChange={e => setForm(prev => ({ ...prev, planRestriction: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="">Any plan</option>
              <option value="STARTER">Starter only</option>
              <option value="PRO">Pro only</option>
              <option value="AGENCY">Agency only</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={create}
            disabled={creating || !form.code || !form.discountPct}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold px-5 py-2 rounded-xl text-sm transition"
          >
            {creating ? 'Creating…' : '+ Create Code'}
          </button>
          {msg && <p className={`text-sm ${msg.includes('!') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
        </div>
      </div>

      {/* Codes list */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="text-sm font-semibold text-white">{codes.length} Active Codes</p>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading…</div>
        ) : codes.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No discount codes yet</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {codes.map(c => (
              <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-white font-bold">{c.code}</span>
                    <span className="text-green-400 text-sm font-semibold">{c.discountPct}% off</span>
                    {c.planRestriction && <span className="text-xs bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded-full">{c.planRestriction}</span>}
                    {!c.isActive && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  {c.description && <p className="text-gray-400 text-xs mt-0.5">{c.description}</p>}
                  <p className="text-gray-600 text-xs mt-1">
                    Used {c.usedCount}/{c.maxUses ?? '∞'} times
                    {c.expiresAt && ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
                {c.isActive && (
                  <button
                    onClick={() => deactivate(c.id)}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-800/50 px-3 py-1.5 rounded-lg transition flex-shrink-0"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
