'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    type: 'general',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          company: '',
          subject: '',
          message: '',
          type: 'general',
        })

        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const contactMethods = [
    {
      title: 'Email',
      value: 'blas@tavaraholdings.com',
      icon: '✉',
      action: 'mailto:blas@tavaraholdings.com',
    },
    {
      title: 'Purpose',
      value: 'Acquisitions • Partnerships • Investments',
      icon: '🎯',
      action: '#',
    },
  ]

  return (
    <div>
      {/* Header */}
      <section className="bg-dark-secondary py-16 border-b border-dark-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-jost text-4xl md:text-5xl text-cream font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-body-text max-w-2xl">
            Whether you're interested in acquiring, investing, or partnering with Solomon Teknika, we're ready to discuss opportunities.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="font-jost text-2xl text-cream font-bold mb-8">Contact Information</h2>

              <div className="space-y-6">
                {contactMethods.map((method) => (
                  <div key={method.title}>
                    <p className="text-orange font-semibold mb-2 flex gap-2">
                      <span>{method.icon}</span>
                      {method.title}
                    </p>
                    {method.action === '#' ? (
                      <p className="text-cream font-semibold">{method.value}</p>
                    ) : (
                      <a
                        href={method.action}
                        className="text-body-text hover:text-orange transition-colors break-all"
                      >
                        {method.value}
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-dark-tertiary">
                <h3 className="font-jost text-xl text-cream font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/portfolio" className="text-body-text hover:text-orange transition-colors">
                      Explore Our Portfolio
                    </a>
                  </li>
                  <li>
                    <a href="/model" className="text-body-text hover:text-orange transition-colors">
                      Learn About BLAS X
                    </a>
                  </li>
                  <li>
                    <a href="/acquirers" className="text-body-text hover:text-orange transition-colors">
                      For Acquirers
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="text-body-text hover:text-orange transition-colors">
                      About Blas Ramos
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="text-4xl text-orange mb-4">✓</div>
                    <h3 className="font-jost text-2xl text-cream font-bold mb-2">Message Sent!</h3>
                    <p className="text-body-text mb-6">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-cream mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 bg-dark-tertiary text-cream rounded-lg border border-dark-tertiary focus:border-orange focus:outline-none transition-colors"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-cream mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 bg-dark-tertiary text-cream rounded-lg border border-dark-tertiary focus:border-orange focus:outline-none transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-semibold text-cream mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-dark-tertiary text-cream rounded-lg border border-dark-tertiary focus:border-orange focus:outline-none transition-colors"
                          placeholder="Your company"
                        />
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-semibold text-cream mb-2">
                          Inquiry Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-dark-tertiary text-cream rounded-lg border border-dark-tertiary focus:border-orange focus:outline-none transition-colors"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="acquisition">Acquisition Interest</option>
                          <option value="partnership">Partnership</option>
                          <option value="investment">Investment</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-cream mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-dark-tertiary text-cream rounded-lg border border-dark-tertiary focus:border-orange focus:outline-none transition-colors"
                        placeholder="What is this about?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-cream mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 bg-dark-tertiary text-cream rounded-lg border border-dark-tertiary focus:border-orange focus:outline-none transition-colors resize-none"
                        placeholder="Tell us more about your interest..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-orange text-dark-primary font-bold rounded-lg hover:bg-cream transition-colors"
                    >
                      Send Message
                    </button>

                    <p className="text-xs text-body-text text-center">
                      We respect your privacy. Your information will only be used to respond to your inquiry.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="bg-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl text-cream font-bold mb-12 text-center">
            Preferred Contact Methods by Inquiry Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-tertiary rounded-xl p-8 border border-dark-tertiary">
              <h3 className="font-jost text-xl text-orange font-bold mb-4">⚡ Time-Sensitive Inquiries</h3>
              <p className="text-body-text mb-4">
                For urgent matters related to acquisitions or investment opportunities:
              </p>
              <a href="mailto:blas@tavaraholdings.com" className="text-cream font-semibold hover:text-orange transition-colors">
                Email directly: blas@tavaraholdings.com
              </a>
            </div>

            <div className="bg-dark-tertiary rounded-xl p-8 border border-dark-tertiary">
              <h3 className="font-jost text-xl text-orange font-bold mb-4">📅 Schedule a Call</h3>
              <p className="text-body-text mb-4">
                For deeper conversations, we use Calendly for scheduling calls with prospects and partners.
              </p>
              <p className="text-cream font-semibold">Coming soon: Calendly link in email response</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-dark-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-jost text-3xl text-cream font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary">
              <h3 className="font-jost text-lg text-orange font-bold mb-3">What's the typical timeline for an acquisition?</h3>
              <p className="text-body-text">
                From initial engagement to closing, we typically work with a 14-week timeline. This includes due diligence, valuation, and transaction documentation.
              </p>
            </div>

            <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary">
              <h3 className="font-jost text-lg text-orange font-bold mb-3">What valuation multiples do you expect?</h3>
              <p className="text-body-text">
                Based on comparable software acquisitions, we typically target 2.5–4x revenue multiples, adjusted for growth rate, unit economics, and market opportunity.
              </p>
            </div>

            <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary">
              <h3 className="font-jost text-lg text-orange font-bold mb-3">Do you work with specific types of acquirers?</h3>
              <p className="text-body-text">
                We're open to strategic acquirers, larger platforms, and financial investors. The best fit depends on the specific product and buyer synergies.
              </p>
            </div>

            <div className="bg-dark-secondary rounded-xl p-8 border border-dark-tertiary">
              <h3 className="font-jost text-lg text-orange font-bold mb-3">What if I'm interested in a specific portfolio company?</h3>
              <p className="text-body-text">
                Contact us directly with the product name and your interest. We'll arrange a conversation to discuss fit and potential next steps.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
