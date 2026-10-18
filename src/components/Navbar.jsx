
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'

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
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
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
            alt="Opet Realms — Sharp & Spotless"
            className="brand-logo"
          />
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
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-link"
              onClick={(event) =>
                handleSectionClick(event, item.href)
              }
            >
              {item.label}
            </a>
          ))}

          <Link
            to="/gallery"
            className="nav-link gallery-nav-link"
            onClick={closeMenu}
          >
            Gallery
          </Link>

          <Link
            to="/quote"
            className="button button-primary nav-cta"
            onClick={closeMenu}
          >
            Request a Quote <ArrowUpRight size={17} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
