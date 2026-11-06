import { useEffect, useRef, useState } from 'react'

// Carrusel del detalle: muestra todas las imágenes del viaje (la primera incluida).
// Flechas, puntos, teclado (← →) y swipe en celular.
// Si una imagen falla al cargar se omite; si no hay ninguna, no renderiza nada.
export default function Gallery({ images = [], title, autoPlayMs = 0 }) {
  const [failed, setFailed] = useState([])
  const [index, setIndex] = useState(0)
  const touchX = useRef(null)

  const valid = images.filter((src) => !failed.includes(src))
  const total = valid.length
  const current = Math.min(index, Math.max(total - 1, 0))

  const go = (i) => setIndex((i + total) % total)
  const next = () => go(current + 1)
  const prev = () => go(current - 1)

  // Reproducción automática opcional (autoPlayMs > 0), ej: <Gallery autoPlayMs={5000} />
  useEffect(() => {
    if (!autoPlayMs || total < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % total), autoPlayMs)
    return () => clearInterval(t)
  }, [autoPlayMs, total, current])

  if (!total) return null

  const markFailed = (src) => setFailed((f) => [...f, src])

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX)
  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)()
    touchX.current = null
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  return (
    <div className="space-y-3" tabIndex={0} onKeyDown={onKeyDown} aria-roledescription="carrusel" aria-label={`Imágenes de ${title}`}>
      <div
        className="group relative overflow-hidden rounded-2xl bg-stone-200"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {valid.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${title} ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={() => markFailed(src)}
              className="aspect-[16/9] w-full shrink-0 object-cover"
            />
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-brand-dark shadow transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-brand-dark shadow transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              ›
            </button>

            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {current + 1} / {total}
            </span>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {valid.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-accent' : 'w-2 bg-white/80 hover:bg-white'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
