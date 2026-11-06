import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, offerBadge } from '../utils/format.js'
import PriceTag from './PriceTag.jsx'

const LABELS = { paquete: 'Paquete', crucero: 'Crucero', hotel: 'Hotel', vuelo: 'Vuelo' }

export default function TripCard({ trip, preview = false }) {
  const [imgFailed, setImgFailed] = useState(false)
  const cover = trip.images?.[0] // la primera imagen es la portada de la tarjeta
  const badge = offerBadge(trip)

  const meta = [
    trip.category === 'vuelo' ? trip.tripKind : `${trip.nights} noches`,
    trip.category === 'vuelo' ? trip.airline : null,
    `Salida ${formatDate(trip.departure)}`,
    `desde ${trip.from}`,
  ].filter(Boolean)

  const Wrapper = preview ? 'div' : Link
  const wrapperProps = preview ? {} : { to: `/viaje/${trip.id}` }

  return (
    <Wrapper
      {...wrapperProps}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`relative flex h-44 items-end overflow-hidden bg-gradient-to-br p-4 ${trip.gradient}`}>
        {cover && !imgFailed && (
          <>
            <img
              src={cover}
              alt={trip.title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        )}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-dark">
          {LABELS[trip.category]}
        </span>
        {badge && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow">
            {badge}
          </span>
        )}
        <h3 className="relative z-10 text-xl font-bold text-white drop-shadow">{trip.destination}</h3>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="font-semibold text-brand-dark">{trip.title}</h4>
        <p className="text-xs text-stone-500">{meta.join(' · ')}</p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <PriceTag trip={trip} />
          <span className="text-sm font-semibold text-accent group-hover:underline">Ver detalle →</span>
        </div>
      </div>
    </Wrapper>
  )
}
