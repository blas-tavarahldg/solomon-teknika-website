import Link from 'next/link'

export const metadata = {
  title: '404 - Page Not Found | Solomon Teknika',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-jost text-6xl md:text-8xl font-bold text-orange mb-4">404</h1>
        <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-4">Page Not Found</h2>
        <p className="text-lg text-body-text mb-8 max-w-2xl mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="px-8 py-3 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors">
            Go Home
          </Link>
          <Link href="/portfolio" className="px-8 py-3 border-2 border-magenta text-cream font-bold rounded-lg hover:bg-magenta/20 transition-colors">
            Browse Portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}
