import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { resetDemoData, selectAllDestinations, selectAllTrips } from '../../store/catalogSlice.js'
import { showToast } from '../../store/uiSlice.js'
import { DEMO_MODE } from '../../services/api.js'
import { TRIP_CATEGORIES } from '../../data/constants.js'
import { daysUntil, indexById, isOfferExpired, todayISO } from '../../utils/catalog.js'
import { formatDate } from '../../utils/format.js'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-brand">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-stone-500">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const trips = useSelector(selectAllTrips)
  const destinations = useSelector(selectAllDestinations)
  const [confirmReset, setConfirmReset] = useState(false)

  const data = useMemo(() => {
    const today = todayISO()
    const byId = indexById(destinations)
    const active = trips.filter((t) => t.active)
    const liveOffers = active.filter((t) => t.offer && !isOfferExpired(t.offer, today))
    return {
      active,
      inactive: trips.length - active.length,
      liveOffers,
      byCategory: TRIP_CATEGORIES.map((c) => ({ ...c, count: active.filter((t) => t.category === c.value).length })),
      nacionales: active.filter((t) => byId[t.destinationId]?.scope === 'nacional').length,
      internacionales: active.filter((t) => byId[t.destinationId]?.scope === 'internacional').length,
      expiredOffers: trips.filter((t) => t.offer && isOfferExpired(t.offer, today)),
      expiringOffers: liveOffers.filter((t) => t.offer.until && daysUntil(t.offer.until, today) <= 14),
      withoutImages: destinations.filter((d) => !d.images?.length && active.some((t) => t.destinationId === d.id)),
      recent: [...trips].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
      byId,
    }
  }, [trips, destinations])

  const attention = data.expiredOffers.length + data.expiringOffers.length + data.withoutImages.length

  const doReset = async () => {
    const res = await dispatch(resetDemoData())
    setConfirmReset(false)
    dispatch(
      resetDemoData.fulfilled.match(res) ? showToast('Se restauraron los datos de ejemplo.') : showToast(res.payload?.message || 'No se pudo restaurar.', 'error')
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Resumen</h1>
          <p className="text-sm text-stone-500">El estado de tu catálogo de un vistazo.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/destinos" className="btn-secondary">
            + Nuevo destino
          </Link>
          <Link to="/admin/viajes/nuevo" className="btn-primary">
            + Nuevo viaje
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Viajes activos" value={data.active.length} sub={`${data.nacionales} nacionales · ${data.internacionales} internacionales`} />
        <Stat label="Desactivados" value={data.inactive} sub="Guardados para reutilizar" />
        <Stat label="Ofertas vigentes" value={data.liveOffers.length} sub="Se ven en “Ofertas imperdibles”" />
        <Stat label="Destinos" value={destinations.length} sub="Con sus imágenes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="font-semibold text-brand-dark">Viajes activos por tipo</h2>
          <ul className="mt-3 space-y-2">
            {data.byCategory.map((c) => {
              const pct = data.active.length ? Math.round((c.count / data.active.length) * 100) : 0
              return (
                <li key={c.value} className="text-sm">
                  <div className="flex justify-between">
                    <span>{c.label}</span>
                    <span className="font-semibold text-brand">{c.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-light">
                    <div className="h-full rounded-full bg-accent-soft" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="font-semibold text-brand-dark">Para revisar</h2>
          {attention === 0 ? (
            <p className="mt-3 text-sm text-stone-500">Todo en orden: no hay ofertas por vencer ni destinos sin imágenes.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data.expiredOffers.map((t) => (
                <li key={`e${t.id}`} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="mr-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">Vencida</span>
                    Oferta de {t.title}
                  </span>
                  <Link to={`/admin/viajes/${t.id}/editar`} className="font-semibold text-accent hover:underline">
                    Renovar
                  </Link>
                </li>
              ))}
              {data.expiringOffers.map((t) => (
                <li key={`x${t.id}`} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="mr-2 rounded bg-gold/30 px-1.5 py-0.5 text-xs font-semibold text-brand">Por vencer</span>
                    {t.title} · hasta {formatDate(t.offer.until)}
                  </span>
                  <Link to={`/admin/viajes/${t.id}/editar`} className="font-semibold text-accent hover:underline">
                    Ver
                  </Link>
                </li>
              ))}
              {data.withoutImages.map((d) => (
                <li key={`d${d.id}`} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="mr-2 rounded bg-stone-200 px-1.5 py-0.5 text-xs font-semibold text-stone-600">Sin imágenes</span>
                    {d.name}
                  </span>
                  <Link to="/admin/destinos" className="font-semibold text-accent hover:underline">
                    Agregar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h2 className="font-semibold text-brand-dark">Últimos cambios</h2>
        {data.recent.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">Todavía no cargaste viajes.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-100">
            {data.recent.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold text-brand-dark">{t.title}</p>
                  <p className="text-xs text-stone-500">
                    {data.byId[t.destinationId]?.name || 'Sin destino'} · modificado el {formatDate(t.updatedAt.slice(0, 10))}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge active={t.active} />
                  <Link to={`/admin/viajes/${t.id}/editar`} className="font-semibold text-accent hover:underline">
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {DEMO_MODE && (
        <section className="rounded-2xl border border-dashed border-stone-300 p-5 text-sm text-stone-600">
          <p className="font-semibold text-brand-dark">Modo demo</p>
          <p className="mt-1">
            Los datos se guardan en este navegador. Cuando se conecte el backend se guardarán en PostgreSQL.
          </p>
          <button type="button" onClick={() => setConfirmReset(true)} className="mt-3 text-sm font-semibold text-red-700 hover:underline">
            Restaurar datos de ejemplo
          </button>
        </section>
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Restaurar datos de ejemplo"
          message="Se borrarán todos los cambios hechos en este navegador (viajes, destinos e imágenes) y se vuelve a los datos de ejemplo originales."
          confirmLabel="Restaurar"
          danger
          onConfirm={doReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  )
}
