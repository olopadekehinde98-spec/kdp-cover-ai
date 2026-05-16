'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl mb-6">💥</div>
          <h1 className="text-2xl font-bold mb-3">Critical Error</h1>
          <p className="text-gray-400 mb-6 text-sm">
            {error.message || 'An unexpected error occurred at the application level.'}
          </p>
          <button
            onClick={reset}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
