'use client'

import { useState, useRef } from 'react'
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

const FONT_SCALE_LABELS: Record<string, string> = {
  '0.6': 'Small',
  '0.8': 'Medium-Small',
  '1.0': 'Medium (default)',
  '1.2': 'Large',
  '1.4': 'Extra Large',
}

type Method = 'ai' | 'upload' | 'template'
type TitleStyle = 'bold-sans' | 'serif' | 'serif-italic'
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
  titleFontScale: number
  titleStyle: TitleStyle
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
  titleFontScale: 1.0,
  titleStyle: 'bold-sans',
}

export default function GeneratePage() {
  const router = useRouter()
  const [method, setMethod] = useState<Method | null>(null)
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [exporting, setExporting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadFileName, setUploadFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update(field: keyof FormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPEG and PNG images are supported.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8MB.')
      return
    }
    setError('')
    setUploadFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pageCount: Number(form.pageCount) }),
      })
      let data: any
      try { data = await res.json() } catch { throw new Error('Generation timed out. Please try again.') }
      if (!res.ok) throw new Error(data?.error || 'Generation failed. Please try again.')
      setResult(data)
      setStep(4)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateManual() {
    if (!uploadedImage) { setError('Please upload an image first.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || undefined,
          authorName: form.authorName,
          genre: form.genre,
          description: form.description || undefined,
          authorBio: form.authorBio || undefined,
          trimSize: form.trimSize,
          pageCount: Number(form.pageCount),
          paperType: form.paperType,
          coverType: form.coverType,
          imageBase64: uploadedImage,
        }),
      })
      let data: any
      try { data = await res.json() } catch { throw new Error('Upload timed out. Please try again.') }
      if (!res.ok) throw new Error(data?.error || 'Upload failed. Please try again.')
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
        body: JSON.stringify({
          coverId: result.coverId,
          titleFontScale: form.titleFontScale,
          titleStyle: form.titleStyle,
        }),
      })
      if (!res.ok) {
        let d: any
        try { d = await res.json() } catch { throw new Error('Export timed out. Please try again.') }
        throw new Error(d?.error || 'Export failed. Please try again.')
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

  // ── Method Selection ────────────────────────────────────────────
  if (!method) {
    return (
      <div className="min-h-screen bg-gray-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your KDP Cover</h1>
            <p className="text-gray-400">Choose how you want to create your book cover.</p>
          </div>

          <div className="grid gap-4">
            {/* Method A — AI Generate */}
            <button
              onClick={() => { setMethod('ai'); setStep(1) }}
              className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-violet-500 rounded-2xl p-6 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">✨</div>
                <div>
                  <div className="text-white font-bold text-lg mb-1 group-hover:text-violet-300 transition">AI-Generated Cover</div>
                  <div className="text-gray-400 text-sm">Describe your vision — AI creates the background image. You control the title style, font size, and all text. Best for: authors who want a professional cover fast.</div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-xs bg-violet-900/50 text-violet-300 border border-violet-700 px-2 py-0.5 rounded-full">Free AI image</span>
                    <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">Custom font style</span>
                    <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">Full-wrap PDF</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Method B — Upload Image */}
            <button
              onClick={() => { setMethod('upload'); setStep(1) }}
              className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-2xl p-6 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">🖼️</div>
                <div>
                  <div className="text-white font-bold text-lg mb-1 group-hover:text-blue-300 transition">Upload Your Own Image</div>
                  <div className="text-gray-400 text-sm">Upload your own JPEG or PNG background. The system will add your title, author name, spine text, and back cover — then export a KDP-ready PDF.</div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full">Your own artwork</span>
                    <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">Text overlay added</span>
                    <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">Full-wrap PDF</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Method C — KDP Template */}
            <button
              onClick={() => { setMethod('template'); setStep(1) }}
              className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-green-500 rounded-2xl p-6 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">📐</div>
                <div>
                  <div className="text-white font-bold text-lg mb-1 group-hover:text-green-300 transition">KDP Dimensions Only</div>
                  <div className="text-gray-400 text-sm">Get your exact Amazon KDP cover dimensions — spine width, total size, bleed, and DPI. Use these to design in Canva, Photoshop, or any tool, then upload the finished image above.</div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-xs bg-green-900/50 text-green-300 border border-green-700 px-2 py-0.5 rounded-full">Exact KDP specs</span>
                    <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">No image needed</span>
                    <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">For Canva / PS</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Template Method — just show dimensions ──────────────────────
  if (method === 'template' && step === 1) {
    return (
      <div className="min-h-screen bg-gray-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => setMethod(null)} className="text-gray-500 hover:text-white text-sm">← Back</button>
            <h1 className="text-2xl font-bold text-white">KDP Dimensions Calculator</h1>
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Enter Your Book Specs</h2>

            <div className="grid grid-cols-2 gap-3">
              {TRIM_SIZES.map(ts => (
                <button key={ts.value} onClick={() => update('trimSize', ts.value)}
                  className={`p-3 rounded-xl border text-sm font-medium transition flex items-center justify-between
                    ${form.trimSize === ts.value ? 'border-green-500 bg-green-900/30 text-green-300' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}`}>
                  <span>{ts.label}</span>
                  {ts.popular && <span className="text-xs bg-green-900 text-green-200 px-1.5 py-0.5 rounded-full">Popular</span>}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Page Count</label>
                <input type="number" min={24} max={828} value={form.pageCount}
                  onChange={e => update('pageCount', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Interior</label>
                <select value={form.paperType} onChange={e => update('paperType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500">
                  <option value="black_and_white">Black & White</option>
                  <option value="color">Color</option>
                  <option value="premium_color">Premium Color</option>
                </select>
              </div>
            </div>

            <TemplateDimensions trimSize={form.trimSize} pageCount={form.pageCount} paperType={form.paperType} />

            <button onClick={() => setMethod(null)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
              ← Back to Methods
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalSteps = 4
  const stepLabels = ['Book Specs', 'Book Info & Style', method === 'upload' ? 'Upload Image' : 'Design Prompt', 'Your Cover']

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => { setMethod(null); setStep(1); setResult(null) }} className="text-gray-500 hover:text-white text-sm mb-3 block">
            ← Change method
          </button>
          <h1 className="text-3xl font-bold text-white mb-1">
            {method === 'ai' ? '✨ AI-Generated Cover' : '🖼️ Upload Your Image'}
          </h1>
          <p className="text-gray-400 text-sm">Amazon-compliant full-wrap KDP cover PDF.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {[1,2,3,4].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === s ? 'bg-violet-600 text-white' : step > s ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-10 flex-shrink-0 ${step > s ? 'bg-green-600' : 'bg-gray-800'}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-400 flex-shrink-0">{stepLabels[step - 1]}</div>
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

        {/* STEP 2 — Book Info + Style */}
        {step === 2 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Book Information & Cover Style</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Your Book Title"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Subtitle <span className="text-gray-600">(optional)</span></label>
                <input value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="A compelling subtitle"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Author Name <span className="text-red-400">*</span></label>
                <input value={form.authorName} onChange={e => update('authorName', e.target.value)} placeholder="Your Name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3">Genre <span className="text-red-400">*</span></label>
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

            {/* Back Cover Text */}
            <div className="border-t border-gray-800 pt-4 space-y-4">
              <p className="text-sm font-semibold text-gray-300">Back Cover Text</p>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  About The Book <span className="text-gray-600">(leave empty — AI will write it)</span>
                </label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  rows={4} placeholder="Write your book description here, or leave empty for AI to generate..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  About The Author <span className="text-gray-600">(optional — shows in a separate box on back cover)</span>
                </label>
                <textarea value={form.authorBio} onChange={e => update('authorBio', e.target.value)}
                  rows={3} placeholder="e.g. Jane Smith is a New York Times bestselling author of thrillers. She lives in London."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none" />
              </div>
            </div>

            {/* Cover Style Options */}
            <div className="border-t border-gray-800 pt-4 space-y-4">
              <p className="text-sm font-semibold text-gray-300">Front Cover Style</p>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Title Font Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'bold-sans', label: 'Bold Modern', desc: 'Helvetica — clean, powerful' },
                    { value: 'serif', label: 'Classic Serif', desc: 'Times Bold — traditional' },
                    { value: 'serif-italic', label: 'Elegant Italic', desc: 'Times Bold Italic — literary' },
                  ].map(s => (
                    <button key={s.value} onClick={() => update('titleStyle', s.value)}
                      className={`p-3 rounded-xl border text-left transition
                        ${form.titleStyle === s.value ? 'border-violet-500 bg-violet-900/30' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                      <div className={`text-sm font-semibold mb-0.5 ${form.titleStyle === s.value ? 'text-violet-300' : 'text-gray-300'}`}>{s.label}</div>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Title Size — <span className="text-violet-400">{FONT_SCALE_LABELS[form.titleFontScale.toFixed(1)] ?? form.titleFontScale + '×'}</span>
                </label>
                <input type="range" min="0.6" max="1.4" step="0.2" value={form.titleFontScale}
                  onChange={e => update('titleFontScale', parseFloat(e.target.value))}
                  className="w-full accent-violet-500" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Small</span><span>Medium</span><span>X-Large</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
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

        {/* STEP 3 — AI Prompt or Upload */}
        {step === 3 && method === 'ai' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Describe Your Cover</h2>
            <p className="text-gray-400 text-sm">Describe the visual style. AI enhances your prompt for best results.</p>

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
              <label className="block text-sm text-gray-400 mb-2">Your Prompt <span className="text-red-400">*</span></label>
              <textarea value={form.prompt} onChange={e => update('prompt', e.target.value)}
                rows={5} placeholder="Describe your cover vision in detail..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-sm space-y-1">
              <p className="text-gray-400 font-medium mb-2">Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-500">Title:</div><div className="text-gray-200">{form.title}</div>
                <div className="text-gray-500">Author:</div><div className="text-gray-200">{form.authorName}</div>
                <div className="text-gray-500">Genre:</div><div className="text-gray-200 capitalize">{form.genre}</div>
                <div className="text-gray-500">Trim:</div><div className="text-gray-200">{form.trimSize}"</div>
                <div className="text-gray-500">Pages:</div><div className="text-gray-200">{form.pageCount}</div>
                <div className="text-gray-500">Style:</div><div className="text-gray-200 capitalize">{form.titleStyle} · {FONT_SCALE_LABELS[form.titleFontScale.toFixed(1)]}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
                ← Back
              </button>
              <button onClick={handleGenerate} disabled={loading || !form.prompt}
                className="flex-2 flex-grow-[2] bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                ) : '✨ Generate Cover'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && method === 'upload' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Upload Your Cover Image</h2>
            <p className="text-gray-400 text-sm">
              Upload a full-wrap cover image (front + spine + back in one file). JPEG or PNG, under 8MB.
              The image should be sized for your book — use the KDP Dimensions Calculator if you need exact pixel sizes.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-violet-500 rounded-xl p-8 text-center cursor-pointer transition"
            >
              {uploadedImage ? (
                <div>
                  <img src={uploadedImage} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-3 object-contain" />
                  <p className="text-green-400 text-sm font-medium">{uploadFileName}</p>
                  <p className="text-gray-500 text-xs mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-gray-300 font-medium">Click to select image</p>
                  <p className="text-gray-500 text-sm mt-1">JPEG or PNG · max 8MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileSelect} />

            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-xs space-y-1">
              <p className="text-gray-400 font-medium mb-2">What gets added to your image:</p>
              <div className="text-gray-500 space-y-1">
                <p>• Front: Title ("{form.title}") · Subtitle · Author name ("{form.authorName}")</p>
                <p>• Spine: Title + Author (reads bottom-to-top)</p>
                <p>• Back: About the Book box · About the Author box · Barcode space</p>
                <p>• Trim marks at all 4 corners</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
                ← Back
              </button>
              <button onClick={handleGenerateManual} disabled={loading || !uploadedImage}
                className="flex-2 flex-grow-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                ) : '🖼️ Build Cover PDF'}
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

// ── Inline dimensions calculator for Template method ─────────────────────────
function TemplateDimensions({ trimSize, pageCount, paperType }: { trimSize: string, pageCount: number, paperType: string }) {
  const [width, height] = trimSize.split('x').map(Number)
  if (!width || !height) return null

  const thickness: Record<string, number> = {
    black_and_white: 0.0025,
    color: 0.002347,
    premium_color: 0.002400,
  }
  const spine = pageCount * (thickness[paperType] ?? 0.0025)
  const total_w = width * 2 + spine + 0.25
  const total_h = height + 0.25
  const px_w = Math.round(total_w * 300)
  const px_h = Math.round(total_h * 300)

  return (
    <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4">
      <p className="text-green-400 font-semibold text-sm mb-3">Your KDP Cover Dimensions</p>
      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <div className="text-gray-400">Total Width:</div><div className="text-white font-mono">{total_w.toFixed(3)}"</div>
        <div className="text-gray-400">Total Height:</div><div className="text-white font-mono">{total_h.toFixed(3)}"</div>
        <div className="text-gray-400">Spine Width:</div><div className="text-white font-mono">{spine.toFixed(4)}" ({(spine * 25.4).toFixed(2)} mm)</div>
        <div className="text-gray-400">Front Cover:</div><div className="text-white font-mono">{width}" × {height}"</div>
        <div className="text-gray-400">Bleed (all sides):</div><div className="text-white font-mono">0.125"</div>
        <div className="text-gray-400">Safe Zone:</div><div className="text-white font-mono">0.25" from trim</div>
        <div className="text-gray-400">Required Resolution:</div><div className="text-white font-mono">{px_w} × {px_h} px</div>
        <div className="text-gray-400">DPI:</div><div className="text-white font-mono">300 DPI minimum</div>
      </div>
      <p className="text-gray-500 text-xs mt-3">Use these measurements in Canva, Photoshop, or any design tool. Then upload the finished image using the "Upload Your Own Image" method.</p>
    </div>
  )
}
