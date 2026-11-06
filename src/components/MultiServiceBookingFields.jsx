import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { SERVICES } from '../data/services'
import LaundryQuantityFields from './LaundryQuantityFields'
import { emptyLaundry, summarizeLaundry, buildLaundryLines } from '../lib/laundry'

const BEDBUG_TREATMENTS = ['1-visit intensive', '2-visit with follow-up']
const todayLocal = () => {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

const fieldStyle = {
  display: 'grid',
  gap: 6,
  color: '#34443a',
  fontSize: 13,
  fontWeight: 600,
  minWidth: 0,
}

const controlStyle = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 42,
  padding: '10px 12px',
  border: '1px solid #DCE5ED',
  borderRadius: 8,
  background: '#fff',
  color: '#172B3F',
  font: 'inherit',
  fontSize: 14,
}

const sectionTitle = {
  margin: '22px 0 12px',
  color: '#16365E',
  fontSize: 16,
  fontWeight: 800,
}

export default function MultiServiceBookingFields({ onSubmit, saving, error }) {
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(SERVICES.map((service) => [service.id, false]))
  )
  const [choice, setChoice] = useState(() =>
    Object.fromEntries(SERVICES.map((service) => [service.id, 0]))
  )
  const [bedbugTreatment, setBedbugTreatment] = useState(0)
  const [upholsteryQty, setUpholsteryQty] = useState('1')
  const [laundry, setLaundry] = useState(emptyLaundry)
  const [details, setDetails] = useState({ street: '', area: '', date: '', notes: '' })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [validationError, setValidationError] = useState('')

  const laundrySummary = useMemo(() => summarizeLaundry(laundry), [laundry])

  const toggleService = (id) =>
    setChecked((previous) => ({ ...previous, [id]: !previous[id] }))

  const buildServiceLines = () => {
    const lines = []
    SERVICES.filter((service) => checked[service.id]).forEach((service) => {
      const option = service.options[choice[service.id]]
      if (service.id === 'laundry') {
        lines.push(...buildLaundryLines(service.title, laundrySummary))
      } else if (service.id === 'upholstery') {
        lines.push(`• ${service.title} — ${option.label} × ${Number.parseInt(upholsteryQty, 10)}`)
      } else if (service.id === 'bedbug') {
        lines.push(`• ${service.title} — Size: ${option.label}, Treatment: ${BEDBUG_TREATMENTS[bedbugTreatment]}`)
      } else {
        lines.push(`• ${service.title} — Size: ${option.label}`)
      }
    })
    return lines
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setValidationError('')

    if (!SERVICES.some((service) => checked[service.id])) {
      setValidationError('Please select at least one service.')
      return
    }
    if (checked.laundry && laundrySummary.count === 0) {
      setValidationError('Please enter a quantity for at least one laundry item, basket, or pressing service.')
      return
    }
    if (checked.upholstery && !(Number.parseInt(upholsteryQty, 10) >= 1)) {
      setValidationError('Please enter a quantity for upholstery & carpet care.')
      return
    }
    if (!details.street.trim() || !details.area.trim()) {
      setValidationError('Please enter the street address and area.')
      return
    }
    if (!contact.name.trim() || !contact.phone.trim()) {
      setValidationError('Please enter the customer name and phone number.')
      return
    }

    onSubmit(event, {
      customer_name: contact.name.trim(),
      phone: contact.phone.trim(),
      email: contact.email.trim() || null,
      address: `${details.street.trim()}, ${details.area.trim()}`,
      service: buildServiceLines().join('\n'),
      preferred_date: details.date || null,
      preferred_time: null,
      notes: details.notes.trim() || null,
    })
  }

  const renderSizeSelect = (service) => (
    <label style={fieldStyle}>
      {service.fieldLabel}
      <select
        style={controlStyle}
        value={choice[service.id]}
        onChange={(event) => setChoice((previous) => ({ ...previous, [service.id]: Number(event.target.value) }))}
      >
        {service.options.map((option, index) => (
          <option key={option.label} value={index}>{option.label}</option>
        ))}
      </select>
    </label>
  )

  const renderServiceOptions = (service) => {
    if (service.id === 'laundry') {
      return (
        <LaundryQuantityFields
          value={laundry}
          onChange={setLaundry}
          disabled={saving}
        />
      )
    }

    if (service.id === 'upholstery') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 120px', gap: 12, marginTop: 12 }}>
          {renderSizeSelect(service)}
          <label style={fieldStyle}>Quantity<input type="number" min="1" step="1" inputMode="numeric" style={controlStyle} value={upholsteryQty} onChange={(event) => setUpholsteryQty(event.target.value)} /></label>
          <p style={{ gridColumn: '1 / -1', margin: 0, color: '#667789', fontSize: 12 }}>{service.hint}</p>
        </div>
      )
    }

    if (service.id === 'bedbug') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginTop: 12 }}>
          {renderSizeSelect(service)}
          <label style={fieldStyle}>Treatment option<select style={controlStyle} value={bedbugTreatment} onChange={(event) => setBedbugTreatment(Number(event.target.value))}>{BEDBUG_TREATMENTS.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>
          <p style={{ gridColumn: '1 / -1', margin: 0, color: '#667789', fontSize: 12 }}>{service.hint}</p>
        </div>
      )
    }

    return (
      <div style={{ marginTop: 12 }}>
        {renderSizeSelect(service)}
        <p style={{ margin: '7px 0 0', color: '#667789', fontSize: 12 }}>{service.hint}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 style={sectionTitle}>1. Services</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {SERVICES.map((service) => {
          const isOn = checked[service.id]
          return (
            <div key={service.id} style={{ border: `1px solid ${isOn ? '#21C9D0' : '#DCE5ED'}`, borderRadius: 10, padding: 13, background: isOn ? '#F3FCFC' : '#fff' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={isOn} onChange={() => toggleService(service.id)} style={{ width: 17, height: 17, marginTop: 2, accentColor: '#16365E' }} />
                <span style={{ display: 'grid', gap: 4 }}>
                  <strong style={{ color: '#16365E', fontSize: 14 }}>{service.title}</strong>
                  <span style={{ color: '#667789', fontSize: 12, lineHeight: 1.5 }}>{service.features.join(' · ')}</span>
                </span>
                {isOn && <Check size={17} color="#087f5b" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </label>
              {isOn && renderServiceOptions(service)}
            </div>
          )
        })}
      </div>

      <h3 style={sectionTitle}>2. Location &amp; details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 13 }}>
        <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>Street address *<input style={controlStyle} value={details.street} onChange={(event) => setDetails((previous) => ({ ...previous, street: event.target.value }))} placeholder="Street address" autoComplete="street-address" /></label>
        <label style={fieldStyle}>Area *<input style={controlStyle} value={details.area} onChange={(event) => setDetails((previous) => ({ ...previous, area: event.target.value }))} placeholder="Area (e.g. Lekki, Yaba)" /></label>
        <label style={fieldStyle}>Preferred date for your service<input type="date" min={todayLocal()} style={controlStyle} value={details.date} onChange={(event) => setDetails((previous) => ({ ...previous, date: event.target.value }))} /></label>
        <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>Notes<textarea rows={4} style={{ ...controlStyle, minHeight: 90, resize: 'vertical' }} value={details.notes} onChange={(event) => setDetails((previous) => ({ ...previous, notes: event.target.value }))} placeholder="Notes (condition, access, special items...)" /></label>
      </div>

      <h3 style={sectionTitle}>3. Your contact</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 13 }}>
        <label style={fieldStyle}>Full name *<input style={controlStyle} value={contact.name} onChange={(event) => setContact((previous) => ({ ...previous, name: event.target.value }))} placeholder="Customer full name" autoComplete="name" /></label>
        <label style={fieldStyle}>Phone number *<input type="tel" style={controlStyle} value={contact.phone} onChange={(event) => setContact((previous) => ({ ...previous, phone: event.target.value }))} placeholder="Customer phone number" autoComplete="tel" /></label>
        <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>Email address (optional)<input type="email" style={controlStyle} value={contact.email} onChange={(event) => setContact((previous) => ({ ...previous, email: event.target.value }))} placeholder="you@example.com" autoComplete="email" /></label>
      </div>

      {(validationError || error) && <p role="alert" style={{ color: '#A12626', background: '#FFF5F5', border: '1px solid #F2CACA', borderRadius: 8, padding: 10, fontSize: 13, marginTop: 14 }}>{validationError || error}</p>}
      <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 43, marginTop: 17, padding: '10px 16px', border: 0, borderRadius: 8, background: '#16365E', color: '#fff', fontWeight: 750, fontSize: 13, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Creating booking...' : 'Create booking'}
      </button>
    </form>
  )
}
