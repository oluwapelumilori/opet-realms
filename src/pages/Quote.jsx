import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ClipboardList, MessageCircle } from 'lucide-react'
import { SERVICES } from '../data/services'
import { GARMENT_PRICES, formatNaira } from '../config'

const WHATSAPP_NUMBER = '2347079079235'
const BEDBUG_TREATMENTS = ['1-visit intensive', '2-visit with follow-up']

const generateReference = () => {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `OR-${yy}${mm}${dd}-${rand}`
}

const todayLocal = () => {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const emptyGarments = () =>
  Object.fromEntries(GARMENT_PRICES.map((item) => [item.id, 0]))

export default function Quote() {
  const [searchParams] = useSearchParams()
  const requestedId = searchParams.get('service')
  const requestedSize = searchParams.get('size')

  // Which service cards are ticked (pre-ticked when coming from a service card)
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(
      SERVICES.map((service) => [service.id, service.id === requestedId])
    )
  )

  // Selected dropdown option index per service (property size / item & size)
  const [choice, setChoice] = useState(() =>
    Object.fromEntries(
      SERVICES.map((service) => {
        const index =
          service.id === requestedId
            ? service.options.findIndex(
                (option) => option.label === requestedSize
              )
            : -1
        return [service.id, index >= 0 ? index : 0]
      })
    )
  )

  const [bedbugTreatment, setBedbugTreatment] = useState(0)
  const [upholsteryQty, setUpholsteryQty] = useState('1')
  const [garments, setGarments] = useState(emptyGarments)

  const [details, setDetails] = useState({
    street: '',
    area: '',
    date: '',
    notes: '',
  })

  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const selectedGarments = useMemo(
    () =>
      GARMENT_PRICES.filter((item) => garments[item.id] > 0).map((item) => ({
        ...item,
        quantity: garments[item.id],
        total: item.price * garments[item.id],
      })),
    [garments]
  )

  const garmentCount = selectedGarments.reduce((sum, i) => sum + i.quantity, 0)
  const laundryTotal = selectedGarments.reduce((sum, i) => sum + i.total, 0)

  const toggleService = (id) =>
    setChecked((previous) => ({ ...previous, [id]: !previous[id] }))

  const updateChoice = (id, value) =>
    setChoice((previous) => ({ ...previous, [id]: Number(value) }))

  const updateDetails = (event) => {
    const { name, value } = event.target
    setDetails((previous) => ({ ...previous, [name]: value }))
  }

  const updateContact = (event) => {
    const { name, value } = event.target
    setContact((previous) => ({ ...previous, [name]: value }))
  }

  const updateGarment = (id, value) => {
    const quantity = value === '' ? 0 : Number(value)
    if (!Number.isInteger(quantity) || quantity < 0) return
    setGarments((previous) => ({ ...previous, [id]: quantity }))
  }

  const buildServiceLines = () => {
    const lines = []

    SERVICES.filter((service) => checked[service.id]).forEach((service) => {
      const option = service.options[choice[service.id]]

      if (service.id === 'laundry') {
        lines.push(`• ${service.title}`)
        selectedGarments.forEach((item) => {
          lines.push(
            `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
          )
        })
        lines.push(`   Total garments: ${garmentCount}`)
        lines.push(`   Estimated laundry total: ${formatNaira(laundryTotal)}`)
        return
      }

      if (service.id === 'upholstery') {
        lines.push(
          `• ${service.title} — ${option.label} × ${Number.parseInt(upholsteryQty, 10)}`
        )
        return
      }

      if (service.id === 'bedbug') {
        lines.push(
          `• ${service.title} — Size: ${option.label}, Treatment: ${BEDBUG_TREATMENTS[bedbugTreatment]}`
        )
        return
      }

      lines.push(`• ${service.title} — Size: ${option.label}`)
    })

    return lines
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    const anySelected = SERVICES.some((service) => checked[service.id])

    if (!anySelected) {
      setError('Please select at least one service.')
      return
    }

    if (checked.laundry && garmentCount === 0) {
      setError('Please enter a quantity for at least one garment.')
      return
    }

    if (
      checked.upholstery &&
      !(Number.parseInt(upholsteryQty, 10) >= 1)
    ) {
      setError('Please enter a quantity for upholstery & carpet care.')
      return
    }

    if (!details.street.trim() || !details.area.trim()) {
      setError('Please enter your street address and area.')
      return
    }

    if (!contact.name.trim() || !contact.phone.trim()) {
      setError('Please enter your name and phone number.')
      return
    }

    const reference = generateReference()

    const message = [
      'Hello Opet Realms! I would like to request a quote.',
      '',
      `Reference: ${reference}`,
      '',
      'SERVICES:',
      ...buildServiceLines(),
      '',
      'LOCATION & DETAILS:',
      `Street: ${details.street.trim()}`,
      `Area: ${details.area.trim()}`,
      `Preferred date: ${details.date ? formatDate(details.date) : 'Not specified'}`,
      `Notes: ${details.notes.trim() || 'None'}`,
      '',
      'CONTACT:',
      `Name: ${contact.name.trim()}`,
      `Phone: ${contact.phone.trim()}`,
      `Email: ${contact.email.trim() || 'Not provided'}`,
      '',
      'Please confirm availability and the final price.',
    ].join('\n')

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    setResult({ reference, url })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const startNew = () => {
    setResult(null)
    setError('')
    setChecked(Object.fromEntries(SERVICES.map((s) => [s.id, false])))
    setChoice(Object.fromEntries(SERVICES.map((s) => [s.id, 0])))
    setBedbugTreatment(0)
    setUpholsteryQty('1')
    setGarments(emptyGarments())
    setDetails({ street: '', area: '', date: '', notes: '' })
    setContact({ name: '', phone: '', email: '' })
  }

  const renderSizeSelect = (service) => (
    <div className="qf-field">
      <label htmlFor={`size-${service.id}`}>{service.fieldLabel}</label>
      <select
        id={`size-${service.id}`}
        value={choice[service.id]}
        onChange={(event) => updateChoice(service.id, event.target.value)}
      >
        {service.options.map((option, index) => (
          <option key={option.label} value={index}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderServiceOptions = (service) => {
    if (service.id === 'laundry') {
      return (
        <div className="laundry-calculator qf-laundry">
          <div className="laundry-calculator-heading">
            <span className="laundry-calculator-icon">
              <ClipboardList size={26} />
            </span>
            <div>
              <h3 id="laundry-heading">Laundry Price Calculator</h3>
              <p>
                Enter the quantity of each garment to calculate your estimated
                laundry bill.
              </p>
            </div>
          </div>

          <div className="laundry-price-list">
            {GARMENT_PRICES.map((item) => (
              <div className="laundry-price-row" key={item.id}>
                <div className="laundry-garment-info">
                  <label htmlFor={`quantity-${item.id}`}>{item.name}</label>
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
                    value={garments[item.id]}
                    onChange={(event) =>
                      updateGarment(item.id, event.target.value)
                    }
                  />
                </div>

                <strong className="laundry-line-total">
                  {formatNaira(item.price * garments[item.id])}
                </strong>
              </div>
            ))}
          </div>

          <div className="laundry-calculator-summary">
            <div className="laundry-summary-details">
              <span>Estimated laundry total</span>
              <strong>{formatNaira(laundryTotal)}</strong>
              <span className="laundry-summary-note">
                {garmentCount} {garmentCount === 1 ? 'garment' : 'garments'}{' '}
                selected
              </span>
            </div>

            <button
              type="button"
              className="button button-outline"
              onClick={() => setGarments(emptyGarments())}
            >
              Reset quantities
            </button>
          </div>

          <p className="laundry-calculator-note">
            The total is an estimate. Confirm the final amount with Opet Realms
            before placing your order.
          </p>
        </div>
      )
    }

    if (service.id === 'upholstery') {
      return (
        <div className="qf-options">
          <div className="qf-row">
            {renderSizeSelect(service)}
            <div className="qf-field qf-field-small">
              <label htmlFor="upholstery-qty">Quantity</label>
              <input
                id="upholstery-qty"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={upholsteryQty}
                onChange={(event) => setUpholsteryQty(event.target.value)}
              />
            </div>
          </div>
          <p className="qf-hint">{service.hint}</p>
        </div>
      )
    }

    if (service.id === 'bedbug') {
      return (
        <div className="qf-options">
          <div className="qf-row">
            {renderSizeSelect(service)}
            <div className="qf-field">
              <label htmlFor="bedbug-treatment">Treatment option</label>
              <select
                id="bedbug-treatment"
                value={bedbugTreatment}
                onChange={(event) =>
                  setBedbugTreatment(Number(event.target.value))
                }
              >
                {BEDBUG_TREATMENTS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="qf-hint">{service.hint}</p>
        </div>
      )
    }

    // Regular, Deep, Post-Construction, Fumigation: choose property size
    return (
      <div className="qf-options">
        <div className="qf-row">{renderSizeSelect(service)}</div>
        <p className="qf-hint">{service.hint}</p>
      </div>
    )
  }

  if (result) {
    return (
      <main className="section qf-page">
        <div className="container qf-narrow">
          <div className="qf-success" role="status">
            <span className="eyebrow">Request sent</span>
            <h1>Your reference number</h1>
            <p className="qf-reference">{result.reference}</p>
            <p>
              WhatsApp should have opened with your request ready to send. Tap
              send there to continue with our team, and quote this reference
              number if you need to follow up.
            </p>

            <div className="qf-success-actions">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary"
              >
                <MessageCircle size={18} />
                Open WhatsApp again
              </a>
              <button
                type="button"
                className="button button-outline"
                onClick={startNew}
              >
                New request
              </button>
              <Link to="/" className="button button-outline">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="section qf-page">
      <div className="container qf-narrow">
        <span className="eyebrow">Request a Quote</span>
        <h1>What do you need done?</h1>
        <p className="qf-intro">
          Select one or more services. You&apos;ll get a reference number
          instantly, then we continue on WhatsApp.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <h2 className="qf-step">1. Services</h2>

          <div className="qf-services">
            {SERVICES.map((service) => {
              const isOn = checked[service.id]

              return (
                <div
                  key={service.id}
                  className={`qf-service${isOn ? ' is-selected' : ''}`}
                >
                  <label className="qf-service-head">
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggleService(service.id)}
                    />
                    <span className="qf-checkbox" aria-hidden="true">
                      <Check size={14} />
                    </span>
                    <span className="qf-service-text">
                      <strong>{service.title}</strong>
                      <span>{service.features.join(' · ')}</span>
                    </span>
                  </label>

                  {isOn && renderServiceOptions(service)}
                </div>
              )
            })}
          </div>

          <h2 className="qf-step">2. Location &amp; details</h2>

          <div className="qf-grid">
            <div className="qf-field qf-full">
              <label htmlFor="street">Street address *</label>
              <input
                id="street"
                name="street"
                autoComplete="street-address"
                value={details.street}
                onChange={updateDetails}
                placeholder="Street address"
              />
            </div>

            <div className="qf-field">
              <label htmlFor="area">Area *</label>
              <input
                id="area"
                name="area"
                value={details.area}
                onChange={updateDetails}
                placeholder="Area (e.g. Lekki, Yaba)"
              />
            </div>

            <div className="qf-field">
              <label htmlFor="date">Preferred date for your service</label>
              <input
                id="date"
                name="date"
                type="date"
                min={todayLocal()}
                value={details.date}
                onChange={updateDetails}
              />
            </div>

            <div className="qf-field qf-full">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={details.notes}
                onChange={updateDetails}
                placeholder="Notes (condition, access, special items...)"
              />
            </div>
          </div>

          <h2 className="qf-step">3. Your contact</h2>

          <div className="qf-grid">
            <div className="qf-field">
              <label htmlFor="contact-name">Full name *</label>
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                value={contact.name}
                onChange={updateContact}
                placeholder="Your full name"
              />
            </div>

            <div className="qf-field">
              <label htmlFor="contact-phone">Phone number *</label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={contact.phone}
                onChange={updateContact}
                placeholder="Your phone number"
              />
            </div>

            <div className="qf-field qf-full">
              <label htmlFor="contact-email">Email address (optional)</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={contact.email}
                onChange={updateContact}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="button button-primary qf-submit">
            <MessageCircle size={19} />
            Request a Quote
          </button>

          <p className="form-note">
            By submitting you agree to our{' '}
            <Link to="/terms">Terms</Link> &amp;{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </main>
  )
}
