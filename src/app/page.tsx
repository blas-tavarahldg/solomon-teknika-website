import Link from 'next/link'
import { portfolioApps } from '@/data/portfolio'

export default function Home() {
  const featuredApps = portfolioApps.slice(0, 3)
  const metrics = [
    { label: 'Concept to Live Product', value: '7 days' },
    { label: 'Build Cost per App', value: '$3,000' },
    { label: 'Target Exit Multiple', value: '2.5–4x' },
    { label: 'Global App Market', value: '$753B' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-primary">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-magenta/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-magenta font-semibold mb-6">INNOVATIONS | TECHNOLOGIES | SOLUTIONS</p>
          <h1 className="font-jost text-4xl sm:text-5xl md:text-7xl font-black text-cream mb-6 leading-[1.05]">
            We Engineer the Future.<br/><span className="text-orange">One Digital Empire at a Time.</span>
          </h1>
          <p className="text-lg sm:text-xl text-body-text mb-8 max-w-3xl mx-auto">
            A technology-driven venture studio that builds, grows, and sells digital marketplace apps. Concept to live product in 7 days. Exit at 2.5–4x revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portfolio" className="px-8 py-4 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors">
              Explore Portfolio
            </Link>
            <Link href="/model" className="px-8 py-4 border-2 border-magenta text-cream font-bold rounded-lg hover:bg-magenta/20 transition-colors">
              Learn BLAS X
            </Link>
          </div>

          {/* Hero CTA Highlight */}
          <div className="mt-16 inline-block">
            <div className="px-4 py-2 bg-dark-secondary border border-magenta rounded-full">
              <p className="text-sm text-magenta font-semibold">
                Redefining product development economics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold text-center mb-16">
            Our Operating Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, i) => (
              <div key={i} className="bg-dark-tertiary p-8 rounded-xl border border-dark-tertiary hover:border-magenta transition-colors">
                <p className="text-body-text text-sm mb-3">{metric.label}</p>
                <p className="text-3xl font-bold text-orange font-jost">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold">
              Featured Portfolio
            </h2>
            <Link href="/portfolio" className="text-orange hover:text-cream transition-colors text-sm font-semibold">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredApps.map((app) => (
              <Link key={app.slug} href={`/portfolio/${app.slug}`}>
                <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary hover:border-orange transition-all cursor-pointer group h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-jost text-2xl text-cream font-bold group-hover:text-orange transition-colors">
                      {app.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'LIVE'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-magenta/20 text-magenta'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-body-text text-sm mb-4">{app.description}</p>
                  <div className="text-xs text-body-text mb-4">
                    <p className="font-semibold mb-2">Market Size</p>
                    <p className="text-orange">{app.marketSize}</p>
                  </div>
                  <div className="inline-block text-orange text-sm font-bold group-hover:text-cream transition-colors">
                    Learn More →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BLAS X Framework Teaser */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-6">
            The BLAS X Framework
          </h2>
          <p className="text-lg text-body-text max-w-2xl mx-auto mb-12">
            A proprietary methodology that transforms product development from months to weeks, and costs from hundreds of thousands to thousands.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {['Build', 'Lift', 'Accelerate', 'Scale'].map((phase) => (
              <div key={phase} className="bg-dark-tertiary p-6 rounded-xl border border-magenta">
                <p className="text-xl font-bold text-orange font-jost">{phase}</p>
              </div>
            ))}
          </div>
          <Link href="/model" className="px-8 py-3 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors inline-block">
            Discover the Model
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark-primary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-6">
            Ready to Explore a Partnership?
          </h2>
          <p className="text-lg text-body-text mb-8">
            Whether you're looking to acquire, invest, or collaborate, we're ready to discuss how Solomon Teknika can add value.
          </p>
          <Link href="/contact" className="px-8 py-4 bg-magenta text-cream font-bold rounded-lg hover:bg-magenta/80 transition-colors inline-block">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
