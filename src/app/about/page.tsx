export const metadata = {
  title: 'About | Solomon Teknika',
  description: 'Meet Blas Ramos, founder of Solomon Teknika. 20+ years of executive leadership building innovative products.',
}

export default function AboutPage() {
  const greatValues = [
    {
      letter: 'G',
      title: 'Grace-Centered Giving',
      description: 'Giving with grace, operating with integrity, and creating value that uplifts communities.',
    },
    {
      letter: 'R',
      title: 'Resolute Resilience',
      description: 'Facing challenges with determination, learning from setbacks, and emerging stronger.',
    },
    {
      letter: 'E',
      title: 'Extraordinary Excellence',
      description: 'Pursuing excellence in everything we do, from product quality to customer experience.',
    },
    {
      letter: 'A',
      title: 'Authentic Compassionate Action',
      description: 'Acting with authenticity and compassion, building products that genuinely help people.',
    },
    {
      letter: 'T',
      title: 'Transformational Impact',
      description: 'Creating lasting positive change in markets, communities, and lives.',
    },
  ]

  const credentials = [
    { title: 'CMC', description: 'Certified Management Consultant' },
    { title: 'ICD', description: 'Institute of Corporate Directors' },
    { title: 'ICF', description: 'International Coach Federation' },
    { title: 'ABNLP', description: 'Association for Behavioral Neuro-Linguistic Programming' },
  ]

  const careerHighlights = [
    {
      company: 'SimCorp',
      role: 'Global Executive Leadership',
      description: 'Launched solutions across international markets',
    },
    {
      company: 'PCCW Solutions',
      role: 'Executive Leadership',
      description: 'Scaled operations and drove digital transformation',
    },
    {
      company: 'Dairy Farm',
      role: 'Operations & Strategy',
      description: 'Optimized supply chain and market expansion',
    },
    {
      company: 'RingCentral',
      role: 'Global Market Development',
      description: 'Built and scaled revenue in emerging markets',
    },
  ]

  return (
    <div>
      {/* Header */}
      <section className="bg-dark-secondary py-16 border-b border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-jost text-4xl md:text-5xl text-cream font-bold mb-4">
            About Solomon Teknika
          </h1>
          <p className="text-lg text-body-text max-w-2xl">
            Built on 20+ years of global executive leadership, a commitment to innovation, and a mission to change lives through technology.
          </p>
        </div>
      </section>

      {/* Founder Bio Section */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-jost text-4xl text-cream font-bold mb-4">Blas Ramos</h2>
              <p className="text-xl text-magenta font-semibold mb-6">Founder & Chief Innovation Officer</p>

              <p className="text-lg text-body-text mb-6">
                Blas is a visionary entrepreneur with 20+ years of global executive leadership experience across telecommunications, operations, and digital transformation.
              </p>

              <p className="text-body-text mb-6">
                A Filipino pioneer in the technology sector, Blas is building the foundation for what could become Southeast Asia's first home-grown unicorn venture studio. His personal tagline captures his philosophy:
              </p>

              <div className="bg-dark-secondary border-l-4 border-magenta p-6 rounded-lg mb-8">
                <p className="font-jost text-xl text-cream italic">
                  "Breaking Limits Achieves Success"
                </p>
              </div>

              <p className="text-body-text mb-6">
                Solomon Teknika represents Blas's commitment to proving that extraordinary companies can be built at speed, with efficiency, and with a purpose-driven mission to transform lives.
              </p>

              <p className="text-body-text">
                He is committed to building from nothing and owning everything—creating enterprises that generate sustainable value and lasting positive impact.
              </p>
            </div>

            <div className="bg-dark-secondary rounded-2xl p-8 border border-dark-tertiary">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-body-text font-semibold mb-2">BACKGROUND</p>
                  <p className="text-cream text-lg">20+ Years Global Executive Leadership</p>
                </div>
                <div>
                  <p className="text-sm text-body-text font-semibold mb-2">NATIONALITY</p>
                  <p className="text-cream text-lg">Filipino</p>
                </div>
                <div>
                  <p className="text-sm text-body-text font-semibold mb-2">MISSION</p>
                  <p className="text-cream">Building the first Filipino unicorn venture studio. Shaping legacies. Scaling futures. Changing lives.</p>
                </div>
                <div>
                  <p className="text-sm text-body-text font-semibold mb-3">CERTIFICATIONS</p>
                  <div className="space-y-2">
                    {credentials.map((cred) => (
                      <div key={cred.title} className="bg-dark-tertiary p-3 rounded">
                        <p className="text-orange font-bold text-sm">{cred.title}</p>
                        <p className="text-xs text-body-text">{cred.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Highlights */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-12 text-center">
            Career Highlights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {careerHighlights.map((item) => (
              <div key={item.company} className="bg-dark-tertiary rounded-xl p-8 border border-dark-tertiary hover:border-orange transition-colors">
                <h3 className="font-jost text-2xl text-orange font-bold mb-2">{item.company}</h3>
                <p className="font-semibold text-cream mb-3">{item.role}</p>
                <p className="text-body-text">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* G.R.E.A.T. Values */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-4 text-center">
            Our G.R.E.A.T. Values
          </h2>
          <p className="text-center text-body-text mb-16 max-w-2xl mx-auto">
            Solomon Teknika operates on principles that unite entrepreneurship with purpose. Every decision, every product, every action is guided by these five pillars.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {greatValues.map((value) => (
              <div key={value.letter} className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary hover:border-magenta transition-all group cursor-pointer">
                <div className="text-5xl font-jost font-bold text-magenta group-hover:text-orange transition-colors mb-4">
                  {value.letter}
                </div>
                <h3 className="font-jost text-lg text-cream font-bold mb-3">{value.title}</h3>
                <p className="text-sm text-body-text">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-jost text-3xl text-orange font-bold mb-4">Our Mission</h3>
              <p className="text-lg text-body-text leading-relaxed">
                To build and scale innovative technology products with unparalleled speed and efficiency, creating sustainable enterprises that generate wealth and positive impact. We are committed to proving that extraordinary companies can be built with minimal resources and maximum purpose.
              </p>
            </div>
            <div>
              <h3 className="font-jost text-3xl text-orange font-bold mb-4">Our Vision</h3>
              <p className="text-lg text-body-text leading-relaxed">
                To establish Solomon Teknika as the world's leading venture studio model, demonstrating that technology-driven operations can consistently produce unicorn-quality exits. To build the first Filipino-founded unicorn venture studio and change the narrative around what's possible from emerging markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TAVARA Holdings Connection */}
      <section className="bg-dark-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-jost text-3xl md:text-4xl text-cream font-bold mb-6">
            Part of TAVARA OPC
          </h2>
          <p className="text-lg text-body-text max-w-2xl mx-auto mb-8">
            Solomon Teknika operates as a division of TAVARA OPC — Orchestrate. Propel. Conquer. A global investment and operations firm committed to building enterprises from the ground up.
          </p>
          <div className="bg-dark-secondary rounded-xl p-8 border border-magenta/30 inline-block">
            <p className="text-cream font-jost text-lg mb-3">TAVARA OPC:</p>
            <p className="text-magenta font-semibold italic">
              "Shaping Futures. Changing Lives.<br/>
              Building from Nothing. Something Worth Leaving."
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-jost text-3xl text-cream font-bold mb-4">
            Let's Build Something Extraordinary
          </h2>
          <p className="text-lg text-body-text mb-8">
            Whether you're an investor, entrepreneur, or potential acquirer, we'd love to discuss how Solomon Teknika can add value.
          </p>
          <a href="mailto:blas@tavaraholdings.com" className="px-8 py-4 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors inline-block">
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  )
}
