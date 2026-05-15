import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export default async function HistoryPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/sign-in')

  const covers = await prisma.cover.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { exports: { select: { format: true, url: true, downloadCount: true } } },
  })

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">All Covers</h1>
            <p className="text-gray-400 mt-1">{covers.length} cover{covers.length !== 1 ? 's' : ''} generated</p>
          </div>
          <Link href="/generate"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm">
            ✨ New Cover
          </Link>
        </div>

        {covers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-400 mb-6">You haven't generated any covers yet.</p>
            <Link href="/generate" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition">
              Generate Your First Cover
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {covers.map((cover: typeof covers[0]) => (
              <div key={cover.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition group">
                <div className="aspect-[3/4] bg-gray-800 overflow-hidden relative">
                  {cover.imageUrl ? (
                    <img src={cover.imageUrl} alt={cover.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                      {cover.status === 'GENERATING' ? 'Generating...' :
                       cover.status === 'FAILED' ? '❌ Failed' : '📚'}
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium
                    ${cover.status === 'COMPLETED' ? 'bg-green-900/80 text-green-300' :
                      cover.status === 'FAILED' ? 'bg-red-900/80 text-red-300' :
                      'bg-yellow-900/80 text-yellow-300'}`}>
                    {cover.status.toLowerCase()}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white truncate">{cover.title}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{cover.genre} · {cover.trimSize}"</p>
                  <p className="text-xs text-gray-600 mt-0.5">{cover.pageCount} pages</p>
                  {cover.exports.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {cover.exports.map((ex: { format: string; url: string; downloadCount: number }, i: number) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full uppercase">{ex.format}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-700 mt-2">{new Date(cover.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
