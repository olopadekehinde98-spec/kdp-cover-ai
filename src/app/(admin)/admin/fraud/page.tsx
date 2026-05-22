import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import FraudActions from './FraudActions'

export default async function AdminFraudPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) redirect('/')

  const logs = await prisma.ipFraudLog.findMany({
    orderBy: { detectedAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
        <h1 className="text-white font-bold">Fraud Detection</h1>
        <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">
          {logs.filter(l => l.isBanned).length} banned IPs
        </span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Flagged IPs</p>
            <p className="text-2xl font-bold text-white">{logs.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Banned</p>
            <p className="text-2xl font-bold text-red-400">{logs.filter(l => l.isBanned).length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Flagged (Not Banned)</p>
            <p className="text-2xl font-bold text-yellow-400">{logs.filter(l => !l.isBanned).length}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">IP Fraud Logs</h2>
            <p className="text-xs text-gray-500 mt-0.5">IPs shared by multiple users — potential account farming</p>
          </div>

          {logs.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-500 text-sm">No fraud logs detected.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {logs.map(log => (
                <div key={log.id} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-violet-400 font-mono text-sm">{log.ipAddress}</code>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.isBanned ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                          {log.isBanned ? 'banned' : 'flagged'}
                        </span>
                        <span className="text-xs text-gray-500">{log.userIds.length} accounts</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {log.emails.map((email, i) => (
                          <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{email}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">Detected: {new Date(log.detectedAt).toLocaleString()}</p>
                    </div>
                    <FraudActions log={{ id: log.id, ipAddress: log.ipAddress, isBanned: log.isBanned, userIds: log.userIds }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
