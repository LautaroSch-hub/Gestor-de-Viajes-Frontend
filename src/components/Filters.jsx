import { useDispatch, useSelector } from 'react-redux'
import {
  resetFilters,
  selectDestinations,
  selectFilters,
  selectMonths,
  selectPriceBounds,
  setFilter,
} from '../store/tripsSlice.js'
import { CATEGORIES, CURRENCIES, SCOPES } from '../data/constants.js'
import { formatPrice } from '../utils/format.js'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const monthLabel = (ym) => {
  const [y, m] = ym.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            value === o.value ? 'bg-brand text-white' : 'bg-brand-light text-brand hover:bg-brand/10'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Filters() {
  const dispatch = useDispatch()
  const f = useSelector(selectFilters)
  const destinations = useSelector(selectDestinations)
  const months = useSelector(selectMonths)
  const bounds = useSelector(selectPriceBounds)

  const update = (key, value) => dispatch(setFilter({ key, value }))
  const set = (key) => (e) => update(key, e.target.value)

  return (
    <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-dark">Filtrar viajes</h2>
        <button onClick={() => dispatch(resetFilters())} className="text-xs font-semibold text-accent hover:underline">
          Limpiar
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Buscar</label>
          <input className="input" placeholder="Destino o nombre" value={f.search} onChange={set('search')} />
        </div>

        <div>
          <label className="label">Tipo de viaje</label>
          <Pills options={CATEGORIES} value={f.category} onChange={(v) => update('category', v)} />
        </div>

        <div>
          <label className="label">Nacionales o internacionales</label>
          <Pills options={SCOPES} value={f.scope} onChange={(v) => update('scope', v)} />
        </div>

        <div>
          <label className="label">Destino</label>
          <select className="input" value={f.destination} onChange={set('destination')}>
            <option value="todos">Todos los destinos</option>
            {destinations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Mes de salida</label>
          <select className="input" value={f.month} onChange={set('month')}>
            <option value="todos">Cualquier mes</option>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Duración</label>
          <select className="input" value={f.duration} onChange={set('duration')}>
            <option value="todas">Cualquiera</option>
            <option value="corta">Hasta 5 noches</option>
            <option value="media">6 a 9 noches</option>
            <option value="larga">10 noches o más</option>
          </select>
        </div>

        <div>
          <label className="label">Moneda</label>
          <Pills options={CURRENCIES} value={f.currency} onChange={(v) => update('currency', v)} />
        </div>

        {bounds && (
          <div>
            <label className="label">
              Precio máximo: <span className="text-brand">{formatPrice(f.maxPrice ?? bounds.max, f.currency)}</span>
            </label>
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={bounds.step}
              value={f.maxPrice ?? bounds.max}
              onChange={(e) => update('maxPrice', Number(e.target.value))}
              className="w-full accent-[#a6644b]"
            />
          </div>
        )}
      </div>
    </aside>
  )
}
