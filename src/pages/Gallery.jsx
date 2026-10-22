import { useState } from 'react'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import { projects, categories } from '../data/galleryProjects'

export default function Gallery() {
  const [active, setActive] = useState('All')

  const visible =
    active === 'All'
      ? projects
      : projects.filter((project) => project.category === active)

  return (
    <main className="ba-section ba-section--page">
      <div className="container">
        <header className="ba-header">
          <span className="ba-eyebrow">Before &amp; After</span>
          <h1>Our work, up close</h1>
          <p>
            Real transformations from our crews across Lagos.
          </p>
        </header>

        <div
          className="ba-filters"
          role="group"
          aria-label="Filter gallery by category"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`ba-pill ${
                active === category ? 'is-active' : ''
              }`}
              aria-pressed={active === category}
              onClick={() => setActive(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="ba-grid ba-grid--2">
            {visible.map((project) => (
              <article
                className="ba-card"
                key={project.title}
              >
                <BeforeAfterSlider {...project} />

                <div className="ba-info">
                  <h3>{project.title}</h3>
                  <span className="ba-category">
                    {project.category}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="ba-empty">
            New {active.toLowerCase()} transformations are coming soon.
          </p>
        )}
      </div>
    </main>
  )
}
```
