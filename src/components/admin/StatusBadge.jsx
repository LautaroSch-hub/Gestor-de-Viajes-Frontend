// Etiqueta de estado de un viaje en el panel.
export default function StatusBadge({ active }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
      }`}
    >
      {active ? 'Activo' : 'Desactivado'}
    </span>
  )
}
