// Utilidades de formato y precios. Cada viaje define su propia moneda (USD o ARS),
// no hay conversión entre monedas.

export const formatPrice = (amount, currency) =>
  currency === 'ARS'
    ? `$ ${amount.toLocaleString('es-AR')}`
    : `USD ${amount.toLocaleString('es-AR')}`

export const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const hasDiscount = (trip) => trip.offer?.type === 'discount' && trip.offer.price < trip.price
export const hasPromo = (trip) => trip.offer?.type === 'promo'

// Precio que realmente paga el cliente (con descuento si lo tiene).
export const finalPrice = (trip) => (hasDiscount(trip) ? trip.offer.price : trip.price)

export const discountPercent = (trip) =>
  hasDiscount(trip) ? Math.round((1 - trip.offer.price / trip.price) * 100) : 0

// Texto corto para el cartel de la tarjeta: "-11%" o "2x1".
export const offerBadge = (trip) =>
  hasDiscount(trip) ? `-${discountPercent(trip)}%` : hasPromo(trip) ? trip.offer.label : null
