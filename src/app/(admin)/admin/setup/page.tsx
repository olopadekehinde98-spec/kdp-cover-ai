/**
 * One-time admin setup page — accessible only if NO admins exist yet.
 * Visit /admin/setup after first sign-up to grant yourself admin.
 */
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export default async function AdminSetupPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminCount = await prisma.user.count({ where: { isAdmin: true } })

  // If admins already exist, block this page
  if (adminCount > 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Admin already set up</h1>
          <p className="text-gray-400 text-sm mb-6">An admin account already exists. This setup page is disabled.</p>
          <Link href="/" className="text-violet-400 hover:text-violet-300 text-sm">← Back to home</Link>
        </div>
      </div>
    )
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/sign-in')

  // Grant this user admin
  await prisma.user.update({
    where: { clerkId: userId },
    data: { isAdmin: true },
  })

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-white mb-2">You are now Admin</h1>
        <p className="text-gray-400 mb-2"><span className="text-white font-medium">{user.email}</span> has been granted admin access.</p>
        <p className="text-gray-600 text-xs mb-8">This setup page is now permanently disabled — a second person cannot use it.</p>
        <Link href="/admin"
          className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-xl transition">
          Open Admin Panel →
        </Link>
      </div>
    </div>
  )
}
