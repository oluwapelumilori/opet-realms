
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'

const categories = [
  'All',
  'Home Cleaning',
  'Deep Cleaning',
  'Fumigation',
  'Garment Care',
]

const projects = [
  {
    title: 'Fresh, Spotless Living Spaces',
    category: 'Home Cleaning',
    description: 'A clean and comfortable space for everyday living.',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Detailed Deep Cleaning',
    category: 'Deep Cleaning',
    description: 'Attention to the areas that need extra care.',
    image:
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Professional Cleaning Care',
    category: 'Home Cleaning',
    description: 'Thoughtful cleaning for a brighter home.',
    image:
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Fabric and Garment Care',
    category: 'Garment Care',
    description: 'Care for the garments and fabrics you value.',
    image:
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'A Cleaner Working Environment',
    category: 'Deep Cleaning',
    description: 'Clean surroundings for a more welcoming space.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'A Fresh Start',
    category: 'Fumigation',
    description: 'Ask our team about suitable pest-control treatments.',
    image:
      'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=900&q=85',
  },
]

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
      <header className="page-header">
        <div className="container">
          <Link to="/" className="button button-outline">
            <ArrowLeft size={18} />
            Back Home
          </Link>

          <span className="eyebrow">Our work</span>

          <h1>See the spotless difference.</h1>

          <p>
            Explore cleaning inspiration and garment-care projects.
            Contact our team to discuss the results you're looking for.
          </p>
        </div>
      </header>

      <main className="section gallery-page">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Project gallery</span>
            <h2>Care in every detail.</h2>
            <p>
              Browse our service categories and discover how we
              approach cleaner, fresher spaces.
            </p>
          </div>

          <div
            className="gallery-filters"
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

          <div className="gallery-grid">
            {filteredProjects.map((project) => (
              <article className="gallery-card" key={project.title}>
                <div className="gallery-image-wrap">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                  />

                  <span className="gallery-category">
                    {project.category}
                  </span>
                </div>

                <div className="gallery-card-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </article>
            ))}
          </div>

          <section className="gallery-cta">
            <div>
              <span className="eyebrow">Your space, refreshed</span>
              <h2>Ready for your own spotless result?</h2>
              <p>
                Tell us about your cleaning or garment-care needs
                and request a personalised quote.
              </p>
            </div>

            <Link to="/quote" className="button button-primary">
              Book a Quote <ArrowUpRight size={18} />
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
