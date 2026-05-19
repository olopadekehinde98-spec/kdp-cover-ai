'use client'

interface Props {
  url: string
  format: string
  title: string
}

export default function HistoryDownload({ url, format, title }: Props) {
  const label = format.toUpperCase()
  const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-kdp-cover.${format}`

  function handleClick() {
    if (url.startsWith('data:')) {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-xs bg-violet-900/30 hover:bg-violet-800/40 text-violet-300 border border-violet-800/50 rounded-lg px-2 py-1.5 text-left transition flex items-center justify-between"
    >
      <span>⬇ Download {label}</span>
      <span className="text-violet-500 text-xs">↓</span>
    </button>
  )
}
