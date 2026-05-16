import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import CoverGrid from '@/components/CoverGrid'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Please add your PostgreSQL connection string in Vercel → Settings → Environment Variables.')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      covers: {
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true, title: true, genre: true, imageUrl: true,
          status: true, trimSize: true, pageCount: true, createdAt: true,
        },
      },
    },
  })

  if (!user) redirect('/sign-in')

  const usagePercent = user.generationsLimit > 0
    ? Math.min(100, Math.round((user.generationsUsed / user.generationsLimit) * 100))
    : 0

  const clerkUser = await currentUser()

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
          <span className="font-semibold text-white">KDP Cover AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full
            ${user.plan === 'FREE' ? 'bg-gray-800 text-gray-400' :
              user.plan === 'PRO' ? 'bg-violet-900/50 text-violet-300' :
              user.plan === 'AGENCY' ? 'bg-amber-900/50 text-amber-300' :
              'bg-blue-900/50 text-blue-300'}`}>
            {user.plan}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{clerkUser?.firstName ? `, ${clerkUser.firstName}` : ''}!
            </h1>
            <p className="text-gray-400 mt-1">Generate, manage, and export your KDP covers.</p>
          </div>
          <Link href="/generate"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition">
            ✨ New Cover
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Covers Created" value={user.covers.length} />
          <StatCard label="Plan" value={user.plan} />
          <StatCard label="Generations Used" value={`${user.generationsUsed} / ${user.generationsLimit === 999999 ? '∞' : user.generationsLimit}`} />
          <StatCard label="Status" value={user.subscriptionStatus === 'active' ? 'Active' : 'Free'} green={user.subscriptionStatus === 'active'} />
        </div>

        {/* Usage bar */}
        {user.plan === 'FREE' || user.plan === 'STARTER' ? (
          <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-400">Monthly Generations</span>
              <span className="text-white font-medium">{user.generationsUsed} / {user.generationsLimit}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-violet-500'}`}
                style={{ width: `${usagePercent}%` }} />
            </div>
            {usagePercent >= 80 && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-amber-400">Running low — upgrade for unlimited covers.</p>
                <Link href="/pricing" className="text-sm text-violet-400 hover:text-violet-300 font-medium">Upgrade →</Link>
              </div>
            )}
          </div>
        ) : null}

        {/* Recent Covers */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Recent Covers</h2>
            <Link href="/history" className="text-sm text-violet-400 hover:text-violet-300">View all →</Link>
          </div>

          <CoverGrid covers={user.covers} />
        </div>

        {/* Quick Actions */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickAction href="/pricing" icon="⬆" title="Upgrade Plan" desc="Get unlimited covers & PDF export" />
          <QuickAction href="/generate" icon="✨" title="New Cover" desc="Generate a new book cover" />
          <QuickAction href="/history" icon="📚" title="All Covers" desc="View and manage your covers" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, green }: { label: string; value: string | number; green?: boolean }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${green ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function QuickAction({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition group">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </Link>
  )
}
