
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const projects = [
  {
    title: 'Bedroom Refresh',
    category: 'Home Cleaning',
    before: '/images/gallery/Bed%20Before%20.jpg',
    after: '/images/gallery/Bed%20after%20.jpg',
  },
  {
    title: 'Parlour Refresh',
    category: 'Home Cleaning',
    before: '/images/gallery/Palour%20Before.jpg',
    after: '/images/gallery/Parlour%20After.jpg',
  },
  {
    title: 'Kitchen Deep Clean',
    category: 'Deep Cleaning',
    before: '/images/gallery/Big%20kitchen%20Before%20.jpg',
    after: '/images/gallery/Big%20kitchen%20After.jpg',
  },
  {
    title: 'Carpet Refresh',
    category: 'Deep Cleaning',
    before: '/images/gallery/Carpet%20Before%20.jpg',
    after: '/images/gallery/Carpet%20After.jpg',
  },
]

export default function BeforeAfter() {
  return (
    <section className="before-after section" id="before-after">
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Before &amp; After
          </span>

          <h2>
            See the <span className="hero-highlight">difference.</span>
          </h2>

          <p>
            Real cleaning transformations from our work across Lagos.
          </p>
        </div>

        <div className="before-after-grid">
          {projects.map((project) => (
            <article className="before-after-card" key={project.title}>
              <div className="before-after-images">
                <div className="before-after-image">
                  <img
                    src={project.before}
                    alt={`${project.title} before cleaning`}
                    loading="lazy"
                    onError={(e) => {
                      console.error('Before image failed to load:', project.before)
                      e.currentTarget.style.visibility = 'hidden'
                    }}
                  />
                  <span className="image-label">BEFORE</span>
                </div>

                <div className="before-after-image">
                  <img
                    src={project.after}
                    alt={`${project.title} after cleaning`}
                    loading="lazy"
                    onError={(e) => {
                      console.error('After image failed to load:', project.after)
                      e.currentTarget.style.visibility = 'hidden'
                    }}
                  />
                  <span className="image-label">AFTER</span>
                </div>
              </div>

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
