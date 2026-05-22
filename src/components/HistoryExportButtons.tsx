'use client'

import { useState } from 'react'

interface Props {
  coverId: string
  title: string
}

const EXPORT_FORMATS = [
  { format: 'pdf',   label: 'Full PDF',     icon: '📄', ext: 'pdf' },
  { format: 'front', label: 'Front Cover',  icon: '🖼️', ext: 'png' },
  { format: 'back',  label: 'Back Cover',   icon: '📖', ext: 'png' },
  { format: 'spine', label: 'Spine',        icon: '📏', ext: 'png' },
  { format: 'png',   label: 'Full PNG',     icon: '🖼️', ext: 'png' },
] as const

export default function HistoryExportButtons({ coverId, title }: Props) {
  const [exporting, setExporting] = useState<string | null>(null)

  async function handleExport(format: string) {
    setExporting(format)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverId, format }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert(d.error || 'Export failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const fmtInfo = EXPORT_FORMATS.find(f => f.format === format)
      const ext = fmtInfo?.ext ?? (format === 'pdf' ? 'pdf' : 'png')
      a.download = `${safeName}-${format}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-600 mb-1">Download separate parts</p>
      <div className="flex flex-wrap gap-1.5">
        {EXPORT_FORMATS.map(({ format, label, icon }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            disabled={!!exporting}
            className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-400 hover:text-white border border-gray-700 rounded-lg px-2.5 py-1.5 transition"
          >
            {exporting === format ? (
              <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{icon}</span>
            )}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
