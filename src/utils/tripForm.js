// Conversión entre el estado del formulario (todo texto) y el viaje que se envía a la API.

export const EMPTY_FORM = {
  category: 'paquete',
  destinationId: '',
  title: '',
  nights: '',
  currency: 'USD',
  price: '',
  departure: '',
  from: 'Buenos Aires',
  summary: '',
  includes: [''],
  hotel: '',
  hotelImages: [],
  tour: '',
  tourImages: [],
  airline: '',
  tripKind: 'Ida y vuelta',
  active: true,
  // oferta
  offerType: 'none', // none | discount | promo
  offerPrice: '',
  offerLabel: '',
  offerNote: '',
  offerUntil: '',
}

const toNumber = (v) => (v === '' || v == null ? NaN : Number(v))

// Arma el objeto "offer" a partir de los campos del formulario (null si no hay oferta).
export function buildOffer(f) {
  if (f.offerType === 'discount') {
    const offer = { type: 'discount', price: toNumber(f.offerPrice) }
    if (f.offerUntil) offer.until = f.offerUntil
    return offer
  }
  if (f.offerType === 'promo') {
    const offer = { type: 'promo', label: f.offerLabel.trim() }
    if (f.offerNote.trim()) offer.note = f.offerNote.trim()
    if (f.offerUntil) offer.until = f.offerUntil
    return offer
  }
  return null
}

export function offerToForm(offer) {
  if (!offer) return { offerType: 'none', offerPrice: '', offerLabel: '', offerNote: '', offerUntil: '' }
  return {
    offerType: offer.type,
    offerPrice: offer.type === 'discount' ? String(offer.price) : '',
    offerLabel: offer.type === 'promo' ? offer.label || '' : '',
    offerNote: offer.type === 'promo' ? offer.note || '' : '',
    offerUntil: offer.until || '',
  }
}

export function tripToForm(t) {
  return {
    category: t.category,
    destinationId: String(t.destinationId),
    title: t.title,
    nights: t.nights == null ? '' : String(t.nights),
    currency: t.currency,
    price: String(t.price),
    departure: t.departure,
    from: t.from,
    summary: t.summary,
    includes: t.includes.length ? [...t.includes] : [''],
    hotel: t.hotel || '',
    hotelImages: [...(t.hotelImages || [])],
    tour: t.tour || '',
    tourImages: [...(t.tourImages || [])],
    airline: t.airline || '',
    tripKind: t.tripKind || 'Ida y vuelta',
    active: t.active,
    ...offerToForm(t.offer),
  }
}

// Formulario -> viaje listo para validar y enviar a la API.
export function formToTrip(f) {
  const isFlight = f.category === 'vuelo'
  const trip = {
    category: f.category,
    destinationId: f.destinationId === '' ? null : Number(f.destinationId),
    title: f.title.trim(),
    nights: isFlight ? null : toNumber(f.nights),
    currency: f.currency,
    price: toNumber(f.price),
    offer: buildOffer(f),
    departure: f.departure,
    from: f.from.trim(),
    summary: f.summary.trim(),
    includes: f.includes.map((s) => s.trim()).filter(Boolean),
    hotel: isFlight ? null : f.hotel.trim() || null,
    hotelImages: isFlight ? [] : f.hotelImages,
    tour: isFlight ? null : f.tour.trim() || null,
    tourImages: isFlight ? [] : f.tourImages,
    active: f.active,
  }
  if (isFlight) {
    trip.airline = f.airline.trim()
    trip.tripKind = f.tripKind.trim()
  }
  return trip
}
