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
      return { ...item, quantity, total: item.price * quantity }
    })

const sumQuantity = (rows) => rows.reduce((sum, row) => sum + row.quantity, 0)
const sumTotal = (rows) => rows.reduce((sum, row) => sum + row.total, 0)

export function summarizeLaundry(laundry) {
  const garments = pick(GARMENT_PRICES, laundry.garments)
  const baskets = pick(BASKET_PRICES, laundry.baskets)
  const pressing = pick(PRESSING_PRICES, laundry.pressing)

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

/* Builds the saved booking text. Same format on the Quote page and in both dashboards. */
export function buildLaundryLines(title, summary) {
  const lines = [`• ${title}`]

  const section = (heading, rows, subtotalLabel, subtotal) => {
    if (!rows.length) return
    lines.push(`   ${heading}:`)
    rows.forEach((item) =>
      lines.push(
        `   - ${item.name}: ${item.quantity} × ${formatNaira(item.price)} = ${formatNaira(item.total)}`
      )
    )
    lines.push(`   ${subtotalLabel}: ${formatNaira(subtotal)}`)
  }

  section('Individual laundry items', summary.garments, 'Individual items subtotal', summary.garmentTotal)
  section('Laundry by basket', summary.baskets, 'Basket subtotal', summary.basketTotal)
  section('Pressing only', summary.pressing, 'Pressing subtotal', summary.pressingTotal)

  lines.push(`   Total individual garments: ${summary.garmentCount}`)
  lines.push(`   Total laundry baskets: ${summary.basketCount}`)
  lines.push(`   Total pressing pieces: ${summary.pressingCount}`)
  lines.push(`   Estimated laundry total: ${formatNaira(summary.total)}`)

  return lines
}
