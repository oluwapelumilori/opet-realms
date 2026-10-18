
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const contactDetails = [
  {
    icon: Phone,
    label: 'Call us',
    value: '+234 707 907 9235',
    href: 'tel:+2347079079235',
  },
  {
    icon: Mail,
    label: 'Email us',
    value: 'opetrealms@gmail.com',
    href: 'mailto:opetrealms@gmail.com',
  },
  {
    icon: MapPin,
    label: 'Our address',
    value: '12 Wulemtu Ajoke Street, Akoka, Bariga, Lagos',
    href: 'https://www.google.com/maps/search/?api=1&query=12+Wulemtu+Ajoke+Street+Akoka+Bariga+Lagos',
  },
]

export default function Contact() {
  const whatsappMessage = encodeURIComponent(
    'Hello Opet Realms! I would like to enquire about your cleaning and garment care services.'
  )

  return (
    <section className="section contact-section" id="contact">
      <div className="container">
        <div className="contact-panel">
          <div className="contact-intro">
            <span className="eyebrow contact-eyebrow">
              Let's talk
            </span>

            <h2>
              Ready for a
              <br />
              <span>spotless difference?</span>
            </h2>

            <p>
              Tell us what you need. Our team is ready to help you
              explore the right cleaning, fumigation or garment-care
              service for your space and lifestyle.
            </p>

            <a
              className="button button-white"
              href={`https://wa.me/2347079079235?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={19} />
              Chat with us on WhatsApp
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="contact-details">
            {contactDetails.map((item) => {
              const Icon = item.icon

              return (
                <a
                  className="contact-detail"
                  href={item.href}
                  key={item.label}
                  target={
                    item.label === 'Our address' ? '_blank' : undefined
                  }
                  rel={
                    item.label === 'Our address'
                      ? 'noreferrer'
                      : undefined
                  }
                >
                  <span className="contact-detail-icon">
                    <Icon size={21} />
                  </span>

                  <span className="contact-detail-text">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </span>

                  <ArrowUpRight
                    className="contact-detail-arrow"
                    size={18}
                  />
                </a>
              )
            })}

            <div className="contact-service-area">
              <span className="contact-area-dot" />
              <p>
                <strong>Serving Lagos Mainland & Island</strong>
                <br />
                Contact us to confirm availability in your area.
              </p>
            </div>
          </div>
        </div>

        <div className="contact-bottom-cta">
          <p>Know the service you need?</p>

          <Link to="/quote" className="button button-primary">
            Book a Quote <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
