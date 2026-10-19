import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'

const navigation = [
  { label: 'Services', href: '/#services' },
  { label: 'Before & After', href: '/#before-after' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'FAQs', href: '/#faqs' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)

  const handleSectionClick = (event, href) => {
    closeMenu()

    if (location.pathname === '/') {
      event.preventDefault()

      const sectionId = href.split('#')[1]
      const section = document.getElementById(sectionId)

      if (section) {
        window.history.replaceState(null, '', href)
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link
          to="/"
          className="brand"
          aria-label="Opet Realms home"
          onClick={closeMenu}
        >
          <img
            src="/images/opet-realms-logo.jfif"
            alt=""
            className="brand-logo"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
          <span className="brand-text">
            <span className="brand-name">Opet Realms</span>
            <span className="brand-tagline">SHARP & SPOTLESS</span>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        <nav
          id="main-navigation"
          className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="nav-menu">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="nav-link"
                onClick={(event) => handleSectionClick(event, item.href)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <a
              href="tel:+2347079079235"
              className="nav-phone"
              onClick={closeMenu}
            >
              <Phone size={17} />
              0707 907 9235
            </a>

            <Link
              to="/quote"
              className="button button-primary nav-cta"
              onClick={closeMenu}
            >
              Request a Quote
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
