
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-name">
                Opet Realms
              </span>

              <span className="footer-logo-tagline">
                SHARP &amp; SPOTLESS
              </span>
            </Link>

            <p>
              Professional cleaning, fumigation and garment care
              across Lagos Mainland and Island. Supervised, sharp
              and spotless.
            </p>

            <a
              className="footer-whatsapp"
              href="https://wa.me/2347079079235"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              Chat with us on WhatsApp
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>

            <Link to="/">Home</Link>
            <Link to="/#services">Services</Link>
            <Link to="/gallery">Before &amp; After</Link>
            <Link to="/#how-it-works">How It Works</Link>
            <Link to="/#faqs">FAQs</Link>
            <Link to="/quote">Request a Quote</Link>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>

            <a href="tel:+2347079079235">
              <Phone size={16} />
              +234 707 907 9235
            </a>

            <a href="mailto:opetrealms@gmail.com">
              <Mail size={16} />
              opetrealms@gmail.com
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=12+Wulemtu+Ajoke+Street+Akoka+Bariga+Lagos"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={16} />
              12 Wulemtu Ajoke Street, Akoka, Bariga, Lagos
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {year} Opet Realms. All rights reserved.
          </p>

          <div className="footer-legal">
            <Link to="/privacy-policy">
              Privacy Policy
            </Link>

            <Link to="/terms-and-conditions">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
