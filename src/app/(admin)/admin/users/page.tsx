import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) redirect('/')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { covers: true } },
    },
  })

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <span className="text-sm text-gray-500">({users.length} total)</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Plan</th>
                <th className="text-left px-5 py-3">Covers</th>
                <th className="text-left px-5 py-3">Generations</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u: typeof users[0]) => (
                <tr key={u.id} className="hover:bg-gray-800/40 transition">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-white font-medium">{u.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${u.plan === 'FREE' ? 'bg-gray-800 text-gray-400' :
                        u.plan === 'PRO' ? 'bg-violet-900/50 text-violet-300' :
                        u.plan === 'AGENCY' ? 'bg-amber-900/50 text-amber-300' :
                        'bg-blue-900/50 text-blue-300'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{u._count.covers}</td>
                  <td className="px-5 py-3 text-gray-300">
                    {u.generationsUsed} / {u.generationsLimit === 999999 ? '∞' : u.generationsLimit}
                  </td>
                  <td className="px-5 py-3">
                    {u.isBanned ? (
                      <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">Banned</span>
                    ) : u.subscriptionStatus === 'active' ? (
                      <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                    ) : (
                      <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{u.subscriptionStatus || 'Free'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
