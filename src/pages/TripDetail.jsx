import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCatalogStatus } from '../store/catalogSlice.js'
import { selectTripById } from '../store/tripsSlice.js'
import { formatDate, formatPrice, hasDiscount, hasPromo } from '../utils/format.js'
import ContactForm from '../components/ContactForm.jsx'
import Gallery from '../components/Gallery.jsx'
import PriceTag from '../components/PriceTag.jsx'

export default function TripDetail() {
  const { id } = useParams()
  const trip = useSelector(selectTripById(id))
  const status = useSelector(selectCatalogStatus)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!trip && status !== 'ready' && status !== 'error') {
    return <p className="px-4 py-20 text-center text-stone-500">Cargando…</p>
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-semibold text-brand-dark">No encontramos este viaje.</p>
        <Link to="/" className="btn-primary mt-4">Volver a los viajes</Link>
      </div>
    )
  }

  const chips = [
    trip.nights ? `${trip.nights} noches` : null,
    trip.tripKind,
    trip.airline,
    `Salida ${formatDate(trip.departure)}`,
    `Desde ${trip.from}`,
    trip.scope === 'nacional' ? 'Nacional' : 'Internacional',
  ].filter(Boolean)

  return (
    <>
      <section className={`bg-gradient-to-br ${trip.gradient} text-white`}>
        <div className="bg-black/30">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <Link to="/" className="text-sm font-medium text-white/90 hover:underline">← Volver a los viajes</Link>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl">{trip.title}</h1>
            <p className="mt-1 text-white/90">{trip.destination}, {trip.country}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              {chips.map((c) => (
                <span key={c} className="rounded-full bg-white/90 px-3 py-1 text-brand-dark">{c}</span>
              ))}
              {hasPromo(trip) && (
                <span className="rounded-full bg-accent px-3 py-1 text-white">Promo {trip.offer.label}</span>
              )}
              {hasDiscount(trip) && (
                <span className="rounded-full bg-accent px-3 py-1 text-white">En descuento</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Gallery images={trip.images} title={trip.title} />

          <div>
            <h2 className="text-xl font-semibold text-brand-dark">Sobre este viaje</h2>
            <p className="mt-2 text-stone-600">{trip.summary}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h3 className="font-semibold text-brand-dark">Incluye</h3>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {trip.includes.map((i) => (
                <li key={i} className="flex gap-2"><span className="text-emerald-600">✓</span>{i}</li>
              ))}
            </ul>
          </div>

          {(trip.hotel || trip.hotelImages.length > 0) && (
            <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <h3 className="font-semibold text-brand-dark">Alojamiento</h3>
              {trip.hotel && <p className="text-sm text-stone-600">{trip.hotel}</p>}
              <Gallery images={trip.hotelImages} title={`Alojamiento: ${trip.title}`} />
            </div>
          )}

          {(trip.tour || trip.tourImages.length > 0) && (
            <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <h3 className="font-semibold text-brand-dark">Tour</h3>
              {trip.tour && <p className="whitespace-pre-line text-sm text-stone-600">{trip.tour}</p>}
              <Gallery images={trip.tourImages} title={`Tour: ${trip.title}`} />
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <p className="text-xs uppercase text-stone-400">Precio por persona</p>
            <PriceTag trip={trip} large />

            {hasDiscount(trip) && (
              <p className="mt-1 text-sm font-semibold text-emerald-600">
                Ahorrás {formatPrice(trip.price - trip.offer.price, trip.currency)}
              </p>
            )}
            {hasPromo(trip) && trip.offer.note && (
              <p className="mt-2 rounded-lg bg-gold/20 p-3 text-sm text-brand-dark">{trip.offer.note}</p>
            )}

            <p className="mb-5 mt-2 text-xs text-stone-500">Sujeto a disponibilidad.</p>
            <ContactForm trip={trip} />
          </div>
        </aside>
      </section>
    </>
  )
}
