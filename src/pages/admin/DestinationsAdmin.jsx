import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeDestination, selectAllDestinations, selectAllTrips } from '../../store/catalogSlice.js'
import { showToast } from '../../store/uiSlice.js'
import { SCOPES, SCOPE_LABELS } from '../../data/constants.js'
import { gradientFor } from '../../utils/catalog.js'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import DestinationModal from '../../components/admin/DestinationModal.jsx'

export default function DestinationsAdmin() {
  const dispatch = useDispatch()
  const destinations = useSelector(selectAllDestinations)
  const trips = useSelector(selectAllTrips)
  const [q, setQ] = useState('')
  const [scope, setScope] = useState('todos')
  const [modal, setModal] = useState(null) // null | { destination: obj | null }
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const counts = useMemo(() => {
    const map = {}
    trips.forEach((t) => {
      const c = map[t.destinationId] || (map[t.destinationId] = { total: 0, active: 0 })
      c.total += 1
      if (t.active) c.active += 1
    })
    return map
  }, [trips])

  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return [...destinations]
      .filter((d) => (scope === 'todos' || d.scope === scope) && (!query || `${d.name} ${d.country}`.toLowerCase().includes(query)))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [destinations, q, scope])

  const confirmDelete = async () => {
    setBusy(true)
    const res = await dispatch(removeDestination(toDelete.id))
    setBusy(false)
    setToDelete(null)
    dispatch(
      removeDestination.fulfilled.match(res)
        ? showToast('Destino eliminado.')
        : showToast(res.payload?.message || 'No se pudo eliminar el destino.', 'error')
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Destinos</h1>
          <p className="text-sm text-stone-500">Cada destino guarda sus imágenes y se reutiliza en todos sus viajes.</p>
        </div>
        <button type="button" onClick={() => setModal({ destination: null })} className="btn-primary">
          + Nuevo destino
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:grid-cols-2">
        <input className="input" placeholder="Buscar destino o país" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" aria-label="Alcance" value={scope} onChange={(e) => setScope(e.target.value)}>
          {SCOPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.value === 'todos' ? 'Nacionales e internacionales' : s.label}
            </option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
          <p className="font-semibold text-brand-dark">{q || scope !== 'todos' ? 'No hay destinos con esos filtros' : 'Todavía no cargaste destinos'}</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => {
            const c = counts[d.id] || { total: 0, active: 0 }
            return (
              <li key={d.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
                <div className={`relative h-32 bg-gradient-to-br ${gradientFor(d.id)}`}>
                  {d.images[0] && <img src={d.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-dark">{SCOPE_LABELS[d.scope]}</span>
                  <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                    {d.images.length} {d.images.length === 1 ? 'imagen' : 'imágenes'}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold text-brand-dark">{d.name}</h3>
                    <p className="text-sm text-stone-500">{d.country}</p>
                  </div>
                  <p className="text-xs text-stone-500">
                    {c.total === 0 ? 'Sin viajes' : `${c.active} activos de ${c.total} ${c.total === 1 ? 'viaje' : 'viajes'}`}
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setModal({ destination: d })} className="btn-secondary !px-3 !py-1.5 !text-xs">
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={c.total > 0}
                      title={c.total > 0 ? 'Tiene viajes asociados: desactivá esos viajes y dejá el destino para reutilizarlo.' : 'Eliminar destino'}
                      onClick={() => setToDelete(d)}
                      className="btn-secondary !px-3 !py-1.5 !text-xs !text-red-700 hover:!bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {modal && <DestinationModal destination={modal.destination} onClose={() => setModal(null)} />}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar destino"
          message={`Vas a eliminar “${toDelete.name}” junto con sus imágenes. Esta acción no se puede deshacer. Si pensás reutilizarlo, mejor dejalo.`}
          confirmLabel="Eliminar"
          danger
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
