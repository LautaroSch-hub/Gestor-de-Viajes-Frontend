import { useEffect, useRef } from 'react'

// Ventana modal genérica del panel: se cierra con Esc, con la × o haciendo click afuera.
export default function Modal({ title, onClose, children, size = 'md' }) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeRef.current()
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const width = size === 'lg' ? 'max-w-3xl' : 'max-w-lg'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92vh] w-full ${width} overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-brand-dark">{title}</h2>
          <button
            type="button"
            onClick={() => closeRef.current()}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 rounded-full px-2 text-2xl leading-none text-stone-400 hover:text-stone-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
