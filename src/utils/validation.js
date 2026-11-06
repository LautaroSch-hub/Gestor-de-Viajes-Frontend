import { CURRENCIES, SCOPES, TRIP_CATEGORIES } from '../data/constants.js'

// Validaciones compartidas: las usa el formulario del panel (para avisar al instante)
// y la capa de servicios (que cuando exista el backend debe repetirlas en el servidor).
// Cada validador devuelve un objeto { campo: 'mensaje' } (vacío si todo está bien).
export function normalizePhone(value = '') {
  return String(value).replace(/[^\d+]/g, '');
}
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00`))
const isUrl = (s) => typeof s === 'string' && (/^https?:\/\/\S+$/i.test(s) || /^data:image\/[a-z+.-]+;base64,/i.test(s))

export const MAX_EXTRA_IMAGES = 10

export const hasErrors = (errors) => Object.keys(errors).length > 0

export function validateOffer(offer, price) {
  const e = {}
  if (!offer) return e
  if (offer.type === 'discount') {
    if (!Number.isInteger(offer.price) || offer.price <= 0) {
      e.offerPrice = 'Ingresá un precio entero mayor a 0.'
    } else if (Number.isInteger(price) && offer.price >= price) {
      e.offerPrice = 'El precio de oferta debe ser menor al precio normal.'
    }
  } else if (offer.type === 'promo') {
    const label = (offer.label || '').trim()
    if (!label) e.offerLabel = 'Indicá la promo (por ejemplo 2x1 o 3x2).'
    else if (label.length > 16) e.offerLabel = 'Máximo 16 caracteres.'
    if (offer.note && offer.note.length > 160) e.offerNote = 'Máximo 160 caracteres.'
  } else {
    e.offerType = 'Tipo de oferta inválido.'
  }
  if (offer.until && !isDate(offer.until)) e.offerUntil = 'Fecha inválida.'
  return e
}

export function validateTrip(t, { destinations }) {
  const e = {}
  if (!TRIP_CATEGORIES.some((c) => c.value === t.category)) e.category = 'Elegí un tipo de viaje.'
  if (!destinations.some((d) => d.id === t.destinationId)) e.destinationId = 'Elegí un destino.'
  if (!t.title || t.title.trim().length < 3) e.title = 'Escribí un título (mínimo 3 letras).'
  if (!CURRENCIES.some((c) => c.value === t.currency && c.value !== 'todas')) e.currency = 'Elegí la moneda.'
  if (!Number.isInteger(t.price) || t.price <= 0) e.price = 'Ingresá un precio entero mayor a 0.'
  if (!isDate(t.departure)) e.departure = 'Elegí la fecha de salida.'
  if (!t.from || !t.from.trim()) e.from = 'Indicá desde dónde sale.'
  if (!t.summary || t.summary.trim().length < 10) e.summary = 'Escribí un resumen (mínimo 10 letras).'
  if (!Array.isArray(t.includes) || t.includes.filter((i) => i && i.trim()).length === 0) {
    e.includes = 'Agregá al menos un ítem de lo que incluye.'
  }
  if (t.hotel && t.hotel.length > 300) e.hotel = 'Máximo 300 caracteres.'
  if (t.tour && t.tour.length > 2000) e.tour = 'Máximo 2000 caracteres.'
  for (const key of ['hotelImages', 'tourImages']) {
    const list = t[key] || []
    if (!Array.isArray(list) || list.some((src) => !isUrl(src))) e[key] = 'Hay imágenes con un link inválido.'
    else if (list.length > MAX_EXTRA_IMAGES) e[key] = `Máximo ${MAX_EXTRA_IMAGES} imágenes.`
  }
  if (t.category === 'vuelo') {
    if (t.nights != null) e.nights = 'Los vuelos no llevan noches.'
    if (!t.airline || !t.airline.trim()) e.airline = 'Indicá la aerolínea.'
    if (!t.tripKind || !t.tripKind.trim()) e.tripKind = 'Indicá el tipo de pasaje.'
  } else if (!Number.isInteger(t.nights) || t.nights <= 0) {
    e.nights = 'Ingresá la cantidad de noches (entero mayor a 0).'
  }
  Object.assign(e, validateOffer(t.offer, t.price))
  return e
}

export function validateDestination(d, { destinations, ignoreId = null }) {
  const e = {}
  const name = (d.name || '').trim()
  if (name.length < 2) e.name = 'Escribí el nombre del destino.'
  else if (destinations.some((x) => x.id !== ignoreId && x.name.trim().toLowerCase() === name.toLowerCase())) {
    e.name = 'Ya existe un destino con ese nombre.'
  }
  if (!d.country || !d.country.trim()) e.country = 'Indicá el país.'
  if (!SCOPES.some((s) => s.value === d.scope && s.value !== 'todos')) e.scope = 'Elegí si es nacional o internacional.'
  if (!Array.isArray(d.images) || d.images.some((src) => !isUrl(src))) e.images = 'Hay imágenes con un link inválido.'
  return e
}

export { isUrl }

export function validateInquiry(i) {
  const e = {}
  if (!i?.name?.trim()) e.name = 'Ingresá tu nombre.'
  if (!i?.message?.trim()) e.message = 'Escribí tu consulta.'
  if (i?.email?.trim() && !/^\S+@\S+\.\S+$/.test(i.email.trim())) e.email = 'El e-mail no es válido.'
  if (!i?.email?.trim() && !i?.phone?.trim()) e.contact = 'Dejanos un e-mail o un teléfono para responderte.'
  return e
}
