import { ClipboardList, MessageCircle, UserCheck } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Select services & address',
    description:
      'Choose a service, your property size or items, and your Lagos street address.',
    icon: ClipboardList,
  },
  {
    number: '02',
    title: 'Send your enquiry on WhatsApp',
    description:
      'Submit your quote request and continue on WhatsApp for pricing and scheduling.',
    icon: MessageCircle,
  },
  {
    number: '03',
    title: 'Supervisor walkthrough',
    description:
      'Our crew does the job and a supervisor walks you through the finished work before we leave.',
    icon: UserCheck,
  },
]

export default function HowItWorks() {
  return (
    <section className="section how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-heading section-heading-left">
          <span className="eyebrow">How it works</span>
          <h2>Three simple steps</h2>
        </div>

        <div className="steps-grid">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <article className="step-card" key={step.number}>
                <div className="step-card-top">
                  <span className="step-icon">
                    <Icon size={26} strokeWidth={1.8} />
                  </span>
                  <span className="step-number">{step.number}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
