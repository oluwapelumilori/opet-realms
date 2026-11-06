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
const SOFT = '#F4F8FC'

const GARMENT_GROUPS = [
  { title: 'Shirts', ids: ['white-shirt', 'shirt'] },
  { title: 'T-shirts', ids: ['white-t-shirt', 't-shirt'] },
  { title: 'Blazers', ids: ['white-blazers', 'blazers'] },
  { title: 'Native', ids: ['white-native', 'native'] },
  { title: 'Agbada', ids: ['white-agbada', 'agbada'] },
  { title: 'Jeans', ids: ['long-jeans', 'short-jeans'] },
  { title: 'Polo', ids: ['white-polo', 'polo'] },
  { title: 'Shorts', ids: ['white-shorts', 'shorts'] },
  { title: 'Gowns', ids: ['stoned-beaded-gowns', 'white-gown', 'gown'] },
  { title: 'Jalamia', ids: ['white-jalamia', 'jalamia'] },
  { title: 'Towels', ids: ['white-towel', 'towel'] },
  { title: 'Trousers', ids: ['white-trouser', 'trouser'] },
  { title: 'Duvets', ids: ['white-duvet', 'duvet', 'duvet-medium', 'duvet-large'] },
  { title: 'Bedsheets', ids: ['white-bedsheet', 'bedsheet'] },
  { title: 'Pillow covers', ids: ['white-pillow-cover', 'pillow-cover'] },
  { title: 'Garments', ids: ['garment'] },
  { title: 'Sweatshirts', ids: ['white-sweatshirt', 'sweat-shirt'] },
  { title: 'Curtains', ids: ['thick-curtain', 'small-curtain', 'inner-curtains'] },
  { title: 'Socks', ids: ['white-socks', 'socks'] },
  { title: 'Singlets', ids: ['white-singlet', 'singlet'] },
]

export default function LaundryQuantityFields({ value, onChange, disabled = false }) {
  const summary = summarizeLaundry(value || emptyLaundry())

  const update = (groupKey, id, raw) => {
    if (raw !== '' && !/^\d+$/.test(raw)) return
    onChange({
      ...(value || emptyLaundry()),
      [groupKey]: {
        ...((value || emptyLaundry())[groupKey] || {}),
        [id]: raw === '' ? 0 : Math.min(999, Number(raw)),
      },
    })
  }

  const quantityInput = (groupKey, item) => (
    <input
      aria-label={`Quantity for ${item.name}`}
      type="number"
      min="0"
      max="999"
      step="1"
      inputMode="numeric"
      disabled={disabled}
      value={(value || emptyLaundry())[groupKey]?.[item.id] ?? 0}
      onChange={(event) => update(groupKey, item.id, event.target.value)}
      style={{ width: 72, minHeight: 36, padding: '6px 8px', border: `1px solid ${BORDER}`, borderRadius: 7, color: DARK, background: disabled ? '#F3F5F7' : '#fff', boxSizing: 'border-box' }}
    />
  )

  const renderItem = (item, groupKey, compact = false) => {
    const quantity = Number((value || emptyLaundry())[groupKey]?.[item.id] || 0)
    return (
      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: 10, padding: compact ? '8px 0' : '9px 0', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: DARK, fontSize: 13, fontWeight: 600, overflowWrap: 'anywhere' }}>{item.name}</div>
          <div style={{ color: MUTED, fontSize: 11 }}>{formatNaira(item.price)} each</div>
        </div>
        {quantityInput(groupKey, item)}
        <strong style={{ color: NAVY, fontSize: 12, minWidth: 78, textAlign: 'right' }}>{formatNaira(quantity * item.price)}</strong>
      </div>
    )
  }

  const garmentGroups = GARMENT_GROUPS.map((group) => ({
    ...group,
    items: group.ids.map((id) => GARMENT_PRICES.find((item) => item.id === id)).filter(Boolean),
  })).filter((group) => group.items.length)
  const groupedIds = new Set(garmentGroups.flatMap((group) => group.items.map((item) => item.id)))
  const ungroupedGarments = GARMENT_PRICES.filter((item) => !groupedIds.has(item.id))

  const renderSpecialGroup = (title, groupKey, items, subtotal, count) => (
    <section style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: 13, background: '#fff', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <strong style={{ color: NAVY, fontSize: 14 }}>{title}</strong>
        <span style={{ color: MUTED, fontSize: 11 }}>{count} selected</span>
      </div>
      {items.map((item) => renderItem(item, groupKey, true))}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 10, fontSize: 12 }}>
        <span style={{ color: MUTED }}>Subtotal</span>
        <strong style={{ color: NAVY }}>{formatNaira(subtotal)}</strong>
      </div>
    </section>
  )

  return (
    <section style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, background: '#fff', marginTop: 12, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <ClipboardList size={19} color={NAVY} />
        <div>
          <strong style={{ display: 'block', color: NAVY, fontSize: 15 }}>Laundry items</strong>
          <span style={{ color: MUTED, fontSize: 11 }}>Choose quantities under each garment type.</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 245px), 1fr))', gap: 10 }}>
        {garmentGroups.map((group) => {
          const selectedCount = summary.garments.filter((item) => group.ids.includes(item.id)).reduce((sum, item) => sum + item.quantity, 0)
          const subtotal = summary.garments.filter((item) => group.ids.includes(item.id)).reduce((sum, item) => sum + item.total, 0)
          return (
            <section key={group.title} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, background: SOFT, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <strong style={{ color: NAVY, fontSize: 13 }}>{group.title}</strong>
                <span style={{ color: MUTED, fontSize: 10 }}>{selectedCount} selected</span>
              </div>
              {group.items.map((item) => renderItem(item, 'garments', true))}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, paddingTop: 8, fontSize: 11 }}>
                <span style={{ color: MUTED }}>Group subtotal</span>
                <strong style={{ color: NAVY }}>{formatNaira(subtotal)}</strong>
              </div>
            </section>
          )
        })}
        {ungroupedGarments.length > 0 && (
          <section style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, background: SOFT }}>
            <strong style={{ color: NAVY, fontSize: 13 }}>Other items</strong>
            {ungroupedGarments.map((item) => renderItem(item, 'garments', true))}
          </section>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 245px), 1fr))', gap: 10, marginTop: 12 }}>
        {renderSpecialGroup('Laundry by basket', 'baskets', BASKET_PRICES, summary.basketTotal, summary.basketCount)}
        {renderSpecialGroup('Pressing only', 'pressing', PRESSING_PRICES, summary.pressingTotal, summary.pressingCount)}
      </div>

      <div style={{ background: '#EAF7F9', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 13, marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', fontSize: 12, color: DARK }}>
          <span>Individual items: <strong>{summary.garmentCount}</strong></span>
          <span>Basket quantity: <strong>{summary.basketCount}</strong></span>
          <span>Pressing pieces: <strong>{summary.pressingCount}</strong></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 10, fontSize: 12 }}>
          <div><span style={{ color: MUTED }}>Individual subtotal</span><strong style={{ display: 'block', color: NAVY }}>{formatNaira(summary.garmentTotal)}</strong></div>
          <div><span style={{ color: MUTED }}>Basket subtotal</span><strong style={{ display: 'block', color: NAVY }}>{formatNaira(summary.basketTotal)}</strong></div>
          <div><span style={{ color: MUTED }}>Pressing subtotal</span><strong style={{ display: 'block', color: NAVY }}>{formatNaira(summary.pressingTotal)}</strong></div>
          <div><span style={{ color: MUTED }}>Estimated laundry total</span><strong style={{ display: 'block', color: NAVY, fontSize: 16 }}>{formatNaira(summary.total)}</strong></div>
        </div>
        <button type="button" disabled={disabled} onClick={() => onChange(emptyLaundry())} style={{ marginTop: 12, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '7px 10px', background: '#fff', color: NAVY, fontSize: 12, fontWeight: 650, cursor: disabled ? 'not-allowed' : 'pointer' }}>Reset laundry quantities</button>
      </div>
    </section>
  )
}
