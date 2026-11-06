// Botones tipo "píldora" para elegir una opción (tipo de viaje, alcance, tipo de oferta...).
export default function Pills({ options, value, onChange, id, size = 'md' }) {
  const pad = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
  return (
    <div id={id} tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full font-semibold transition ${pad} ${
            value === o.value ? 'bg-brand text-white' : 'bg-brand-light text-brand hover:bg-brand/10'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
