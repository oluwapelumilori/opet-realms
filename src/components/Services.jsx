import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { SERVICES } from '../data/services'
import { formatNaira } from '../config'

function ServiceCard({ service }) {
  const [selected, setSelected] = useState(0)

  const option = service.options[selected]
  const selectId = `service-select-${service.id}`

  const quoteLink = `/quote?${new URLSearchParams({
    service: service.id,
    size: option.label,
  }).toString()}`

  return (
    <article className="service-card">
      <h3>{service.title}</h3>

      <p className="service-description">{service.description}</p>

      <ul className="service-features">
        {service.features.map((feature) => (
          <li key={feature}>
            <Check size={16} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="service-field">
        <label htmlFor={selectId}>{service.fieldLabel}</label>

        <select
          id={selectId}
          className="service-select"
          value={selected}
          onChange={(event) => setSelected(Number(event.target.value))}
        >
          {service.options.map((item, index) => (
            <option key={item.label} value={index}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="service-price">
        <span className="service-price-label">
          {option.price ? 'Starting from' : 'Price'}
        </span>

        {option.price ? (
          <>
            <strong>{formatNaira(option.price)}</strong>
            {service.priceSuffix && (
              <span className="service-price-suffix">{service.priceSuffix}</span>
            )}
          </>
        ) : (
          <strong className="service-price-text">
            {option.priceText || 'Quote after inspection'}
          </strong>
        )}
      </div>

      <p className="service-hint">{service.hint}</p>

      <Link to={quoteLink} className="button button-outline service-cta">
        Request a Quote
      </Link>
    </article>
  )
}

export default function Services() {
  return (
    <section className="section services-section" id="services">
      <div className="container">
        <div className="section-heading section-heading-left">
          <span className="eyebrow">Services</span>
          <h2>Everything your space needs</h2>
          <p>
            Pick your size or items for each service to see its starting
            price.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <p className="services-disclaimer">
          All prices are starting prices. The final price is confirmed after
          inspection and depends on property size, condition and the work
          required.
        </p>
      </div>
    </section>
  )
}
