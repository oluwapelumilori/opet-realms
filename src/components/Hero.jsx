
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Clock3 } from 'lucide-react'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-background">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90"
          alt=""
          aria-hidden="true"
        />
        <div className="hero-background-overlay" />
      </div>

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="eyebrow">
            <Sparkles size={16} />
            SERVING ALL OF LAGOS
          </span>

          <h1>
            Homes left
            <br />
            <span className="hero-highlight">
              sharp &amp; spotless.
            </span>
          </h1>

          <p className="hero-description">
            Regular and deep cleaning, post-construction, fumigation,
            bedbug treatment, upholstery and laundry — supervised
            from start to finish.
          </p>

          <div className="hero-actions">
            <Link to="/quote" className="button button-primary">
              Request a Quote
              <ArrowRight size={18} />
            </Link>

            <a
              href="https://wa.me/2347079079235"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
            >
              <span aria-hidden="true">◉</span>
              Chat on WhatsApp
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <ShieldCheck size={24} />
              <div>
                <strong>Supervised jobs</strong>
                <span>Walkthrough on completion</span>
              </div>
            </div>

            <div className="hero-trust-item">
              <CheckCircle2 size={24} />
              <div>
                <strong>Trained crew</strong>
                <span>Vetted and uniformed</span>
              </div>
            </div>

            <div className="hero-trust-item">
              <Clock3 size={24} />
              <div>
                <strong>Fast response</strong>
                <span>Quick enquiry handling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
