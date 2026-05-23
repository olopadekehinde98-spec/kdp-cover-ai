'use client'

import { useEffect, useState } from 'react'

export default function LiveStats() {
  const [stats, setStats] = useState({ totalCovers: 0, totalUsers: 0 })

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-wrap justify-center gap-8 py-8 border-y border-gray-800 my-12">
      <Stat value={stats.totalCovers} label="Covers Generated" suffix="+" />
      <Stat value={stats.totalUsers} label="Authors Using It" suffix="+" />
      <Stat value={30} label="Seconds to Generate" suffix="s" static />
      <Stat value={0} label="KDP Rejections" prefix="~" static />
    </div>
  )
}

function Stat({ value, label, suffix = '', prefix = '', static: isStatic = false }:
  { value: number; label: string; suffix?: string; prefix?: string; static?: boolean }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isStatic) { setDisplay(value); return }
    if (value === 0) return
    let start = 0
    const step = Math.ceil(value / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [value, isStatic])

  return (
    <div className="text-center">
      <p className="text-3xl font-black text-white">
        {prefix}{isStatic ? value : display.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
