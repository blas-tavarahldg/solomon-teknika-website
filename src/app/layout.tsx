import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Solomon Teknika | Technology Venture Studio',
  description: 'Building innovative technology products from concept to exit. BLAS X Framework: Build. Lift. Accelerate. Scale.',
  keywords: 'venture studio, technology, entrepreneurship, product development',
  openGraph: {
    title: 'Solomon Teknika | Technology Venture Studio',
    description: 'Building innovative technology products from concept to exit.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-dark-primary text-body-text">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
