// Constantes compartidas por la web pública y el panel de administración.

export const CATEGORIES = [
  { value: 'todos', label: 'Todos' },
  { value: 'paquete', label: 'Paquetes' },
  { value: 'crucero', label: 'Cruceros' },
  { value: 'hotel', label: 'Hoteles' },
  { value: 'vuelo', label: 'Vuelos' },
]

// Categorías reales de un viaje (sin la opción "Todos" de los filtros).
export const TRIP_CATEGORIES = CATEGORIES.filter((c) => c.value !== 'todos')

export const CATEGORY_LABELS = { paquete: 'Paquete', crucero: 'Crucero', hotel: 'Hotel', vuelo: 'Vuelo' }

export const SCOPES = [
  { value: 'todos', label: 'Todos' },
  { value: 'nacional', label: 'Nacionales' },
  { value: 'internacional', label: 'Internacionales' },
]

export const SCOPE_LABELS = { nacional: 'Nacional', internacional: 'Internacional' }

export const CURRENCIES = [
  { value: 'todas', label: 'Todas' },
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'ARS', label: 'Pesos (ARS)' },
]

export const TRIP_KINDS = ['Ida y vuelta', 'Solo ida', 'Múltiples destinos']

// Promos rápidas que se ofrecen en el formulario de ofertas.
export const PROMO_PRESETS = ['2x1', '3x2', '4x3', '50% 2da persona']
