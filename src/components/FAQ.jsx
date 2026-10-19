import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What services does Opet Realms offer?',
    answer:
      'We offer regular and deep cleaning, post-construction and move-in cleaning, fumigation and pest control, bedbug treatment, upholstery and carpet care, and laundry and garment care.',
  },
  {
    question: 'How do I request a quote?',
    answer:
      'Visit our Request a Quote page, select your preferred service and size, and provide your contact details and job requirements. We will use these details to prepare your enquiry.',
  },
  {
    question: 'How much do your services cost?',
    answer:
      'The prices on our website are starting prices. The final price is confirmed after inspection and depends on the service, property size, condition and work required. Laundry and garment care uses item-based pricing.',
  },
  {
    question: 'Can I send multiple garments for laundry?',
    answer:
      'Yes. You can select multiple garment types, enter the quantity for each item and review the estimated total before submitting your laundry enquiry.',
  },
  {
    question: 'Which areas do you cover?',
    answer:
      'Opet Realms serves customers across Lagos Mainland and Lagos Island. Please include your exact area in your quote request so we can confirm service availability.',
  },
  {
    question: 'How does the booking process work?',
    answer:
      'Choose a service, submit your requirements through our quote form and follow the WhatsApp link to discuss your enquiry with our team. Your service date and final price should be confirmed with us.',
  },
  {
    question: 'Do I need to provide cleaning supplies?',
    answer:
      'Please mention any specific requirements when requesting a quote. Our team will confirm the equipment, products and preparations needed for your particular service.',
  },
  {
    question: 'How can I contact Opet Realms?',
    answer:
      'Call or WhatsApp us on +234 707 907 9235, or email opetrealms@gmail.com. You can also use the contact information at the bottom of our website.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(-1)

  return (
    <section className="section faq-section" id="faqs">
      <div className="container faq-narrow">
        <div className="section-heading section-heading-left">
          <span className="eyebrow">FAQs</span>
          <h2>Questions, answered</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            const answerId = `faq-answer-${index}`

            return (
              <article className="faq-item" key={faq.question}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span>{faq.question}</span>

                  <ChevronDown
                    size={20}
                    className={isOpen ? 'faq-chevron is-open' : 'faq-chevron'}
                  />
                </button>

                {isOpen && (
                  <div className="faq-answer" id={answerId}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
