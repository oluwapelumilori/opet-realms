
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Sparkles,
  Building2,
  Bug,
  Armchair,
  HardHat,
  Shirt,
} from 'lucide-react'

const services = [
  {
    id: 'home-cleaning',
    title: 'Home Cleaning',
    description:
      'Enjoy a fresh, tidy home with professional cleaning tailored to your space.',
    price: 15000,
    icon: Sparkles,
  },
  {
    id: 'commercial-cleaning',
    title: 'Office & Commercial Cleaning',
    description:
      'Keep your workplace clean, welcoming and ready for business.',
    price: 20000,
    icon: Building2,
  },
  {
    id: 'fumigation',
    title: 'Fumigation & Pest Control',
    description:
      'Professional pest treatment for homes, offices and other properties.',
    price: 15000,
    icon: Bug,
  },
  {
    id: 'upholstery',
    title: 'Upholstery & Sofa Cleaning',
    description:
      'Give your sofas and upholstered furniture a refreshed appearance.',
    price: 10000,
    icon: Armchair,
  },
  {
    id: 'post-construction',
    title: 'Post-Construction Cleaning',
    description:
      'Clear construction dust and residue to prepare your space for use.',
    price: 25000,
    icon: HardHat,
  },
  {
    id: 'laundry',
    title: 'Laundry & Garment Care',
    description:
      'Professional garment care with item-based pricing for your laundry.',
    price: 400,
    priceSuffix: 'per garment',
    icon: Shirt,
  },
]

const formatPrice = (amount) =>
  `₦${amount.toLocaleString('en-NG')}`

export default function Services() {
  return (
    <section className="section services-section" id="services">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">What we do</span>

          <h2>
            Professional care.
            <br />
            <span className="text-green">Every detail matters.</span>
          </h2>

          <p>
            From spotless homes to fresh garments, Opet Realms delivers
            dependable cleaning and care services across Lagos Mainland
            and Island.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => {
            const Icon = service.icon

            return (
              <article className="service-card" key={service.id}>
                <div className="service-card-top">
                  <span className="service-icon">
                    <Icon size={27} strokeWidth={1.8} />
                  </span>

                  <span className="service-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>

                <h3>{service.title}</h3>

                <p className="service-description">
                  {service.description}
                </p>

                <div className="service-price">
                  <span className="service-price-label">
                    Starting from
                  </span>

                  <strong>{formatPrice(service.price)}</strong>

                  {service.priceSuffix && (
                    <span className="service-price-suffix">
                      {service.priceSuffix}
                    </span>
                  )}
                </div>

                <Link
                  to={`/quote?service=${service.id}`}
                  className="service-link"
                >
                  Request a Quote <ArrowUpRight size={17} />
                </Link>
              </article>
            )
          })}
        </div>

        <p className="services-disclaimer">
          Prices shown are provisional starting estimates, except laundry
          pricing, which is based on the supplied garment price list.
          Final quotes depend on the service and job requirements.
        </p>
      </div>
    </section>
  )
}
