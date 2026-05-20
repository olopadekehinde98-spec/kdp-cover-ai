import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Minimal branded header */}
      <header className="border-b border-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-black text-sm text-white">K</div>
            <span className="font-bold text-lg text-white">KDP Cover AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
            <Link href="/help" className="text-gray-400 hover:text-white transition">Help</Link>
            <Link href="/sign-in" className="text-gray-400 hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Sign-up form */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
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

      {/* Minimal footer */}
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
