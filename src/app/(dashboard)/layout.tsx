import Link from 'next/link'
import { Suspense } from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import DashboardNav from '@/components/DashboardNav'
import SupportChatBot from '@/components/SupportChatBot'
import IpTracker from '@/components/IpTracker'
import ReferralCapture from '@/components/ReferralCapture'
import ExitIntentPopup from '@/components/ExitIntentPopup'
import RewardsBanner from '@/components/RewardsBanner'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KDP-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true, email: true, isBanned: true, generationsLimit: true },
  })

  // Auto-create user in DB if webhook hasn't fired yet
  // Uses upsert to safely handle race conditions and duplicate email from old Clerk instance
  if (!user) {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? ''
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined
    const isOwner = email === process.env.OWNER_EMAIL

    try {
      // First try to find by email (handles old dev-instance records with different clerkId)
      const existingByEmail = await prisma.user.findUnique({ where: { email } })
      if (existingByEmail) {
        // Update the old record with the new clerkId so it works going forward
        await prisma.user.update({
          where: { email },
          data: {
            clerkId: userId,
            name: name ?? existingByEmail.name,
            imageUrl: clerkUser.imageUrl ?? existingByEmail.imageUrl,
            ...(isOwner ? { plan: 'AGENCY', generationsLimit: 999999, subscriptionStatus: 'active' } : {}),
          },
        })
      } else {
        await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            name,
            imageUrl: clerkUser.imageUrl,
            plan: isOwner ? 'AGENCY' : 'FREE',
            generationsLimit: isOwner ? 999999 : 5,
            subscriptionStatus: isOwner ? 'active' : 'free',
            referralCode: generateReferralCode(),
          },
        })
      }
    } catch {
      // If create fails (race condition), the record exists — proceed
    }

    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { plan: true, email: true, isBanned: true, generationsLimit: true },
    })
  }

  if (!user) redirect('/sign-in')

  // Self-heal: the owner account should always be AGENCY with unlimited generations.
  // (Older records — e.g. ones created before this rule, or ones whose plan was
  // changed via an admin action that didn't also update the limit — could be
  // stuck on a stale generationsLimit like 20 even though plan says AGENCY.)
  if (
    user.email === process.env.OWNER_EMAIL &&
    (user.plan !== 'AGENCY' || user.generationsLimit !== 999999 || user.isBanned)
  ) {
    await prisma.user.update({
      where: { email: user.email },
      data: { plan: 'AGENCY', generationsLimit: 999999, subscriptionStatus: 'active', isBanned: false },
    })
    user = { ...user, plan: 'AGENCY', generationsLimit: 999999, isBanned: false }
  }

  // Redirect banned users — but not if they're already on the banned page
  if (user.isBanned) redirect('/banned')

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── IP Tracker + Referral auto-apply ──────────── */}
      <IpTracker />
      <Suspense fallback={null}>
        <ReferralCapture applyOnLoad />
      </Suspense>

      {/* ── Shared top nav ─────────────────────────────── */}
      <DashboardNav
        plan={user.plan}
        email={user.email}
        firstName={clerkUser?.firstName ?? null}
      />

      {/* ── Page content ───────────────────────────────── */}
      <main className="flex-1">
        {/* Rewards banner — shown to FREE/STARTER users */}
        {(user.plan === 'FREE' || user.plan === 'STARTER') && (
          <div className="max-w-6xl mx-auto px-6 pt-4">
            <RewardsBanner />
          </div>
        )}
        {children}
      </main>

      {/* ── Support chat ───────────────────────────────── */}
      <SupportChatBot />

      {/* ── Shared footer ──────────────────────────────── */}
      <footer className="border-t border-gray-800 bg-gray-950 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-black text-sm text-white">K</div>
                <span className="font-bold text-white">KDP Cover AI</span>
              </Link>
              <p className="text-gray-500 text-xs leading-relaxed">
                AI-powered book covers built for Amazon KDP self-publishers.
              </p>
            </div>

            {/* App */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">App</p>
              <ul className="space-y-2">
                {[
                  { href: '/dashboard', label: 'Dashboard' },
                  { href: '/generate',  label: 'Generate Cover' },
                  { href: '/interior',  label: 'Generate Interior' },
                  { href: '/history',   label: 'My Covers' },
                  { href: '/pricing',   label: 'Pricing' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-500 hover:text-white text-sm transition">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Company</p>
              <ul className="space-y-2">
                {[
                  { href: '/about',     label: 'About' },
                  { href: '/affiliate', label: 'Affiliates' },
                  { href: '/blog',      label: 'Blog' },
                  { href: '/help',      label: 'Help Center' },
                  { href: '/support',   label: 'Support' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-500 hover:text-white text-sm transition">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2">
                {[
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms',   label: 'Terms of Service' },
                  { href: '/refund',  label: 'Refund Policy' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-500 hover:text-white text-sm transition">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} KDP Cover AI · Not affiliated with Amazon KDP.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <Link href="/privacy" className="hover:text-gray-400 transition">Privacy</Link>
              <Link href="/terms"   className="hover:text-gray-400 transition">Terms</Link>
              <Link href="/refund"  className="hover:text-gray-400 transition">Refund</Link>
              <a href="mailto:support@kdpcoverai.com" className="hover:text-gray-400 transition">support@kdpcoverai.com</a>
            </div>
          </div>
        </div>
      </footer>
      <ExitIntentPopup />
    </div>
  )
}
