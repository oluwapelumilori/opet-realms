import { ClipboardList } from 'lucide-react'
import {
  GARMENT_PRICES,
  BASKET_PRICES,
  PRESSING_PRICES,
  formatNaira,
} from '../config'
import { emptyLaundry, summarizeLaundry } from '../lib/laundry'

const NAVY = '#16365E'
const MUTED = '#667789'
const DARK = '#172B3F'
const BORDER = '#DCE5ED'

const controlStyle = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 42,
  padding: '10px 12px',
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  background: '#fff',
  color: DARK,
  font: 'inherit',
  fontSize: 14,
}

export default function LaundryCalculator({ value, onChange, disabled = false }) {
  const summary = summarizeLaundry(value)

  const update = (groupKey, id, raw) => {
    if (raw !== '' && !/^\d+$/.test(raw)) return
    onChange({
      ...value,
      [groupKey]: { ...value[groupKey], [id]: raw === '' ? 0 : Number(raw) },
    })
  }

  const renderGroup = (title, groupKey, items, unitLabel) => (
    <section style={{ marginTop: 16 }}>
      <h4 style={{ margin: '0 0 6px', color: NAVY, fontSize: 14, fontWeight: 800 }}>{title}</h4>
      <div style={{ display: 'grid', gap: 0 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 84px minmax(84px,auto)',
              alignItems: 'center',
              gap: 9,
              padding: '7px 0',
              borderBottom: '1px solid #E1E8EF',
            }}
          >
            <div>
              <label
                htmlFor={`laundry-${item.id}`}
                style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DARK }}
              >
                {item.name}
              </label>
              <span style={{ color: MUTED, fontSize: 11 }}>
                {formatNaira(item.price)} per {unitLabel}
              </span>
            </div>
            <input
              id={`laundry-${item.id}`}
              aria-label={`Quantity of ${item.name}`}
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              disabled={disabled}
              style={controlStyle}
              value={value[groupKey][item.id]}
              onChange={(event) => update(groupKey, item.id, event.target.value)}
            />
            <strong style={{ textAlign: 'right', fontSize: 12, color: NAVY }}>
              {formatNaira(item.price * Number(value[groupKey][item.id] || 0))}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <div
      style={{
        marginTop: 14,
        padding: 13,
        borderRadius: 9,
        background: '#F5F8FB',
        border: `1px solid ${BORDER}`,
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ClipboardList size={23} color={NAVY} />
        <div>
          <strong style={{ color: NAVY, fontSize: 14 }}>Laundry Price Calculator</strong>
          <p style={{ margin: '3px 0 0', color: MUTED, fontSize: 12 }}>
            Enter quantities from any of the three categories below. You can combine them in one request.
          </p>
        </div>
      </div>

      {renderGroup('Individual laundry items', 'garments', GARMENT_PRICES, 'item')}
      {renderGroup('Laundry by basket', 'baskets', BASKET_PRICES, 'basket')}
      <p style={{ margin: '8px 0 0', color: MUTED, fontSize: 11 }}>
        Basket pricing is based on the quantity of laundry measured by basket. The number of clothes inside each basket does not change the basket price.
      </p>
      {renderGroup('Pressing only', 'pressing', PRESSING_PRICES, 'piece')}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 16,
        }}
      >
        <div>
          <span style={{ display: 'block', color: MUTED, fontSize: 12 }}>Estimated laundry total</span>
          <strong style={{ display: 'block', color: NAVY, fontSize: 18 }}>{formatNaira(summary.total)}</strong>
          <span style={{ display: 'block', color: MUTED, fontSize: 11 }}>
            {summary.garmentCount} individual {summary.garmentCount === 1 ? 'item' : 'items'} · {summary.basketCount} {summary.basketCount === 1 ? 'basket' : 'baskets'} · {summary.pressingCount} pressing {summary.pressingCount === 1 ? 'piece' : 'pieces'}
          </span>
          <span style={{ display: 'block', color: MUTED, fontSize: 11 }}>
            Items: {formatNaira(summary.garmentTotal)} · Baskets: {formatNaira(summary.basketTotal)} · Pressing: {formatNaira(summary.pressingTotal)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(emptyLaundry())}
          disabled={disabled}
          style={{
            border: `1px solid ${NAVY}`,
            borderRadius: 7,
            background: '#fff',
            color: NAVY,
            padding: '8px 11px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          Reset quantities
        </button>
      </div>

      <p style={{ margin: '10px 0 0', color: MUTED, fontSize: 11 }}>
        The total is an estimate. Confirm the final amount with Opet Realms before placing the order.
      </p>
    </div>
  )
}
