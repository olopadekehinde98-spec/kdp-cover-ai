'use client'

import { useEffect, useState } from 'react'

type DbStats = {
  totalUsers: number
  todaySignups: number
  weekSignups: number
  monthSignups: number
  paidUsers: number
  conversionRate: string
  plans: Record<string, number>
  dailySignups: Array<{ date: string; count: number }>
  visitorCountries: Array<{ country: string; count: number }>
}

type AnalyticsData = {
  dbStats?: DbStats
  realtime?: { activeUsers: string }
  overview?: {
    users: string; sessions: string; bounceRate: string
    avgDuration: string; pageViews: string; newUsers: string
  }
  topPages?: Array<{ path: string; views: string; users: string }>
  sources?: Array<{ channel: string; sessions: string; users: string }>
  countries?: Array<{ country: string; users: string }>
  devices?: Array<{ device: string; sessions: string }>
  daily?: Array<{ date: string; users: string; sessions: string }>
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
          <p className="text-gray-400">You don&apos;t have permission to view analytics.</p>
        </div>
      </div>
    )
  }

  const db = data?.dbStats
  const maxDailySignup = Math.max(...(db?.dailySignups?.map(d => d.count) ?? [1]), 1)
  const maxVisitorCountry = Math.max(...(db?.visitorCountries?.map(v => v.count) ?? [1]), 1)
  const gaReady = !data?.setup_needed && !!data?.overview
  const maxDaily = gaReady ? Math.max(...(data.daily?.map(d => parseInt(d.users)) ?? [1])) : 0
  const totalSessions = gaReady ? (data.sources?.reduce((s, r) => s + parseInt(r.sessions), 0) ?? 0) : 0
  const totalDevices = gaReady ? (data.devices?.reduce((s, r) => s + parseInt(r.sessions), 0) ?? 0) : 0

  return (
    <div className="flex-1 py-8 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Site Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">
              Live DB stats · {gaReady ? 'GA4 connected' : 'GA4 not configured'}
              {lastUpdated && <span> · Refreshed {lastUpdated.toLocaleTimeString()}</span>}
            </p>
          </div>
          <button onClick={load} className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-xl transition">
            ↻ Refresh
          </button>
        </div>

        {/* ── DB STATS — always visible ── */}
        {db && (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <div className="col-span-2 lg:col-span-1 bg-blue-950/40 border border-blue-700/50 rounded-2xl p-5 text-center">
                <p className="text-4xl font-black text-blue-400">{db.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Total Users</p>
              </div>
              {[
                { label: 'Today', value: db.todaySignups, color: 'text-green-400' },
                { label: 'This Week', value: db.weekSignups, color: 'text-cyan-400' },
                { label: 'This Month', value: db.monthSignups, color: 'text-violet-400' },
                { label: 'Paid', value: db.paidUsers, color: 'text-amber-400' },
                { label: 'Conv. Rate', value: `${db.conversionRate}%`, color: 'text-pink-400' },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Plan breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {(['FREE', 'STARTER', 'PRO', 'AGENCY'] as const).map(plan => {
                const colors: Record<string, string> = {
                  FREE: 'text-gray-400 border-gray-700', STARTER: 'text-blue-400 border-blue-700/40',
                  PRO: 'text-violet-400 border-violet-700/40', AGENCY: 'text-amber-400 border-amber-700/40',
                }
                return (
                  <div key={plan} className={`bg-gray-900 border rounded-2xl p-5 ${colors[plan]}`}>
                    <p className="text-xs text-gray-500 mb-1">{plan}</p>
                    <p className="text-2xl font-bold">{(db.plans[plan] ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {db.totalUsers > 0 ? ((( db.plans[plan] ?? 0) / db.totalUsers) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Daily signups chart + Visitor countries */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-4">New Signups — Last 14 Days</p>
                {db.dailySignups.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No signups yet</p>
                ) : (
                  <>
                    <div className="flex items-end gap-1 h-28">
                      {db.dailySignups.map(d => {
                        const h = maxDailySignup > 0 ? Math.max(4, (d.count / maxDailySignup) * 100) : 4
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10">
                              {d.date}<br />{d.count} signups
                            </div>
                            <div className="w-full bg-green-600 hover:bg-green-400 rounded-sm transition-all cursor-pointer" style={{ height: `${h}%` }} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>{db.dailySignups[0]?.date?.slice(5)}</span>
                      <span>{db.dailySignups[db.dailySignups.length - 1]?.date?.slice(5)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Visitor Countries</p>
                  <span className="text-xs text-gray-500">Non-subscribers tracked</span>
                </div>
                <div className="divide-y divide-gray-800">
                  {db.visitorCountries.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No visitor data yet — will appear as people visit</p>
                  ) : db.visitorCountries.map(v => (
                    <div key={v.country} className="px-5 py-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">{v.country}</span>
                        <span className="text-blue-400 font-bold">{v.count.toLocaleString()}</span>
                      </div>
                      <Bar value={v.count} max={maxVisitorCountry} color="bg-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── GA4 SETUP NOTICE ── */}
        {data?.setup_needed && (
          <div className="bg-amber-950/30 border border-amber-700/30 rounded-2xl p-6 mb-6">
            <p className="text-amber-400 font-semibold mb-1">📊 GA4 not connected — DB stats shown above</p>
            <p className="text-gray-400 text-sm mb-3">Add these to Vercel to unlock real-time visitors, session data, bounce rate & traffic sources:</p>
            <div className="space-y-2">
              {['GA_PROPERTY_ID', 'GA_SERVICE_ACCOUNT_EMAIL', 'GA_SERVICE_ACCOUNT_KEY'].map(k => (
                <code key={k} className="block bg-gray-900 text-violet-400 text-xs px-3 py-2 rounded-lg font-mono">{k}</code>
              ))}
            </div>
          </div>
        )}

        {/* ── GA4 STATS (only when connected) ── */}
        {gaReady && data.overview && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
              <div className="col-span-2 lg:col-span-1 bg-green-950/40 border border-green-700/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse mb-2" />
                <p className="text-4xl font-black text-green-400">{data.realtime?.activeUsers ?? '0'}</p>
                <p className="text-xs text-gray-400 mt-1">Live right now</p>
              </div>
              {[
                { label: 'Visitors (30d)', value: parseInt(data.overview.users).toLocaleString(), color: 'text-blue-400' },
                { label: 'New Visitors', value: parseInt(data.overview.newUsers).toLocaleString(), color: 'text-cyan-400' },
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

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-white">Daily Visitors — Last 14 Days</p>
                  {maxDaily > 0 && <span className="text-xs text-gray-500">Peak: {maxDaily}</span>}
                </div>
                {!data.daily?.length ? (
                  <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
                ) : (
                  <>
                    <div className="flex items-end gap-1 h-28">
                      {data.daily.map(d => {
                        const count = parseInt(d.users)
                        const h = maxDaily > 0 ? Math.max(8, (count / maxDaily) * 100) : 8
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10">
                              {d.date}<br />{d.users} users · {d.sessions} sessions
                            </div>
                            <div className="w-full bg-violet-600 hover:bg-violet-400 rounded-sm transition-all cursor-pointer" style={{ height: `${h}%` }} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>{data.daily[0]?.date?.slice(5)}</span>
                      <span>{data.daily[data.daily.length - 1]?.date?.slice(5)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-4">Traffic Sources</p>
                <div className="space-y-3">
                  {data.sources?.slice(0, 6).map(s => {
                    const pct = totalSessions > 0 ? ((parseInt(s.sessions) / totalSessions) * 100).toFixed(1) : '0'
                    const color = SOURCE_COLORS[s.channel] ?? 'bg-gray-600'
                    return (
                      <div key={s.channel}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{s.channel}</span>
                          <span className="text-gray-400 font-mono">{parseInt(s.sessions).toLocaleString()} · {pct}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800">
                  <p className="text-sm font-semibold text-white">Top Pages</p>
                </div>
                <div className="divide-y divide-gray-800">
                  {data.topPages?.map(p => {
                    const maxViews = parseInt(data.topPages![0]?.views ?? '1')
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

              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800">
                  <p className="text-sm font-semibold text-white">Top Countries (GA4)</p>
                </div>
                <div className="divide-y divide-gray-800">
                  {data.countries?.map(c => {
                    const maxUsers = parseInt(data.countries![0]?.users ?? '1')
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

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-5">Devices</p>
                <div className="space-y-4">
                  {data.devices?.map(d => {
                    const pct = totalDevices > 0 ? ((parseInt(d.sessions) / totalDevices) * 100).toFixed(0) : '0'
                    const icons: Record<string, string> = { mobile: '📱', desktop: '🖥️', tablet: '📟' }
                    return (
                      <div key={d.device}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">{icons[d.device] ?? '💻'} {d.device}</span>
                          <span className="text-white font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3">
                          <div className="bg-gradient-to-r from-violet-600 to-blue-600 h-3 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{parseInt(d.sessions).toLocaleString()} sessions</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
