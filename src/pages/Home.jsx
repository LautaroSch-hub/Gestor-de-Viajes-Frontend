import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { resetFilters, selectFilteredTrips, selectOffers } from '../store/tripsSlice.js'
import { selectCatalogStatus } from '../store/catalogSlice.js'
import { openContact } from '../store/uiSlice.js'
import Filters from '../components/Filters.jsx'
import TripCard from '../components/TripCard.jsx'

export default function Home() {
  const location = useLocation()
  const dispatch = useDispatch()
  const trips = useSelector(selectFilteredTrips)
  const offers = useSelector(selectOffers)
  const status = useSelector(selectCatalogStatus)
  const loaded = status === 'ready'

  useEffect(() => {
    if (location.hash !== '#todos-los-viajes') return

    // React Router changes the URL with history.pushState, which does not trigger
    // the browser's native hash scrolling. Wait for Home to render, then scroll.
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('todos-los-viajes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash])

  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
            Paquetes, cruceros, hoteles y vuelos para tu próximo viaje
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Si no encontrás lo que buscás, contactanos: armamos paquetes personalizados, tu viaje a tu medida.
          </p>
          <button type="button" onClick={() => dispatch(openContact())} className="btn-primary mt-6">
            Consultas personalizadas
          </button>
        </div>
      </section>

      {loaded && offers.length > 0 && (
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-dark">Ofertas imperdibles</h2>
              <p className="text-sm text-stone-500">Precios rebajados y promociones 2x1, 3x2 y más, por tiempo limitado.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="todos-los-viajes" className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[300px_1fr] scroll-mt-32">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Filters />
        </div>

        <div>
          <h2 className="mb-1 text-xl font-semibold text-brand-dark">Todos los viajes</h2>
          <p className="mb-4 text-sm text-stone-500">
            {loaded ? `${trips.length} ${trips.length === 1 ? 'viaje encontrado' : 'viajes encontrados'}` : '\u00a0'}
          </p>

          {!loaded ? (
            <p className="rounded-2xl bg-white p-10 text-center text-stone-500 ring-1 ring-stone-200">
              {status === 'error' ? 'No pudimos cargar los viajes. Probá recargar la página.' : 'Cargando viajes…'}
            </p>
          ) : trips.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {trips.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
              <p className="font-semibold text-brand-dark">No hay viajes con esos filtros</p>
              <p className="mt-1 text-sm text-stone-500">Probá ampliar la búsqueda o limpiar los filtros.</p>
              <button onClick={() => dispatch(resetFilters())} className="btn-primary mt-4">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
