'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ModelPage() {
  const [activePhase, setActivePhase] = useState<'Build' | 'Lift' | 'Accelerate' | 'Scale'>('Build')

  const phases = [
    {
      name: 'Build',
      title: 'Zero to Deployed Product',
      duration: 'Sprint 1–3',
      description: 'Transform concept into deployed MVP that processes real transactions. Proprietary development velocity compresses traditional 3-month cycles into days, not weeks.',
      deliverables: [
        'Market research & validation',
        'MVP development & launch',
        'Initial user acquisition',
        'Product-market fit signals',
        'Cost efficiency optimization',
      ],
      metrics: [
        'Development cost: ~$3,000',
        'Time to MVP: 2-4 weeks',
        'Initial user base: 100+',
      ],
    },
    {
      name: 'Lift',
      title: 'Paying Users & Market Validation',
      duration: 'Sprint 4–8',
      description: 'Get paying users. Supply-first strategy — onboard providers who bring their own clients. Target: 50 completed transactions.',
      deliverables: [
        'Supply-side onboarding (providers first)',
        '50+ completed transactions',
        'Revenue model validation',
        'Retention optimization',
        'User feedback integration',
      ],
      metrics: [
        'Completed transactions: 50+',
        'Paying users: growing weekly',
        'Feature velocity: 2-3 per week',
      ],
    },
    {
      name: 'Accelerate',
      title: 'Hit $5K MRR & Optimize',
      duration: 'Sprint 9–20',
      description: 'Hit $5K MRR sustained 2+ months. Retention over acquisition. Optimize take rates. Focus on unit economics and sustainable growth.',
      deliverables: [
        '$5K MRR sustained 2+ months',
        'Take rate optimization',
        'Retention-first strategy',
        'Operational maturation',
        'Strategic partnerships',
      ],
      metrics: [
        'MRR target: $5K+ sustained',
        'Retention: month-over-month improvement',
        'Unit economics: Positive',
      ],
    },
    {
      name: 'Scale',
      title: 'Package for Acquisition & Exit',
      duration: 'Sprint 21–30',
      description: 'Package for acquisition. List on Acquire.com, Empire Flippers, Microns.io. Exit at 2.5–4x revenue. No emotional attachment — data decides.',
      deliverables: [
        'Acquisition listing preparation',
        'Financial documentation & P&L',
        'Strategic buyer identification',
        'Growth narrative packaging',
        'Transaction closing',
      ],
      metrics: [
        'Exit multiple: 2.5–4x revenue',
        'Gross margin: 70%+',
        'Clean cap table & documentation',
      ],
    },
  ]

  const phase = phases.find((p) => p.name === activePhase) || phases[0]

  return (
    <div>
      {/* Header */}
      <section className="bg-dark-secondary py-16 border-b border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-jost text-4xl md:text-5xl text-cream font-bold mb-4">
            The BLAS X Framework
          </h1>
          <p className="text-lg text-body-text max-w-2xl">
            Our proprietary methodology for transforming concepts into profitable, scalable products faster and cheaper than traditional development.
          </p>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {phases.map((p) => (
              <button
                key={p.name}
                onClick={() => setActivePhase(p.name as any)}
                className={`p-6 rounded-xl transition-all cursor-pointer text-center ${
                  activePhase === p.name
                    ? 'bg-orange text-dark-primary border-2 border-orange'
                    : 'bg-dark-secondary border-2 border-dark-tertiary text-cream hover:border-orange'
                }`}
              >
                <h3 className="font-jost text-2xl font-bold mb-2">{p.name}</h3>
                <p className={`text-sm ${activePhase === p.name ? 'text-dark-primary/80' : 'text-body-text'}`}>
                  {p.duration}
                </p>
              </button>
            ))}
          </div>

          {/* Active Phase Detail */}
          <div className="bg-dark-secondary rounded-2xl p-12 border border-orange/30">
            <h2 className="font-jost text-4xl text-cream font-bold mb-4">{phase.title}</h2>
            <p className="text-lg text-body-text mb-8">{phase.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-jost text-xl text-orange font-bold mb-4">Key Deliverables</h3>
                <ul className="space-y-3">
                  {phase.deliverables.map((item, i) => (
                    <li key={i} className="flex gap-3 text-body-text">
                      <span className="text-orange font-bold text-lg">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-jost text-xl text-orange font-bold mb-4">Target Metrics</h3>
                <ul className="space-y-3">
                  {phase.metrics.map((metric, i) => (
                    <li key={i} className="bg-dark-tertiary p-4 rounded-lg">
                      <p className="text-sm text-body-text">{metric}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Economics Comparison */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            Superior Economics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Approach */}
            <div className="bg-dark-tertiary rounded-xl p-8 border border-red-900/30">
              <h3 className="font-jost text-2xl text-cream font-bold mb-6">Traditional Venture Approach</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-body-text text-sm mb-1">Development Cost</p>
                  <p className="text-2xl font-bold text-red-400">$50K–$500K+</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Time to MVP</p>
                  <p className="text-2xl font-bold text-red-400">3–6 months</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Team Size</p>
                  <p className="text-2xl font-bold text-red-400">5–15 people</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Time to Scale</p>
                  <p className="text-2xl font-bold text-red-400">12–24 months</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Capital Required</p>
                  <p className="text-2xl font-bold text-red-400">$500K–$5M Series A</p>
                </div>
              </div>
            </div>

            {/* BLAS X Approach */}
            <div className="bg-dark-tertiary rounded-xl p-8 border border-green-900/30">
              <h3 className="font-jost text-2xl text-cream font-bold mb-6">BLAS X Framework</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-body-text text-sm mb-1">Development Cost</p>
                  <p className="text-2xl font-bold text-green-400">~$3,000</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Time to MVP</p>
                  <p className="text-2xl font-bold text-green-400">2–4 weeks</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Operating Model</p>
                  <p className="text-2xl font-bold text-green-400">Lean & Vertically Integrated</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Time to Scale</p>
                  <p className="text-2xl font-bold text-green-400">3–6 months</p>
                </div>
                <div>
                  <p className="text-body-text text-sm mb-1">Capital Efficiency</p>
                  <p className="text-2xl font-bold text-green-400">10x improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BLAS X Works */}
      <section className="bg-dark-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            Why BLAS X Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-secondary p-8 rounded-xl border border-magenta/30">
              <div className="flex gap-4 mb-4">
                <div className="text-3xl text-orange">⚡</div>
                <h3 className="font-jost text-xl text-cream font-bold">Speed First Design</h3>
              </div>
              <p className="text-body-text">
                Every decision prioritizes velocity. No committee approvals. No lengthy planning cycles. Ship, learn, iterate.
              </p>
            </div>

            <div className="bg-dark-secondary p-8 rounded-xl border border-magenta/30">
              <div className="flex gap-4 mb-4">
                <div className="text-3xl text-orange">🧬</div>
                <h3 className="font-jost text-xl text-cream font-bold">Proprietary Technology Stack</h3>
              </div>
              <p className="text-body-text">
                Built on proven, reusable foundations. No reinventing the wheel. Each new product stands on the shoulders of previous ones.
              </p>
            </div>

            <div className="bg-dark-secondary p-8 rounded-xl border border-magenta/30">
              <div className="flex gap-4 mb-4">
                <div className="text-3xl text-orange">🎯</div>
                <h3 className="font-jost text-xl text-cream font-bold">Market-Driven Development</h3>
              </div>
              <p className="text-body-text">
                Real users from day one. Every feature tested against actual market demand. Zero ego, pure pragmatism.
              </p>
            </div>

            <div className="bg-dark-secondary p-8 rounded-xl border border-magenta/30">
              <div className="flex gap-4 mb-4">
                <div className="text-3xl text-orange">🚀</div>
                <h3 className="font-jost text-xl text-cream font-bold">Exit-Ready Architecture</h3>
              </div>
              <p className="text-body-text">
                Built to be acquired. Clean code. Scalable infrastructure. Documentation. No technical debt anchoring valuation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Summary */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            Framework Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: 'Concept to Live', value: '7 days', icon: '⚡' },
              { label: 'Build Cost', value: '~$3,000', icon: '💰' },
              { label: 'Global App Market', value: '$753B', icon: '🌍' },
              { label: 'Target Exit Multiple', value: '2.5–4x', icon: '📈' },
              { label: 'Portfolio Apps', value: '5', icon: '📦' },
            ].map((metric, i) => (
              <div key={i} className="bg-dark-tertiary p-6 rounded-xl border border-dark-tertiary hover:border-orange transition-colors text-center">
                <div className="text-3xl mb-3">{metric.icon}</div>
                <p className="text-sm text-body-text mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-orange font-jost">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark-primary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-6">
            Ready to See BLAS X in Action?
          </h2>
          <p className="text-lg text-body-text mb-8">
            Explore our portfolio of products built using the framework.
          </p>
          <Link href="/portfolio" className="px-8 py-4 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors inline-block">
            View Our Portfolio
          </Link>
        </div>
      </section>
    </div>
  )
}
