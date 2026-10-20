
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

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

  useEffect(() => {
    closeMenu()

    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.slice(1)

      let attempts = 0

      const scrollToSection = () => {
        const section = document.getElementById(sectionId)

        if (section) {
          section.scrollIntoView({ behavior: 'smooth' })
          return
        }

        attempts += 1

        if (attempts < 20) {
          requestAnimationFrame(scrollToSection)
        }
      }

      requestAnimationFrame(scrollToSection)
    }
  }, [location.pathname, location.hash])

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link
          to="/"
          className="navbar-logo"
          aria-label="Opet Realms home"
          onClick={closeMenu}
        >
          <img
            src="/images/opet-realms-logo.png.jpg"
            alt="Opet Realms logo"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile action buttons */}
          <div className="nav-mobile-actions">
            <Link
              to="/#services"
              className="button button-secondary nav-cta"
              onClick={closeMenu}
            >
              View Our Services
            </Link>

            <Link
              to="/quote"
              className="button button-primary nav-cta"
              onClick={closeMenu}
            >
              Request a Quote
            </Link>
          </div>
        </nav>

        {/* Desktop action buttons */}
        <div className="nav-actions">
          <Link
            to="/#services"
            className="button button-secondary nav-cta"
          >
            View Our Services
          </Link>

          <Link
            to="/quote"
            className="button button-primary nav-cta"
          >
            Request a Quote
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="nav-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
