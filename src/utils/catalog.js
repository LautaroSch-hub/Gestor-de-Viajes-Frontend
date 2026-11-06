// Utilidades para combinar viajes con sus destinos y manejar la vigencia de las ofertas.

// Fecha de hoy en formato 'YYYY-MM-DD' (hora local).
export const todayISO = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// Degradado de respaldo para destinos sin imágenes (se elige según el id del destino).
const GRADIENTS = [
  'from-brand to-accent-soft',
  'from-brand-dark to-gold',
  'from-brand-soft to-accent',
  'from-accent-soft to-brand-dark',
]
export const gradientFor = (destinationId) => GRADIENTS[Math.abs(Number(destinationId) || 0) % GRADIENTS.length]

// Una oferta con "until" vence después de esa fecha (el último día inclusive sigue vigente).
export const isOfferExpired = (offer, today = todayISO()) => Boolean(offer?.until) && offer.until < today

// Oferta vigente de un viaje (null si no tiene o ya venció).
export const activeOffer = (trip, today = todayISO()) =>
  trip.offer && !isOfferExpired(trip.offer, today) ? trip.offer : null

export const indexById = (list) => Object.fromEntries(list.map((item) => [item.id, item]))

// Viaje "listo para mostrar": suma los datos del destino (nombre, país, alcance, imágenes),
// el degradado de respaldo y descarta la oferta si ya venció.
// Devuelve null si el destino no existe.
export function toViewTrip(trip, destinationsById, today = todayISO()) {
  const dest = destinationsById[trip.destinationId]
  if (!dest) return null
  return {
    ...trip,
    offer: activeOffer(trip, today),
    destination: dest.name,
    country: dest.country,
    scope: dest.scope,
    images: dest.images || [],
    // los viajes cargados antes de existir estas secciones no las tienen: se completan vacías
    hotel: trip.hotel ?? null,
    hotelImages: trip.hotelImages || [],
    tour: trip.tour ?? null,
    tourImages: trip.tourImages || [],
    gradient: gradientFor(dest.id),
  }
}

// Cantidad de días desde hoy hasta una fecha 'YYYY-MM-DD' (negativo si ya pasó).
export const daysUntil = (iso, today = todayISO()) =>
  Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / 86400000)
