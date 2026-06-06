'use client'

import { useState } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

type Template = {
  id: string
  label: string
  emoji: string
  desc: string
  popular?: boolean
}

const TEMPLATES: Template[] = [
  { id: 'lined',          emoji: '📝', label: 'Lined Journal',     desc: 'Classic horizontal lines for writing', popular: true },
  { id: 'dotted',         emoji: '⋯',  label: 'Dot Grid Notebook', desc: 'Dot grid — perfect for bullet journaling', popular: true },
  { id: 'blank',          emoji: '◻',  label: 'Blank / Sketch',    desc: 'Empty pages for drawing or mixed media' },
  { id: 'graph',          emoji: '⊞',  label: 'Graph Paper',       desc: '5mm squares for math, charting, planning' },
  { id: 'planner-weekly', emoji: '📅', label: 'Weekly Planner',    desc: '7-day grid with notes section', popular: true },
  { id: 'planner-daily',  emoji: '🗓',  label: 'Daily Planner',     desc: 'Hourly schedule + priorities + gratitude' },
  { id: 'habit-tracker',  emoji: '✅', label: 'Habit Tracker',     desc: 'Monthly grid to track up to 10 habits' },
  { id: 'recipe',         emoji: '🍽',  label: 'Recipe Book',       desc: 'Structured pages for recipe collection' },
]

const TRIM_SIZES = [
  { value: '5x8',     label: '5″ × 8″' },
  { value: '5.5x8.5', label: '5.5″ × 8.5″' },
  { value: '6x9',     label: '6″ × 9″ — Most Popular' },
  { value: '7x10',    label: '7″ × 10″' },
  { value: '8x10',    label: '8″ × 10″' },
  { value: '8.5x11',  label: '8.5″ × 11″' },
]

const ACCENT_COLORS = [
  { value: '#7c3aed', label: 'Violet' },
  { value: '#2563eb', label: 'Blue' },
  { value: '#059669', label: 'Green' },
  { value: '#dc2626', label: 'Red' },
  { value: '#d97706', label: 'Amber' },
  { value: '#db2777', label: 'Pink' },
  { value: '#374151', label: 'Dark Gray' },
]

// ── Main component ──────────────────────────────────────────────────────────

export default function InteriorPage() {
  const [template,      setTemplate]      = useState<string>('lined')
  const [trimSize,      setTrimSize]      = useState<string>('6x9')
  const [pageCount,     setPageCount]     = useState<number>(120)
  const [lineSpacing,   setLineSpacing]   = useState<string>('medium')
  const [hasHeader,     setHasHeader]     = useState<boolean>(false)
  const [hasPageNums,   setHasPageNums]   = useState<boolean>(true)
  const [headerText,    setHeaderText]    = useState<string>('')
  const [primaryColor,  setPrimaryColor]  = useState<string>('#7c3aed')
  const [title,         setTitle]         = useState<string>('')
  const [habits,        setHabits]        = useState<string[]>(['Exercise', 'Read 30 min', 'Drink water', 'Meditate', 'Sleep 8h'])
  const [loading,       setLoading]       = useState<boolean>(false)
  const [error,         setError]         = useState<string>('')
  const [done,          setDone]          = useState<boolean>(false)

  const needsLineSpacing  = ['lined', 'dotted'].includes(template)
  const needsHabits       = template === 'habit-tracker'
  const needsHeaderOption = ['lined'].includes(template)

  async function handleGenerate() {
    setError('')
    setDone(false)
    setLoading(true)

    const customData = needsHabits
      ? JSON.stringify({ habits: habits.filter(Boolean) })
      : undefined

    try {
      const res = await fetch('/api/interior/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:          title || undefined,
          template,
          trimSize,
          pageCount,
          paperType:      'black_and_white',
          lineSpacing:    needsLineSpacing ? lineSpacing : undefined,
          hasHeader:      needsHeaderOption ? hasHeader : false,
          hasPageNumbers: hasPageNums,
          headerText:     hasHeader && headerText ? headerText : undefined,
          primaryColor,
          customData,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Error ${res.status}`)
      }

      // Trigger download
      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = url
      const tLabel   = TEMPLATES.find(t => t.id === template)?.label ?? template
      a.download     = `${tLabel.toLowerCase().replace(/\s+/g, '-')}-${trimSize}-${pageCount}pg.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function updateHabit(index: number, value: string) {
    setHabits(prev => prev.map((h, i) => i === index ? value : h))
  }

  function addHabit() {
    if (habits.length < 10) setHabits(prev => [...prev, ''])
  }

  function removeHabit(index: number) {
    if (habits.length > 1) setHabits(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📖</span>
            <div>
              <h1 className="text-3xl font-black text-white">KDP Interior Generator</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Generate a print-ready interior PDF for Amazon KDP in seconds.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Correct KDP margins auto-set', 'No design skills needed', 'Download as PDF'].map(tag => (
              <span key={tag} className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">✓ {tag}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left form column ─────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Template picker */}
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                1. Choose Template
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`relative text-left p-3 rounded-xl border transition
                      ${template === t.id
                        ? 'border-violet-500 bg-violet-950/40 text-white'
                        : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-600 hover:text-white'}`}
                  >
                    {t.popular && (
                      <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">HOT</span>
                    )}
                    <div className="text-xl mb-1">{t.emoji}</div>
                    <div className="font-semibold text-sm leading-tight">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">{t.desc}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Trim size + page count */}
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                2. Book Specifications
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Trim Size</label>
                  <select
                    value={trimSize}
                    onChange={e => setTrimSize(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  >
                    {TRIM_SIZES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    Number of Pages: <span className="text-white font-bold">{pageCount}</span>
                    <span className="text-gray-600 ml-2">(must match your KDP paperback page count)</span>
                  </label>
                  <input
                    type="range"
                    min={24}
                    max={800}
                    step={2}
                    value={pageCount}
                    onChange={e => setPageCount(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>24 pages</span>
                    <span>800 pages</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-800/60 rounded-lg p-3">
                  <span className="text-violet-400 font-semibold">Auto-set:</span> Inside margin will be{' '}
                  <span className="text-white font-mono">
                    {pageCount < 150 ? '0.375"' : pageCount < 300 ? '0.5"' : pageCount < 500 ? '0.625"' : pageCount < 600 ? '0.75"' : pageCount < 700 ? '0.875"' : '1"'}
                  </span>{' '}
                  — as required by Amazon KDP for {pageCount} pages.
                </div>
              </div>
            </section>

            {/* Customisation */}
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                3. Customise
              </h2>
              <div className="space-y-4">

                {/* Title */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Journal / Book Title (optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='e.g. "My Daily Journal 2025"'
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Line spacing */}
                {needsLineSpacing && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Line Spacing</label>
                    <div className="flex gap-2">
                      {(['narrow','medium','wide'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setLineSpacing(s)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition border
                            ${lineSpacing === s
                              ? 'bg-violet-600 border-violet-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Header option */}
                {needsHeaderOption && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setHasHeader(!hasHeader)}
                        className={`relative w-10 h-5 rounded-full transition ${hasHeader ? 'bg-violet-600' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hasHeader ? 'left-5' : 'left-0.5'}`} />
                      </div>
                      <span className="text-sm text-gray-300">Add header line on each page</span>
                    </label>
                    {hasHeader && (
                      <input
                        type="text"
                        value={headerText}
                        onChange={e => setHeaderText(e.target.value)}
                        placeholder='e.g. "Name:______  Date:______"'
                        className="mt-2 w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500"
                      />
                    )}
                  </div>
                )}

                {/* Page numbers */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setHasPageNums(!hasPageNums)}
                    className={`relative w-10 h-5 rounded-full transition ${hasPageNums ? 'bg-violet-600' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hasPageNums ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-300">Include page numbers</span>
                </label>

                {/* Accent color */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Accent Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setPrimaryColor(c.value)}
                        title={c.label}
                        className={`w-8 h-8 rounded-full border-2 transition ${primaryColor === c.value ? 'border-white scale-110' : 'border-transparent scale-100'}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5">Used for headers, dividers, and decorative elements.</p>
                </div>

                {/* Habit names */}
                {needsHabits && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Habits to Track (up to 10)</label>
                    <div className="space-y-2">
                      {habits.map((h, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={h}
                            onChange={e => updateHabit(i, e.target.value)}
                            placeholder={`Habit ${i + 1}`}
                            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500"
                          />
                          {habits.length > 1 && (
                            <button onClick={() => removeHabit(i)} className="text-gray-600 hover:text-red-400 transition text-lg px-1">×</button>
                          )}
                        </div>
                      ))}
                      {habits.length < 10 && (
                        <button onClick={addHabit} className="text-xs text-violet-400 hover:text-violet-300 transition">
                          + Add habit
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Right summary + generate column ──────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">

              {/* Preview card */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Interior</h3>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Template',   value: TEMPLATES.find(t => t.id === template)?.label ?? template },
                    { label: 'Trim Size',  value: TRIM_SIZES.find(s => s.value === trimSize)?.label ?? trimSize },
                    { label: 'Pages',      value: `${pageCount} pages` },
                    { label: 'KDP Margin', value: pageCount < 150 ? '0.375" inside' : pageCount < 300 ? '0.5" inside' : pageCount < 500 ? '0.625" inside' : '0.75"+ inside' },
                    { label: 'Accent',     value: ACCENT_COLORS.find(c => c.value === primaryColor)?.label ?? primaryColor },
                    { label: 'Page Nums',  value: hasPageNums ? 'Yes' : 'No' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="text-gray-200 font-medium text-right">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Estimated time */}
                <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
                  ⚡ Estimated generation time: {pageCount < 100 ? '< 5s' : pageCount < 300 ? '5–10s' : '10–20s'}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-lg
                  ${loading
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-900/40'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Generating PDF…
                  </span>
                ) : '📥 Generate & Download PDF'}
              </button>

              {/* Error */}
              {error && (
                <div className="bg-red-950/40 border border-red-800 rounded-xl p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Success */}
              {done && !error && (
                <div className="bg-green-950/40 border border-green-800 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-1">🎉</div>
                  <p className="text-green-300 font-semibold text-sm">Downloaded!</p>
                  <p className="text-gray-400 text-xs mt-1">Upload this PDF to KDP as your book interior.</p>
                  <button
                    onClick={() => { setDone(false); }}
                    className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition"
                  >
                    Generate another →
                  </button>
                </div>
              )}

              {/* Help note */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
                <p className="font-semibold text-gray-400">How to use with KDP:</p>
                <p>1. Generate & download this interior PDF</p>
                <p>2. On KDP: <em>Manuscript</em> → upload this file</p>
                <p>3. Your cover: use our <a href="/generate" className="text-violet-400 hover:underline">Cover Generator</a></p>
                <p>4. KDP previewer confirms the layout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
