// Campo de formulario con etiqueta, ayuda y mensaje de error.
export default function Field({ label, htmlFor, error, hint, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  )
}

// Clase del input; resalta en rojo cuando tiene error.
export const inputClass = (error) => `input ${error ? '!border-red-400 !ring-2 !ring-red-100' : ''}`
