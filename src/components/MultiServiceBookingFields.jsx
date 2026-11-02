
import { useMemo, useState } from 'react'
import { SERVICES } from '../data/services'
import { GARMENT_PRICES, formatNaira } from '../config'

const TREATMENTS = ['1-visit intensive', '2-visit with follow-up']

const initialQuantities = () =>
  Object.fromEntries(GARMENT_PRICES.map((item) => [item.id, 0]))

export default function MultiServiceBookingFields({
  value,
  onChange,
  inputStyle,
  labelStyle,
}) {
  const [selected, setSelected] = useState({})
  const [choices, setChoices] = useState({})
  const [treatment, setTreatment] = useState(0)
  const [upholsteryQty, setUpholsteryQty] = useState('1')
  const [garments, setGarments] = useState(initialQuantities)
  const [manualService, setManualService] = useState('')

  const garmentLines = useMemo(
    () =>
      GARMENT_PRICES
        .filter((g) => Number(garments[g.id]) > 0)
        .map((g) => ({
          ...g,
          quantity: Number(garments[g.id]),
          total: g.price * Number(garments[g.id]),
        })),
    [garments]
  )

  const garmentCount = garmentLines.reduce(
    (sum, garment) => sum + garment.quantity,
    0
  )

  const laundryTotal = garmentLines.reduce(
    (sum, garment) => sum + garment.total,
    0
  )

  function publish(
    nextSelected = selected,
    nextChoices = choices,
    nextTreatment = treatment,
    nextUpholsteryQty = upholsteryQty,
    nextGarments = garments,
    nextManual = manualService
  ) {
    const lines = []

    SERVICES.filter((service) => nextSelected[service.id]).forEach(
      (service) => {
        const option = service.options[nextChoices[service.id] ?? 0]

        if (service.id === 'laundry') {
          lines.push(`• ${service.title}`)

          GARMENT_PRICES
            .filter((garment) => Number(nextGarments[garment.id]) > 0)
            .forEach((garment) => {
              const quantity = Number(nextGarments[garment.id])

              lines.push(
                `   - ${garment.name}: ${quantity} × ${formatNaira(
                  garment.price
                )} = ${formatNaira(garment.price * quantity)}`
              )
            })

          const count = GARMENT_PRICES.reduce(
            (sum, garment) =>
              sum + Number(nextGarments[garment.id] || 0),
            0
          )

          const total = GARMENT_PRICES.reduce(
            (sum, garment) =>
              sum +
              Number(nextGarments[garment.id] || 0) * garment.price,
            0
          )

          lines.push(
            `   Total garments: ${count}`,
            `   Estimated laundry total: ${formatNaira(total)}`
          )
        } else if (service.id === 'upholstery') {
          lines.push(
            `• ${service.title} — ${option.label} × ${
              Number.parseInt(nextUpholsteryQty, 10) || 0
            }`
          )
        } else if (service.id === 'bedbug') {
          lines.push(
            `• ${service.title} — Size: ${option.label}, Treatment: ${
              TREATMENTS[nextTreatment]
            }`
          )
        } else {
          lines.push(`• ${service.title} — Size: ${option.label}`)
        }
      }
    )

    const text = [
      ...lines,
      ...(nextManual.trim() ? [`• ${nextManual.trim()}`] : []),
    ].join('\n')

    onChange(text)
  }

  const field = {
    ...inputStyle,
    marginTop: 5,
  }

  const heading = {
    margin: '0 0 8px',
    color: '#172B3F',
    fontSize: 14,
  }

  const card = {
    border: '1px solid #DCE5ED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 9,
  }

  const updateSelected = (id) => {
    const next = {
      ...selected,
      [id]: !selected[id],
    }

    setSelected(next)
    publish(next)
  }

  const updateChoice = (id, index) => {
    const next = {
      ...choices,
      [id]: Number(index),
    }

    setChoices(next)
    publish(selected, next)
  }

  const updateGarment = (id, raw) => {
    if (
      raw !== '' &&
      (!/^\d+$/.test(raw) || Number(raw) > 999)
    ) {
      return
    }

    const next = {
      ...garments,
      [id]: raw === '' ? 0 : Number(raw),
    }

    setGarments(next)
    publish(
      selected,
      choices,
      treatment,
      upholsteryQty,
      next
    )
  }

  return (
    <section style={{ margin: '4px 0 16px' }}>
      <h3 style={heading}>
        Services *{' '}
        <span style={{ fontWeight: 400, color: '#667789' }}>
          Select one or more, just like the customer booking form.
        </span>
      </h3>

      {SERVICES.map((service) => (
        <div key={service.id} style={card}>
          <label
            style={{
              display: 'flex',
              gap: 9,
              alignItems: 'flex-start',
              cursor: 'pointer',
              color: '#172B3F',
            }}
          >
            <input
              type="checkbox"
              checked={!!selected[service.id]}
              onChange={() => updateSelected(service.id)}
            />

            <span>
              <strong>{service.title}</strong>

              <span
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: '#667789',
                  marginTop: 3,
                }}
              >
                {service.features.join(' · ')}
              </span>
            </span>
          </label>

          {selected[service.id] && (
            <div
              style={{
                marginTop: 12,
                paddingLeft: 24,
              }}
            >
              {service.id === 'laundry' ? (
                <>
                  <strong style={{ fontSize: 13 }}>
                    Laundry quantities
                  </strong>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit,minmax(180px,1fr))',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {GARMENT_PRICES.map((garment) => (
                      <label
                        key={garment.id}
                        style={labelStyle}
                      >
                        {garment.name} ·{' '}
                        {formatNaira(garment.price)}

                        <input
                          type="number"
                          min="0"
                          max="999"
                          step="1"
                          style={field}
                          value={garments[garment.id]}
                          onChange={(event) =>
                            updateGarment(
                              garment.id,
                              event.target.value
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: '#667789',
                    }}
                  >
                    Total garments: {garmentCount} · Estimated
                    laundry total:{' '}
                    <strong>{formatNaira(laundryTotal)}</strong>
                  </p>
                </>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(180px,1fr))',
                    gap: 10,
                  }}
                >
                  <label style={labelStyle}>
                    {service.fieldLabel}

                    <select
                      style={field}
                      value={choices[service.id] ?? 0}
                      onChange={(event) =>
                        updateChoice(
                          service.id,
                          event.target.value
                        )
                      }
                    >
                      {service.options.map((option, index) => (
                        <option
                          key={option.label}
                          value={index}
                        >
                          {option.label}
                          {option.price != null
                            ? ` — ${formatNaira(option.price)}`
                            : option.priceText
                              ? ` — ${option.priceText}`
                              : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  {service.id === 'upholstery' && (
                    <label style={labelStyle}>
                      Quantity

                      <input
                        type="number"
                        min="1"
                        step="1"
                        style={field}
                        value={upholsteryQty}
                        onChange={(event) => {
                          const next = event.target.value
                          setUpholsteryQty(next)

                          publish(
                            selected,
                            choices,
                            treatment,
                            next
                          )
                        }}
                      />
                    </label>
                  )}

                  {service.id === 'bedbug' && (
                    <label style={labelStyle}>
                      Treatment option

                      <select
                        style={field}
                        value={treatment}
                        onChange={(event) => {
                          const next = Number(event.target.value)
                          setTreatment(next)

                          publish(
                            selected,
                            choices,
                            next
                          )
                        }}
                      >
                        {TREATMENTS.map((item, index) => (
                          <option key={item} value={index}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              )}

              <p
                style={{
                  color: '#667789',
                  fontSize: 12,
                  marginBottom: 0,
                }}
              >
                {service.hint}
              </p>
            </div>
          )}
        </div>
      ))}

      <label style={labelStyle}>
        Additional service (optional)

        <input
          style={field}
          value={manualService}
          placeholder="Enter a service not listed above"
          onChange={(event) => {
            const next = event.target.value
            setManualService(next)

            publish(
              selected,
              choices,
              treatment,
              upholsteryQty,
              garments,
              next
            )
          }}
        />
      </label>

      <input
        type="hidden"
        required
        value={value || ''}
        onChange={() => {}}
      />

      {!value && (
        <p
          style={{
            color: '#B45309',
            fontSize: 12,
            marginTop: 7,
          }}
        >
          Select at least one service before saving.
        </p>
      )}
    </section>
  )
}
