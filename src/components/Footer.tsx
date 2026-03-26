import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-secondary border-t border-dark-tertiary mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-cream font-jost font-bold mb-4">Solomon Teknika</h3>
            <p className="text-sm text-body-text mb-4">
              Technology-driven venture studio building innovative products at speed and scale.
            </p>
            <p className="text-xs text-body-text">INNOVATIONS | TECHNOLOGIES | SOLUTIONS</p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-cream font-jost font-bold mb-4">Portfolio</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/portfolio/serbisuyo" className="text-body-text hover:text-orange transition-colors">
                  SERBISUYO
                </Link>
              </li>
              <li>
                <Link href="/portfolio/palo-fore" className="text-body-text hover:text-orange transition-colors">
                  PALO FORE
                </Link>
              </li>
              <li>
                <Link href="/portfolio/pamealya-plate" className="text-body-text hover:text-orange transition-colors">
                  PAMEALYA PLATE
                </Link>
              </li>
              <li>
                <Link href="/portfolio/roleta" className="text-body-text hover:text-orange transition-colors">
                  ROLETA
                </Link>
              </li>
              <li>
                <Link href="/portfolio/unified-local-card" className="text-body-text hover:text-orange transition-colors">
                  UNIFIED LOCAL CARD
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-cream font-jost font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-body-text hover:text-orange transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/model" className="text-body-text hover:text-orange transition-colors">
                  BLAS X Model
                </Link>
              </li>
              <li>
                <Link href="/acquirers" className="text-body-text hover:text-orange transition-colors">
                  For Acquirers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-body-text hover:text-orange transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-cream font-jost font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-body-text hover:text-orange transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-body-text hover:text-orange transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-tertiary pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-body-text text-center md:text-left">
              © {currentYear} Solomon Teknika / TAVARA OPC. All rights reserved.
            </p>
            <div className="text-xs text-body-text text-center">
              <p className="mb-2">TAVARA OPC: Orchestrate. Propel. Conquer.</p>
              <p>Building from Nothing. Something Worth Leaving.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
