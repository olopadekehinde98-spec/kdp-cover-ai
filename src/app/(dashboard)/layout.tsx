import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import DashboardNav from '@/components/DashboardNav'
import SupportChatBot from '@/components/SupportChatBot'
import IpTracker from '@/components/IpTracker'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, clerkUser] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { plan: true, email: true, isBanned: true } }),
    currentUser(),
  ])

  if (!user) redirect('/sign-in')

  // Redirect banned users — but not if they're already on the banned page
  if (user.isBanned) redirect('/banned')

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── IP Tracker ─────────────────────────────────── */}
      <IpTracker />

      {/* ── Shared top nav ─────────────────────────────── */}
      <DashboardNav
        plan={user.plan}
        email={user.email}
        firstName={clerkUser?.firstName ?? null}
      />

      {/* ── Page content ───────────────────────────────── */}
      <main className="flex-1">
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
    </div>
  )
}
