'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RatingModal from '@/components/RatingModal'
import CoverPreview from '@/components/editor/CoverPreview'

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

// ── Cover Style Templates ─────────────────────────────────────
const STYLE_TEMPLATES = [
  {
    id: 'dark-thriller', emoji: '🔪', name: 'Dark Thriller', color: 'red',
    prompt: 'Dark psychological thriller, cinematic red neon smoke, lone silhouette in the rain, gritty city streets',
    titleStyle: 'bold-sans' as const, titleFontScale: 1.2, genre: 'thriller',
  },
  {
    id: 'romance-warm', emoji: '💕', name: 'Romance Warm', color: 'pink',
    prompt: 'Romantic sunset beach, warm golden bokeh, soft pink clouds, couple silhouette in golden hour light',
    titleStyle: 'serif-italic' as const, titleFontScale: 1.0, genre: 'romance',
  },
  {
    id: 'epic-fantasy', emoji: '🧙', name: 'Epic Fantasy', color: 'violet',
    prompt: 'Epic fantasy landscape, towering ancient ruins, glowing magical runes, misty mountains, dramatic golden light rays',
    titleStyle: 'serif' as const, titleFontScale: 1.2, genre: 'fantasy',
  },
  {
    id: 'clean-business', emoji: '📈', name: 'Clean Business', color: 'blue',
    prompt: 'Minimalist business background, bold geometric shapes, deep navy blue gradient, subtle gold accent lines',
    titleStyle: 'bold-sans' as const, titleFontScale: 1.0, genre: 'business',
  },
  {
    id: 'horror-dark', emoji: '👻', name: 'Horror Dark', color: 'gray',
    prompt: 'Gothic horror, abandoned mansion, dead twisted bare trees, full moon through storm clouds, blood-red ground mist',
    titleStyle: 'courier-bold' as const, titleFontScale: 1.2, genre: 'horror',
  },
  {
    id: 'sci-fi-future', emoji: '🚀', name: 'Sci-Fi Future', color: 'cyan',
    prompt: 'Futuristic sci-fi deep space, glowing nebula, spacecraft silhouette, alien planet surface, electric blue energy arcs',
    titleStyle: 'sans-oblique' as const, titleFontScale: 1.0, genre: 'sci-fi',
  },
  {
    id: 'self-help-bright', emoji: '🌟', name: 'Self-Help', color: 'amber',
    prompt: 'Motivational sunrise, radiant golden light breaking through clouds, silhouette on mountaintop, vast open sky',
    titleStyle: 'bold-sans' as const, titleFontScale: 1.0, genre: 'self-help',
  },
  {
    id: 'literary-elegant', emoji: '📚', name: 'Literary', color: 'amber',
    prompt: 'Elegant vintage library, soft candlelight on ancient books, dust motes in warm golden light, rich deep tones',
    titleStyle: 'serif-light' as const, titleFontScale: 0.8, genre: 'literary-fiction',
  },
]

type Method = 'ai' | 'upload' | 'kdp' | 'book'
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

// Wrap in Suspense because useSearchParams() requires it in Next.js 15+
export default function GeneratePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <GeneratePage />
    </Suspense>
  )
}

function GeneratePage() {
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

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadFileName, setUploadFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export extras (entered on result screen)
  const [isbn, setIsbn] = useState('')
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null)
  const [barcodeFileName, setBarcodeFileName] = useState('')
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // ── DRAFT AUTO-SAVE ──────────────────────────────────────────────
  const DRAFT_KEY = 'kdp_cover_draft'
  const [hasDraft, setHasDraft]     = useState(false)
  const [draftMsg, setDraftMsg]     = useState('')

  // Check for saved draft on mount
  useEffect(() => {
    if (fromCoverId) return
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const { form: f } = JSON.parse(saved)
        if (f?.title) { setHasDraft(true); setDraftMsg(f.title) }
      }
    } catch {}
  }, [])

  // Save draft 600ms after any form change
  useEffect(() => {
    if (fromCoverId) return
    const t = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, method, step })) } catch {}
    }, 600)
    return () => clearTimeout(t)
  }, [form, method, step])

  function restoreDraft() {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) return
      const { form: f, method: m, step: s } = JSON.parse(saved)
      if (f) setForm({ ...INITIAL, ...f })
      if (m) setMethod(m)
      if (s && s !== 99) setStep(s)
      setHasDraft(false)
    } catch {}
  }

  function discardDraft() {
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    setHasDraft(false)
  }

  // ── BOOK FILE UPLOAD (Method 4) ───────────────────────────────────
  const [bookFile, setBookFile]               = useState<string | null>(null)
  const [bookFileName, setBookFileName]       = useState('')
  const [bookSubStep, setBookSubStep]         = useState<'upload' | 'design-choice' | 'design'>('upload')
  const [bookDesign, setBookDesign]           = useState<'ai' | 'upload' | null>(null)
  const [bookExtractLoading, setBookExtractLoading] = useState(false)
  const [bookExtractError, setBookExtractError]     = useState('')
  const bookFileRef = useRef<HTMLInputElement>(null)

  // Also used for inline book upload on the description field
  const [inlineBookLoading, setInlineBookLoading] = useState(false)
  const [inlineBookError, setInlineBookError]     = useState('')
  const inlineBookRef = useRef<HTMLInputElement>(null)

  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleBookFileSelect(e: React.ChangeEvent<HTMLInputElement>, mode: 'method4' | 'inline') {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['text/plain', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type) && !file.name.match(/\.(txt|pdf|docx?|epub)$/i)) {
      if (mode === 'method4') setBookExtractError('Only TXT, PDF, DOCX, or EPUB supported.')
      else setInlineBookError('Only TXT, PDF, DOCX, or EPUB supported.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      if (mode === 'method4') setBookExtractError('File must be under 20MB.')
      else setInlineBookError('File must be under 20MB.')
      return
    }
    if (mode === 'method4') { setBookExtractLoading(true); setBookExtractError('') }
    else { setInlineBookLoading(true); setInlineBookError('') }

    try {
      let base64 = ''
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // Read text directly in browser
        const text = await file.text()
        base64 = btoa(unescape(encodeURIComponent(text.slice(0, 8000))))
      } else {
        base64 = await readFileAsBase64(file)
        base64 = base64.split(',')[1] ?? base64
      }

      const res = await fetch('/api/book-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
          title: form.title,
          genre: form.genre,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Extraction failed.')

      if (data.description) update('description', data.description)
      if (data.title && !form.title) update('title', data.title)
      if (data.authorName && !form.authorName) update('authorName', data.authorName)

      if (mode === 'method4') {
        setBookFile(base64); setBookFileName(file.name)
        setBookSubStep('design-choice')
      }
    } catch (err: any) {
      if (mode === 'method4') setBookExtractError(err.message)
      else setInlineBookError(err.message)
    } finally {
      if (mode === 'method4') setBookExtractLoading(false)
      else setInlineBookLoading(false)
    }
  }

  // ── PRE-FILL FROM AN EXISTING COVER ──────────────────────────────
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
      if (data?.coverId) {
        setRatingCoverId(data.coverId)
        setTimeout(() => setShowRatingModal(true), 4000)
      }
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
      if (data?.coverId) {
        setRatingCoverId(data.coverId)
        setTimeout(() => setShowRatingModal(true), 4000)
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const [exportingFormat, setExportingFormat] = useState<string | null>(null)
  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [aiDescError, setAiDescError] = useState('')
  const [brandSaved, setBrandSaved] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingCoverId, setRatingCoverId] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [regenOpen, setRegenOpen] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  async function handleAIDescription() {
    if (!form.title || !form.genre) { setAiDescError('Enter a title and genre first.'); return }
    setAiDescLoading(true); setAiDescError('')
    try {
      const res = await fetch('/api/ai-description', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, genre: form.genre, authorName: form.authorName, description: form.description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'AI description failed.')
      update('description', data.description)
    } catch (e: any) { setAiDescError(e.message) }
    finally { setAiDescLoading(false) }
  }

  function saveBrandPreset() {
    if (typeof window === 'undefined') return
    const preset = { titleStyle: form.titleStyle, titleFontScale: form.titleFontScale, genre: form.genre, authorName: form.authorName }
    localStorage.setItem('kdp_brand_preset', JSON.stringify(preset))
    setBrandSaved(true); setTimeout(() => setBrandSaved(false), 2000)
  }

  function loadBrandPreset() {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('kdp_brand_preset')
    if (!raw) return
    try {
      const preset = JSON.parse(raw)
      if (preset.titleStyle) update('titleStyle', preset.titleStyle)
      if (preset.titleFontScale) update('titleFontScale', preset.titleFontScale)
      if (preset.genre) update('genre', preset.genre)
      if (preset.authorName) update('authorName', preset.authorName)
    } catch {}
  }

  async function handleExport(format: 'pdf' | 'png' | 'jpg' | 'front' | 'back' | 'spine' = 'pdf') {
    if (!result?.coverId) return
    setExportingFormat(format); setError('')
    try {
      const spineOverride = form.spineWidthOverride ? parseFloat(form.spineWidthOverride) : undefined
      const res = await fetch('/api/export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverId: result.coverId,
          format,
          titleFontScale: form.titleFontScale, titleStyle: form.titleStyle,
          isbn: isbn || undefined,
          barcodeImageBase64: barcodeImage || undefined,
          spineWidthOverride: spineOverride,
          reviewQuote: form.reviewQuote || undefined,
          reviewAttribution: form.reviewAttribution || undefined,
          // Pass any text edits made on the result screen
          titleOverride:       form.title       || undefined,
          subtitleOverride:    form.subtitle     || undefined,
          authorNameOverride:  form.authorName   || undefined,
          descriptionOverride: form.description  || undefined,
          authorBioOverride:   form.authorBio    || undefined,
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
      const ext = format === 'pdf' ? 'pdf' : format === 'jpg' ? 'jpg' : 'png'
      const suffix = format === 'front' ? '-front-cover' : format === 'back' ? '-back-cover' : format === 'spine' ? '-spine' : '-kdp-cover'
      a.download = `${form.title || 'cover'}${suffix}.${ext}`
      a.click(); URL.revokeObjectURL(url)
    } catch (e: any) { setError(e.message) }
    finally { setExportingFormat(null) }
  }

  function resetAll() {
    setMethod(null); setStep(1); setResult(null)
    setKdpSubStep('specs'); setKdpDesign(null)
    setUploadedImage(null); setUploadFileName('')
    setIsbn(''); setBarcodeImage(null); setBarcodeFileName('')
    setBookFile(null); setBookFileName(''); setBookSubStep('upload'); setBookDesign(null)
    setError(''); setInlineBookError('')
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
  }

  // ── METHOD SELECTION ────────────────────────────────────────────
  if (!method) {
    return (
      <div className="min-h-screen bg-gray-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your KDP Cover</h1>
          <p className="text-gray-400 mb-6">Choose how you want to create your book cover.</p>

          {/* Draft restore banner */}
          {hasDraft && (
            <div className="mb-6 bg-amber-950/40 border border-amber-700/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-amber-300 font-semibold text-sm">📝 Unsaved Draft Found</p>
                <p className="text-amber-400/70 text-xs mt-0.5">You have a saved draft{draftMsg ? ` — "${draftMsg}"` : ''} from a previous session.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={restoreDraft} className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition font-semibold">Restore Draft →</button>
                <button onClick={discardDraft} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-2 rounded-xl transition">Discard</button>
              </div>
            </div>
          )}

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
            <MethodCard
              emoji="📖" color="orange"
              title="Upload Your Book"
              desc="Upload your manuscript (PDF, TXT, DOCX). AI reads your book, writes the back cover description automatically, then you choose AI or upload for the cover image."
              tags={['Upload manuscript', 'AI writes description', 'AI or Upload cover']}
              onClick={() => { setMethod('book'); setBookSubStep('upload') }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── METHOD 4: UPLOAD YOUR BOOK ─────────────────────────────────
  if (method === 'book') {
    return (
      <div className="min-h-screen bg-gray-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={resetAll} className="text-gray-500 hover:text-white text-sm mb-4 block">← Back to methods</button>
          <h1 className="text-2xl font-bold text-white mb-6">📖 Upload Your Book</h1>
          {bookExtractError && <div className="mb-4 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{bookExtractError}</div>}
          {error && <div className="mb-4 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{error}</div>}

          {/* Step A: Upload book file */}
          {bookSubStep === 'upload' && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
              <div className="bg-violet-950/30 border border-violet-700/40 rounded-xl p-4 text-sm space-y-2">
                <p className="text-violet-300 font-bold">How this works</p>
                <ol className="list-decimal list-inside text-gray-300 space-y-1.5">
                  <li>Upload your manuscript (PDF, TXT, DOCX, or EPUB)</li>
                  <li>AI reads the first section and writes your back cover description</li>
                  <li>It also tries to extract your title and author name</li>
                  <li>You review and edit everything before generating</li>
                  <li>Choose AI or upload image for the cover art</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Book Manuscript File</label>
                <div
                  onClick={() => bookFileRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-violet-500 rounded-xl p-8 text-center cursor-pointer transition group">
                  {bookExtractLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-violet-300 font-medium text-sm">AI is reading your book...</p>
                      <p className="text-gray-500 text-xs">This may take 10–20 seconds</p>
                    </div>
                  ) : bookFileName ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📄</span>
                      <p className="text-white font-medium text-sm">{bookFileName}</p>
                      <p className="text-violet-400 text-xs">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl group-hover:scale-110 transition-transform">📖</span>
                      <p className="text-gray-300 font-medium text-sm">Click to upload your book</p>
                      <p className="text-gray-600 text-xs">PDF, TXT, DOCX, EPUB — up to 20MB</p>
                    </div>
                  )}
                </div>
                <input ref={bookFileRef} type="file" accept=".pdf,.txt,.doc,.docx,.epub"
                  className="hidden" onChange={e => handleBookFileSelect(e, 'method4')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Trim Size</label>
                  <select value={form.trimSize} onChange={e => update('trimSize', e.target.value)} className={inp()}>
                    {TRIM_SIZES.map(ts => <option key={ts.value} value={ts.value}>{ts.label}{ts.popular ? ' ★' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Page Count</label>
                  <input type="number" min={24} max={828} value={form.pageCount}
                    onChange={e => update('pageCount', parseInt(e.target.value))} className={inp()} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Interior</label>
                  <select value={form.paperType} onChange={e => update('paperType', e.target.value)} className={inp()}>
                    <option value="black_and_white">Black & White</option>
                    <option value="color">Color</option>
                    <option value="premium_color">Premium Color</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cover Type</label>
                  <select value={form.coverType} onChange={e => update('coverType', e.target.value)} className={inp()}>
                    <option value="paperback">Paperback</option>
                    <option value="hardcover">Hardcover</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                No manuscript? You can still fill in the description manually — just upload a blank TXT file or skip to Method 1.
              </p>
            </div>
          )}

          {/* Step B: Choose AI or Upload cover */}
          {bookSubStep === 'design-choice' && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
              <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4">
                <p className="text-green-300 font-semibold text-sm mb-1">✅ Book content extracted!</p>
                <p className="text-gray-400 text-xs">AI has written your back cover description based on your manuscript. You can review and edit it in the next step.</p>
              </div>
              <h2 className="text-lg font-semibold text-white">Choose Your Cover Design</h2>
              <p className="text-gray-400 text-sm">How should the cover image be created?</p>

              <button onClick={() => { setBookDesign('ai'); setBookSubStep('design'); setStep(2) }}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-violet-500 rounded-xl p-5 transition group">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-white font-semibold group-hover:text-violet-300">AI Creates the Cover Image</div>
                <div className="text-gray-400 text-sm mt-1">Describe the style you want — AI generates a custom image that matches your genre.</div>
              </button>

              <button onClick={() => { setBookDesign('upload'); setBookSubStep('design'); setStep(2) }}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-5 transition group">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-white font-semibold group-hover:text-blue-300">I Upload My Own Cover Image</div>
                <div className="text-gray-400 text-sm mt-1">Upload your own designed front cover image — system adds text and exports full-wrap PDF.</div>
              </button>

              <button onClick={() => setBookSubStep('upload')} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-2 rounded-xl text-sm transition">
                ← Back
              </button>
            </div>
          )}

          {/* Step C: Main form steps (reuses existing renderMainSteps) */}
          {bookSubStep === 'design' && renderMainSteps()}
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
    const isUploadMode = method === 'upload' || kdpDesign === 'upload' || bookDesign === 'upload'
    const isAIMode = method === 'ai' || kdpDesign === 'ai' || bookDesign === 'ai'

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
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <label className="text-sm text-gray-400">About The Book</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => inlineBookRef.current?.click()} disabled={inlineBookLoading}
                      className="flex items-center gap-1.5 text-xs bg-blue-900/50 hover:bg-blue-800/60 border border-blue-700/50 text-blue-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50 font-medium">
                      {inlineBookLoading ? <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" /> : '📖'}
                      {inlineBookLoading ? 'Reading...' : 'Upload Book'}
                    </button>
                    <button onClick={handleAIDescription} disabled={aiDescLoading}
                      className="flex items-center gap-1.5 text-xs bg-violet-900/50 hover:bg-violet-800/60 border border-violet-700/50 text-violet-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50 font-medium">
                      {aiDescLoading ? <span className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin" /> : '✨'}
                      {aiDescLoading ? 'Writing...' : 'AI Write (Pro)'}
                    </button>
                  </div>
                </div>
                <input ref={inlineBookRef} type="file" accept=".pdf,.txt,.doc,.docx,.epub"
                  className="hidden" onChange={e => handleBookFileSelect(e, 'inline')} />
                {inlineBookError && <p className="text-red-400 text-xs mb-2">{inlineBookError}</p>}
                {aiDescError && <p className="text-red-400 text-xs mb-2">{aiDescError}</p>}
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  rows={4} placeholder="Write your description, upload your book, or click AI Write..."
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

            {/* Brand Preset (Series Branding) */}
            <div className="border-t border-gray-800 pt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">Series Branding:</span>
              <button onClick={saveBrandPreset}
                className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition">
                {brandSaved ? '✅ Saved!' : '💾 Save Brand Preset'}
              </button>
              {typeof window !== 'undefined' && localStorage.getItem('kdp_brand_preset') && (
                <button onClick={loadBrandPreset}
                  className="text-xs bg-violet-900/40 hover:bg-violet-900/60 border border-violet-700/50 text-violet-300 px-3 py-1.5 rounded-lg transition">
                  📂 Load Saved Preset
                </button>
              )}
              <span className="text-xs text-gray-600">Saves font style, size, genre & author name for your series.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => {
                if (method === 'kdp') setKdpSubStep('design-choice')
                else if (method === 'book') setBookSubStep('design-choice')
                else setStep(1)
              }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">← Back</button>
              <button onClick={() => setStep(3)} disabled={!form.title || !form.authorName}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && isAIMode && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Describe Your Cover</h2>
            <p className="text-gray-400 text-sm">Pick a style template to start, or describe your own vision below.</p>

            {/* ── Style Templates ─────────────────────────────── */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Quick Style Templates</p>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_TEMPLATES.map(t => {
                  const isActive = form.prompt === t.prompt
                  const borderColor: Record<string, string> = {
                    red: isActive ? 'border-red-500 bg-red-950/40' : 'border-gray-700 hover:border-red-700',
                    pink: isActive ? 'border-pink-500 bg-pink-950/40' : 'border-gray-700 hover:border-pink-700',
                    violet: isActive ? 'border-violet-500 bg-violet-950/40' : 'border-gray-700 hover:border-violet-700',
                    blue: isActive ? 'border-blue-500 bg-blue-950/40' : 'border-gray-700 hover:border-blue-700',
                    gray: isActive ? 'border-gray-400 bg-gray-800' : 'border-gray-700 hover:border-gray-500',
                    cyan: isActive ? 'border-cyan-500 bg-cyan-950/40' : 'border-gray-700 hover:border-cyan-700',
                    amber: isActive ? 'border-amber-500 bg-amber-950/40' : 'border-gray-700 hover:border-amber-700',
                  }
                  return (
                    <button key={t.id}
                      onClick={() => {
                        update('prompt', t.prompt)
                        update('titleStyle', t.titleStyle)
                        update('titleFontScale', t.titleFontScale)
                        update('genre', t.genre)
                      }}
                      className={`p-3 rounded-xl border bg-gray-800 text-left transition flex items-center gap-2.5 ${borderColor[t.color] ?? borderColor.gray}`}>
                      <span className="text-xl shrink-0">{t.emoji}</span>
                      <div className="min-w-0">
                        <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{t.name}</div>
                      </div>
                      {isActive && <span className="ml-auto text-green-400 text-xs shrink-0">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 mb-1">Or use a custom example:</p>
              {[
                'Dark psychological thriller with cinematic red smoke and a lone female silhouette',
                'Epic fantasy with a glowing ancient map, misty mountains, and dramatic golden light',
                'Clean modern business book with bold geometric shapes and deep navy blue',
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
        {showRatingModal && ratingCoverId && (
          <RatingModal coverId={ratingCoverId} onClose={() => setShowRatingModal(false)} />
        )}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-1">Your KDP Cover is Ready!</h2>
          <p className="text-gray-400 text-sm mb-4">Full-wrap preview — front cover, spine &amp; back cover with your text.</p>

          {/* ── Live canvas preview with text overlays ── */}
          {result.imageUrl && result.dims && (
            <div className="mb-5">
              <CoverPreview
                imageUrl={result.imageUrl}
                dims={result.dims}
                title={form.title}
                subtitle={form.subtitle || undefined}
                authorName={form.authorName}
                description={form.description || undefined}
                authorBio={form.authorBio || undefined}
                reviewQuote={form.reviewQuote || undefined}
                reviewAttribution={form.reviewAttribution || undefined}
                titleFontScale={form.titleFontScale}
                titleStyle={form.titleStyle}
              />
              <p className="text-xs text-gray-600 mt-2 text-center">
                Preview only — red dashes mark bleed edges. The downloaded PDF is the final print file.
              </p>
            </div>
          )}

          {/* ── New Background Image panel ── */}
          {(method === 'ai' || kdpDesign === 'ai' || bookDesign === 'ai') && (
            <div className="mb-3">
              <button
                onClick={() => setRegenOpen(v => !v)}
                className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-white transition"
              >
                <span>🎨 New Background Image</span>
                <span className="text-gray-400 text-xs">{regenOpen ? '▲ Hide' : '▼ Show'}</span>
              </button>

              {regenOpen && (
                <div className="mt-3 bg-gray-800/60 border border-gray-700 rounded-xl p-5 space-y-4">
                  <p className="text-xs text-gray-500">Keep your text &amp; settings — just regenerate the background image with a new style.</p>

                  {/* Quick style chips */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Quick style switch:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLE_TEMPLATES.map(t => (
                        <button key={t.id}
                          onClick={() => {
                            update('prompt', t.prompt)
                            update('titleStyle', t.titleStyle)
                            update('titleFontScale', t.titleFontScale)
                          }}
                          className={`p-2 rounded-lg border text-left text-xs flex items-center gap-2 transition
                            ${form.prompt === t.prompt
                              ? 'border-violet-500 bg-violet-900/30 text-violet-300'
                              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                          <span>{t.emoji}</span><span>{t.name}</span>
                          {form.prompt === t.prompt && <span className="ml-auto text-green-400">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Or write your own prompt:</label>
                    <textarea value={form.prompt} onChange={e => update('prompt', e.target.value)}
                      rows={3} placeholder="Describe the new background style..."
                      className={inp('resize-none text-sm')} />
                  </div>

                  <button
                    onClick={async () => { setRegenOpen(false); await handleGenerateAI() }}
                    disabled={loading || !form.prompt}
                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                    {loading ? <><Spinner />Generating new background...</> : '✨ Generate New Background'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Edit Cover Text panel ── */}
          <div className="mb-5">
            <button
              onClick={() => setEditOpen(v => !v)}
              className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-white transition"
            >
              <span>✏️ Edit Cover Text</span>
              <span className="text-gray-400 text-xs">{editOpen ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {editOpen && (
              <div className="mt-3 bg-gray-800/60 border border-gray-700 rounded-xl p-5 space-y-4">
                <p className="text-xs text-gray-500">Changes update the preview instantly and will be included in your download.</p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Title</label>
                    <input
                      value={form.title}
                      onChange={e => update('title', e.target.value)}
                      className={inp()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Subtitle <span className="text-gray-600">(optional)</span></label>
                    <input
                      value={form.subtitle}
                      onChange={e => update('subtitle', e.target.value)}
                      placeholder="Leave empty for no subtitle"
                      className={inp()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Author Name</label>
                    <input
                      value={form.authorName}
                      onChange={e => update('authorName', e.target.value)}
                      className={inp()}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <p className="text-xs text-gray-400 font-medium">Back Cover Text</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">About The Book</label>
                    <textarea
                      value={form.description}
                      onChange={e => update('description', e.target.value)}
                      rows={4}
                      className={inp('resize-none')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">About The Author <span className="text-gray-600">(optional)</span></label>
                    <textarea
                      value={form.authorBio}
                      onChange={e => update('authorBio', e.target.value)}
                      rows={3}
                      className={inp('resize-none')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Review Quote <span className="text-gray-600">(optional)</span></label>
                    <textarea
                      value={form.reviewQuote}
                      onChange={e => update('reviewQuote', e.target.value)}
                      rows={2}
                      className={inp('resize-none')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Quote Attribution <span className="text-gray-600">(optional)</span></label>
                    <input
                      value={form.reviewAttribution}
                      onChange={e => update('reviewAttribution', e.target.value)}
                      placeholder="e.g. — Publishers Weekly"
                      className={inp()}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <p className="text-xs text-gray-400 font-medium">Front Cover Style</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Title Font Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'bold-sans',    label: 'Bold Modern' },
                        { value: 'serif',        label: 'Classic Serif' },
                        { value: 'serif-italic', label: 'Elegant Italic' },
                        { value: 'serif-light',  label: 'Serif Light' },
                        { value: 'sans-oblique', label: 'Modern Slanted' },
                        { value: 'courier-bold', label: 'Typewriter' },
                      ].map(s => (
                        <button key={s.value} onClick={() => update('titleStyle', s.value)}
                          className={`p-2 rounded-lg border text-xs font-medium transition text-left
                            ${form.titleStyle === s.value
                              ? 'border-violet-500 bg-violet-900/30 text-violet-300'
                              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">
                      Title Size — <span className="text-violet-400">{FONT_SCALE_LABELS[form.titleFontScale.toFixed(1)] ?? `${form.titleFontScale}×`}</span>
                    </label>
                    <input type="range" min="0.6" max="1.4" step="0.2" value={form.titleFontScale}
                      onChange={e => update('titleFontScale', parseFloat(e.target.value))}
                      className="w-full accent-violet-500" />
                    <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                      <span>Small</span><span>Medium</span><span>X-Large</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {result.dims && (
            <details className="mb-5">
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400 select-none">▶ KDP Dimensions</summary>
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mt-2">
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
            </details>
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

          {/* Download format buttons */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Download Format</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleExport('pdf')} disabled={!!exportingFormat}
                className="flex flex-col items-center gap-1.5 bg-green-900/40 hover:bg-green-800/50 border border-green-700/50 disabled:opacity-50 text-green-300 font-bold py-4 rounded-xl transition">
                {exportingFormat === 'pdf' ? <Spinner /> : <span className="text-2xl">📄</span>}
                <span className="text-xs">KDP PDF</span>
                <span className="text-xs text-green-500 font-normal">Full-wrap · Print-ready</span>
              </button>
              <button onClick={() => handleExport('front')} disabled={!!exportingFormat}
                className="flex flex-col items-center gap-1.5 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-700/50 disabled:opacity-50 text-amber-300 font-bold py-4 rounded-xl transition">
                {exportingFormat === 'front' ? <Spinner /> : <span className="text-2xl">📱</span>}
                <span className="text-xs">Front Cover</span>
                <span className="text-xs text-amber-500 font-normal">Amazon thumbnail</span>
              </button>
              <button onClick={() => handleExport('png')} disabled={!!exportingFormat}
                className="flex flex-col items-center gap-1.5 bg-blue-900/40 hover:bg-blue-800/50 border border-blue-700/50 disabled:opacity-50 text-blue-300 font-bold py-4 rounded-xl transition">
                {exportingFormat === 'png' ? <Spinner /> : <span className="text-2xl">🖼️</span>}
                <span className="text-xs">Full-Wrap PNG</span>
                <span className="text-xs text-blue-500 font-normal">Social · mockups</span>
              </button>
              <button onClick={() => handleExport('jpg')} disabled={!!exportingFormat}
                className="flex flex-col items-center gap-1.5 bg-violet-900/40 hover:bg-violet-800/50 border border-violet-700/50 disabled:opacity-50 text-violet-300 font-bold py-4 rounded-xl transition">
                {exportingFormat === 'jpg' ? <Spinner /> : <span className="text-2xl">📸</span>}
                <span className="text-xs">JPG Image</span>
                <span className="text-xs text-violet-500 font-normal">Smaller file</span>
              </button>
            </div>
            <p className="text-xs text-gray-600">KDP PDF = for upload to Amazon · Front Cover PNG = for Amazon listing thumbnail</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button onClick={() => { setStep(3); setResult(null) }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
              🔄 Full Regenerate
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition">
              Dashboard
            </button>
          </div>

          {/* ── Share Cover ──────────────────────────────────── */}
          <div className="relative mt-3">
            <button
              onClick={async () => {
                const shareText = `Just created my KDP book cover for "${form.title}" — check out KDP Cover AI!`
                const shareUrl  = 'https://kdpcoverai.site'
                if (typeof navigator !== 'undefined' && navigator.share) {
                  try { await navigator.share({ title: form.title, text: shareText, url: shareUrl }) } catch {}
                } else {
                  setShowShareMenu(v => !v)
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-700/50 text-indigo-300 font-semibold py-2.5 rounded-xl transition text-sm"
            >
              📤 Share Your Cover
            </button>

            {showShareMenu && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 z-20 space-y-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Share via</p>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just created my KDP book cover for "${form.title}" with @kdpcoverai 🎨`)}&url=${encodeURIComponent('https://kdpcoverai.site')}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm transition">
                  𝕏 &nbsp;Share on X / Twitter
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Just created my KDP book cover for "${form.title}" with KDP Cover AI 🎨 https://kdpcoverai.site`)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm transition">
                  💬 &nbsp;Share on WhatsApp
                </a>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText('https://kdpcoverai.site')
                    setShareCopied(true)
                    setTimeout(() => { setShareCopied(false); setShowShareMenu(false) }, 1800)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm transition text-left">
                  {shareCopied ? '✅ Link Copied!' : '🔗 Copy Link'}
                </button>
                <button onClick={() => setShowShareMenu(false)} className="w-full text-xs text-gray-600 hover:text-gray-400 py-1 transition">✕ Close</button>
              </div>
            )}
          </div>

          <a
            href="https://g.page/r/kdpcoverai/review"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-700/50 text-amber-300 font-semibold py-2.5 rounded-xl transition text-sm"
          >
            ⭐ Rate Us on Google
          </a>
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
    blue:   'hover:border-blue-500 group-hover:text-blue-300',
    green:  'hover:border-green-500 group-hover:text-green-300',
    orange: 'hover:border-orange-500 group-hover:text-orange-300',
  }
  const tagColors: Record<string, string> = {
    violet: 'bg-violet-900/50 text-violet-300 border-violet-700',
    blue:   'bg-blue-900/50 text-blue-300 border-blue-700',
    green:  'bg-green-900/50 text-green-300 border-green-700',
    orange: 'bg-orange-900/50 text-orange-300 border-orange-700',
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
  const thick: Record<string, number> = { black_and_white: 0.002252, color: 0.002500, premium_color: 0.002347 }
  const spine = pageCount * (thick[paperType] ?? 0.002252)
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
