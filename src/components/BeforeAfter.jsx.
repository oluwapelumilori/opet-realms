
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const projects = [
  {
    title: 'Living Room Refresh',
    category: 'Home Cleaning',
    before:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    after:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Fresh & Spotless Space',
    category: 'Professional Cleaning',
    before:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    after:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  },
]

export default function BeforeAfter() {
  return (
    <section className="section before-after-section" id="before-after">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">The Opet Realms difference</span>

          <h2>
            See the difference.
            <br />
            <span className="text-green">Feel the freshness.</span>
          </h2>

          <p>
            Every detail matters. Explore the kind of fresh, clean spaces
            we aim to deliver with professional care.
          </p>
        </div>

        <div className="before-after-grid">
          {projects.map((project) => (
            <article className="comparison-card" key={project.title}>
              <div className="comparison-images">
                <div className="comparison-image">
                  <img src={project.before} alt={`${project.title} example`} />
                  <span className="comparison-label">BEFORE</span>
                </div>

                <div className="comparison-image">
                  <img src={project.after} alt={`${project.title} example`} />
                  <span className="comparison-label comparison-label-after">
                    AFTER
                  </span>
                </div>
              </div>

              <div className="comparison-content">
                <div>
                  <span className="comparison-category">
                    {project.category}
                  </span>
                  <h3>{project.title}</h3>
                </div>

                <Sparkles className="comparison-sparkle" size={24} />
              </div>
            </article>
          ))}
        </div>

        <div className="before-after-cta">
          <p>Ready to give your space the care it deserves?</p>

          <Link to="/gallery" className="button button-primary">
            Explore Our Gallery <ArrowRight size={18} />
          </Link>
        </div>

        <p className="gallery-note">
          These are illustrative photos, not verified Opet Realms project
          results. Replace them with your actual before-and-after photos
          when available.
        </p>
      </div>
    </section>
  )
}
