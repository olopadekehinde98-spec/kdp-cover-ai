import Link from 'next/link'

export const metadata = {
  title: 'Account Suspended — KDP Cover AI',
  description: 'Your account has been suspended due to suspicious activity.',
}

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-red-900/40 border border-red-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚫</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-red-400 mb-3">Account Suspended</h1>
        <p className="text-gray-400 text-lg mb-8">
          Your account has been temporarily suspended.
        </p>

        {/* Explanation card */}
        <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-white font-bold mb-3">Why was my account suspended?</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Our system detected that multiple free accounts were created from the same IP address.
            This is a violation of our fair-use policy, as it is used to bypass the free tier limit.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            If you believe this is a mistake — for example, if you are using a shared network, school Wi-Fi,
            corporate proxy, or VPN — please contact our support team and we will review your case.
          </p>
        </div>

        {/* What to do */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8 text-left">
          <h2 className="text-white font-semibold text-sm mb-3">What can I do?</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5 shrink-0">→</span>
              Submit a support ticket explaining the situation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5 shrink-0">→</span>
              If using a shared/school/office network, mention that in your ticket
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5 shrink-0">→</span>
              Upgrade to a paid plan — paid users are exempt from IP ban detection
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/support"
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition"
          >
            Submit Support Ticket
          </Link>
          <Link
            href="/pricing"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-xl transition"
          >
            View Pricing Plans
          </Link>
        </div>

        <p className="text-gray-600 text-xs mt-8">
          Contact: <a href="mailto:support@kdpcoverai.com" className="text-gray-500 hover:text-gray-300">support@kdpcoverai.com</a>
        </p>
      </div>
    </div>
  )
}
