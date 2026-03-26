'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-dark-primary/95 backdrop-blur border-b border-dark-tertiary">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center text-dark-primary font-bold">
            ST
          </div>
          <span className="font-jost font-bold text-cream hidden sm:inline">Solomon Teknika</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-8 items-center">
          <li>
            <Link href="/portfolio" className="text-body-text hover:text-orange transition-colors">
              Portfolio
            </Link>
          </li>
          <li>
            <Link href="/model" className="text-body-text hover:text-orange transition-colors">
              The Model
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-body-text hover:text-orange transition-colors">
              About
            </Link>
          </li>
          <li>
            <Link href="/acquirers" className="text-body-text hover:text-orange transition-colors">
              For Acquirers
            </Link>
          </li>
          <li>
            <Link href="/contact" className="px-4 py-2 bg-orange text-dark-primary rounded-lg font-semibold hover:bg-cream transition-colors">
              Contact
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-cream"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-dark-secondary border-t border-dark-tertiary">
          <ul className="flex flex-col gap-4 p-4">
            <li>
              <Link href="/portfolio" onClick={() => setIsOpen(false)} className="text-body-text hover:text-orange">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/model" onClick={() => setIsOpen(false)} className="text-body-text hover:text-orange">
                The Model
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setIsOpen(false)} className="text-body-text hover:text-orange">
                About
              </Link>
            </li>
            <li>
              <Link href="/acquirers" onClick={() => setIsOpen(false)} className="text-body-text hover:text-orange">
                For Acquirers
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="inline-block px-4 py-2 bg-orange text-dark-primary rounded-lg font-semibold hover:bg-cream">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
