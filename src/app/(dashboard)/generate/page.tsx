'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const GENRES = [
  { value: 'thriller', label: 'Thriller', emoji: '🔪' },
  { value: 'romance', label: 'Romance', emoji: '💕' },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙' },
  { value: 'sci-fi', label: 'Sci-Fi', emoji: '🚀' },
  { value: 'mystery', label: 'Mystery', emoji: '🔍' },
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'business', label: 'Business', emoji: '📈' },
  { value: 'self-help', label: 'Self-Help', emoji: '🌟' },
  { value: 'memoir', label: 'Memoir', emoji: '📖' },
  { value: 'christian', label: 'Christian', emoji: '✝️' },
  { value: 'children', label: "Children's", emoji: '🎨' },
  { value: 'literary-fiction', label: 'Literary Fiction', emoji: '📚' },
  { value: 'young-adult', label: 'Young Adult', emoji: '⚡' },
  { value: 'historical-fiction', label: 'Historical Fiction', emoji: '🏛️' },
  { value: 'biography', label: 'Biography', emoji: '👤' },
]

const TRIM_SIZES = [
  { value: '5x8', label: '5" × 8"', popular: false },
  { value: '5.5x8.5', label: '5.5" × 8.5"', popular: true },
  { value: '6x9', label: '6" × 9"', popular: true },
  { value: '6.14x9.21', label: '6.14" × 9.21"', popular: false },
  { value: '7x10', label: '7" × 10"', popular: false },
  { value: '8x10', label: '8" × 10"', popular: false },
  { value: '8.5x11', label: '8.5" × 11"', popular: false },
]

type Step = 1 | 2 | 3 | 4

interface FormData {
  trimSize: string
  pageCount: number
  paperType: string
  coverType: string
  title: string
  subtitle: string
  authorName: string
  genre: string
  prompt: string
  description: string
  authorBio: string
}

const INITIAL: FormData = {
  trimSize: '6x9',
  pageCount: 200,
  paperType: 'black_and_white',
  coverType: 'paperback',
  title: '',
  subtitle: '',
  authorName: '',
  genre: 'thriller',
  prompt: '',
  description: '',
  authorBio: '',
}

export default function GeneratePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  function update(field: keyof FormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pageCount: Number(form.pageCount),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
      setStep(4)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    if (!result?.coverId) return
    setExporting(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverId: result.coverId }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${form.title}-kdp-cover.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Generate Your KDP Cover</h1>
          <p className="text-gray-400">AI-powered, Amazon-compliant, full-wrap in seconds.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3,4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === s ? 'bg-violet-600 text-white' : step > s ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-12 ${step > s ? 'bg-green-600' : 'bg-gray-800'}`} />}
            </div>
          ))}
          <div className="ml-4 text-sm text-gray-400">
            {step === 1 && 'Book specs'}
            {step === 2 && 'Book info'}
            {step === 3 && 'Design prompt'}
            {step === 4 && 'Your cover'}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1 — Book Specs */}
        {step === 1 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">Book Specifications</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Cover Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['paperback', 'hardcover'].map(ct => (
                  <button key={ct} onClick={() => update('coverType', ct)}
                    className={`p-3 rounded-xl border text-sm font-medium capitalize transition
                      ${form.coverType === ct ? 'border-violet-500 bg-violet-900/30 text-violet-300' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}`}>
                    {ct}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Trim Size</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIM_SIZES.map(ts => (
                  <button key={ts.value} onClick={() => update('trimSize', ts.value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition flex items-center justify-between
                      ${form.trimSize === ts.value ? 'border-violet-500 bg-violet-900/30 text-violet-300' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}`}>
                    <span>{ts.label}</span>
                    {ts.popular && <span className="text-xs bg-violet-800 text-violet-200 px-1.5 py-0.5 rounded-full">Popular</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Page Count</label>
                <input type="number" min={24} max={828} value={form.pageCount}
                  onChange={e => update('pageCount', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Interior</label>
                <select value={form.paperType} onChange={e => update('paperType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="black_and_white">Black & White</option>
                  <option value="color">Color</option>
                  <option value="premium_color">Premium Color</option>
                </select>
              </div>
            </div>

            <button onClick={() => setStep(2)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition">
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — Book Info */}
        {step === 2 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Book Information</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Your Book Title"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Subtitle <span className="text-gray-600">(optional)</span></label>
              <input value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="A compelling subtitle"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Author Name *</label>
              <input value={form.authorName} onChange={e => update('authorName', e.target.value)} placeholder="Your Name"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3">Genre *</label>
              <div className="grid grid-cols-3 gap-2">
                {GENRES.map(g => (
                  <button key={g.value} onClick={() => update('genre', g.value)}
                    className={`p-2 rounded-xl border text-xs font-medium transition flex flex-col items-center gap-1
                      ${form.genre === g.value ? 'border-violet-500 bg-violet-900/30 text-violet-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                    <span className="text-lg">{g.emoji}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Back Cover Description <span className="text-gray-600">(optional — AI will generate if empty)</span></label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={4} placeholder="What is your book about? Leave empty for AI to generate."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
                ← Back
              </button>
              <button onClick={() => setStep(3)} disabled={!form.title || !form.authorName}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Design Prompt */}
        {step === 3 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Describe Your Cover</h2>
            <p className="text-gray-400 text-sm">Describe the visual style. Our AI will enhance your prompt for maximum quality.</p>

            <div className="grid grid-cols-1 gap-2 mb-2">
              {[
                'Dark psychological thriller with cinematic red smoke and a lone female silhouette',
                'Epic fantasy with a glowing ancient map, misty mountains, and dramatic golden light',
                'Clean modern business book with bold geometric shapes and deep navy blue',
                'Romantic sunset beach scene with warm golden tones and soft bokeh',
                'Dark horror with abandoned mansion, full moon, and twisted bare trees',
              ].map(example => (
                <button key={example} onClick={() => update('prompt', example)}
                  className="text-left text-xs text-gray-400 hover:text-violet-300 p-2 rounded-lg hover:bg-gray-800 transition border border-transparent hover:border-gray-700">
                  "{example}"
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Prompt *</label>
              <textarea value={form.prompt} onChange={e => update('prompt', e.target.value)}
                rows={5} placeholder="Describe your cover vision in detail..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            {/* Summary */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-sm space-y-1">
              <p className="text-gray-400 font-medium mb-2">Generation Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-500">Title:</div><div className="text-gray-200">{form.title}</div>
                <div className="text-gray-500">Author:</div><div className="text-gray-200">{form.authorName}</div>
                <div className="text-gray-500">Genre:</div><div className="text-gray-200 capitalize">{form.genre}</div>
                <div className="text-gray-500">Trim:</div><div className="text-gray-200">{form.trimSize}"</div>
                <div className="text-gray-500">Pages:</div><div className="text-gray-200">{form.pageCount}</div>
                <div className="text-gray-500">Type:</div><div className="text-gray-200 capitalize">{form.coverType} / {form.paperType.replace(/_/g, ' ')}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
                ← Back
              </button>
              <button onClick={handleGenerate} disabled={loading || !form.prompt}
                className="flex-2 flex-grow-[2] bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : '✨ Generate Cover'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Result */}
        {step === 4 && result && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Your KDP Cover is Ready!</h2>

              {result.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-6 border border-gray-700">
                  <img src={result.imageUrl} alt="Generated cover" className="w-full object-contain max-h-96" />
                </div>
              )}

              {/* KDP Dimensions */}
              {result.dims && (
                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-gray-300 mb-3">KDP Dimensions (Exact)</p>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="text-gray-500">Total Width:</div>
                    <div className="text-green-400 font-mono">{result.dims.totalWidth.toFixed(3)}"</div>
                    <div className="text-gray-500">Total Height:</div>
                    <div className="text-green-400 font-mono">{result.dims.totalHeight.toFixed(3)}"</div>
                    <div className="text-gray-500">Spine Width:</div>
                    <div className="text-green-400 font-mono">{result.dims.spineWidth.toFixed(4)}"</div>
                    <div className="text-gray-500">Bleed:</div>
                    <div className="text-green-400 font-mono">0.125" (all sides)</div>
                    <div className="text-gray-500">Resolution:</div>
                    <div className="text-green-400 font-mono">{result.dims.totalWidthPx} × {result.dims.totalHeightPx} px @ 300 DPI</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleExport} disabled={exporting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                  {exporting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Exporting...</>
                  ) : '⬇ Download KDP PDF'}
                </button>
                <button onClick={() => { setStep(3); setResult(null) }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
                  Regenerate
                </button>
                <button onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
