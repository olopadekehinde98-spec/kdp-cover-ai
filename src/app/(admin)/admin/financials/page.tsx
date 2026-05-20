import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export default async function AdminFinancialsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) redirect('/')

  const [users, covers] = await Promise.all([
    prisma.user.findMany({ select: { plan: true, subscriptionStatus: true } }),
    prisma.cover.count({ where: { status: 'COMPLETED' } }),
  ])

  const planCounts = {
    FREE:    users.filter(u => u.plan === 'FREE').length,
    STARTER: users.filter(u => u.plan === 'STARTER').length,
    PRO:     users.filter(u => u.plan === 'PRO').length,
    AGENCY:  users.filter(u => u.plan === 'AGENCY').length,
  }

  const planPrices = { FREE: 0, STARTER: 9, PRO: 29, AGENCY: 79 }

  const grossRevenue =
    planCounts.STARTER * planPrices.STARTER +
    planCounts.PRO     * planPrices.PRO +
    planCounts.AGENCY  * planPrices.AGENCY

  const lemonFee        = grossRevenue * 0.05
  const openAICost      = covers * 0.001
  const affiliatePayout = grossRevenue * 0.15 // assume 50% of paid users were referred at 30%
  const netProfit       = grossRevenue - lemonFee - openAICost - affiliatePayout

  const rows = [
    { label: 'Gross Revenue',        value: grossRevenue,    type: 'revenue',  note: 'Sum of all active subscriptions' },
    { label: 'Lemon Squeezy (5%)',   value: -lemonFee,       type: 'cost',     note: 'Payment processor fee' },
    { label: 'OpenAI Costs',         value: -openAICost,     type: 'cost',     note: `${covers} completed covers × $0.001` },
    { label: 'Affiliate Payouts',    value: -affiliatePayout,type: 'cost',     note: 'Est. 50% referred at 30% commission' },
    { label: 'Vercel / Neon',        value: 0,               type: 'neutral',  note: 'Free tier — $0/mo' },
    { label: 'Net Profit (Est.)',     value: netProfit,       type: 'profit',   note: 'Monthly estimate' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Nav */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
          <h1 className="text-2xl font-bold text-white">Business Financials</h1>
        </div>

        {/* Plan breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(['FREE','STARTER','PRO','AGENCY'] as const).map(plan => (
            <div key={plan} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1">{plan} users</p>
              <p className="text-2xl font-bold text-white">{planCounts[plan]}</p>
              <p className="text-xs text-gray-600 mt-1">
                {planPrices[plan] > 0 ? `$${planPrices[plan]}/mo each` : 'Free'}
              </p>
            </div>
          ))}
        </div>

        {/* P&L Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">Monthly P&L Estimate</h2>
            <p className="text-xs text-gray-500 mt-0.5">Based on current subscriber count. Updates live.</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-6 py-3">Item</th>
                <th className="text-left px-6 py-3">Note</th>
                <th className="text-right px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.map(row => (
                <tr key={row.label} className={row.label.includes('Net') ? 'bg-gray-800/60' : ''}>
                  <td className="px-6 py-4 font-medium text-white">{row.label}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{row.note}</td>
                  <td className={`px-6 py-4 text-right font-mono font-bold
                    ${row.type === 'revenue' ? 'text-green-400' :
                      row.type === 'cost'    ? 'text-red-400' :
                      row.type === 'profit'  ? (netProfit >= 0 ? 'text-green-400' : 'text-red-400') :
                      'text-gray-400'}`}>
                    {row.value === 0 ? '$0.00' : `${row.value < 0 ? '-' : ''}$${Math.abs(row.value).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Per-plan unit economics */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">Unit Economics per Subscriber</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-6 py-3">Plan</th>
                <th className="text-right px-6 py-3">Price</th>
                <th className="text-right px-6 py-3">Lemon Fee</th>
                <th className="text-right px-6 py-3">Affiliate (max rate)</th>
                <th className="text-right px-6 py-3">Profit (no aff.)</th>
                <th className="text-right px-6 py-3">Profit (with aff.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { plan: 'Starter', price: 9,  maxAff: 0.18 },
                { plan: 'Pro',     price: 29, maxAff: 0.30 },
                { plan: 'Agency',  price: 79, maxAff: 0.25 },
              ].map(({ plan, price, maxAff }) => {
                const fee = price * 0.05
                const aff = price * maxAff
                const noAff = price - fee
                const withAff = price - fee - aff
                return (
                  <tr key={plan}>
                    <td className="px-6 py-3 text-white font-medium">{plan}</td>
                    <td className="px-6 py-3 text-right text-gray-300 font-mono">${price.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right text-red-400 font-mono">-${fee.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right text-orange-400 font-mono">-${aff.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right text-green-400 font-mono">${noAff.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right text-emerald-300 font-mono">${withAff.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-600 text-center">
          All figures are estimates. Connect Lemon Squeezy for real revenue data.
          OpenAI cost calculated from actual completed covers in DB.
        </p>
      </div>
    </div>
  )
}
