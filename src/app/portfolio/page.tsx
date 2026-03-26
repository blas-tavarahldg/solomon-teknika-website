import Link from 'next/link'
import { portfolioApps } from '@/data/portfolio'

export const metadata = {
  title: 'Portfolio | Solomon Teknika',
  description: 'Our portfolio of innovative technology products from concept to scale.',
}

export default function PortfolioPage() {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Build':
        return 'bg-blue-900/30 text-blue-400'
      case 'Lift':
        return 'bg-purple-900/30 text-purple-400'
      case 'Accelerate':
        return 'bg-orange-900/30 text-orange-400'
      case 'Scale':
        return 'bg-green-900/30 text-green-400'
      default:
        return 'bg-magenta/20 text-magenta'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-900/30 text-green-400'
      case 'In Development':
        return 'bg-magenta/20 text-magenta'
      case 'Acquired':
        return 'bg-navy/30 text-navy'
      default:
        return 'bg-dark-tertiary text-body-text'
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-dark-secondary py-16 border-b border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-jost text-4xl md:text-5xl text-cream font-bold mb-4">
            Our Portfolio
          </h1>
          <p className="text-lg text-body-text max-w-2xl">
            Five innovative products at different stages of development, from launch to scale. Each built with our proprietary BLAS X Framework.
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {portfolioApps.map((app) => (
              <Link key={app.slug} href={`/portfolio/${app.slug}`}>
                <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary hover:border-orange transition-all cursor-pointer group h-full">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h2 className="font-jost text-3xl text-cream font-bold group-hover:text-orange transition-colors mb-2">
                        {app.name}
                      </h2>
                      <p className="text-sm text-magenta font-semibold mb-4">{app.tagline}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(app.phase)}`}>
                      Phase: {app.phase}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-body-text text-sm mb-6">{app.description}</p>

                  {/* Market Size */}
                  <div className="bg-dark-tertiary rounded-lg p-4 mb-6">
                    <p className="text-xs text-body-text font-semibold mb-1">Market Size</p>
                    <p className="text-xl font-bold text-orange">{app.marketSize}</p>
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-2 mb-6">
                    {app.metrics.slice(0, 2).map((metric, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-xs text-body-text">{metric.label}</span>
                        <span className="text-xs text-cream font-semibold">{metric.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="text-orange font-bold text-sm group-hover:text-cream transition-colors">
                    Explore Details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BLAS X Phase Info */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            BLAS X Framework Phases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-dark-tertiary border border-blue-900/50 p-6 rounded-xl">
              <h3 className="font-jost text-xl text-blue-400 font-bold mb-3">Build</h3>
              <p className="text-sm text-body-text">
                Foundation phase: MVP development, market validation, and core product-market fit establishment.
              </p>
            </div>
            <div className="bg-dark-tertiary border border-purple-900/50 p-6 rounded-xl">
              <h3 className="font-jost text-xl text-purple-400 font-bold mb-3">Lift</h3>
              <p className="text-sm text-body-text">
                Growth phase: Feature expansion, user acquisition, and early traction metrics validation.
              </p>
            </div>
            <div className="bg-dark-tertiary border border-orange-900/50 p-6 rounded-xl">
              <h3 className="font-jost text-xl text-orange-400 font-bold mb-3">Accelerate</h3>
              <p className="text-sm text-body-text">
                Scaling phase: Revenue optimization, market expansion, and operational maturation.
              </p>
            </div>
            <div className="bg-dark-tertiary border border-green-900/50 p-6 rounded-xl">
              <h3 className="font-jost text-xl text-green-400 font-bold mb-3">Scale</h3>
              <p className="text-sm text-body-text">
                Exit preparation: Strategic positioning, buyer engagement, and transaction readiness.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
