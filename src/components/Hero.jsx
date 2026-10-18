
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <span className="eyebrow">
            <Sparkles size={16} />
            Professional care. Spotless results.
          </span>

          <h1>
            Sharp service.
            <br />
            <span className="hero-highlight">Spotless spaces.</span>
          </h1>

          <p className="hero-description">
            Professional cleaning, fumigation and garment care across
            Lagos Mainland and Island. Supervised, sharp and spotless.
          </p>

          <div className="hero-actions">
            <Link to="/quote" className="button button-primary">
              Book a Quote <ArrowRight size={18} />
            </Link>

            <a href="#services" className="button button-outline">
              View Our Services
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <CheckCircle2 size={18} />
              <span>Professional care</span>
            </div>

            <div className="hero-trust-item">
              <CheckCircle2 size={18} />
              <span>Supervised service</span>
            </div>

            <div className="hero-trust-item">
              <CheckCircle2 size={18} />
              <span>Lagos Mainland & Island</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1100&q=85"
            alt="Professional cleaner preparing a space for a thorough clean"
            className="hero-image"
          />

          <div className="hero-image-overlay">
            <span className="hero-overlay-icon">
              <Sparkles size={22} />
            </span>

            <div>
              <strong>Sharp & Spotless</strong>
              <p>Care you can see. Quality you can trust.</p>
            </div>
          </div>

          <div className="hero-floating-badge">
            <span className="hero-badge-check">
              <CheckCircle2 size={20} />
            </span>

            <div>
              <strong>Every detail matters</strong>
              <span>Professional cleaning care</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
