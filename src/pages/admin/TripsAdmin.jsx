import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  duplicateTrip,
  selectAllDestinations,
  selectAllTrips,
  toggleTripActive,
} from '../../store/catalogSlice.js'
import { showToast } from '../../store/uiSlice.js'
import { CATEGORIES, CATEGORY_LABELS, SCOPE_LABELS, SCOPES } from '../../data/constants.js'
import { indexById, isOfferExpired, todayISO } from '../../utils/catalog.js'
import { formatDate, formatPrice } from '../../utils/format.js'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import OfferModal from '../../components/admin/OfferModal.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'

function AdminPrice({ trip }) {
  const offer = trip.offer
  const expired = isOfferExpired(offer)
  return (
    <div className="text-sm">
      {offer?.type === 'discount' ? (
        <>
          <span className="text-xs text-stone-400 line-through">{formatPrice(trip.price, trip.currency)}</span>
          <br />
          <span className={`font-semibold ${expired ? 'text-stone-500' : 'text-accent'}`}>{formatPrice(offer.price, trip.currency)}</span>
        </>
      ) : (
        <span className="font-semibold text-brand">{formatPrice(trip.price, trip.currency)}</span>
      )}
      {offer?.type === 'promo' && (
        <span className={`ml-2 rounded px-1.5 py-0.5 text-xs font-semibold ${expired ? 'bg-stone-200 text-stone-500' : 'bg-gold/25 text-brand'}`}>
          {offer.label}
        </span>
      )}
      {expired && <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">Oferta vencida</span>}
      {offer?.until && !expired && <p className="text-[11px] text-stone-500">Oferta hasta {formatDate(offer.until)}</p>}
    </div>
  )
}

const SCOPE_OPTIONS = SCOPES
const CATEGORY_OPTIONS = CATEGORIES

export default function TripsAdmin() {
  const dispatch = useDispatch()
  const trips = useSelector(selectAllTrips)
  const destinations = useSelector(selectAllDestinations)
  const byId = useMemo(() => indexById(destinations), [destinations])

  const [q, setQ] = useState('')
  const [category, setCategory] = useState('todos')
  const [scope, setScope] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [offerFilter, setOfferFilter] = useState('todas')
  const [offerTrip, setOfferTrip] = useState(null)
  const [toDeactivate, setToDeactivate] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const rows = useMemo(() => {
    const today = todayISO()
    const query = q.trim().toLowerCase()
    return trips
      .map((trip) => ({ trip, dest: byId[trip.destinationId] }))
      .filter(({ trip, dest }) => {
        if (query && !`${trip.title} ${dest?.name || ''} ${dest?.country || ''}`.toLowerCase().includes(query)) return false
        if (category !== 'todos' && trip.category !== category) return false
        if (scope !== 'todos' && dest?.scope !== scope) return false
        if (status === 'activos' && !trip.active) return false
        if (status === 'desactivados' && trip.active) return false
        if (offerFilter === 'con' && !(trip.offer && !isOfferExpired(trip.offer, today))) return false
        if (offerFilter === 'sin' && trip.offer) return false
        if (offerFilter === 'vencida' && !(trip.offer && isOfferExpired(trip.offer, today))) return false
        return true
      })
      .sort((a, b) => b.trip.updatedAt.localeCompare(a.trip.updatedAt))
  }, [trips, byId, q, category, scope, status, offerFilter])

  const notify = (res, okMessage, thunk) =>
    dispatch(thunk.fulfilled.match(res) ? showToast(okMessage) : showToast(res.payload?.message || 'No se pudo completar la acción.', 'error'))

  const setActive = async (trip, active) => {
    setBusyId(trip.id)
    const res = await dispatch(toggleTripActive({ id: trip.id, active }))
    setBusyId(null)
    setToDeactivate(null)
    notify(
      res,
      active ? 'Viaje activado: ya se ve en la web.' : 'Viaje desactivado. Se conserva con su destino e imágenes para reutilizarlo.',
      toggleTripActive
    )
  }

  const duplicate = async (trip) => {
    setBusyId(trip.id)
    const res = await dispatch(duplicateTrip(trip.id))
    setBusyId(null)
    notify(res, 'Copia creada (desactivada y sin oferta). Editala y activala cuando esté lista.', duplicateTrip)
  }

  const clearFilters = () => {
    setQ('')
    setCategory('todos')
    setScope('todos')
    setStatus('todos')
    setOfferFilter('todas')
  }
  const filtered = q || category !== 'todos' || scope !== 'todos' || status !== 'todos' || offerFilter !== 'todas'

  const linkBtn = 'rounded-md px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-light disabled:opacity-40'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Viajes</h1>
          <p className="text-sm text-stone-500">
            {trips.length} en total · {trips.filter((t) => t.active).length} activos
          </p>
        </div>
        <Link to="/admin/viajes/nuevo" className="btn-primary">
          + Nuevo viaje
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:grid-cols-2 lg:grid-cols-5">
        <input className="input lg:col-span-1" placeholder="Buscar viaje o destino" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" aria-label="Tipo de viaje" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value === 'todos' ? 'Todos los tipos' : c.label}
            </option>
          ))}
        </select>
        <select className="input" aria-label="Alcance" value={scope} onChange={(e) => setScope(e.target.value)}>
          {SCOPE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.value === 'todos' ? 'Nacionales e internacionales' : s.label}
            </option>
          ))}
        </select>
        <select className="input" aria-label="Estado" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="desactivados">Desactivados</option>
        </select>
        <select className="input" aria-label="Oferta" value={offerFilter} onChange={(e) => setOfferFilter(e.target.value)}>
          <option value="todas">Con o sin oferta</option>
          <option value="con">Con oferta vigente</option>
          <option value="sin">Sin oferta</option>
          <option value="vencida">Oferta vencida</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
          <p className="font-semibold text-brand-dark">{filtered ? 'No hay viajes con esos filtros' : 'Todavía no cargaste viajes'}</p>
          {filtered ? (
            <button type="button" onClick={clearFilters} className="btn-secondary mt-4">
              Limpiar filtros
            </button>
          ) : (
            <Link to="/admin/viajes/nuevo" className="btn-primary mt-4">
              Cargar el primero
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Viaje</th>
                <th className="px-4 py-3">Alcance</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Salida</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map(({ trip, dest }) => (
                <tr key={trip.id} className={trip.active ? '' : 'bg-stone-50 text-stone-500'}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark">{trip.title}</p>
                    <p className="text-xs text-stone-500">
                      {dest?.name || 'Sin destino'} · {CATEGORY_LABELS[trip.category]}
                    </p>
                  </td>
                  <td className="px-4 py-3">{dest ? SCOPE_LABELS[dest.scope] : '—'}</td>
                  <td className="px-4 py-3">
                    <AdminPrice trip={trip} />
                  </td>
                  <td className="px-4 py-3">{formatDate(trip.departure)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={trip.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Link to={`/admin/viajes/${trip.id}/editar`} className={linkBtn}>
                        Editar
                      </Link>
                      <button type="button" className={linkBtn} onClick={() => setOfferTrip(trip)}>
                        Oferta
                      </button>
                      <button type="button" className={linkBtn} disabled={busyId === trip.id} onClick={() => duplicate(trip)}>
                        Duplicar
                      </button>
                      {trip.active ? (
                        <button type="button" className={`${linkBtn} !text-red-700 hover:!bg-red-50`} disabled={busyId === trip.id} onClick={() => setToDeactivate(trip)}>
                          Desactivar
                        </button>
                      ) : (
                        <button type="button" className={`${linkBtn} !text-emerald-700 hover:!bg-emerald-50`} disabled={busyId === trip.id} onClick={() => setActive(trip, true)}>
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {offerTrip && <OfferModal trip={offerTrip} onClose={() => setOfferTrip(null)} />}

      {toDeactivate && (
        <ConfirmDialog
          title="Desactivar viaje"
          message={`“${toDeactivate.title}” dejará de mostrarse en la web. No se borra: el viaje, su destino y las imágenes se conservan y podés reactivarlo o duplicarlo cuando quieras.`}
          confirmLabel="Desactivar"
          danger
          busy={busyId === toDeactivate.id}
          onConfirm={() => setActive(toDeactivate, false)}
          onCancel={() => setToDeactivate(null)}
        />
      )}
    </div>
  )
}
