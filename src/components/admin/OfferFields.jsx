import Field, { inputClass } from './Field.jsx'
import Pills from './Pills.jsx'
import { PROMO_PRESETS } from '../../data/constants.js'
import { formatPrice } from '../../utils/format.js'

const TYPES = [
  { value: 'none', label: 'Sin oferta' },
  { value: 'discount', label: 'Descuento' },
  { value: 'promo', label: 'Promo (2x1, 3x2…)' },
]

// Campos de la oferta de un viaje. Se usan tanto en el formulario del viaje como en la
// ventana rápida "Oferta" del listado. onChange recibe un objeto con los campos que cambian.
export default function OfferFields({ form, onChange, errors = {}, price, currency }) {
  const normal = Number(price)
  const offer = Number(form.offerPrice)
  const validDiscount =
    form.offerType === 'discount' && Number.isInteger(normal) && normal > 0 && Number.isInteger(offer) && offer > 0 && offer < normal
  const percent = validDiscount ? Math.round((1 - offer / normal) * 100) : 0

  return (
    <div className="space-y-4">
      <Pills id="f-offerType" options={TYPES} value={form.offerType} onChange={(v) => onChange({ offerType: v })} />

      {form.offerType === 'discount' && (
        <>
          <Field
            label={`Precio con descuento (${currency})`}
            htmlFor="f-offerPrice"
            error={errors.offerPrice}
            hint={
              Number.isInteger(normal) && normal > 0
                ? `Número entero, sin puntos. Precio normal: ${formatPrice(normal, currency)}.`
                : 'Número entero, sin puntos. Cargá primero el precio normal del viaje.'
            }
          >
            <input
              id="f-offerPrice"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              className={inputClass(errors.offerPrice)}
              value={form.offerPrice}
              onChange={(e) => onChange({ offerPrice: e.target.value })}
            />
          </Field>
          {validDiscount && (
            <p className="rounded-lg bg-gold/20 p-3 text-sm text-brand-dark">
              En la web se verá <span className="line-through">{formatPrice(normal, currency)}</span> →{' '}
              <strong>{formatPrice(offer, currency)}</strong> ({percent}% menos).
            </p>
          )}
        </>
      )}

      {form.offerType === 'promo' && (
        <>
          <Field label="Promo" htmlFor="f-offerLabel" error={errors.offerLabel} hint="Se muestra como cartel en la tarjeta del viaje.">
            <div className="mb-2 flex flex-wrap gap-2">
              {PROMO_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ offerLabel: p })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    form.offerLabel === p ? 'bg-accent text-white' : 'bg-gold/25 text-brand hover:bg-gold/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              id="f-offerLabel"
              maxLength={16}
              placeholder="Ej: 2x1"
              className={inputClass(errors.offerLabel)}
              value={form.offerLabel}
              onChange={(e) => onChange({ offerLabel: e.target.value })}
            />
          </Field>
          <Field label="Aclaración (opcional)" htmlFor="f-offerNote" error={errors.offerNote} hint="Se ve en el detalle del viaje.">
            <textarea
              id="f-offerNote"
              rows="2"
              maxLength={160}
              placeholder="Ej: Pagás un solo pasaje y viajan dos personas."
              className={inputClass(errors.offerNote)}
              value={form.offerNote}
              onChange={(e) => onChange({ offerNote: e.target.value })}
            />
          </Field>
        </>
      )}

      {form.offerType !== 'none' && (
        <Field
          label="Válida hasta (opcional)"
          htmlFor="f-offerUntil"
          error={errors.offerUntil}
          hint="Pasada esa fecha la oferta se oculta sola de la web."
        >
          <input
            id="f-offerUntil"
            type="date"
            className={inputClass(errors.offerUntil)}
            value={form.offerUntil}
            onChange={(e) => onChange({ offerUntil: e.target.value })}
          />
        </Field>
      )}
    </div>
  )
}
