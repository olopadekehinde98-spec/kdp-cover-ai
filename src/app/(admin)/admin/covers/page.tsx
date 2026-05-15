import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export default async function AdminCoversPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) redirect('/')

  const covers = await prisma.cover.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
      exports: { select: { format: true } },
    },
  })

  type CoverRow = typeof covers[0]
  const flagged = covers.filter((c: CoverRow) => c.isFlagged)

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
          <h1 className="text-2xl font-bold text-white">Cover Moderation</h1>
        </div>

        {flagged.length > 0 && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-2xl">
            <p className="text-red-400 font-semibold mb-2">⚠ {flagged.length} flagged cover{flagged.length !== 1 ? 's' : ''} require review</p>
            <div className="space-y-2">
              {flagged.map((c: CoverRow) => (
                <div key={c.id} className="flex items-center justify-between bg-gray-900 rounded-xl p-3">
                  <div>
                    <span className="text-white text-sm font-medium">{c.title}</span>
                    <span className="text-gray-500 text-xs ml-2">by {c.user.email}</span>
                    {c.flagReason && <p className="text-red-400 text-xs mt-1">Reason: {c.flagReason}</p>}
                  </div>
                  <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">Flagged</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-5 py-3">Cover</th>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Genre</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Exports</th>
                <th className="text-left px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {covers.map((c: CoverRow) => (
                <tr key={c.id} className={`hover:bg-gray-800/40 transition ${c.isFlagged ? 'bg-red-950/20' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {c.imageUrl && (
                        <img src={c.imageUrl} alt="" className="w-8 h-10 object-cover rounded" />
                      )}
                      <div>
                        <p className="text-white font-medium truncate max-w-[180px]">{c.title}</p>
                        {c.subtitle && <p className="text-gray-500 text-xs truncate max-w-[180px]">{c.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{c.user.email}</td>
                  <td className="px-5 py-3 text-gray-400 capitalize text-xs">{c.genre}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${c.status === 'COMPLETED' ? 'bg-green-900/50 text-green-300' :
                        c.status === 'FAILED' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                      {c.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{c.exports.map((e: { format: string }) => e.format).join(', ') || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
