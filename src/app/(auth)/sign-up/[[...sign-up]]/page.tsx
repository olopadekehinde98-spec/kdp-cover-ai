import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Suspense } from 'react'
import RefCapture from '@/components/RefCapture'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="border-b border-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-black text-sm text-white">K</div>
            <span className="font-bold text-lg text-white">KDP Cover AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
            <Link href="/sign-in" className="text-gray-400 hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </header>

      <Suspense fallback={null}><RefCapture /></Suspense>

      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — value props */}
          <div className="hidden lg:block">
            <h1 className="text-3xl font-black text-white leading-tight mb-3">
              Professional KDP Covers<br />
              <span className="text-violet-400">in 30 Seconds</span>
            </h1>
            <p className="text-gray-400 mb-8">Join thousands of self-publishers generating print-ready Amazon KDP book covers with AI — no design skills needed.</p>

            <div className="space-y-4">
              {[
                { icon: '⚡', title: 'Instant Generation', desc: 'Full-wrap cover with front, spine & back in under 30 seconds' },
                { icon: '📐', title: 'Exact KDP Dimensions', desc: '300 DPI, correct bleed, all trim sizes — ready to upload' },
                { icon: '🎨', title: 'AI-Powered Design', desc: 'Describe your vision, our AI creates a professional cover' },
                { icon: '🆓', title: 'Free to Start', desc: '3 free covers — no credit card required' },
              ].map(f => (
                <div key={f.title} className="flex gap-3">
                  <div className="w-10 h-10 bg-violet-600/20 border border-violet-700/40 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{f.icon}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-gray-500 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400 text-sm">★★★★★</div>
                <span className="text-gray-400 text-xs">Trusted by authors worldwide</span>
              </div>
              <p className="text-gray-300 text-sm italic">&quot;Saved me hours of work. My KDP cover looked completely professional.&quot;</p>
              <p className="text-gray-600 text-xs mt-1">— Self-published author</p>
            </div>
          </div>

          {/* Right — Clerk form */}
          <div>
            <SignUp
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'bg-gray-900 border border-gray-800 shadow-2xl',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-gray-400',
                  formFieldLabel: 'text-gray-300',
                  formFieldInput: 'bg-gray-800 border-gray-700 text-white',
                  footerActionLink: 'text-violet-400',
                  formButtonPrimary: 'bg-violet-600 hover:bg-violet-700',
                  socialButtonsBlockButton: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700',
                  dividerLine: 'bg-gray-800',
                  dividerText: 'text-gray-600',
                },
              }}
            />
            <p className="text-center text-gray-600 text-xs mt-4">
              By signing up you agree to our{' '}
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-900 px-6 py-4 text-center text-xs text-gray-700">
        <div className="flex items-center justify-center gap-4 mb-1">
          <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-400">Terms</Link>
          <Link href="/refund" className="hover:text-gray-400">Refund Policy</Link>
          <Link href="/help" className="hover:text-gray-400">Help</Link>
        </div>
        <p>© {new Date().getFullYear()} KDP Cover AI</p>
      </footer>
    </div>
  )
}
