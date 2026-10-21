
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeftRight, Sparkles } from 'lucide-react'

const projects = [
  {
    title: 'Bedroom Refresh',
    category: 'Home Cleaning',
    before: '/images/gallery/Bed%20Before%20.jpg',
    after: '/images/gallery/Bed%20after%20.jpg',
  },
  {
    title: 'Kitchen Deep Clean',
    category: 'Deep Cleaning',
    before: '/images/gallery/Big%20kitchen%20Before%20.jpg',
    after: '/images/gallery/Big%20kitchen%20After%20.jpg',
  },
  {
    title: 'Carpet Refresh',
    category: 'Deep Cleaning',
    before: '/images/gallery/Carpet%20Before%20.jpg',
    after: '/images/gallery/Carpet%20After%20.jpg',
  },
  {
    title: 'Parlour Refresh',
    category: 'Home Cleaning',
    before: '/images/gallery/Palour%20Before.jpg',
    after: '/images/gallery/Parlour%20After.jpg',
  },
]

function BeforeAfterSlider({ project }) {
  const [position, setPosition] = useState(50)

  return (
    <div className="ba-slider">
      <img
        className="ba-image"
        src={project.after}
        alt={`${project.title} after cleaning`}
        loading="lazy"
        draggable="false"
      />

      <img
        className="ba-image"
        src={project.before}
        alt={`${project.title} before cleaning`}
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

export default function BeforeAfter() {
  return (
    <section className="before-after section" id="before-after">
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Real Cleaning Results
          </span>

          <h2>
            See the <span className="hero-highlight">difference.</span>
          </h2>

          <p>
            Drag to compare our before-and-after cleaning photos.
          </p>
        </div>

        <div className="before-after-grid">
          {projects.map((project) => (
            <article className="before-after-card" key={project.title}>
              <BeforeAfterSlider project={project} />

              <div className="before-after-info">
                <div>
                  <span className="before-after-category">
                    {project.category}
                  </span>
                  <h3>{project.title}</h3>
                </div>

                <Sparkles size={20} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>

        <div className="before-after-cta">
          <Link to="/gallery" className="button button-primary">
            View All Projects
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
