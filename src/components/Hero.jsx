import { Link } from 'react-router-dom'
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Clock3,
} from 'lucide-react'

const trust = [
  { icon: ShieldCheck, title: 'Supervised jobs', text: 'Walkthrough on completion' },
  { icon: CheckCircle2, title: 'Trained crew', text: 'Vetted and uniformed' },
  { icon: Clock3, title: 'Fast response', text: 'Quick enquiry handling' },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-background" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90"
          alt=""
        />
        <div className="hero-background-overlay" />
      </div>

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="eyebrow">
            <MapPin size={15} aria-hidden="true" />
            SERVING ALL OF LAGOS
          </span>

          <h1>
            Homes left{' '}
            <span className="hero-highlight">sharp &amp; spotless.</span>
          </h1>

          <p className="hero-description">
            Regular and deep cleaning, post-construction, fumigation, bedbug
            treatment, upholstery and laundry — supervised from start to
            finish.
          </p>

          <div className="hero-actions">
            <Link to="/quote" className="button button-primary">
              Request a Quote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <a
              href="https://wa.me/2347079079235"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="hero-trust">
            {trust.map((item) => {
              const Icon = item.icon

              return (
                <div className="hero-trust-item" key={item.title}>
                  <Icon size={24} aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
