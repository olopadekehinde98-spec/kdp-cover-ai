import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

async function requireAdmin(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user?.isAdmin) redirect('/')
  return user
}

export default async function AdminDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  await requireAdmin(userId)

  const [totalUsers, totalCovers, activeSubscriptions, failedCovers, recentUsers, recentCovers] = await prisma.$transaction([
    prisma.user.count(),
    prisma.cover.count(),
    prisma.user.count({ where: { subscriptionStatus: 'active' } }),
    prisma.cover.count({ where: { status: 'FAILED' } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10,
      select: { id: true, email: true, name: true, plan: true, generationsUsed: true, createdAt: true, isBanned: true } }),
    prisma.cover.findMany({ orderBy: { createdAt: 'desc' }, take: 8,
      select: { id: true, title: true, genre: true, status: true, userId: true, createdAt: true } }),
  ])

  const mrr = activeSubscriptions * 49 // rough estimate, real MRR from Stripe

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-semibold text-white text-sm">Admin Panel</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-white font-medium">Dashboard</Link>
            <Link href="/admin/users" className="text-gray-400 hover:text-white">Users</Link>
            <Link href="/admin/covers" className="text-gray-400 hover:text-white">Covers</Link>
            <Link href="/admin/financials" className="text-gray-400 hover:text-white">Financials</Link>
            <Link href="/admin/payments" className="text-gray-400 hover:text-white">Payments</Link>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">← Back to app</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <AdminKPI label="Total Users" value={totalUsers} color="blue" />
          <AdminKPI label="Active Subscriptions" value={activeSubscriptions} color="green" />
          <AdminKPI label="Total Covers" value={totalCovers} color="violet" />
          <AdminKPI label="Est. MRR" value={`$${mrr.toLocaleString()}`} color="amber" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <AdminKPI label="Failed Generations" value={failedCovers} color="red" />
          <AdminKPI label="Free Users" value={totalUsers - activeSubscriptions} color="gray" />
          <AdminKPI label="Conv. Rate" value={`${totalUsers > 0 ? Math.round(activeSubscriptions / totalUsers * 100) : 0}%`} color="green" />
          <AdminKPI label="Covers / User" value={totalUsers > 0 ? (totalCovers / totalUsers).toFixed(1) : '0'} color="violet" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Recent Users</h2>
              <Link href="/admin/users" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>
            <div className="divide-y divide-gray-800">
              {recentUsers.map((u: typeof recentUsers[0]) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{u.name || u.email}</p>
                    <p className="text-xs text-gray-500">{u.email} · {u.generationsUsed} gens</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.isBanned && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">Banned</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${u.plan === 'FREE' ? 'bg-gray-800 text-gray-400' :
                        u.plan === 'PRO' ? 'bg-violet-900/50 text-violet-300' : 'bg-amber-900/50 text-amber-300'}`}>
                      {u.plan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Covers */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Recent Covers</h2>
              <Link href="/admin/covers" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>
            <div className="divide-y divide-gray-800">
              {recentCovers.map((c: typeof recentCovers[0]) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium truncate max-w-[200px]">{c.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{c.genre} · {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${c.status === 'COMPLETED' ? 'bg-green-900/50 text-green-300' :
                      c.status === 'FAILED' ? 'bg-red-900/50 text-red-300' :
                      'bg-yellow-900/50 text-yellow-300'}`}>
                    {c.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminKPI({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400', green: 'text-green-400', violet: 'text-violet-400',
    amber: 'text-amber-400', red: 'text-red-400', gray: 'text-gray-400',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}
