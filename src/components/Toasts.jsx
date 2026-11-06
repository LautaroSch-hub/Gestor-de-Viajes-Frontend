import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dismissToast, selectToasts } from '../store/uiSlice.js'

function Toast({ toast }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), 4500)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id])

  const isError = toast.type === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${isError ? 'bg-red-700' : 'bg-brand-dark'}`}
    >
      <span className={isError ? '' : 'text-gold'}>{isError ? '!' : '✓'}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="text-white/70 hover:text-white"
      >
        ×
      </button>
    </div>
  )
}

// Avisos breves ("Viaje guardado", errores...) que se apilan abajo a la derecha.
export default function Toasts() {
  const toasts = useSelector(selectToasts)
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  )
}
