import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ClipboardList, MessageCircle } from 'lucide-react'
import { SERVICES } from '../data/services'
import {
  GARMENT_PRICES,
  BASKET_PRICES,
  PRESSING_PRICES,
  formatNaira,
} from '../config'
import { supabase } from '../lib/supabase'

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

const emptyQuantities = (items) =>
  Object.fromEntries(items.map((item) => [item.id, 0]))

export default function Quote() {
  const [searchParams] = useSearchParams()
  const requestedId = searchParams.get('service')
  const requestedSize = searchParams.get('size')

  const [checked, setChecked] = useState(() =>
    Object.fromEntries(SERVICES.map((service) => [service.id, service.id === requestedId]))
  )
  const [choice, setChoice] = useState(() =>
    Object.fromEntries(
      SERVICES.map((service) => {
        const index = service.id === requestedId
          ? service.options.findIndex((option) => option.label === requestedSize)
          : -1
        return [service.id, index >= 0 ? index : 0]
      })
    )
  )
  const [bedbugTreatment, setBedbugTreatment] = useState(0)
  const [upholsteryQty, setUpholsteryQty] = useState('1')
  const [garments, setGarments] = useState(() => emptyQuantities(GARMENT_PRICES))
  const [baskets, setBaskets] = useState(() => emptyQuantities(BASKET_PRICES))
  const [pressing, setPressing] = useState(() => emptyQuantities(PRESSING_PRICES))
  const [details, setDetails] = useState({ street: '', area: '', date: '', notes: '' })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedGarments = useMemo(
    () => GARMENT_PRICES.filter((item) => garments[item.id] > 0).map((item) => ({
      ...item,
      quantity: garments[item.id],
      total: item.price * garments[item.id],
    })),
    [garments]
  )

  const selectedBaskets = useMemo(
    () => BASKET_PRICES.filter((item) => baskets[item.id] > 0).map((item) => ({
      ...item,
      quantity: baskets[item.id],
      total: item.price * baskets[item.id],
    })),
    [baskets]
  )

  const selectedPressing = useMemo(
    () => PRESSING_PRICES.filter((item) => pressing[item.id] > 0).map((item) => ({
      ...item,
      quantity: pressing[item.id],
      total: item.price * pressing[item.id],
    })),
    [pressing]
  )

  const garmentCount = selectedGarments.reduce((sum, item) => sum + item.quantity, 0)
  const basketCount = selectedBaskets.reduce((sum, item) => sum + item.quantity, 0)
  const pressingCount = selectedPressing.reduce((sum, item) => sum + item.quantity, 0)

  const garmentTotal = selectedGarments.reduce((sum, item) => sum + item.total, 0)
  const basketTotal = selectedBaskets.reduce((sum, item) => sum + item.total, 0)
  const pressingTotal = selectedPressing.reduce((sum, item) => sum + item.total, 0)
  const laundryTotal = garmentTotal + basketTotal + pressingTotal
  const hasLaundrySelection = garmentCount + basketCount + pressingCount > 0

  const toggleService = (id) => setChecked((previous) => ({ ...previous, [id]: !previous[id] }))
  const updateChoice = (id, value) => setChoice((previous) => ({ ...previous, [id]: Number(value) }))

  const updateDetails = (event) => {
    const { name, value } = event.target
    setDetails((previous) => ({ ...previous, [name]: value }))
  }

  const updateContact = (event) => {
    const { name, value } = event.target
    setContact((previous) => ({ ...previous, [name]: value }))
  }

  const updateQuantity = (setter) => (id, value) => {
    const quantity = value === '' ? 0 : Number(value)
    if (!Number.isInteger(quantity) || quantity < 0) return
    setter((previous) => ({ ...previous, [id]: quantity }))
  }

  const updateGarment = updateQuantity(setGarments)
  const updateBasket = updateQuantity(setBaskets)
  const updatePressing = updateQuantity(setPressing)

  const buildServiceLines = () => {
    const lines = []

    SERVICES.filter((service) => checked[service.id]).forEach((service) => {
      const option = service.options[choice[service.id]]

      if (service.id === 'laundry') {
        lines.push(`• ${service.title}`)

        if (selectedGarments.length) {
          lines.push('   Individual laundry items:')
          selectedGarments.forEach((item) => lines.push(
            `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
          ))
          lines.push(`   Individual items subtotal: ${formatNaira(garmentTotal)}`)
        }

        if (selectedBaskets.length) {
          lines.push('   Laundry by basket:')
          selectedBaskets.forEach((item) => lines.push(
            `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
          ))
          lines.push(`   Basket subtotal: ${formatNaira(basketTotal)}`)
        }

        if (selectedPressing.length) {
          lines.push('   Pressing only:')
          selectedPressing.forEach((item) => lines.push(
            `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
          ))
          lines.push(`   Pressing subtotal: ${formatNaira(pressingTotal)}`)
        }

        lines.push(`   Total individual garments: ${garmentCount}`)
        lines.push(`   Total laundry baskets: ${basketCount}`)
        lines.push(`   Total pressing pieces: ${pressingCount}`)
        lines.push(`   Estimated laundry total: ${formatNaira(laundryTotal)}`)
        return
      }

      if (service.id === 'upholstery') {
        lines.push(`• ${service.title} — ${option.label} × ${Number.parseInt(upholsteryQty, 10)}`)
        return
      }

      if (service.id === 'bedbug') {
        lines.push(`• ${service.title} — Size: ${option.label}, Treatment: ${BEDBUG_TREATMENTS[bedbugTreatment]}`)
        return
      }

      lines.push(`• ${service.title} — Size: ${option.label}`)
    })

    return lines
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setError('')

    if (!SERVICES.some((service) => checked[service.id])) {
      setError('Please select at least one service.')
      return
    }

    if (checked.laundry && !hasLaundrySelection) {
      setError('Please enter a quantity for at least one laundry item, basket, or pressing service.')
      return
    }

    if (checked.upholstery && !(Number.parseInt(upholsteryQty, 10) >= 1)) {
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
    const serviceLines = buildServiceLines()
    const message = [
      'Hello Opet Realms! I would like to request a quote.',
      '',
      `Reference: ${reference}`,
      '',
      'SERVICES:',
      ...serviceLines,
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

    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('bookings').insert({
        booking_ref: reference,
        customer_name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim() || null,
        address: `${details.street.trim()}, ${details.area.trim()}`,
        service: serviceLines.join('\n'),
        preferred_date: details.date || null,
        preferred_time: null,
        notes: details.notes.trim() || null,
        status: 'new',
      })

      if (insertError) {
        console.error('Booking insert failed:', insertError)
        setError(`We couldn't save your request. Please try again. ${insertError.message || ''}`)
        return
      }

      setResult({ reference, url })
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Booking submission failed:', err)
      setError('Something went wrong while saving your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const startNew = () => {
    setResult(null)
    setError('')
    setChecked(Object.fromEntries(SERVICES.map((service) => [service.id, false])))
    setChoice(Object.fromEntries(SERVICES.map((service) => [service.id, 0])))
    setBedbugTreatment(0)
    setUpholsteryQty('1')
    setGarments(emptyQuantities(GARMENT_PRICES))
    setBaskets(emptyQuantities(BASKET_PRICES))
    setPressing(emptyQuantities(PRESSING_PRICES))
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
          <option key={option.label} value={index}>{option.label}</option>
        ))}
      </select>
    </div>
  )

  const renderLaundryGroup = (title, items, quantities, update, unitLabel) => (
    <section className="qf-laundry-group">
      <h4 className="qf-laundry-group-title">{title}</h4>
      <div className="laundry-price-list">
        {items.map((item) => (
          <div className="laundry-price-row" key={item.id}>
            <div className="laundry-garment-info">
              <label htmlFor={`quantity-${item.id}`}>{item.name}</label>
              <span>{formatNaira(item.price)} per {unitLabel}</span>
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
                onChange={(event) => update(item.id, event.target.value)}
              />
            </div>
            <strong className="laundry-line-total">
              {formatNaira(item.price * quantities[item.id])}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )

  const renderServiceOptions = (service) => {
    if (service.id === 'laundry') {
      return (
        <div className="laundry-calculator qf-laundry">
          <div className="laundry-calculator-heading">
            <span className="laundry-calculator-icon"><ClipboardList size={26} /></span>
            <div>
              <h3 id="laundry-heading">Laundry Price Calculator</h3>
              <p>Select quantities from any of the three laundry categories below. You can combine them in one request.</p>
            </div>
          </div>

          {renderLaundryGroup(
            'Individual laundry items',
            GARMENT_PRICES,
            garments,
            updateGarment,
            'item'
          )}

          {renderLaundryGroup(
            'Laundry by basket',
            BASKET_PRICES,
            baskets,
            updateBasket,
            'basket'
          )}
          <p className="qf-hint">
            Basket pricing is based on the quantity of laundry measured by basket. The number of clothes inside each basket does not change the basket price.
          </p>

          {renderLaundryGroup(
            'Pressing only',
            PRESSING_PRICES,
            pressing,
            updatePressing,
            'piece'
          )}

          <div className="laundry-calculator-summary">
            <div className="laundry-summary-details">
              <span>Estimated laundry total</span>
              <strong>{formatNaira(laundryTotal)}</strong>
              <span className="laundry-summary-note">
                {garmentCount} individual {garmentCount === 1 ? 'item' : 'items'} · {basketCount} {basketCount === 1 ? 'basket' : 'baskets'} · {pressingCount} pressing {pressingCount === 1 ? 'piece' : 'pieces'}
              </span>
              <span className="laundry-summary-note">
                Items: {formatNaira(garmentTotal)} · Baskets: {formatNaira(basketTotal)} · Pressing: {formatNaira(pressingTotal)}
              </span>
            </div>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setGarments(emptyQuantities(GARMENT_PRICES))
                setBaskets(emptyQuantities(BASKET_PRICES))
                setPressing(emptyQuantities(PRESSING_PRICES))
              }}
            >
              Reset quantities
            </button>
          </div>
          <p className="laundry-calculator-note">
            The total is an estimate. Confirm the final amount with Opet Realms before placing your order.
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
                onChange={(event) => setBedbugTreatment(Number(event.target.value))}
              >
                {BEDBUG_TREATMENTS.map((label, index) => (
                  <option key={label} value={index}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="qf-hint">{service.hint}</p>
        </div>
      )
    }

    return (
      <div className="qf-options">
        <div className="qf-row">{renderSizeSelect(service)}</div>
        <p className="qf-hint">{service.hint}</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="section qf-page">
        <div className="container qf-narrow">
          <div className="qf-success" role="status">
            <span className="eyebrow">Request saved</span>
            <h1>Your reference number</h1>
            <p className="qf-reference">{result.reference}</p>
            <p>
              Your request has been saved. WhatsApp should have opened with your request ready to send. Tap send there to continue with our team, and quote this reference number if you need to follow up.
            </p>
            <div className="qf-success-actions">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="button button-primary">
                <MessageCircle size={18} />Open WhatsApp again
              </a>
              <button type="button" className="button button-outline" onClick={startNew}>New request</button>
              <Link to="/" className="button button-outline">Back home</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section qf-page">
      <div className="container qf-narrow">
        <span className="eyebrow">Request a Quote</span>
        <h1>What do you need done?</h1>
        <p className="qf-intro">
          Select one or more services. You&apos;ll get a reference number instantly, then we continue on WhatsApp.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <h2 className="qf-step">1. Services</h2>
          <div className="qf-services">
            {SERVICES.map((service) => {
              const isOn = checked[service.id]
              return (
                <div key={service.id} className={`qf-service${isOn ? ' is-selected' : ''}`}>
                  <label className="qf-service-head">
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggleService(service.id)}
                    />
                    <span className="qf-checkbox" aria-hidden="true"><Check size={14} /></span>
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

          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary qf-submit" disabled={submitting}>
            <MessageCircle size={19} />
            {submitting ? 'Saving your request...' : 'Request a Quote'}
          </button>
          <p className="form-note">
            By submitting you agree to our <Link to="/terms-and-conditions">Terms</Link> &amp; <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  )
}
