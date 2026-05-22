import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

const EXCHANGE_RATE = 1370

export default async function AdminFinancialsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!adminUser?.isAdmin) redirect('/')

  const [users, covers, payments, affiliatePayouts] = await Promise.all([
    prisma.user.findMany({ select: { plan: true, subscriptionStatus: true } }),
    prisma.cover.count({ where: { status: 'COMPLETED' } }),
    prisma.paymentSubmission.findMany({
      where: { status: 'APPROVED' },
      select: { amount: true, currency: true, planAssigned: true, createdAt: true, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.affiliatePayout.findMany({
      select: { amountUsd: true, amountNgn: true, status: true, requestedAt: true },
    }),
  ])

  const planCounts = {
    FREE:    users.filter(u => u.plan === 'FREE').length,
    STARTER: users.filter(u => u.plan === 'STARTER').length,
    PRO:     users.filter(u => u.plan === 'PRO').length,
    AGENCY:  users.filter(u => u.plan === 'AGENCY').length,
  }

  // Revenue from approved payments
  const totalRevenueUsd = payments.reduce((sum, p) => {
    const usd = p.currency === 'NGN' ? p.amount / EXCHANGE_RATE : p.amount
    return sum + usd
  }, 0)

  const revenueByPlan: Record<string, number> = {}
  payments.forEach(p => {
    const plan = p.planAssigned || 'UNKNOWN'
    const usd = p.currency === 'NGN' ? p.amount / EXCHANGE_RATE : p.amount
    revenueByPlan[plan] = (revenueByPlan[plan] || 0) + usd
  })

  const totalAffiliatePaid = affiliatePayouts
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amountUsd, 0)

  const totalAffiliatePending = affiliatePayouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amountUsd, 0)

  const openAICost = covers * 0.001
  const netProfit = totalRevenueUsd - totalAffiliatePaid - openAICost

  const planPrices = { FREE: 0, STARTER: 9, PRO: 29, AGENCY: 79 }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Nav */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm">← Admin</Link>
          <h1 className="text-2xl font-bold text-white">Business Financials</h1>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <FinCard label="Total Revenue (USD)" value={`$${totalRevenueUsd.toFixed(2)}`} sub={`₦${Math.round(totalRevenueUsd * EXCHANGE_RATE).toLocaleString()}`} color="green" />
          <FinCard label="Affiliate Payouts Paid" value={`$${totalAffiliatePaid.toFixed(2)}`} color="orange" />
          <FinCard label="Affiliate Payouts Pending" value={`$${totalAffiliatePending.toFixed(2)}`} color="yellow" />
          <FinCard label="Net Profit (est.)" value={`$${netProfit.toFixed(2)}`} color={netProfit >= 0 ? 'green' : 'red'} />
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

        {/* Revenue by plan */}
        {Object.keys(revenueByPlan).length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Revenue by Plan (from approved payments)</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {Object.entries(revenueByPlan).map(([plan, usd]) => (
                <div key={plan} className="px-6 py-3 flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{plan.toLowerCase()}</span>
                  <div className="text-right">
                    <span className="text-green-400 font-mono font-bold">${usd.toFixed(2)}</span>
                    <span className="text-gray-600 text-xs ml-2">₦{Math.round(usd * EXCHANGE_RATE).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* P&L Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">P&L Summary</h2>
            <p className="text-xs text-gray-500 mt-0.5">Based on actual approved payments in database.</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="text-left px-6 py-3">Item</th>
                <th className="text-left px-6 py-3">Note</th>
                <th className="text-right px-6 py-3">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-6 py-4 font-medium text-white">Total Revenue</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{payments.length} approved payments</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-green-400">${totalRevenueUsd.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-white">OpenAI Costs</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{covers} completed covers × $0.001</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-red-400">-${openAICost.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-white">Affiliate Payouts (Paid)</td>
                <td className="px-6 py-4 text-gray-500 text-xs">Actual paid commissions</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-orange-400">-${totalAffiliatePaid.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-white">Refunds</td>
                <td className="px-6 py-4 text-gray-500 text-xs">Track manually</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-gray-400">$0.00</td>
              </tr>
              <tr className="bg-gray-800/60">
                <td className="px-6 py-4 font-bold text-white">Net Profit (Est.)</td>
                <td className="px-6 py-4 text-gray-500 text-xs">Revenue - OpenAI - Affiliates</td>
                <td className={`px-6 py-4 text-right font-mono font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${netProfit.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Affiliate payout history */}
        {affiliatePayouts.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Affiliate Payout History</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {affiliatePayouts.slice(0, 15).map((p, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-gray-300 text-sm">{new Date(p.requestedAt).toLocaleDateString()}</span>
                    <span className="text-gray-600 text-xs ml-3">₦{p.amountNgn.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-mono text-sm">${p.amountUsd.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'PAID' ? 'bg-green-900/50 text-green-400' :
                      p.status === 'REJECTED' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {p.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent approved payments */}
        {payments.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Recent Approved Payments</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs">
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3">Plan</th>
                  <th className="text-right px-6 py-3">Amount</th>
                  <th className="text-right px-6 py-3">USD</th>
                  <th className="text-right px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {payments.slice(0, 20).map((p, i) => {
                  const usd = p.currency === 'NGN' ? p.amount / EXCHANGE_RATE : p.amount
                  return (
                    <tr key={i}>
                      <td className="px-6 py-3 text-gray-300 text-xs">{p.user.email}</td>
                      <td className="px-6 py-3 text-violet-300 text-xs">{p.planAssigned || '—'}</td>
                      <td className="px-6 py-3 text-right text-gray-300 font-mono text-xs">
                        {p.currency === 'NGN' ? `₦${p.amount.toLocaleString()}` : `$${p.amount.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-3 text-right text-green-400 font-mono text-xs">${usd.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function FinCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-400', orange: 'text-orange-400', yellow: 'text-yellow-400',
    red: 'text-red-400', blue: 'text-blue-400',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  )
}
