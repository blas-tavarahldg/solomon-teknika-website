'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-jost text-5xl md:text-6xl font-bold text-orange mb-4">Oops!</h1>
        <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-4">Something went wrong</h2>
        <p className="text-lg text-body-text mb-2 max-w-2xl mx-auto">
          We encountered an unexpected error. Please try again or contact us if the problem persists.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="text-sm text-red-400 bg-dark-secondary p-4 rounded-lg my-6 font-mono">
            Error: {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors"
          >
            Try Again
          </button>
          <Link href="/" className="px-8 py-3 border-2 border-magenta text-cream font-bold rounded-lg hover:bg-magenta/20 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
