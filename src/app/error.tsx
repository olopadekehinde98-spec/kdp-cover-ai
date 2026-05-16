'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  const isDbError =
    error.message?.includes('DATABASE_URL') ||
    error.message?.includes('connect') ||
    error.message?.includes('ECONNREFUSED') ||
    error.message?.includes('prisma')

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">{isDbError ? '🗄️' : '⚠️'}</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          {isDbError ? 'Database Not Connected' : 'Something went wrong'}
        </h1>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          {isDbError
            ? 'The DATABASE_URL environment variable is not set. Add a PostgreSQL connection string in your Vercel project settings to use the app.'
            : 'An unexpected error occurred. Try refreshing the page.'}
        </p>

        {isDbError ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left mb-6">
            <p className="text-xs text-gray-500 mb-2 font-mono">Required env var:</p>
            <code className="text-violet-400 text-xs">DATABASE_URL=postgresql://...</code>
            <p className="text-xs text-gray-600 mt-2">
              Get a free DB at{' '}
              <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">
                neon.tech
              </a>{' '}
              or{' '}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">
                supabase.com
              </a>
            </p>
          </div>
        ) : null}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
