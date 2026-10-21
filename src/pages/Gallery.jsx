
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from 'lucide-react'

const categories = [
  'All',
  'Home Cleaning',
  'Deep Cleaning',
  'Fumigation',
  'Garment Care',
]

const projects = [
  {
    title: 'Fabric armchair revival',
    category: 'Garment Care',
    description: 'Stains lifted and fabric freshened.',
    before:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Parlour deep clean',
    category: 'Deep Cleaning',
    description: 'Attention to the areas that need extra care.',
    before:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Bedroom reset',
    category: 'Home Cleaning',
    description: 'A clean and comfortable space for everyday living.',
    before:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Living room refresh',
    category: 'Home Cleaning',
    description: 'Thoughtful cleaning for a brighter home.',
    before:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Office deep clean',
    category: 'Deep Cleaning',
    description: 'Clean surroundings for a more welcoming workspace.',
    before:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Pest-free fresh start',
    category: 'Fumigation',
    description: 'Ask our team about suitable pest-control treatments.',
    before:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  },
]

function Slider({ project }) {
  const [position, setPosition] = useState(50)

  return (
    <div className="ba-slider">
      <img
        className="ba-image"
        src={project.after}
        alt={`${project.title} after`}
        loading="lazy"
        draggable="false"
      />

      <img
        className="ba-image"
        src={project.before}
        alt={`${project.title} before`}
        loading="lazy"
        draggable="false"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      />

      <span className="ba-label ba-label-before">Before</span>
      <span className="ba-label ba-label-after">After</span>

      <span
        className="ba-divider"
        style={{ left: `${position}%` }}
      />

      <span
        className="ba-handle"
        style={{ left: `${position}%` }}
      >
        <ArrowLeftRight size={18} aria-hidden="true" />
      </span>

      <input
        type="range"
        className="ba-range"
        min="0"
        max="100"
        step="0.5"
        value={position}
        onChange={(event) =>
          setPosition(Number(event.target.value))
        }
        aria-label={`Compare before and after: ${project.title}`}
      />
    </div>
  )
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter(
          (project) => project.category === activeCategory
        )

  return (
    <>
      <header className="page-header gallery-page-header">
        <div className="container gallery-header-content">
          <Link
            to="/"
            className="button button-outline gallery-back-button"
          >
            <ArrowLeft size={18} />
            Back Home
          </Link>

          <div className="gallery-header-copy">
            <span className="eyebrow">Our work</span>

            <h1>See the spotless difference.</h1>

            <p>
              Drag each slider to compare before and after.
              Contact our team to discuss the results you're
              looking for.
            </p>
          </div>
        </div>
      </header>

      <main className="section gallery-page">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Project gallery</span>
            <h2>Drag to see the difference</h2>

            <p>
              Browse our service categories and see how we
              approach cleaner, fresher spaces.
            </p>
          </div>

          <div
            className="gallery-filters"
            role="group"
            aria-label="Filter gallery by service"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`gallery-filter ${
                  activeCategory === category ? 'active' : ''
                }`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProjects.length > 0 ? (
            <div className="gallery-grid">
              {filteredProjects.map((project) => (
                <article
                  className="gallery-card"
                  key={project.title}
                >
                  <Slider project={project} />

                  <div className="gallery-card-content">
                    <span className="gallery-category">
                      {project.category}
                    </span>

                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No projects in this category yet.</p>
            </div>
          )}

          <p className="gallery-note">
            These are illustrative photos, not verified Opet
            Realms project results. Replace them with your actual
            before-and-after photos when available.
          </p>

          <section className="gallery-cta">
            <div>
              <span className="eyebrow">
                Your space, refreshed
              </span>

              <h2>Ready for your own spotless result?</h2>

              <p>
                Tell us about your cleaning or garment-care needs
                and request a personalised quote.
              </p>
            </div>

            <Link to="/quote" className="button button-white">
              Book a Quote <ArrowUpRight size={18} />
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
