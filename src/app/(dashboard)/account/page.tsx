import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import BillingPortalButton from '@/components/BillingPortalButton'

export const metadata = { title: 'Account — KDP Cover AI' }

export default async function AccountPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, clerkUser] = await Promise.all([
    prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        plan: true, email: true, generationsUsed: true, generationsLimit: true,
        subscriptionStatus: true, referralCode: true, createdAt: true,
        _count: { select: { covers: true } },
      },
    }),
    currentUser(),
  ])

  if (!user) redirect('/sign-in')

  const usagePct = user.generationsLimit > 0
    ? Math.min(100, Math.round((user.generationsUsed / user.generationsLimit) * 100))
    : 0

  const planColor =
    user.plan === 'PRO'     ? 'bg-violet-900/60 text-violet-300 border-violet-700/50' :
    user.plan === 'AGENCY'  ? 'bg-amber-900/60 text-amber-300 border-amber-700/50'   :
    user.plan === 'STARTER' ? 'bg-blue-900/60 text-blue-300 border-blue-700/50'      :
                              'bg-gray-800 text-gray-400 border-gray-700'

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Account</h1>
        <p className="text-gray-400 mt-1">Manage your profile, plan, and preferences.</p>
      </div>

      <div className="space-y-6">

        {/* Profile card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5">
            {clerkUser?.imageUrl ? (
              <img src={clerkUser.imageUrl} alt="" className="w-14 h-14 rounded-full border border-gray-700" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-violet-700 flex items-center justify-center text-white text-xl font-bold">
                {(clerkUser?.firstName?.[0] ?? user.email[0] ?? 'U').toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-lg">
                {clerkUser?.firstName && clerkUser?.lastName
                  ? `${clerkUser.firstName} ${clerkUser.lastName}`
                  : clerkUser?.firstName ?? 'Your Account'}
              </p>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-gray-600 text-xs mt-0.5">Member since {joinDate}</p>
            </div>
            <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full border ${planColor}`}>
              {user.plan}
            </span>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 mb-3">
              To change your email, password, or connected accounts, use the Clerk account settings below.
            </p>
            <a
              href="/account/manage"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              ⚙️ Manage Email & Password →
            </a>
          </div>
        </div>

        {/* Plan & usage */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Plan & Usage</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Plan', value: user.plan },
              { label: 'Status', value: user.subscriptionStatus === 'active' ? '✅ Active' : '🔵 Free' },
              { label: 'Covers Generated', value: user._count.covers },
              { label: 'Referral Code', value: user.referralCode ?? '—' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-white font-bold text-sm">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Usage bar */}
          {user.generationsLimit < 999999 && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400">Monthly Generations</span>
                <span className="text-white font-medium">{user.generationsUsed} / {user.generationsLimit}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usagePct > 80 ? 'bg-red-500' : 'bg-violet-500'}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              {usagePct >= 80 && (
                <p className="text-amber-400 text-xs mt-2">Running low — upgrade for more generations.</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-800">
            {user.plan === 'FREE' ? (
              <Link href="/pricing"
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                ⬆️ Upgrade Plan
              </Link>
            ) : (
              <BillingPortalButton />
            )}
            <Link href="/history"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition">
              📚 View My Covers
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: '/generate',  icon: '✨', label: 'Generate New Cover',    desc: 'Create a new KDP book cover' },
              { href: '/history',   icon: '📚', label: 'My Cover History',       desc: 'View, download, and re-export covers' },
              { href: '/affiliate', icon: '💰', label: 'Affiliate Program',       desc: 'Earn commissions by referring authors' },
              { href: '/pricing',   icon: '💳', label: 'View Plans',             desc: 'Compare Starter, Pro, and Agency' },
              { href: '/help',      icon: '❓', label: 'Help Center',             desc: 'FAQs and guides' },
              { href: '/support',   icon: '🛟', label: 'Contact Support',         desc: 'Email our support team' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl p-3.5 transition group">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-violet-300 transition">{a.label}</p>
                  <p className="text-gray-500 text-xs">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-gray-900 border border-red-900/40 rounded-2xl p-6">
          <h2 className="text-red-400 font-semibold mb-2">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-4">
            To permanently delete your account and all associated data, email us. We will process it within 30 days.
          </p>
          <a href="mailto:support@kdpcoverai.com?subject=Delete%20Account"
            className="inline-flex items-center gap-2 bg-red-950/60 hover:bg-red-900/60 border border-red-900/50 text-red-400 text-sm font-medium px-4 py-2 rounded-xl transition">
            🗑️ Request Account Deletion
          </a>
        </div>

      </div>
    </div>
  )
}
