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
    title: 'Bedroom Refresh',
    category: 'Home Cleaning',
    description: 'A fresh, tidy bedroom transformation.',
    before: '/images/gallery/Bed%20Before%20.jpg',
    after: '/images/gallery/Bed%20after%20.jpg',
  },
  {
    title: 'Bathroom Transformation',
    category: 'Deep Cleaning',
    description: 'A fresher, cleaner bathroom.',
    before: '/images/gallery/Bathroom%20Before%20.jpg',
    after: '/images/gallery/Bathroom%20After%20.jpg',
  },
  {
    title: 'Kitchen Deep Clean',
    category: 'Deep Cleaning',
    description: 'A refreshed kitchen space.',
    before: '/images/gallery/Big%20kitchen%20Before%20.jpg',
    after: '/images/gallery/Big%20kitchen%20After%20.jpg',
  },
  {
    title: 'Brown Chair Refresh',
    category: 'Deep Cleaning',
    description: 'A refreshed chair with a cleaner finish.',
    before: '/images/gallery/Brown%20chair%20Before%20.jpg',
    after: '/images/gallery/Brown%20chair%20After%20.jpg',
  },
  {
    title: 'Carpet Refresh',
    category: 'Deep Cleaning',
    description: 'A cleaner-looking carpet.',
    before: '/images/gallery/Carpet%20Before%20.jpg',
    after: '/images/gallery/Carpet%20After%20.jpg',
  },
  {
    title: 'Colour Chair Refresh',
    category: 'Deep Cleaning',
    description: 'A chair cleaning transformation.',
    before: '/images/gallery/Colour%20Chair%20Before.jpg',
    after: '/images/gallery/Colur%20Chair%20After.jpg',
  },
  {
    title: 'Long Chair Refresh',
    category: 'Deep Cleaning',
    description: 'A refreshed long chair.',
    before: '/images/gallery/Long%20Chair%20Before%20.jpg',
    after: '/images/gallery/Long%20Cahir%20After.jpg',
  },
  {
    title: 'Parlour Refresh',
    category: 'Home Cleaning',
    description: 'A cleaner, more inviting living space.',
    before: '/images/gallery/Palour%20Before.jpg',
    after: '/images/gallery/Parlour%20After.jpg',
  },
  {
    title: 'Room Refresh',
    category: 'Home Cleaning',
    description: 'A refreshed and tidier room.',
    before: '/images/gallery/Room%20before.jpg',
    after: '/images/gallery/Room%20After%20.jpg',
  },
  {
    title: 'Room Self Refresh',
    category: 'Home Cleaning',
    description: 'A refreshed room with a cleaner finish.',
    before: '/images/gallery/RoomSelf%20%20Before..jpg',
    after: '/images/gallery/RoomSelf%20After%20.jpg',
  },
  {
    title: 'Rug Refresh',
    category: 'Deep Cleaning',
    description: 'A refreshed rug.',
    before: '/images/gallery/Rug%20Before%20.jpg',
    after: '/images/gallery/Rug%20After%20.jpg',
  },
  {
    title: 'Small Kitchen Clean',
    category: 'Deep Cleaning',
    description: 'A cleaner, tidier kitchen.',
    before: '/images/gallery/Small%20Kichten%20Before.jpg',
    after: '/images/gallery/Small%20Kichten%20After%20.jpg',
  },
  {
    title: 'Toilet Transformation',
    category: 'Deep Cleaning',
    description: 'A fresher, cleaner toilet space.',
    before: '/images/gallery/Toilet%20Before%20.jpg',
    after: '/images/gallery/Toilet%20after%20.jpg',
  },
  {
    title: 'White Chair Refresh',
    category: 'Deep Cleaning',
    description: 'A refreshed white chair.',
    before: '/images/gallery/White%20CHair%20Before%20.jpg',
    after: '/images/gallery/White%20Chair%20After.jpg',
  },
  {
    title: 'Yellow Chair Refresh',
    category: 'Deep Cleaning',
    description: 'A chair cleaning transformation.',
    before: '/images/gallery/Yellow%20Cahir%20Bfeore%20.jpg',
    after: '/images/gallery/Yellow%20Cahir%20After%20.jpg',
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
