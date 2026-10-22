
import { useState } from 'react'
import { ArrowLeftRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const projects = [
  {
    title: 'Fabric armchair revival',
    category: 'Armchairs',
    before: '/images/gallery/Brown%20chair%20Before.jpg',
    after: '/images/gallery/Brown%20chair%20After.jpg',
  },
  {
    title: 'Parlour deep clean',
    category: 'Parlour',
    before: '/images/gallery/Palour%20Before.jpg',
    after: '/images/gallery/Parlour%20After.jpg',
  },
  {
    title: 'Bedroom reset',
    category: 'Bedroom',
    before: '/images/gallery/Bed%20Before%20.jpg',
    after: '/images/gallery/Bed%20after%20.jpg',
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
        decoding="async"
        draggable="false"
      />

      <img
        className="ba-image ba-image-before"
        src={project.before}
        alt={`${project.title} before cleaning`}
        loading="lazy"
        decoding="async"
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
        step="1"
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
        <div className="before-after-heading">
          <span className="section-eyebrow">
            BEFORE &amp; AFTER
          </span>

          <h2>Drag to see the difference</h2>

          <p>
            Real transformations from our crews across Lagos.
          </p>
        </div>

        <div className="before-after-grid">
          {projects.map((project) => (
            <article
              className="before-after-card"
              key={project.title}
            >
              <BeforeAfterSlider project={project} />

              <div className="before-after-info">
                <h3>{project.title}</h3>
              </div>
            </article>
          ))}
        </div>

        <div className="before-after-cta">
          <Link to="/gallery" className="before-after-gallery-link">
            View full gallery
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
