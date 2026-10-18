
import { ClipboardList, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    number: '01',
    title: 'Choose Your Service',
    description:
      'Select the cleaning, fumigation, upholstery or garment-care service you need.',
    icon: ClipboardList,
  },
  {
    number: '02',
    title: 'Request a Quote',
    description:
      'Tell us about your requirements, property or garments to receive a tailored estimate.',
    icon: MessageCircle,
  },
  {
    number: '03',
    title: 'Confirm With Our Team',
    description:
      'Continue on WhatsApp to discuss your quote, availability and service arrangements.',
    icon: CheckCircle2,
  },
]

export default function HowItWorks() {
  return (
    <section className="section how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Simple and straightforward</span>

          <h2>
            A spotless experience
            <br />
            <span className="text-green">in three steps.</span>
          </h2>

          <p>
            Getting started with Opet Realms is easy. Tell us what you
            need, and our team will help you plan the next step.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <article className="step-card" key={step.number}>
                <div className="step-card-top">
                  <span className="step-number">{step.number}</span>

                  <span className="step-icon">
                    <Icon size={27} strokeWidth={1.8} />
                  </span>
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

                {index < steps.length - 1 && (
                  <ArrowRight
                    className="step-connector"
                    size={22}
                    aria-hidden="true"
                  />
                )}
              </article>
            )
          })}
        </div>

        <div className="steps-cta">
          <p>Ready to get started?</p>

          <Link to="/quote" className="button button-primary">
            Book a Quote <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
