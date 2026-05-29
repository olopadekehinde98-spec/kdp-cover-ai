import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import EmailLimitHittersButton from '@/components/admin/EmailLimitHittersButton'

export default async function NonSubscribersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) redirect('/')

  const users = await prisma.user.findMany({
    where: { plan: 'FREE', subscriptionStatus: { not: 'active' } },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { covers: true } } },
  })

  const today = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const newToday = users.filter(u => (today.getTime() - new Date(u.createdAt).getTime()) < dayMs).length
  const usedLimit = users.filter(u => u.generationsUsed >= u.generationsLimit).length
  const neverGenerated = users.filter(u => u.generationsUsed === 0).length

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
            <h1 className="text-2xl font-bold text-white">Non-Subscribers</h1>
            <span className="text-sm text-gray-500">({users.length} free users)</span>
          </div>
          <EmailLimitHittersButton count={usedLimit} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Free Users', value: users.length, color: 'text-blue-400' },
            { label: 'Joined Today', value: newToday, color: 'text-green-400' },
            { label: 'Hit Free Limit', value: usedLimit, color: 'text-amber-400', note: 'Ready to convert' },
            { label: 'Never Generated', value: neverGenerated, color: 'text-red-400', note: 'Needs re-engagement' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              {s.note && <p className="text-xs text-gray-600 mt-1">{s.note}</p>}
            </div>
          ))}
        </div>

        <div className="bg-amber-950/30 border border-amber-700/30 rounded-xl p-4 mb-6 text-sm">
          <p className="text-amber-400 font-semibold mb-1">💡 Conversion Tips</p>
          <p className="text-gray-400">
            <strong className="text-white">{usedLimit} users</strong> hit their limit — click &quot;Email UPGRADE20&quot; above to send them a 20% off code.{' '}
            <strong className="text-white">{neverGenerated} users</strong> never generated — consider a re-engagement campaign.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Covers</th>
                <th className="text-left px-5 py-3">Generations</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map(u => {
                const hitLimit = u.generationsUsed >= u.generationsLimit
                const daysAgo = Math.floor((today.getTime() - new Date(u.createdAt).getTime()) / dayMs)
                return (
                  <tr key={u.id} className={`hover:bg-gray-800/40 transition ${hitLimit ? 'bg-amber-950/10' : ''}`}>
                    <td className="px-5 py-3 text-white font-mono text-xs">{u.email}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{u.name || '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={u._count.covers > 0 ? 'text-green-400 font-bold' : 'text-gray-600'}>{u._count.covers}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={hitLimit ? 'text-amber-400 font-bold' : 'text-gray-300'}>{u.generationsUsed}/{u.generationsLimit}</span>
                        {hitLimit && <span className="text-xs bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded-full">Limit hit</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {u.generationsUsed === 0
                        ? <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">Never used</span>
                        : hitLimit
                          ? <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">Needs upgrade</span>
                          : <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">Active free</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && <div className="py-10 text-center text-gray-500">No free users yet</div>}
        </div>
      </div>
    </div>
  )
}
