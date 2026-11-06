import { createSelector, createSlice } from '@reduxjs/toolkit'
import { finalPrice } from '../utils/format.js'
import { indexById, toViewTrip } from '../utils/catalog.js'

// Filtros de la web pública y selectores de lo que se muestra al público:
// solo viajes ACTIVOS, ya combinados con su destino (nombre, país, alcance e imágenes) y con
// la oferta descartada si venció.

export const DEFAULT_FILTERS = {
  search: '',
  category: 'todos', // todos | paquete | crucero | hotel | vuelo
  scope: 'todos', // todos | nacional | internacional
  destination: 'todos',
  month: 'todos', // 'YYYY-MM'
  duration: 'todas', // todas | corta | media | larga
  currency: 'todas', // todas | USD | ARS
  maxPrice: null, // null = sin límite; solo aplica si se elige una moneda
}

const tripsSlice = createSlice({
  name: 'trips',
  initialState: { filters: { ...DEFAULT_FILTERS } },
  reducers: {
    setFilter(state, { payload }) {
      const { key, value } = payload
      state.filters[key] = value
      // El tope de precio depende de la moneda y el destino de si es nacional/internacional.
      if (key === 'currency') state.filters.maxPrice = null
      if (key === 'scope') state.filters.destination = 'todos'
    },
    resetFilters(state) {
      state.filters = { ...DEFAULT_FILTERS }
    },
  },
})

export const { setFilter, resetFilters } = tripsSlice.actions
export default tripsSlice.reducer

// ---------- Selectores ----------
const selectCatalogTrips = (s) => s.catalog.trips
const selectCatalogDestinations = (s) => s.catalog.destinations
export const selectFilters = (s) => s.trips.filters

// Viajes visibles para el público.
export const selectItems = createSelector([selectCatalogTrips, selectCatalogDestinations], (trips, destinations) => {
  const byId = indexById(destinations)
  return trips.filter((t) => t.active).map((t) => toViewTrip(t, byId)).filter(Boolean)
})

export const selectTripById = (id) => (s) => selectItems(s).find((t) => String(t.id) === String(id))

const durationMatch = (nights, duration) => {
  if (duration === 'todas') return true
  if (nights == null) return false // los vuelos no tienen noches
  if (duration === 'corta') return nights <= 5
  if (duration === 'media') return nights >= 6 && nights <= 9
  if (duration === 'larga') return nights >= 10
  return true
}

export const selectFilteredTrips = createSelector([selectItems, selectFilters], (items, f) =>
  items.filter((t) => {
    if (f.category !== 'todos' && t.category !== f.category) return false
    if (f.scope !== 'todos' && t.scope !== f.scope) return false
    if (f.destination !== 'todos' && t.destination !== f.destination) return false
    if (f.month !== 'todos' && !t.departure.startsWith(f.month)) return false
    if (!durationMatch(t.nights, f.duration)) return false
    if (f.currency !== 'todas' && t.currency !== f.currency) return false
    if (f.maxPrice != null && finalPrice(t) > f.maxPrice) return false
    if (f.search.trim()) {
      const q = f.search.trim().toLowerCase()
      if (!`${t.title} ${t.destination} ${t.country}`.toLowerCase().includes(q)) return false
    }
    return true
  })
)

// Viajes con oferta vigente (descuento o promo 2x1 / 3x2...) para la sección "Ofertas imperdibles".
export const selectOffers = createSelector([selectItems], (items) => items.filter((t) => t.offer))

// Destinos con viajes activos; se acotan según nacionales / internacionales.
export const selectDestinations = createSelector([selectItems, selectFilters], (items, f) =>
  [...new Set(items.filter((t) => f.scope === 'todos' || t.scope === f.scope).map((t) => t.destination))].sort()
)

export const selectMonths = createSelector([selectItems], (items) =>
  [...new Set(items.map((t) => t.departure.slice(0, 7)))].sort()
)

// Rango del control de precio para la moneda elegida (null si no hay moneda elegida).
export const selectPriceBounds = createSelector([selectItems, selectFilters], (items, f) => {
  if (f.currency === 'todas') return null
  const prices = items.filter((t) => t.currency === f.currency).map(finalPrice)
  if (!prices.length) return null
  const step = f.currency === 'USD' ? 50 : 10000
  return {
    step,
    min: Math.floor(Math.min(...prices) / step) * step,
    max: Math.ceil(Math.max(...prices) / step) * step,
  }
})
