import Link from 'next/link'
import { portfolioApps, PortfolioApp } from '@/data/portfolio'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Portfolio Detail | Solomon Teknika',
}

export function generateStaticParams() {
  return portfolioApps.map((app) => ({
    slug: app.slug,
  }))
}

function getApp(slug: string): PortfolioApp | undefined {
  return portfolioApps.find((app) => app.slug === slug)
}

const getPhaseColor = (phase: string) => {
  switch (phase) {
    case 'Build':
      return { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-900/50' }
    case 'Lift':
      return { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-900/50' }
    case 'Accelerate':
      return { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-900/50' }
    case 'Scale':
      return { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-900/50' }
    default:
      return { bg: 'bg-magenta/20', text: 'text-magenta', border: 'border-magenta/50' }
  }
}

export default function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  const app = getApp(params.slug)

  if (!app) {
    notFound()
  }

  const phaseColor = getPhaseColor(app.phase)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-dark-secondary border-b border-dark-tertiary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/portfolio" className="text-orange hover:text-cream transition-colors mb-6 inline-block">
            ← Back to Portfolio
          </Link>
          <div className="mb-8">
            <h1 className="font-jost text-4xl md:text-5xl text-cream font-bold mb-4">
              {app.name}
            </h1>
            <p className="text-xl text-magenta font-semibold mb-4">{app.tagline}</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-green-900/30 text-green-400 rounded-full text-sm font-bold">
                {app.status}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${phaseColor.bg} ${phaseColor.text}`}>
                Phase: {app.phase}
              </span>
              {app.website && (
                <a href={app.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-orange text-dark-primary rounded-full text-sm font-bold hover:bg-cream transition-colors">
                  Visit Site ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Column */}
            <div className="lg:col-span-2">
              {/* Description */}
              <div className="mb-12">
                <h2 className="font-jost text-3xl text-cream font-bold mb-4">Overview</h2>
                <p className="text-lg text-body-text leading-relaxed mb-4">
                  {app.longDescription}
                </p>
              </div>

              {/* Unique Angle */}
              <div className="mb-12">
                <h2 className="font-jost text-3xl text-cream font-bold mb-4">Unique Angle</h2>
                <div className="bg-dark-secondary border-l-4 border-magenta p-6 rounded-lg">
                  <p className="text-body-text">
                    {app.uniqueAngle}
                  </p>
                </div>
              </div>

              {/* Revenue Model */}
              <div className="mb-12">
                <h2 className="font-jost text-3xl text-cream font-bold mb-4">Revenue Model</h2>
                <p className="text-body-text mb-4">
                  {app.revenueModel}
                </p>
              </div>

              {/* Market & Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="font-jost text-xl text-cream font-bold mb-3">Market Opportunity</h3>
                  <div className="bg-dark-secondary rounded-lg p-6 border border-dark-tertiary">
                    <p className="text-2xl font-bold text-orange font-jost mb-2">{app.marketSize}</p>
                    <p className="text-sm text-body-text">Total Addressable Market</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-jost text-xl text-cream font-bold mb-3">Target Market</h3>
                  <div className="bg-dark-secondary rounded-lg p-6 border border-dark-tertiary">
                    <p className="text-body-text text-sm leading-relaxed">
                      {app.targetMarket}
                    </p>
                  </div>
                </div>
              </div>

              {/* Competitive Advantages */}
              <div className="mb-12">
                <h2 className="font-jost text-3xl text-cream font-bold mb-4">Competitive Advantages</h2>
                <ul className="space-y-3">
                  {app.competitiveAdvantage.map((advantage, i) => (
                    <li key={i} className="flex gap-3 text-body-text">
                      <span className="text-orange font-bold">✓</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h2 className="font-jost text-3xl text-cream font-bold mb-4">Technology Stack</h2>
                <div className="flex flex-wrap gap-3">
                  {app.techStack.map((tech) => (
                    <span key={tech} className="px-4 py-2 bg-dark-secondary border border-magenta/50 rounded-lg text-sm text-cream font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Key Metrics Card */}
              <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary sticky top-24 mb-8">
                <h3 className="font-jost text-xl text-cream font-bold mb-6">Key Metrics</h3>
                <div className="space-y-4">
                  {app.metrics.map((metric, i) => (
                    <div key={i} className="border-b border-dark-tertiary pb-4 last:border-b-0 last:pb-0">
                      <p className="text-xs text-body-text font-semibold mb-1">{metric.label}</p>
                      <p className="text-lg font-bold text-orange">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase Tracker */}
              <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary">
                <h3 className="font-jost text-xl text-cream font-bold mb-6">BLAS X Phase</h3>
                <div className="space-y-2">
                  {(['Build', 'Lift', 'Accelerate', 'Scale'] as const).map((phase) => {
                    const isCurrentPhase = phase === app.phase
                    const phaseColors = getPhaseColor(phase)
                    return (
                      <div
                        key={phase}
                        className={`p-3 rounded-lg transition-all ${
                          isCurrentPhase
                            ? `${phaseColors.bg} ${phaseColors.text} border ${phaseColors.border}`
                            : 'bg-dark-tertiary text-body-text border border-dark-tertiary'
                        }`}
                      >
                        <p className="font-semibold text-sm">
                          {isCurrentPhase ? '▶ ' : '○ '}{phase}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-jost text-3xl text-cream font-bold mb-4">
            Interested in {app.name}?
          </h2>
          <p className="text-lg text-body-text mb-8">
            Learn more about acquisition, partnership, or investment opportunities.
          </p>
          <Link href="/contact" className="px-8 py-3 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors inline-block">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
