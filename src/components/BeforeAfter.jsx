import { Link } from 'react-router-dom'
import BeforeAfterSlider from './BeforeAfterSlider'
import { projects } from '../data/galleryProjects'

export default function BeforeAfter() {
  const featured = projects.slice(0, 3)

  return (
    <section className="ba-section" id="before-after">
      <div className="container">
        <header className="ba-header">
          <span className="ba-eyebrow">Before &amp; After</span>

          <h2>Drag to see the difference</h2>

          <p>Real transformations from our crews across Lagos.</p>
        </header>

        <div className="ba-grid ba-grid--3">
          {featured.map((project) => (
            <article className="ba-card" key={project.title}>
              <BeforeAfterSlider {...project} />

              <div className="ba-info">
                <h3>{project.title}</h3>
              </div>
            </article>
          ))}
        </div>

        <div className="ba-more">
          <Link to="/gallery">View full gallery →</Link>
        </div>
      </div>
    </section>
  )
}
