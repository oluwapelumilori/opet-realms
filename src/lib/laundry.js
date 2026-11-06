
import {
  GARMENT_PRICES,
  BASKET_PRICES,
  PRESSING_PRICES,
  formatNaira,
} from '../config'

export const emptyQuantities = (items) =>
  Object.fromEntries(items.map((item) => [item.id, 0]))

export const emptyLaundry = () => ({
  garments: emptyQuantities(GARMENT_PRICES),
  baskets: emptyQuantities(BASKET_PRICES),
  pressing: emptyQuantities(PRESSING_PRICES),
})

const pick = (items, quantities) =>
  items
    .filter((item) => Number(quantities?.[item.id]) > 0)
    .map((item) => {
      const quantity = Number(quantities[item.id])
      return {
        ...item,
        quantity,
        total: item.price * quantity,
      }
    })

const sumQuantity = (rows) =>
  rows.reduce((sum, row) => sum + row.quantity, 0)

const sumTotal = (rows) =>
  rows.reduce((sum, row) => sum + row.total, 0)

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
  {
    title: 'Duvets',
    ids: ['white-duvet', 'duvet', 'duvet-medium', 'duvet-large'],
  },
  { title: 'Bedsheets', ids: ['white-bedsheet', 'bedsheet'] },
  { title: 'Pillow covers', ids: ['white-pillow-cover', 'pillow-cover'] },
  { title: 'Garments', ids: ['garment'] },
  { title: 'Sweatshirts', ids: ['white-sweatshirt', 'sweat-shirt'] },
  {
    title: 'Curtains',
    ids: ['thick-curtain', 'small-curtain', 'inner-curtains'],
  },
  { title: 'Socks', ids: ['white-socks', 'socks'] },
  { title: 'Singlets', ids: ['white-singlet', 'singlet'] },
]

export function summarizeLaundry(laundry = emptyLaundry()) {
  const garments = pick(GARMENT_PRICES, laundry?.garments || {})
  const baskets = pick(BASKET_PRICES, laundry?.baskets || {})
  const pressing = pick(PRESSING_PRICES, laundry?.pressing || {})

  const garmentCount = sumQuantity(garments)
  const basketCount = sumQuantity(baskets)
  const pressingCount = sumQuantity(pressing)

  const garmentTotal = sumTotal(garments)
  const basketTotal = sumTotal(baskets)
  const pressingTotal = sumTotal(pressing)

  return {
    garments,
    baskets,
    pressing,
    garmentCount,
    basketCount,
    pressingCount,
    garmentTotal,
    basketTotal,
    pressingTotal,
    count: garmentCount + basketCount + pressingCount,
    total: garmentTotal + basketTotal + pressingTotal,
  }
}

export function buildLaundryLines(title, summary) {
  const lines = [`• ${title}`]

  const section = (heading, rows, subtotalLabel, subtotal) => {
    if (!rows.length) return

    lines.push(`   ${heading}:`)

    rows.forEach((item) => {
      lines.push(
        `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
      )
    })

    lines.push(`   ${subtotalLabel}: ${formatNaira(subtotal)}`)
  }

  if (summary.garments.length) {
    lines.push('   Individual laundry items:')

    const groupedIds = new Set()

    GARMENT_GROUPS.forEach((group) => {
      const rows = group.ids
        .map((id) => summary.garments.find((item) => item.id === id))
        .filter(Boolean)

      if (!rows.length) return

      rows.forEach((item) => groupedIds.add(item.id))

      lines.push(`   ${group.title}:`)

      rows.forEach((item) => {
        lines.push(
          `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
        )
      })

      const subtotal = rows.reduce(
        (sum, item) => sum + item.total,
        0
      )

      lines.push(
        `   ${group.title} subtotal: ${formatNaira(subtotal)}`
      )
    })

    const otherRows = summary.garments.filter(
      (item) => !groupedIds.has(item.id)
    )

    if (otherRows.length) {
      lines.push('   Other items:')

      otherRows.forEach((item) => {
        lines.push(
          `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
        )
      })
    }

    lines.push(
      `   Individual items subtotal: ${formatNaira(summary.garmentTotal)}`
    )
  }

  section(
    'Laundry by basket',
    summary.baskets,
    'Basket subtotal',
    summary.basketTotal
  )

  section(
    'Pressing only',
    summary.pressing,
    'Pressing subtotal',
    summary.pressingTotal
  )

  lines.push(`   Total individual garments: ${summary.garmentCount}`)
  lines.push(`   Total laundry baskets: ${summary.basketCount}`)
  lines.push(`   Total pressing pieces: ${summary.pressingCount}`)
  lines.push(`   Estimated laundry total: ${formatNaira(summary.total)}`)

  return lines
}
