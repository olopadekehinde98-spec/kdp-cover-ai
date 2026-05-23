'use client'

import { useEffect, useState } from 'react'

type AnalyticsData = {
  realtime: { activeUsers: string }
  overview: {
    users: string; sessions: string; bounceRate: string
    avgDuration: string; pageViews: string; newUsers: string
  }
  topPages: Array<{ path: string; views: string; users: string }>
  sources: Array<{ channel: string; sessions: string; users: string }>
  countries: Array<{ country: string; users: string }>
  devices: Array<{ device: string; sessions: string }>
  daily: Array<{ date: string; users: string; sessions: string }>
  setup_needed?: boolean
  error?: string
}

const SOURCE_COLORS: Record<string, string> = {
  'Organic Search': 'bg-green-600',
  'Direct': 'bg-blue-600',
  'Organic Social': 'bg-pink-600',
  'Referral': 'bg-violet-600',
  'Email': 'bg-amber-600',
  'Paid Search': 'bg-orange-600',
  'Unassigned': 'bg-gray-600',
}

function Bar({ value, max, color = 'bg-violet-600' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
    // Auto-refresh realtime every 30 seconds
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics…</p>
        </div>
      </div>
    )
  }

  if (data?.error === 'Forbidden' || data?.error === 'Unauthorized') {
    return (
      <div className="flex-1 py-16 px-6 max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-red-700/50 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">🔒 Access Denied</h1>
          <p className="text-gray-400">You don&apos;t have permission to view analytics. Make sure <code className="text-violet-400">OWNER_EMAIL</code> is set in Vercel and matches your account email.</p>
        </div>
      </div>
    )
  }

  if (data?.setup_needed || !data) {
    return (
      <div className="flex-1 py-16 px-6 max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-amber-700/50 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">📊 Analytics Setup Required</h1>
          <p className="text-gray-400 mb-6">Add these 3 environment variables to Vercel to enable the dashboard:</p>
          <div className="space-y-3 mb-6">
            {[
              { key: 'GA_PROPERTY_ID', desc: 'Numeric ID from GA4 → Admin → Property Settings (e.g. 123456789)' },
              { key: 'GA_SERVICE_ACCOUNT_EMAIL', desc: 'Service account email from Google Cloud Console' },
              { key: 'GA_SERVICE_ACCOUNT_KEY', desc: 'Private key from service account JSON (base64 or PEM)' },
            ].map(v => (
              <div key={v.key} className="bg-gray-800 rounded-xl p-4">
                <code className="text-violet-400 font-mono text-sm">{v.key}</code>
                <p className="text-gray-500 text-xs mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-950/50 border border-blue-700/50 rounded-xl p-4 text-sm">
            <p className="text-blue-300 font-semibold mb-2">Quick Setup (5 minutes):</p>
            <ol className="text-gray-400 space-y-1 list-decimal list-inside text-xs">
              <li>Go to console.cloud.google.com → select or create a project</li>
              <li>Enable the &quot;Google Analytics Data API&quot;</li>
              <li>Create a Service Account → download JSON key</li>
              <li>In GA4 Admin → Property Access Management → add service account email as Viewer</li>
              <li>Add the 3 env vars above to Vercel</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  const maxDaily = Math.max(...(data.daily?.map(d => parseInt(d.users)) ?? [1]))
  const totalSessions = data.sources.reduce((s, r) => s + parseInt(r.sessions), 0)
  const totalDevices = data.devices.reduce((s, r) => s + parseInt(r.sessions), 0)

  return (
    <div className="flex-1 py-8 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Site Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">
              Last 30 days · Updates every 30s ·{' '}
              {lastUpdated && <span>Refreshed {lastUpdated.toLocaleTimeString()}</span>}
            </p>
          </div>
          <button
            onClick={load}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-xl transition"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Real-time + Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-8">

          {/* Real-time — big card */}
          <div className="col-span-2 lg:col-span-1 bg-green-950/40 border border-green-700/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse mb-2" />
            <p className="text-4xl font-black text-green-400">{data.realtime.activeUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Live right now</p>
          </div>

          {/* 6 overview stats */}
          {[
            { label: 'Users (30d)', value: parseInt(data.overview.users).toLocaleString(), color: 'text-blue-400' },
            { label: 'New Users', value: parseInt(data.overview.newUsers).toLocaleString(), color: 'text-cyan-400' },
            { label: 'Sessions', value: parseInt(data.overview.sessions).toLocaleString(), color: 'text-violet-400' },
            { label: 'Page Views', value: parseInt(data.overview.pageViews).toLocaleString(), color: 'text-amber-400' },
            { label: 'Avg Duration', value: data.overview.avgDuration, color: 'text-pink-400' },
            { label: 'Bounce Rate', value: data.overview.bounceRate, color: 'text-orange-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Daily chart + Sources */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Daily visitors bar chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-4">Daily Visitors — Last 14 Days</p>
            <div className="flex items-end gap-1 h-28">
              {data.daily.map(d => {
                const h = maxDaily > 0 ? Math.max(4, (parseInt(d.users) / maxDaily) * 100) : 4
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10">
                      {d.date}<br />{d.users} users · {d.sessions} sessions
                    </div>
                    <div
                      className="w-full bg-violet-600 hover:bg-violet-500 rounded-sm transition-all cursor-pointer"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>{data.daily[0]?.date?.slice(5)}</span>
              <span>{data.daily[data.daily.length - 1]?.date?.slice(5)}</span>
            </div>
          </div>

          {/* Traffic sources */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-4">Traffic Sources</p>
            <div className="space-y-3">
              {data.sources.slice(0, 6).map(s => {
                const pct = totalSessions > 0 ? ((parseInt(s.sessions) / totalSessions) * 100).toFixed(1) : '0'
                const color = SOURCE_COLORS[s.channel] ?? 'bg-gray-600'
                return (
                  <div key={s.channel}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{s.channel}</span>
                      <span className="text-gray-400 font-mono">{parseInt(s.sessions).toLocaleString()} · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top pages + Countries + Devices */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          {/* Top pages */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">Top Pages</p>
            </div>
            <div className="divide-y divide-gray-800">
              {data.topPages.map((p, i) => {
                const maxViews = parseInt(data.topPages[0]?.views ?? '1')
                return (
                  <div key={p.path} className="px-5 py-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 font-mono truncate max-w-[60%]">{p.path || '/'}</span>
                      <span className="text-violet-400 font-bold">{parseInt(p.views).toLocaleString()}</span>
                    </div>
                    <Bar value={parseInt(p.views)} max={maxViews} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">Top Countries</p>
            </div>
            <div className="divide-y divide-gray-800">
              {data.countries.map(c => {
                const maxUsers = parseInt(data.countries[0]?.users ?? '1')
                return (
                  <div key={c.country} className="px-5 py-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">{c.country}</span>
                      <span className="text-blue-400 font-bold">{parseInt(c.users).toLocaleString()}</span>
                    </div>
                    <Bar value={parseInt(c.users)} max={maxUsers} color="bg-blue-600" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-5">Devices</p>
            <div className="space-y-4">
              {data.devices.map(d => {
                const pct = totalDevices > 0 ? ((parseInt(d.sessions) / totalDevices) * 100).toFixed(0) : '0'
                const icons: Record<string, string> = { mobile: '📱', desktop: '🖥️', tablet: '📟' }
                return (
                  <div key={d.device}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{icons[d.device] ?? '💻'} {d.device}</span>
                      <span className="text-white font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-violet-600 to-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{parseInt(d.sessions).toLocaleString()} sessions</p>
                  </div>
                )
              })}
            </div>

            {/* What you are missing — Search Console note */}
            <div className="mt-6 bg-amber-950/30 border border-amber-700/30 rounded-xl p-3">
              <p className="text-xs text-amber-400 font-semibold mb-1">🔍 Search Keywords</p>
              <p className="text-xs text-gray-500">
                Link Search Console to GA4 to see exactly what people typed in Google to find you.
                Go to GA4 → Admin → Search Console Links.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
