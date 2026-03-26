import Link from 'next/link'

export const metadata = {
  title: 'For Acquirers | Solomon Teknika',
  description: 'Why acquire a Solomon Teknika portfolio company. Understand the exit process and what you get.',
}

export default function AcquirersPage() {
  const whyBuy = [
    {
      title: 'Proven Business Model',
      description: 'Products built using the BLAS X Framework are tested, validated, and market-ready. No concept risk.',
      icon: '✓',
    },
    {
      title: 'Clean Tech Stack',
      description: 'Built on modern, scalable technology. No legacy code or technical debt. Easy integration.',
      icon: '⚙',
    },
    {
      title: 'Lean Economics',
      description: 'Low burn rate. Strong unit economics. Positive gross margins. Sustainable growth paths.',
      icon: '💰',
    },
    {
      title: 'Rapid Scale Potential',
      description: 'Proven ability to scale 10x–100x with proper capital allocation. Exit-ready infrastructure.',
      icon: '🚀',
    },
    {
      title: 'Market Validation',
      description: 'Real users. Real revenue. Real demand signals. No unproven assumptions.',
      icon: '📊',
    },
    {
      title: 'Exit Ready',
      description: 'Clean cap table, proper documentation, and strategic positioning. Ready for smooth transaction.',
      icon: '🎯',
    },
  ]

  const exitProcess = [
    {
      step: '1',
      phase: 'Engagement',
      timeline: 'Weeks 1-2',
      details: [
        'Initial conversation and NDA signing',
        'High-level business overview',
        'Mutual fit assessment',
      ],
    },
    {
      step: '2',
      phase: 'Information Gathering',
      timeline: 'Weeks 3-4',
      details: [
        'Deep dive financial review',
        'Technical architecture review',
        'Customer references and testimonials',
        'Market validation data',
      ],
    },
    {
      step: '3',
      phase: 'Valuation & Term Sheet',
      timeline: 'Weeks 5-6',
      details: [
        'Financial modeling and forecasts',
        'Comparable company analysis',
        'Valuation framework discussion',
        'Term sheet preparation',
      ],
    },
    {
      step: '4',
      phase: 'Due Diligence',
      timeline: 'Weeks 7-10',
      details: [
        'Comprehensive legal review',
        'Operational audit',
        'Customer and revenue verification',
        'IP and technology assessment',
      ],
    },
    {
      step: '5',
      phase: 'Negotiation & Closing',
      timeline: 'Weeks 11-14',
      details: [
        'Price and term negotiations',
        'Deal documentation',
        'Closing conditions satisfaction',
        'Transaction closing',
      ],
    },
  ]

  const whatYouGet = [
    {
      title: 'The Product',
      items: [
        'Fully developed, market-tested product',
        'Clean code base and architecture',
        'Scalable infrastructure',
        'All intellectual property',
      ],
    },
    {
      title: 'The Team',
      items: [
        'Founder/leadership transition plan',
        'Key personnel (if desired)',
        'Detailed operational documentation',
        'Training and knowledge transfer',
      ],
    },
    {
      title: 'The Data',
      items: [
        'User base and customer contracts',
        'Revenue history and projections',
        'Market research and competitive analysis',
        'Growth and performance metrics',
      ],
    },
    {
      title: 'The Future',
      items: [
        'Clear growth roadmap',
        'Market expansion opportunities',
        'Cross-sell and integration potential',
        'Founder support during transition',
      ],
    },
  ]

  const valuation = [
    {
      metric: 'Typical Exit Multiple',
      value: '2.5–4x revenue',
      explanation: 'Based on SaaS and software comparables',
    },
    {
      metric: 'ARR at Exit',
      value: '$1M–$10M+',
      explanation: 'Depends on product maturity and market',
    },
    {
      metric: 'Time to Exit',
      value: '18–24 months',
      explanation: 'From inception to acquisition-ready',
    },
    {
      metric: 'Gross Margin Target',
      value: '70%+',
      explanation: 'Software-grade unit economics',
    },
  ]

  return (
    <div>
      {/* Header */}
      <section className="bg-dark-secondary py-16 border-b border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-jost text-4xl md:text-5xl text-cream font-bold mb-4">
            For Strategic Acquirers
          </h1>
          <p className="text-lg text-body-text max-w-2xl">
            Understand why Solomon Teknika portfolio companies represent exceptional acquisition targets. Learn our process and what you'll receive.
          </p>
        </div>
      </section>

      {/* Why Buy Section */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            Why Acquire a Solomon Teknika Company?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyBuy.map((item, i) => (
              <div key={i} className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary hover:border-orange transition-all">
                <div className="text-4xl text-orange mb-4">{item.icon}</div>
                <h3 className="font-jost text-xl text-cream font-bold mb-3">{item.title}</h3>
                <p className="text-body-text text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valuation Framework */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            Valuation Framework
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {valuation.map((item) => (
              <div key={item.metric} className="bg-dark-tertiary rounded-xl p-8 border border-dark-tertiary">
                <p className="text-body-text text-sm font-semibold mb-2">{item.metric}</p>
                <p className="text-3xl font-bold text-orange font-jost mb-3">{item.value}</p>
                <p className="text-sm text-body-text italic">{item.explanation}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-dark-primary p-8 rounded-xl border border-magenta/30">
            <h3 className="font-jost text-xl text-cream font-bold mb-4">How We Price</h3>
            <p className="text-body-text mb-4">
              Solomon Teknika portfolio companies are priced based on comparable software acquisitions, adjusted for:
            </p>
            <ul className="space-y-2 text-body-text">
              <li className="flex gap-3">
                <span className="text-orange">•</span>
                <span>Growth rate and market traction</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange">•</span>
                <span>Unit economics and margins</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange">•</span>
                <span>Market size and opportunity</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange">•</span>
                <span>Strategic value and synergies</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange">•</span>
                <span>Team and operational maturity</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Exit Process */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            Our Acquisition Process
          </h2>

          <div className="space-y-6 mb-12">
            {exitProcess.map((phase) => (
              <div key={phase.step} className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange">
                      <span className="font-jost text-xl font-bold text-dark-primary">{phase.step}</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-jost text-2xl text-cream font-bold mb-2">{phase.phase}</h3>
                    <p className="text-sm text-magenta font-semibold mb-4">{phase.timeline}</p>
                    <ul className="space-y-2">
                      {phase.details.map((detail, i) => (
                        <li key={i} className="flex gap-2 text-body-text text-sm">
                          <span className="text-orange">→</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-dark-secondary rounded-xl p-8 border border-magenta/30">
            <h3 className="font-jost text-xl text-cream font-bold mb-4">Timeline Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-orange font-bold mb-1">Weeks 1-2</p>
                <p className="text-xs text-body-text">Engagement</p>
              </div>
              <div className="flex items-center justify-center text-orange text-2xl hidden md:block">→</div>
              <div className="text-center">
                <p className="text-orange font-bold mb-1">Weeks 3-6</p>
                <p className="text-xs text-body-text">Due Diligence</p>
              </div>
              <div className="flex items-center justify-center text-orange text-2xl hidden md:block">→</div>
              <div className="text-center">
                <p className="text-orange font-bold mb-1">Weeks 7-14</p>
                <p className="text-xs text-body-text">Closing</p>
              </div>
            </div>
            <p className="text-sm text-body-text text-center mt-6">
              Total: ~14 weeks from initial engagement to transaction close
            </p>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            What You'll Receive
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whatYouGet.map((section) => (
              <div key={section.title} className="bg-dark-tertiary rounded-xl p-8 border border-dark-tertiary">
                <h3 className="font-jost text-xl text-orange font-bold mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-body-text text-sm">
                      <span className="text-cream font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Success Factors */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            What Makes Our Companies Successful Post-Acquisition
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-secondary rounded-xl p-8 border border-magenta/30">
              <h3 className="font-jost text-xl text-magenta font-bold mb-4">Strong Fundamentals</h3>
              <ul className="space-y-3 text-body-text text-sm">
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Market demand is already proven</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Unit economics are validated</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Growth levers are identified</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Product-market fit is clear</span>
                </li>
              </ul>
            </div>

            <div className="bg-dark-secondary rounded-xl p-8 border border-magenta/30">
              <h3 className="font-jost text-xl text-magenta font-bold mb-4">Rapid Scaling Potential</h3>
              <ul className="space-y-3 text-body-text text-sm">
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Technology is scalable and clean</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Operations are repeatable</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Team is battle-tested</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange">●</span>
                  <span>Capital efficiency is proven</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-6">
            Ready to Explore an Acquisition?
          </h2>
          <p className="text-lg text-body-text mb-4">
            Contact Blas Ramos to discuss how a Solomon Teknika company can add value to your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:blas@tavaraholdings.com" className="px-8 py-4 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors inline-block">
              Email: blas@tavaraholdings.com
            </a>
            <Link href="/portfolio" className="px-8 py-4 border-2 border-magenta text-cream font-bold rounded-lg hover:bg-magenta/20 transition-colors inline-block">
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
