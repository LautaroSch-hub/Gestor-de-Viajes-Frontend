import { hasDiscount, hasPromo, formatPrice } from '../utils/format.js'

// Precio de un viaje en su propia moneda.
// - Con descuento: precio anterior tachado + nuevo precio.
// - Con promo (2x1, 3x2...): precio normal + etiqueta de la promo.
export default function PriceTag({ trip, large = false }) {
  const discount = hasDiscount(trip)
  const size = large ? 'text-3xl' : 'text-lg'

  return (
    <div>
      <p className="text-[11px] uppercase text-stone-400">Desde</p>
      {discount ? (
        <>
          <p className="text-sm text-stone-400 line-through">{formatPrice(trip.price, trip.currency)}</p>
          <p className={`${size} font-bold leading-tight text-accent`}>{formatPrice(trip.offer.price, trip.currency)}</p>
        </>
      ) : (
        <p className={`${size} font-bold leading-tight text-brand`}>{formatPrice(trip.price, trip.currency)}</p>
      )}
      {hasPromo(trip) && (
        <span className="mt-1 inline-block rounded bg-gold/25 px-2 py-0.5 text-xs font-semibold text-brand">
          Promo {trip.offer.label}
        </span>
      )}
    </div>
  )
}
