
import { useState } from 'react'
import { Shirt, RotateCcw, WashingMachine, Package } from 'lucide-react'
import {
  GARMENT_PRICES,
  BASKET_PRICES,
  PRESSING_PRICES,
  formatNaira,
} from '../config'

export default function LaundryCalculator({ onChange }) {
  const [quantities, setQuantities] = useState({})
  const [basketQuantities, setBasketQuantities] = useState({})
  const [pressingQuantities, setPressingQuantities] = useState({})

  const buildSelections = (
    garmentValues,
    basketValues,
    pressingValues
  ) => {
    const garments = GARMENT_PRICES
      .filter((item) => (garmentValues[item.id] || 0) > 0)
      .map((item) => ({
        ...item,
        quantity: garmentValues[item.id],
        subtotal: item.price * garmentValues[item.id],
      }))

    const baskets = BASKET_PRICES
      .filter((item) => (basketValues[item.id] || 0) > 0)
      .map((item) => ({
        ...item,
        quantity: basketValues[item.id],
        subtotal: item.price * basketValues[item.id],
      }))

    const pressing = PRESSING_PRICES
      .filter((item) => (pressingValues[item.id] || 0) > 0)
      .map((item) => ({
        ...item,
        quantity: pressingValues[item.id],
        subtotal: item.price * pressingValues[item.id],
      }))

    const allItems = [...garments, ...baskets, ...pressing]

    return {
      garments,
      baskets,
      pressing,
      items: allItems,
      total: allItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      ),
      totalItems: allItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    }
  }

  const updateQuantity = (id, value, category) => {
    if (value !== '' && !/^\d+$/.test(value)) return

    const quantity =
      value === '' ? 0 : Math.min(999, Number(value))

    const setters = {
      garments: [quantities, setQuantities],
      baskets: [basketQuantities, setBasketQuantities],
      pressing: [pressingQuantities, setPressingQuantities],
    }

    const [currentValues, setter] = setters[category]
    const nextValues = {
      ...currentValues,
      [id]: quantity,
    }

    setter(nextValues)

    const nextGarments =
      category === 'garments' ? nextValues : quantities

    const nextBaskets =
      category === 'baskets' ? nextValues : basketQuantities

    const nextPressing =
      category === 'pressing' ? nextValues : pressingQuantities

    onChange?.(
      buildSelections(
        nextGarments,
        nextBaskets,
        nextPressing
      )
    )
  }

  const resetCalculator = () => {
    setQuantities({})
    setBasketQuantities({})
    setPressingQuantities({})

    onChange?.({
      garments: [],
      baskets: [],
      pressing: [],
      items: [],
      total: 0,
      totalItems: 0,
    })
  }

  const selection = buildSelections(
    quantities,
    basketQuantities,
    pressingQuantities
  )

  const renderPriceList = (items, values, category, unit) => (
    <div className="laundry-price-list">
      {items.map((item) => (
        <div className="laundry-price-row" key={item.id}>
          <div className="laundry-garment-info">
            <label htmlFor={`quantity-${item.id}`}>
              {item.name}
            </label>
            <span>
              {formatNaira(item.price)} {unit}
            </span>
          </div>

          <div className="laundry-quantity-control">
            <label
              className="sr-only"
              htmlFor={`quantity-${item.id}`}
            >
              Quantity of {item.name}
            </label>

            <input
              id={`quantity-${item.id}`}
              type="number"
              min="0"
              max="999"
              step="1"
              inputMode="numeric"
              value={values[item.id] ?? ''}
              placeholder="0"
              onChange={(event) =>
                updateQuantity(
                  item.id,
                  event.target.value,
                  category
                )
              }
            />
          </div>

          <strong className="laundry-line-total">
            {formatNaira(
              item.price * (values[item.id] || 0)
            )}
          </strong>
        </div>
      ))}
    </div>
  )

  return (
    <section className="laundry-calculator">
      <div className="laundry-calculator-heading">
        <span className="laundry-calculator-icon">
          <Shirt size={25} />
        </span>

        <div>
          <h2>Laundry &amp; Garment Care</h2>
          <p>
            Select your laundry service and enter the quantity
            for each item.
          </p>
        </div>
      </div>

      <div className="laundry-category">
        <div className="laundry-category-heading">
          <Shirt size={19} />
          <div>
            <h3>Individual Laundry Items</h3>
            <p>Pricing per garment or item.</p>
          </div>
        </div>

        {renderPriceList(
          GARMENT_PRICES,
          quantities,
          'garments',
          'per item'
        )}
      </div>

      <div className="laundry-category">
        <div className="laundry-category-heading">
          <Package size={19} />
          <div>
            <h3>Laundry by Basket</h3>
            <p>
              Bulk laundry priced by the basket.
            </p>
          </div>
        </div>

        {renderPriceList(
          BASKET_PRICES,
          basketQuantities,
          'baskets',
          'per basket'
        )}
      </div>

      <div className="laundry-category">
        <div className="laundry-category-heading">
          <WashingMachine size={19} />
          <div>
            <h3>Pressing Only</h3>
            <p>
              Pressing service without laundry washing.
            </p>
          </div>
        </div>

        {renderPriceList(
          PRESSING_PRICES,
          pressingQuantities,
          'pressing',
          'per item'
        )}
      </div>

      <div className="laundry-calculator-summary">
        <div className="laundry-summary-details">
          <span>
            {selection.totalItems} item(s) selected
          </span>
          <strong>{formatNaira(selection.total)}</strong>
          <span className="laundry-summary-note">
            Estimated laundry total
          </span>
        </div>

        <button
          type="button"
          className="button button-outline"
          onClick={resetCalculator}
        >
          <RotateCcw size={16} />
          Clear selections
        </button>
      </div>

      <p className="laundry-calculator-note">
        Basket pricing is based on the quantity of laundry
        measured by basket. Your final quotation will be
        confirmed by Opet Realms.
      </p>
    </section>
  )
}
