'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Cover {
  id: string
  title: string
  genre: string
  imageUrl: string | null
  status: string
  trimSize: string
  pageCount: number
  createdAt: Date
}

export default function CoverGrid({ covers }: { covers: Cover[] }) {
  const router = useRouter()
  const [list, setList] = useState(covers)
  const [preview, setPreview] = useState<Cover | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [exporting, setExporting] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this cover? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/covers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setList(l => l.filter(c => c.id !== id))
        if (preview?.id === id) setPreview(null)
        router.refresh()
      }
    } finally {
      setDeleting(null)
    }
  }

  async function handleExport(cover: Cover) {
    setExporting(cover.id)
    setExportError(null)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverId: cover.id }),
      })

      if (!res.ok) {
        let msg = 'Export failed. Please try again.'
        try {
          const data = await res.json()
          msg = data.error ?? msg
        } catch { /* response was not JSON (e.g. timeout HTML page) */ }
        setExportError(msg)
        return
      }

      // Download the PDF
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cover.title}-kdp-cover.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setExportError(e?.message ?? 'Network error during export')
    } finally {
      setExporting(null)
    }
  }

  if (list.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">📚</div>
        <p className="text-gray-400 mb-4">No covers yet. Generate your first one!</p>
        <a href="/generate"
          className="inline-flex bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition">
          Generate Cover
        </a>
      </div>
    )
  }

  return (
    <>
      {exportError && (
        <div className="mb-4 bg-red-900/30 border border-red-700 rounded-xl p-4 text-sm text-red-300 flex justify-between items-start">
          <span>⚠️ {exportError}</span>
          <button onClick={() => setExportError(null)} className="ml-4 text-red-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {list.map(cover => (
          <div key={cover.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition group">

            {/* Image */}
            <div
              className="aspect-[3/4] bg-gray-800 overflow-hidden relative cursor-pointer"
              onClick={() => cover.imageUrl && cover.status === 'COMPLETED' && setPreview(cover)}
            >
              {cover.imageUrl && cover.status === 'COMPLETED' ? (
                <>
                  <img
                    src={cover.imageUrl}
                    alt={cover.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">
                      👁 Preview
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  {cover.status === 'GENERATING' ? (
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs text-gray-400">Generating...</span>
                    </div>
                  ) : cover.status === 'FAILED' ? (
                    <div className="text-center text-xs text-red-400">
                      <div className="text-2xl mb-1">✕</div>
                      Failed
                    </div>
                  ) : '📚'}
                </div>
              )}
            </div>

            {/* Info + actions */}
            <div className="p-3">
              <p className="text-sm font-semibold text-white truncate">{cover.title}</p>
              <p className="text-xs text-gray-500 capitalize mb-3">{cover.genre} · {cover.trimSize}"</p>

              <div className="flex gap-2">
                {cover.status === 'COMPLETED' && (
                  <button
                    onClick={() => handleExport(cover)}
                    disabled={exporting === cover.id}
                    className="flex-1 text-xs bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900 disabled:text-violet-400 text-white font-semibold py-1.5 rounded-lg transition"
                  >
                    {exporting === cover.id ? '⏳ Exporting...' : '⬇ PDF'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(cover.id)}
                  disabled={deleting === cover.id}
                  className="text-xs bg-gray-800 hover:bg-red-900/40 hover:text-red-400 disabled:opacity-40 text-gray-400 font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  {deleting === cover.id ? '...' : '🗑'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl"
            >✕</button>
            <img
              src={preview.imageUrl!}
              alt={preview.title}
              className="w-full rounded-xl shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">{preview.title}</p>
                <p className="text-gray-400 text-sm capitalize">{preview.genre} · {preview.trimSize}"</p>
              </div>
              <button
                onClick={() => handleExport(preview)}
                disabled={exporting === preview.id}
                className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
              >
                {exporting === preview.id ? '⏳ Exporting...' : '⬇ Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
