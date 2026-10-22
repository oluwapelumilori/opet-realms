
import { useState } from 'react'
import { ArrowLeftRight, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const projects = [
  {
    title: 'Bedroom Refresh',
    category: 'Home Cleaning',
    before: '/images/gallery/optimized/bed-before.webp',
    after: '/images/gallery/optimized/bed-after.webp',
  },
  {
    title: 'Parlour Refresh',
    category: 'Home Cleaning',
    before: '/images/gallery/optimized/parlour-before.webp',
    after: '/images/gallery/optimized/parlour-after.webp',
  },
  {
    title: 'Kitchen Deep Clean',
    category: 'Deep Cleaning',
    before: '/images/gallery/optimized/kitchen-before.webp',
    after: '/images/gallery/optimized/kitchen-after.webp',
  },
  {
    title: 'Carpet Refresh',
    category: 'Deep Cleaning',
    before: '/images/gallery/optimized/carpet-before.webp',
    after: '/images/gallery/optimized/carpet-after.webp',
  },
  {
    title: 'Living Room Refresh',
    category: 'Home Cleaning',
    before: '/images/gallery/optimized/parlour-before.webp',
    after: '/images/gallery/optimized/parlour-after.webp',
  },
  {
    title: 'Fresh Kitchen Finish',
    category: 'Deep Cleaning',
    before: '/images/gallery/optimized/kitchen-before.webp',
    after: '/images/gallery/optimized/kitchen-after.webp',
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
        decoding="async"
        draggable="false"
      />

      <img
        className="ba-image ba-image-before"
        src={project.before}
        alt={`${project.title} before`}
        loading="lazy"
        decoding="async"
        draggable="false"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      />

      <span className="ba-label ba-label-before">
        Before
      </span>

      <span className="ba-label ba-label-after">
        After
      </span>

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
    <section
      className="section before-after-section"
      id="before-after"
    >
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Before &amp; After
          </span>

          <h2>
            See the{' '}
            <span className="hero-highlight">difference.</span>
          </h2>

          <p>
            Real cleaning transformations from our work across Lagos.
          </p>
        </div>

        <div className="before-after-grid">
          {projects.map((project) => (
            <article
              className="before-after-card"
              key={project.title}
            >
              <Slider project={project} />

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
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
