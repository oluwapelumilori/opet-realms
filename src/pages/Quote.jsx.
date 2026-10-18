import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ClipboardList,
  MessageCircle,
} from 'lucide-react'
import { GARMENT_PRICES, formatNaira } from '../config'

const SERVICES = [
  { value: 'home-cleaning', label: 'Home Cleaning' },
  { value: 'commercial-cleaning', label: 'Office & Commercial Cleaning' },
  { value: 'fumigation', label: 'Fumigation & Pest Control' },
  { value: 'upholstery', label: 'Upholstery & Sofa Cleaning' },
  { value: 'post-construction', label: 'Post-Construction Cleaning' },
  { value: 'laundry', label: 'Laundry & Garment Care' },
]

export default function Quote() {
  const [searchParams] = useSearchParams()
  const requestedService = searchParams.get('service')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: SERVICES.some((service) => service.value === requestedService)
      ? requestedService
      : '',
    location: '',
    details: '',
  })

  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(GARMENT_PRICES.map((item) => [item.id, 0]))
  )

  const [error, setError] = useState('')

  const selectedGarments = useMemo(
    () =>
      GARMENT_PRICES.filter((item) => quantities[item.id] > 0).map(
        (item) => ({
          ...item,
          quantity: quantities[item.id],
          total: item.price * quantities[item.id],
        })
      ),
    [quantities]
  )

  const garmentCount = selectedGarments.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const laundryTotal = selectedGarments.reduce(
    (sum, item) => sum + item.total,
    0
  )

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const updateQuantity = (id, value) => {
    const quantity = value === '' ? 0 : Number(value)

    if (!Number.isInteger(quantity) || quantity < 0) return

    setQuantities((previous) => ({
      ...previous,
      [id]: quantity,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim() || !form.phone.trim() || !form.service || !form.location.trim()) {
      setError('Please complete your name, phone number, service and location.')
      return
    }

    if (form.service === 'laundry' && garmentCount === 0) {
      setError('Please enter a quantity for at least one garment.')
      return
    }

    const serviceName =
      SERVICES.find((service) => service.value === form.service)?.label ||
      form.service

    const laundryDetails =
      form.service === 'laundry'
        ? [
            '',
            'GARMENT BREAKDOWN:',
            ...selectedGarments.map(
              (item) =>
                `${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
            ),
            `Total garments: ${garmentCount}`,
            `Estimated laundry total: ${formatNaira(laundryTotal)}`,
          ].join('\n')
        : ''

    const message = [
      'Hello Opet Realms! I would like to request a quote.',
      '',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Email: ${form.email.trim() || 'Not provided'}`,
      `Service: ${serviceName}`,
      `Location: ${form.location.trim()}`,
      `Requirements: ${form.details.trim() || 'Not provided'}`,
      laundryDetails,
      '',
      'Please confirm availability and the final price.',
    ].join('\n')

    window.open(
      `https://wa.me/2347079079235?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Link to="/" className="button button-outline">
            <ArrowLeft size={18} />
            Back Home
          </Link>

          <div style={{ marginTop: 28 }}>
            <span className="eyebrow">Opet Realms</span>
            <h1>Request a Quote</h1>
            <p>
              Tell us what you need. Calculate your laundry estimate
              and send your enquiry directly to our team on WhatsApp.
            </p>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="container quote-layout">
          <section className="card quote-form-card">
            <h2>Your spotless experience starts here.</h2>
            <p>
              Complete your details below. Our team will confirm your
              requirements, availability and final quote.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="quote-name">Full name *</label>
                  <input
                    id="quote-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={updateForm}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="quote-phone">Phone number *</label>
                  <input
                    id="quote-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={updateForm}
                    required
                    placeholder="Your phone number"
                  />
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="quote-email">Email address</label>
                  <input
                    id="quote-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="quote-service">Service required *</label>
                  <select
                    id="quote-service"
                    name="service"
                    value={form.service}
                    onChange={updateForm}
                    required
                  >
                    <option value="">Choose a service</option>
                    {SERVICES.map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="quote-location">
                    Your location in Lagos *
                  </label>
                  <input
                    id="quote-location"
                    name="location"
                    value={form.location}
                    onChange={updateForm}
                    required
                    placeholder="Area, street or neighbourhood"
                  />
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="quote-details">
                    Additional details
                  </label>
                  <textarea
                    id="quote-details"
                    name="details"
                    rows={4}
                    value={form.details}
                    onChange={updateForm}
                    placeholder="Property size, number of rooms, preferred date or other requirements"
                  />
                </div>
              </div>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="button button-primary quote-submit"
              >
                <MessageCircle size={19} />
                Send Enquiry on WhatsApp
              </button>

              <p className="form-note">
                Your enquiry opens WhatsApp with your details prepared
                for review. You can check the message before sending it.
              </p>
            </form>
          </section>

          <section
            className="laundry-calculator"
            aria-labelledby="laundry-heading"
          >
            <div className="laundry-calculator-heading">
              <span className="laundry-calculator-icon">
                <ClipboardList size={26} />
              </span>

              <div>
                <h2 id="laundry-heading">Laundry Price Calculator</h2>
                <p>
                  Enter the quantity of each garment to calculate
                  your estimated laundry bill.
                </p>
              </div>
            </div>

            <div className="laundry-price-list">
              {GARMENT_PRICES.map((item) => (
                <div className="laundry-price-row" key={item.id}>
                  <div className="laundry-garment-info">
                    <label htmlFor={`quantity-${item.id}`}>
                      {item.name}
                    </label>
                    <span>{formatNaira(item.price)} per item</span>
                  </div>

                  <div className="laundry-quantity-control">
                    <input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      aria-label={`Quantity of ${item.name}`}
                      value={quantities[item.id]}
                      onChange={(event) =>
                        updateQuantity(item.id, event.target.value)
                      }
                    />
                  </div>

                  <strong className="laundry-line-total">
                    {formatNaira(item.price * quantities[item.id])}
                  </strong>
                </div>
              ))}
            </div>

            <div className="laundry-calculator-summary">
              <div className="laundry-summary-details">
                <span>Estimated laundry total</span>
                <strong>{formatNaira(laundryTotal)}</strong>
                <span className="laundry-summary-note">
                  {garmentCount} {garmentCount === 1 ? 'garment' : 'garments'} selected
                </span>
              </div>

              <button
                type="button"
                className="button button-outline"
                onClick={() =>
                  setQuantities(
                    Object.fromEntries(
                      GARMENT_PRICES.map((item) => [item.id, 0])
                    )
                  )
                }
              >
                Reset quantities
              </button>
            </div>

            <p className="laundry-calculator-note">
              Prices are based on your supplied garment price list.
              The total is an estimate; confirm the final amount with
              Opet Realms before placing your order.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
