'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const BANKS = [
  { value: 'Grey Dollar (Lead Bank)', label: '🇺🇸 Grey Dollar Account — Lead Bank (USD)', currency: 'USD', account: '216113472865', name: 'Samuel Olopade Kehinde' },
  { value: 'OPay Naira', label: '🇳🇬 OPay Account (Naira)', currency: 'NGN', account: '7041389971', name: 'Olopade Samuel Kehinde' },
]

const PLANS = [
  { plan: 'STARTER', usd: 9, ngn: 14000 },
  { plan: 'PRO', usd: 29, ngn: 45000 },
  { plan: 'AGENCY', usd: 79, ngn: 122000 },
]

export default function PaymentProofPage() {
  const [selectedBank, setSelectedBank] = useState(BANKS[0])
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState<{ base64: string; mime: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      setReceipt({ base64, mime: file.type, name: file.name })
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!receipt) { setError('Please upload your payment receipt'); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter the amount you paid')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          currency: selectedBank.currency,
          bankUsed: selectedBank.value,
          receiptBase64: receipt.base64,
          receiptMime: receipt.mime,
          note,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSuccess(data.message)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 border border-green-700/50 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-3">Receipt Submitted!</h2>
          <p className="text-gray-300 text-sm mb-6">{success}</p>
          <p className="text-gray-400 text-xs mb-8">
            Your account will be upgraded within a few hours after we confirm your payment.
            You'll see the change reflected on your dashboard.
          </p>
          <Link href="/dashboard" className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <Link href="/pricing" className="text-gray-400 hover:text-white text-sm">← Back to Pricing</Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">Submit Payment Proof</h1>
          <p className="text-gray-400">
            Transfer to one of the accounts below, then upload your receipt here.
            Your plan will be upgraded automatically based on the amount you paid.
          </p>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {BANKS.map(bank => (
            <div key={bank.value} className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">{bank.label}</div>
              <div className="text-2xl font-mono font-bold text-white tracking-widest mb-1">{bank.account}</div>
              <div className="text-sm text-gray-300">{bank.name}</div>
              <div className="text-xs text-gray-500 mt-1">{bank.value}</div>
            </div>
          ))}
        </div>

        {/* Plan Reference */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-8">
          <p className="text-sm font-semibold text-gray-300 mb-3">Plan Pricing Reference</p>
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map(p => (
              <div key={p.plan} className="text-center">
                <div className="text-xs text-gray-400 mb-1">{p.plan}</div>
                <div className="text-white font-bold">${p.usd}</div>
                <div className="text-gray-400 text-xs">₦{p.ngn.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Upload Your Receipt</h2>

          {/* Bank Used */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Which account did you pay into?</label>
            <div className="grid grid-cols-1 gap-2">
              {BANKS.map(bank => (
                <button
                  key={bank.value}
                  type="button"
                  onClick={() => setSelectedBank(bank)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    selectedBank.value === bank.value
                      ? 'border-violet-500 bg-violet-900/20 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm">{bank.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Amount Paid ({selectedBank.currency})
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-mono">{selectedBank.currency === 'USD' ? '$' : '₦'}</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={selectedBank.currency === 'USD' ? 'e.g. 29' : 'e.g. 45000'}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Receipt / Payment Screenshot</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                receipt ? 'border-green-500 bg-green-900/10' : 'border-gray-600 hover:border-violet-500'
              }`}
            >
              {receipt ? (
                <div>
                  <div className="text-green-400 text-2xl mb-1">📎</div>
                  <p className="text-green-400 font-medium text-sm">{receipt.name}</p>
                  <p className="text-gray-400 text-xs mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <div className="text-gray-400 text-3xl mb-2">📸</div>
                  <p className="text-gray-300 text-sm font-medium">Click to upload receipt</p>
                  <p className="text-gray-500 text-xs mt-1">JPG, PNG — screenshot of your bank transfer</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Any additional info — transaction ID, plan you want, etc."
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? 'Submitting...' : 'Submit Payment Proof'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Your account is upgraded within a few hours after confirmation.
            Questions? Contact us at support@kdpcoverai.site
          </p>
        </form>
      </div>
    </div>
  )
}
