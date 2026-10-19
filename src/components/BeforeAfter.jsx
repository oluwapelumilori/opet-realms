import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight } from 'lucide-react'

// Replace these image URLs with your real before-and-after photos.
const projects = [
  {
    title: 'Fabric armchair revival',
    before:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Parlour deep clean',
    before:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Bedroom reset',
    before:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    after:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
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
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      <span className="ba-label ba-label-before">Before</span>
      <span className="ba-label ba-label-after">After</span>

      <span className="ba-divider" style={{ left: `${position}%` }} />

      <span className="ba-handle" style={{ left: `${position}%` }}>
        <ArrowLeftRight size={18} aria-hidden="true" />
      </span>

      <input
        type="range"
        className="ba-range"
        min="0"
        max="100"
        step="0.5"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Compare before and after: ${project.title}`}
      />
    </div>
  )
}

export default function BeforeAfter() {
  return (
    <section className="section before-after-section" id="before-after">
      <div className="container">
        <div className="section-heading section-heading-left">
          <span className="eyebrow">Before &amp; After</span>
          <h2>Drag to see the difference</h2>
          <p>Real transformations from our crews across Lagos.</p>
        </div>

        <div className="ba-grid">
          {projects.map((project) => (
            <article key={project.title}>
              <Slider project={project} />
              <h3 className="ba-caption">{project.title}</h3>
            </article>
          ))}
        </div>

        <div className="ba-gallery-link">
          <Link to="/gallery">
            View full gallery <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <p className="gallery-note">
          These are illustrative photos, not verified Opet Realms project
          results. Replace them with your actual before-and-after photos when
          available.
        </p>
      </div>
    </section>
  )
}
