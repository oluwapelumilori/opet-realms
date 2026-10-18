import { useMemo, useState } from 'react' import { GARMENT_PRICES, formatNaira } from '../config' import { Shirt, RotateCcw } from 'lucide-react'

export default function LaundryCalculator() { const [quantities, setQuantities] = useState({})

const selectedGarments = useMemo( () => GARMENT_PRICES.filter( (garment) => (quantities[garment.id] || 0) > 0 ).map((garment) => ({ ...garment, quantity: quantities[garment.id], subtotal: garment.price * quantities[garment.id], })), [quantities] )

const total = selectedGarments.reduce( (sum, garment) => sum + garment.subtotal, 0 )

const totalItems = selectedGarments.reduce( (sum, garment) => sum + garment.quantity, 0 )

const updateQuantity = (id, value) => { const quantity = Math.max( 0, Math.min(999, Number.parseInt(value, 10) || 0) )

setQuantities((current) => ({
  ...current,
  [id]: quantity,
}))


}

const resetCalculator = () => setQuantities({})

return ( <section className="laundry-calculator"> <div className="laundry-calculator-heading"> <span className="laundry-calculator-icon"> <Shirt size={25} /> </span>

    <div>
      <h2>Laundry & Garment Care</h2>
      <p>Select your garments and enter the quantity for each item.</p>
    </div>
  </div>

  <div className="laundry-price-list">
    {GARMENT_PRICES.map((garment) => (
      <div className="laundry-price-row" key={garment.id}>
        <div className="laundry-garment-info">
          <label htmlFor={`quantity-${garment.id}`}>
            {garment.name}
          </label>
          <span>{formatNaira(garment.price)} per item</span>
        </div>

        <div className="laundry-quantity-control">
          <label
            className="sr-only"
            htmlFor={`quantity-${garment.id}`}
          >
            Quantity of {garment.name}
          </label>

          <input
            id={`quantity-${garment.id}`}
            type="number"
            min="0"
            max="999"
            step="1"
            inputMode="numeric"
            value={quantities[garment.id] ?? ''}
            placeholder="0"
            onChange={(event) =>
              updateQuantity(garment.id, event.target.value)
            }
          />
        </div>

        <strong className="laundry-line-total">
          {formatNaira(
            garment.price * (quantities[garment.id] || 0)
          )}
        </strong>
      </div>
    ))}
  </div>

  <div className="laundry-calculator-summary">
    <div className="laundry-summary-details">
      <span>{totalItems} item(s) selected</span>
      <strong>{formatNaira(total)}</strong>
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
    Prices are based on the supplied garment price list. The final
    quotation will be confirmed by Opet Realms.
  </p>
</section>


) }
