'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  '0.6': 'Small', '0.8': 'Medium-Small', '1.0': 'Medium (default)', '1.2': 'Large', '1.4': 'Extra Large',
}

type Method = 'ai' | 'upload' | 'kdp'
type TitleStyle = 'bold-sans' | 'serif' | 'serif-italic' | 'sans-oblique' | 'courier-bold' | 'serif-light'

interface FormData {
  trimSize: string; pageCount: number; paperType: string; coverType: string
  title: string; subtitle: string; authorName: string; genre: string
  prompt: string; description: string; authorBio: string; reviewQuote: string; reviewAttribution: string
  titleFontScale: number; titleStyle: TitleStyle
  spineWidthOverride: string  // for Method 3 — exact spine from Amazon KDP
}

const INITIAL: FormData = {
  trimSize: '6x9', pageCount: 200, paperType: 'black_and_white', coverType: 'paperback',
  title: '', subtitle: '', authorName: '', genre: 'thriller',
  prompt: '', description: '', authorBio: '', reviewQuote: '', reviewAttribution: '',
  titleFontScale: 1.0, titleStyle: 'bold-sans',
  spineWidthOverride: '',
}

function inp(cls = '') {
  return `w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 ${cls}`
}

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromCoverId = searchParams.get('from')
  const [method, setMethod] = useState<Method | null>(null)
  // Method 3 sub-step: 'specs' | 'design-choice' | 'design'
  const [kdpSubStep, setKdpSubStep] = useState<'specs' | 'design-choice' | 'design'>('specs')
  const [kdpDesign, setKdpDesign] = useState<'ai' | 'upload' | null>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadFileName, setUploadFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export extras (entered on result screen)
  const [isbn, setIsbn] = useState('')
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null)
  const [barcodeFileName, setBarcodeFileName] = useState('')
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Pre-fill from an existing cover when ?from=coverId
  useEffect(() => {
    if (!fromCoverId) return
    fetch(`/api/covers/${fromCoverId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.cover) {
          const c = data.cover
          setForm(prev => ({
            ...prev,
            trimSize:    c.trimSize    ?? prev.trimSize,
            pageCount:   c.pageCount   ?? prev.pageCount,
            paperType:   c.paperType   ?? prev.paperType,
            coverType:   c.coverType   ?? prev.coverType,
            title:       c.title       ?? prev.title,
            subtitle:    c.subtitle    ?? prev.subtitle,
            authorName:  c.authorName  ?? prev.authorName,
            genre:       c.genre       ?? prev.genre,
            prompt:      c.prompt      ?? prev.prompt,
            description: c.description ?? prev.description,
            authorBio:   c.authorBio   ?? prev.authorBio,
            reviewQuote: c.reviewQuote ?? prev.reviewQuote,
          }))
          // Start at step 1, method AI so user sees it pre-filled
          setMethod('ai')
          setStep(1)
        }
      })
      .catch(() => {})
  }, [fromCoverId])

  function update(field: keyof FormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Only JPEG/PNG supported.'); return }
    if (file.size > 8 * 1024 * 1024) { setError('Image must be under 8MB.'); return }
    setError('')
    setUploadFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => setUploadedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleBarcodeSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Barcode must be JPEG or PNG.'); return }
    setError('')
    setBarcodeFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => setBarcodeImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleGenerateAI() {
    setLoading(true); setError('')
    try {
      const spineOverride = form.spineWidthOverride ? parseFloat(form.spineWidthOverride) : undefined
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pageCount: Number(form.pageCount), spineWidthOverride: spineOverride,
          reviewQuote: form.reviewQuote || undefined, reviewAttribution: form.reviewAttribution || undefined }),
      })
      let data: any
      try { data = await res.json() } catch { throw new Error('Generation timed out. Please try again.') }
      if (!res.ok) throw new Error(data?.error || 'Generation failed.')
      setResult(data); setStep(99)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleGenerateUpload() {
    if (!uploadedImage) { setError('Please upload an image first.'); return }
    setLoading(true); setError('')
    try {
      const spineOverride = form.spineWidthOverride ? parseFloat(form.spineWidthOverride) : undefined
      const res = await fetch('/api/generate-manual', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title, subtitle: form.subtitle || undefined,
          authorName: form.authorName, genre: form.genre,
          description: form.description || undefined, authorBio: form.authorBio || undefined,
          trimSize: form.trimSize, pageCount: Number(form.pageCount),
          paperType: form.paperType, coverType: form.coverType,
          imageBase64: uploadedImage, spineWidthOverride: spineOverride,
          reviewQuote: form.reviewQuote || undefined, reviewAttribution: form.reviewAttribution || undefined,
        }),
      })
      let data: any
      try { data = await res.json() } catch { throw new Error('Upload timed out. Please try again.') }
      if (!res.ok) throw new Error(data?.error || 'Upload failed.')
      setResult(data); setStep(99)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleExport() {
    if (!result?.coverId) return
    setExporting(true); setError('')
    try {
      const spineOverride = form.spineWidthOverride ? parseFloat(form.spineWidthOverride) : undefined
      const res = await fetch('/api/export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverId: result.coverId,
          titleFontScale: form.titleFontScale, titleStyle: form.titleStyle,
          isbn: isbn || undefined,
          barcodeImageBase64: barcodeImage || undefined,
          spineWidthOverride: spineOverride,
          reviewQuote: form.reviewQuote || undefined,
          reviewAttribution: form.reviewAttribution || undefined,
        }),
      })
      if (!res.ok) {
        let d: any
        try { d = await res.json() } catch { throw new Error('Export timed out.') }
        throw new Error(d?.error || 'Export failed.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `${form.title || 'cover'}-kdp-cover.pdf`
      a.click(); URL.revokeObjectURL(url)
    } catch (e: any) { setError(e.message) }
    finally { setExporting(false) }
  }

  function resetAll() { setMethod(null); setStep(1); setResult(null); setKdpSubStep('specs'); setKdpDesign(null); setUploadedImage(null); setUploadFileName(''); setIsbn(''); setBarcodeImage(null); setBarcodeFileName(''); setError('') }

  // ── METHOD SELECTION ────────────────────────────────────────────
  if (!method) {
    return (
      <div className="min-h-screen bg-gray-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your KDP Cover</h1>
          <p className="text-gray-400 mb-8">Choose how you want to create your book cover.</p>

          <div className="grid gap-4">
            <MethodCard
              emoji="✨" color="violet"
              title="AI-Generated Cover"
              desc="Describe your vision — AI creates the background image, then the system adds your title, author name, spine, and back cover text."
              tags={['Free AI image', 'Custom style', 'Full-wrap PDF']}
              onClick={() => { setMethod('ai'); setStep(1) }}
            />
            <MethodCard
              emoji="🖼️" color="blue"
              title="Upload Your Own Image"
              desc="Upload your own JPEG or PNG background. The system adds your title, spine text, and full back cover — then exports a KDP-ready PDF."
              tags={['Your artwork', 'Text overlay', 'Full-wrap PDF']}
              onClick={() => { setMethod('upload'); setStep(1) }}
            />
            <MethodCard
              emoji="📐" color="green"
              title="Amazon KDP Template"
              desc="Download the official Amazon KDP cover template for your book, enter the exact spine width it gives you, then choose AI or upload for your design. Most accurate dimensions."
              tags={['Amazon KDP template', 'Exact spine width', 'AI or Upload design']}
              onClick={() => { setMethod('kdp'); setKdpSubStep('specs') }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── METHOD 3: AMAZON KDP TEMPLATE ──────────────────────────────
  if (method === 'kdp') {
    return (
      <div className="min-h-screen bg-gray-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={resetAll} className="text-gray-500 hover:text-white text-sm mb-4 block">← Back to methods</button>
          <h1 className="text-2xl font-bold text-white mb-6">📐 Amazon KDP Template</h1>

          {error && <div className="mb-4 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{error}</div>}

          {/* Step A: Get Amazon template + enter spine */}
          {kdpSubStep === 'specs' && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 text-sm space-y-3">
                <p className="text-blue-300 font-bold">Step 1 — Get your spine width from Amazon KDP</p>
                <ol className="list-decimal list-inside text-gray-300 space-y-1.5">
                  <li>Go to <span className="text-blue-400 font-mono">kdp.amazon.com</span> → sign in → click <strong>Bookshelf</strong></li>
                  <li>Click <strong>+ Paperback</strong> → scroll to <strong>Cover</strong> section</li>
                  <li>Click <strong>"Launch Cover Creator"</strong> → then click <strong>"Use a different tool"</strong></li>
                  <li>Use the <strong>Cover Calculator</strong> — enter your trim size and page count</li>
                  <li>Note the <strong>spine width</strong> (e.g. <span className="text-green-400 font-mono">0.8125"</span>)</li>
                  <li>Download the <strong>PDF template</strong> — it shows all exact dimensions</li>
                </ol>
                <p className="text-gray-400 text-xs">Or use our calculator as a guide — it uses the same Amazon formula.</p>
              </div>

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
                    onChange={e => update('pageCount', parseInt(e.target.value))} className={inp()} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Interior</label>
                  <select value={form.paperType} onChange={e => update('paperType', e.target.value)} className={inp()}>
                    <option value="black_and_white">Black & White</option>
                    <option value="color">Color</option>
                    <option value="premium_color">Premium Color</option>
                  </select>
                </div>
              </div>

              <KDPCalc trimSize={form.trimSize} pageCount={form.pageCount} paperType={form.paperType} />

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Exact Spine Width from Amazon KDP <span className="text-green-400 text-xs">(enter the number Amazon gives you)</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input type="number" step="0.0001" min="0.06" max="3"
                    value={form.spineWidthOverride}
                    onChange={e => update('spineWidthOverride', e.target.value)}
                    placeholder="e.g. 0.8125"
                    className={inp('flex-1')} />
                  <span className="text-gray-400 text-sm">inches</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Leave empty to use our calculator's value</p>
              </div>

              <button onClick={() => setKdpSubStep('design-choice')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition">
                Continue → Choose Design Method
              </button>
            </div>
          )}

          {/* Step B: Choose AI or Upload */}
          {kdpSubStep === 'design-choice' && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Choose Your Cover Design</h2>
              <p className="text-gray-400 text-sm">How do you want the cover image to be created?</p>

              <button onClick={() => { setKdpDesign('ai'); setKdpSubStep('design'); setStep(2) }}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-violet-500 rounded-xl p-5 transition group">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-white font-semibold group-hover:text-violet-300">AI Creates the Background</div>
                <div className="text-gray-400 text-sm mt-1">Describe your cover vision — AI generates the image using your Amazon KDP exact spine width.</div>
              </button>

              <button onClick={() => { setKdpDesign('upload'); setKdpSubStep('design'); setStep(2) }}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-5 transition group">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-white font-semibold group-hover:text-blue-300">I Upload My Own Image</div>
                <div className="text-gray-400 text-sm mt-1">Upload your designed cover image (sized to Amazon's template dimensions) — system adds all text.</div>
              </button>

              <button onClick={() => setKdpSubStep('specs')} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-2 rounded-xl text-sm transition">
                ← Back
              </button>
            </div>
          )}

          {/* Step C onwards: reuse main steps */}
          {kdpSubStep === 'design' && renderMainSteps()}
        </div>
      </div>
    )
  }

  function renderMainSteps() {
    const isUploadMode = method === 'upload' || kdpDesign === 'upload'
    const isAIMode = method === 'ai' || kdpDesign === 'ai'

    return (
      <div className="space-y-4">
        {error && <div className="mb-4 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{error}</div>}

        {/* Result screen — works for ALL methods including Method 3 */}
        {step === 99 && result && renderResult()}

        {step === 2 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Book Information & Style</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Your Book Title" className={inp()} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subtitle <span className="text-gray-600">(optional)</span></label>
                <input value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="A compelling subtitle" className={inp()} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Author Name <span className="text-red-400">*</span></label>
                <input value={form.authorName} onChange={e => update('authorName', e.target.value)} placeholder="Your Name" className={inp()} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3">Genre <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {GENRES.map(g => (
                  <button key={g.value} onClick={() => update('genre', g.value)}
                    className={`p-2 rounded-xl border text-xs font-medium transition flex flex-col items-center gap-1
                      ${form.genre === g.value ? 'border-violet-500 bg-violet-900/30 text-violet-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                    <span className="text-lg">{g.emoji}</span><span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-4">
              <p className="text-sm font-semibold text-gray-300">Back Cover Text</p>
              <div>
                <label className="block text-sm text-gray-400 mb-2">About The Book <span className="text-gray-600">(leave empty — AI writes it)</span></label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  rows={4} placeholder="Write your book description, or leave empty for AI to generate..."
                  className={inp('resize-none')} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">About The Author <span className="text-gray-600">(optional)</span></label>
                <textarea value={form.authorBio} onChange={e => update('authorBio', e.target.value)}
                  rows={3} placeholder="e.g. Jane Smith is a New York Times bestselling thriller author. She lives in London with her family."
                  className={inp('resize-none')} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Review Quote <span className="text-gray-600">(optional — appears on back cover)</span></label>
                <textarea value={form.reviewQuote} onChange={e => update('reviewQuote', e.target.value)}
                  rows={2} placeholder='e.g. "A masterpiece of suspense that kept me up all night."'
                  className={inp('resize-none')} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Quote Attribution <span className="text-gray-600">(optional — who said it)</span></label>
                <input value={form.reviewAttribution} onChange={e => update('reviewAttribution', e.target.value)}
                  placeholder="e.g. — Publishers Weekly"
                  className={inp()} />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-4">
              <p className="text-sm font-semibold text-gray-300">Front Cover Style</p>
              <div>
                <label className="block text-sm text-gray-400 mb-3">Title Font Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'bold-sans',    label: 'Bold Modern',     desc: 'Helvetica Bold — clean, powerful' },
                    { value: 'serif',        label: 'Classic Serif',   desc: 'Times Roman Bold — traditional' },
                    { value: 'serif-italic', label: 'Elegant Italic',  desc: 'Times Bold Italic — literary' },
                    { value: 'serif-light',  label: 'Serif Light',     desc: 'Times Italic — soft & refined' },
                    { value: 'sans-oblique', label: 'Modern Slanted',  desc: 'Helvetica Oblique — dynamic' },
                    { value: 'courier-bold', label: 'Typewriter',      desc: 'Courier Bold — retro, gritty' },
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
                  Title Size — <span className="text-violet-400">{FONT_SCALE_LABELS[form.titleFontScale.toFixed(1)] ?? `${form.titleFontScale}×`}</span>
                </label>
                <input type="range" min="0.6" max="1.4" step="0.2" value={form.titleFontScale}
                  onChange={e => update('titleFontScale', parseFloat(e.target.value))} className="w-full accent-violet-500" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Small</span><span>Medium</span><span>X-Large</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { if (method === 'kdp') setKdpSubStep('design-choice'); else setStep(1) }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">← Back</button>
              <button onClick={() => setStep(3)} disabled={!form.title || !form.authorName}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && isAIMode && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Describe Your Cover</h2>
            <p className="text-gray-400 text-sm">Describe the visual style — AI enhances and generates the background image.</p>

            <div className="space-y-1 mb-2">
              {[
                'Dark psychological thriller with cinematic red smoke and a lone female silhouette',
                'Epic fantasy with a glowing ancient map, misty mountains, and dramatic golden light',
                'Clean modern business book with bold geometric shapes and deep navy blue',
                'Romantic sunset beach scene with warm golden tones and soft bokeh',
                'Dark horror with abandoned mansion, full moon, and twisted bare trees',
              ].map(ex => (
                <button key={ex} onClick={() => update('prompt', ex)}
                  className="w-full text-left text-xs text-gray-400 hover:text-violet-300 p-2 rounded-lg hover:bg-gray-800 transition border border-transparent hover:border-gray-700">
                  "{ex}"
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Prompt <span className="text-red-400">*</span></label>
              <textarea value={form.prompt} onChange={e => update('prompt', e.target.value)}
                rows={5} placeholder="Describe your cover vision in detail..."
                className={inp('resize-none')} />
            </div>

            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-xs space-y-1">
              <p className="text-gray-400 font-medium mb-2">Summary</p>
              <div className="grid grid-cols-2 gap-1.5">
                <span className="text-gray-500">Title:</span><span className="text-gray-200">{form.title}</span>
                <span className="text-gray-500">Author:</span><span className="text-gray-200">{form.authorName}</span>
                <span className="text-gray-500">Genre:</span><span className="text-gray-200 capitalize">{form.genre}</span>
                <span className="text-gray-500">Trim:</span><span className="text-gray-200">{form.trimSize}"</span>
                <span className="text-gray-500">Pages:</span><span className="text-gray-200">{form.pageCount}</span>
                {form.spineWidthOverride && <><span className="text-gray-500">Spine override:</span><span className="text-green-400">{form.spineWidthOverride}"</span></>}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">← Back</button>
              <button onClick={handleGenerateAI} disabled={loading || !form.prompt}
                className="flex-[2] bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? <><Spinner />Generating...</> : '✨ Generate Cover'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && isUploadMode && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Upload Your Cover Image</h2>
            <p className="text-gray-400 text-sm">Upload a full-wrap cover image (JPEG or PNG, under 8MB). The system adds all text overlays.</p>

            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-violet-500 rounded-xl p-8 text-center cursor-pointer transition">
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
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleImageSelect} />

            {form.spineWidthOverride && (
              <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-3 text-xs text-green-300">
                Using Amazon KDP spine width: <strong>{form.spineWidthOverride}"</strong> — make sure your image was designed to this exact width.
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">← Back</button>
              <button onClick={handleGenerateUpload} disabled={loading || !uploadedImage}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? <><Spinner />Processing...</> : '🖼️ Build Cover PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── METHODS 1 & 2 — standard step flow ─────────────────────────
  const isUploadMode = method === 'upload'

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={resetAll} className="text-gray-500 hover:text-white text-sm mb-3 block">← Change method</button>
        <h1 className="text-3xl font-bold text-white mb-1">
          {method === 'ai' ? '✨ AI-Generated Cover' : '🖼️ Upload Your Image'}
        </h1>
        <p className="text-gray-400 text-sm mb-6">Amazon-compliant full-wrap KDP cover PDF.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === s ? 'bg-violet-600 text-white' : step > s ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-12 ${step > s ? 'bg-green-600' : 'bg-gray-800'}`} />}
            </div>
          ))}
          <div className="ml-3 text-sm text-gray-400">
            {step === 1 ? 'Book Specs' : step === 2 ? 'Book Info & Style' : isUploadMode ? 'Upload Image' : 'Design Prompt'}
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{error}</div>}

        {/* STEP 1 — Specs */}
        {step === 1 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">Book Specifications</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Cover Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['paperback','hardcover'].map(ct => (
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
                  onChange={e => update('pageCount', parseInt(e.target.value))} className={inp()} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Interior</label>
                <select value={form.paperType} onChange={e => update('paperType', e.target.value)} className={inp()}>
                  <option value="black_and_white">Black & White</option>
                  <option value="color">Color</option>
                  <option value="premium_color">Premium Color</option>
                </select>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition">Continue →</button>
          </div>
        )}

        {/* STEP 2 & 3 — shared */}
        {(step === 2 || step === 3) && renderMainSteps()}

        {/* RESULT */}
        {step === 99 && result && renderResult()}
      </div>
    </div>
  )

  function renderResult() {
    return (
      <div className="space-y-5">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your KDP Cover is Ready!</h2>

          {result.imageUrl && (
            <div className="rounded-xl overflow-hidden mb-5 border border-gray-700">
              <img src={result.imageUrl} alt="Generated cover" className="w-full object-contain max-h-80" />
            </div>
          )}

          {result.dims && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-5">
              <p className="text-sm font-medium text-gray-300 mb-3">KDP Dimensions</p>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                <span className="text-gray-500">Total Width:</span><span className="text-green-400 font-mono">{result.dims.totalWidth.toFixed(3)}"</span>
                <span className="text-gray-500">Total Height:</span><span className="text-green-400 font-mono">{result.dims.totalHeight.toFixed(3)}"</span>
                <span className="text-gray-500">Spine Width:</span>
                <span className="text-green-400 font-mono">
                  {form.spineWidthOverride ? `${form.spineWidthOverride}" (Amazon KDP)` : `${result.dims.spineWidth.toFixed(4)}"`}
                </span>
                <span className="text-gray-500">Resolution:</span><span className="text-green-400 font-mono">{result.dims.totalWidthPx} × {result.dims.totalHeightPx} px @ 300 DPI</span>
              </div>
            </div>
          )}

          {/* ISBN + Barcode before download */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-5 space-y-4">
            <p className="text-sm font-semibold text-gray-300">Before Downloading (Optional)</p>
            <div>
              <label className="block text-sm text-gray-400 mb-2">ISBN Number <span className="text-gray-600">(appears on back cover near barcode)</span></label>
              <input value={isbn} onChange={e => setIsbn(e.target.value)}
                placeholder="e.g. 978-0-00-000000-0"
                className={inp()} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Barcode Image <span className="text-gray-600">(upload PNG/JPEG — replaces the white barcode box)</span></label>
              <div onClick={() => barcodeInputRef.current?.click()}
                className="border border-dashed border-gray-600 hover:border-violet-500 rounded-xl p-4 cursor-pointer text-center transition">
                {barcodeImage ? (
                  <div>
                    <img src={barcodeImage} alt="Barcode" className="max-h-16 mx-auto mb-1 object-contain" />
                    <p className="text-green-400 text-xs">{barcodeFileName} — click to change</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Click to upload barcode (optional)</p>
                )}
              </div>
              <input ref={barcodeInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleBarcodeSelect} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExport} disabled={exporting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {exporting ? <><Spinner />Exporting...</> : '⬇ Download KDP PDF'}
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
    )
  }
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

function MethodCard({ emoji, color, title, desc, tags, onClick }: {
  emoji: string; color: string; title: string; desc: string; tags: string[]; onClick: () => void
}) {
  const colors: Record<string, string> = {
    violet: 'hover:border-violet-500 group-hover:text-violet-300',
    blue: 'hover:border-blue-500 group-hover:text-blue-300',
    green: 'hover:border-green-500 group-hover:text-green-300',
  }
  const tagColors: Record<string, string> = {
    violet: 'bg-violet-900/50 text-violet-300 border-violet-700',
    blue: 'bg-blue-900/50 text-blue-300 border-blue-700',
    green: 'bg-green-900/50 text-green-300 border-green-700',
  }
  return (
    <button onClick={onClick} className={`w-full text-left bg-gray-900 border border-gray-700 rounded-2xl p-6 transition group ${colors[color]}`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex-1">
          <div className={`text-white font-bold text-lg mb-1 transition ${colors[color].split(' ')[1]}`}>{title}</div>
          <div className="text-gray-400 text-sm mb-3">{desc}</div>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs border px-2 py-0.5 rounded-full ${tagColors[color]}`}>{tags[0]}</span>
            {tags.slice(1).map(t => <span key={t} className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">{t}</span>)}
          </div>
        </div>
      </div>
    </button>
  )
}

function KDPCalc({ trimSize, pageCount, paperType }: { trimSize: string; pageCount: number; paperType: string }) {
  const parts = trimSize.split('x').map(Number)
  const [w, h] = parts
  if (!w || !h) return null
  const thick: Record<string, number> = { black_and_white: 0.0025, color: 0.002347, premium_color: 0.002400 }
  const spine = pageCount * (thick[paperType] ?? 0.0025)
  const tw = w * 2 + spine + 0.25
  const th = h + 0.25
  return (
    <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4 text-xs">
      <p className="text-green-400 font-semibold mb-2">Our Calculator (matches Amazon formula)</p>
      <div className="grid grid-cols-2 gap-y-1.5">
        <span className="text-gray-400">Spine Width:</span><span className="text-white font-mono font-bold">{spine.toFixed(4)}" ({(spine*25.4).toFixed(2)} mm)</span>
        <span className="text-gray-400">Total Size:</span><span className="text-white font-mono">{tw.toFixed(3)}" × {th.toFixed(3)}"</span>
        <span className="text-gray-400">Canvas (300dpi):</span><span className="text-white font-mono">{Math.round(tw*300)} × {Math.round(th*300)} px</span>
      </div>
    </div>
  )
}
