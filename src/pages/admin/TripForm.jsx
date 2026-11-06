import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { saveTrip, selectAllDestinations, selectAllTrips } from '../../store/catalogSlice.js'
import { showToast } from '../../store/uiSlice.js'
import { CURRENCIES, SCOPE_LABELS, TRIP_CATEGORIES, TRIP_KINDS } from '../../data/constants.js'
import { gradientFor, indexById, toViewTrip, todayISO } from '../../utils/catalog.js'
import { EMPTY_FORM, formToTrip, tripToForm } from '../../utils/tripForm.js'
import { MAX_EXTRA_IMAGES, hasErrors, validateOffer, validateTrip } from '../../utils/validation.js'
import Field, { inputClass } from '../../components/admin/Field.jsx'
import Pills from '../../components/admin/Pills.jsx'
import ImageManager from '../../components/admin/ImageManager.jsx'
import OfferFields from '../../components/admin/OfferFields.jsx'
import DestinationModal from '../../components/admin/DestinationModal.jsx'
import TripCard from '../../components/TripCard.jsx'

// Orden de los campos en pantalla: se usa para llevar el foco al primer error.
const FIELD_ORDER = [
  'category', 'destinationId', 'title', 'airline', 'tripKind', 'nights', 'departure', 'from',
  'currency', 'price', 'summary', 'includes', 'hotel', 'hotelImages', 'tour', 'tourImages', 'offerType', 'offerPrice', 'offerLabel', 'offerNote', 'offerUntil',
]

const CURRENCY_OPTIONS = CURRENCIES.filter((c) => c.value !== 'todas')

function Section({ title, hint, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <h2 className="text-base font-semibold text-brand-dark">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

// La "key" hace que al pasar de "nuevo" a "editar" (o entre viajes) el formulario arranque limpio.
export default function TripForm() {
  const { id } = useParams()
  return <TripFormInner key={id ?? 'new'} id={id ?? null} />
}

function TripFormInner({ id }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const trips = useSelector(selectAllTrips)
  const destinations = useSelector(selectAllDestinations)
  const editing = id ? trips.find((t) => t.id === Number(id)) : null

  const [form, setForm] = useState(() => (editing ? tripToForm(editing) : { ...EMPTY_FORM }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [destModal, setDestModal] = useState(null) // null | 'new' | 'edit'
  const initialRef = useRef(JSON.stringify(form))
  const dirty = JSON.stringify(form) !== initialRef.current

  // Avisa si se intenta cerrar o recargar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return undefined
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const isFlight = form.category === 'vuelo'
  const sortedDestinations = useMemo(() => [...destinations].sort((a, b) => a.name.localeCompare(b.name, 'es')), [destinations])
  const destination = destinations.find((d) => d.id === Number(form.destinationId)) || null

  const clearErrors = (keys) =>
    setErrors((prev) => {
      const next = { ...prev }
      keys.forEach((k) => delete next[k])
      return next
    })
  const patch = (changes) => {
    setForm((f) => ({ ...f, ...changes }))
    clearErrors(Object.keys(changes))
  }
  const onInput = (e) => patch({ [e.target.name]: e.target.value })

  const setInclude = (i, value) => {
    setForm((f) => ({ ...f, includes: f.includes.map((x, k) => (k === i ? value : x)) }))
    clearErrors(['includes'])
  }
  const addInclude = () => setForm((f) => ({ ...f, includes: [...f.includes, ''] }))
  const removeInclude = (i) =>
    setForm((f) => ({ ...f, includes: f.includes.length > 1 ? f.includes.filter((_, k) => k !== i) : [''] }))

  // Vista previa de la tarjeta tal como se verá en la web.
  const preview = useMemo(() => {
    const data = formToTrip(form)
    const price = Number.isInteger(data.price) ? data.price : 0
    const offerOk = data.offer && !hasErrors(validateOffer(data.offer, price))
    const trip = {
      ...data,
      id: editing?.id ?? 0,
      title: data.title || 'Título del viaje',
      price,
      nights: isFlight ? null : Number.isInteger(data.nights) ? data.nights : '–',
      departure: data.departure || todayISO(),
      from: data.from || '—',
      offer: offerOk ? data.offer : null,
      airline: data.airline,
    }
    return (
      toViewTrip(trip, indexById(destinations)) || {
        ...trip,
        destination: 'Destino',
        country: '',
        scope: 'internacional',
        images: [],
        gradient: gradientFor(0),
      }
    )
  }, [form, destinations, editing, isFlight])

  const focusFirst = (errs) => {
    const key = FIELD_ORDER.find((k) => errs[k])
    const el = key && document.getElementById(`f-${key}`)
    if (el) {
      el.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      el.focus?.({ preventScroll: true })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const data = formToTrip(form)
    const errs = validateTrip(data, { destinations })
    if (hasErrors(errs)) {
      setErrors(errs)
      focusFirst(errs)
      dispatch(showToast('Revisá los campos marcados.', 'error'))
      return
    }
    setSaving(true)
    const res = await dispatch(saveTrip({ id: editing?.id ?? null, data }))
    setSaving(false)
    if (saveTrip.fulfilled.match(res)) {
      initialRef.current = JSON.stringify(form)
      dispatch(showToast(editing ? 'Viaje actualizado.' : 'Viaje creado.'))
      navigate('/admin/viajes')
    } else {
      const fields = res.payload?.fields || {}
      setErrors(fields)
      focusFirst(fields)
      dispatch(showToast(res.payload?.message || 'No se pudo guardar el viaje.', 'error'))
    }
  }

  if (id && !editing) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
        <p className="font-semibold text-brand-dark">No encontramos ese viaje.</p>
        <Link to="/admin/viajes" className="btn-primary mt-4">
          Volver a los viajes
        </Link>
      </div>
    )
  }

  return (
    <>
      <form id="trip-form" onSubmit={submit} noValidate className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link to="/admin/viajes" className="text-sm font-medium text-stone-500 hover:text-brand">
              ← Volver a los viajes
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-brand-dark">{editing ? 'Editar viaje' : 'Nuevo viaje'}</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/viajes" className="btn-secondary">
              Cancelar
            </Link>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear viaje'}
            </button>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Section title="Tipo de viaje">
              <Field error={errors.category}>
                <Pills id="f-category" options={TRIP_CATEGORIES} value={form.category} onChange={(v) => patch({ category: v })} />
              </Field>
            </Section>

            <Section title="Destino" hint="El destino guarda el país, si es nacional o internacional y las imágenes. Se reutiliza en todos sus viajes.">
              <Field label="Destino *" htmlFor="f-destinationId" error={errors.destinationId}>
                <select id="f-destinationId" name="destinationId" className={inputClass(errors.destinationId)} value={form.destinationId} onChange={onInput}>
                  <option value="">Elegí un destino…</option>
                  {sortedDestinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.country}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setDestModal('new')} className="btn-secondary">
                  + Nuevo destino
                </button>
                {destination && (
                  <button type="button" onClick={() => setDestModal('edit')} className="btn-secondary">
                    Editar destino e imágenes
                  </button>
                )}
              </div>
              {destination && (
                <div className="rounded-lg bg-brand-light p-3 text-sm">
                  <p className="font-semibold text-brand-dark">
                    {destination.name}, {destination.country} · {SCOPE_LABELS[destination.scope]}
                  </p>
                  {destination.images.length ? (
                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {destination.images.slice(0, 5).map((src) => (
                        <img key={src} src={src} alt="" className="h-16 w-24 shrink-0 rounded object-cover" />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-stone-600">Este destino todavía no tiene imágenes: la web mostrará un degradado.</p>
                  )}
                </div>
              )}
            </Section>

            <Section title="Datos del viaje">
              <Field label="Título *" htmlFor="f-title" error={errors.title}>
                <input id="f-title" name="title" className={inputClass(errors.title)} value={form.title} onChange={onInput} placeholder={isFlight ? 'Ej: Buenos Aires – Tokio' : 'Ej: Caribe Todo Incluido'} />
              </Field>

              {isFlight && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Aerolínea *" htmlFor="f-airline" error={errors.airline}>
                    <input id="f-airline" name="airline" className={inputClass(errors.airline)} value={form.airline} onChange={onInput} placeholder="Ej: Aerolíneas Argentinas" />
                  </Field>
                  <Field label="Tipo de pasaje *" htmlFor="f-tripKind" error={errors.tripKind}>
                    <select id="f-tripKind" name="tripKind" className={inputClass(errors.tripKind)} value={form.tripKind} onChange={onInput}>
                      {[...new Set([...TRIP_KINDS, form.tripKind])].filter(Boolean).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                {!isFlight && (
                  <Field label="Noches *" htmlFor="f-nights" error={errors.nights}>
                    <input id="f-nights" name="nights" type="number" min="1" step="1" inputMode="numeric" className={inputClass(errors.nights)} value={form.nights} onChange={onInput} />
                  </Field>
                )}
                <Field label="Fecha de salida *" htmlFor="f-departure" error={errors.departure}>
                  <input id="f-departure" name="departure" type="date" className={inputClass(errors.departure)} value={form.departure} onChange={onInput} />
                </Field>
                <Field label="Sale desde *" htmlFor="f-from" error={errors.from}>
                  <input id="f-from" name="from" className={inputClass(errors.from)} value={form.from} onChange={onInput} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Moneda *" htmlFor="f-currency" error={errors.currency}>
                  <select id="f-currency" name="currency" className={inputClass(errors.currency)} value={form.currency} onChange={onInput}>
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Precio por persona *" htmlFor="f-price" error={errors.price} hint="Número entero, sin puntos ni comas.">
                  <input id="f-price" name="price" type="number" min="1" step="1" inputMode="numeric" className={inputClass(errors.price)} value={form.price} onChange={onInput} />
                </Field>
              </div>

              <Field label="Resumen *" htmlFor="f-summary" error={errors.summary}>
                <textarea id="f-summary" name="summary" rows="3" className={inputClass(errors.summary)} value={form.summary} onChange={onInput} placeholder="Una o dos frases que describan el viaje." />
              </Field>

              <Field label="Qué incluye *" error={errors.includes} hint="Un ítem por renglón. Se muestra como lista con tildes en el detalle.">
                <div id="f-includes" tabIndex={-1} className="space-y-2 outline-none">
                  {form.includes.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        aria-label={`Ítem ${i + 1}`}
                        className={inputClass(errors.includes && !item.trim())}
                        value={item}
                        onChange={(e) => setInclude(i, e.target.value)}
                        placeholder="Ej: Traslados aeropuerto-hotel"
                      />
                      <button type="button" onClick={() => removeInclude(i)} aria-label={`Quitar ítem ${i + 1}`} className="rounded-lg px-3 text-lg text-stone-400 hover:text-red-700">
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addInclude} className="text-sm font-semibold text-accent hover:underline">
                    + Agregar ítem
                  </button>
                </div>
              </Field>

              {!isFlight && (
                <>
                  <div className="space-y-3 rounded-xl border border-stone-200 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-brand-dark">Alojamiento (opcional)</h3>
                      <p className="text-xs text-stone-500">Se muestra en el detalle del viaje, con un carrusel si cargás fotos del hotel.</p>
                    </div>
                    <Field label="Descripción del hotel" htmlFor="f-hotel" error={errors.hotel}>
                      <input id="f-hotel" name="hotel" className={inputClass(errors.hotel)} value={form.hotel} onChange={onInput} placeholder="Ej: Hotel 4★ frente a la playa" />
                    </Field>
                    <Field label="Fotos del hotel" error={errors.hotelImages} hint={`Hasta ${MAX_EXTRA_IMAGES} fotos.`}>
                      <div id="f-hotelImages" tabIndex={-1} className="outline-none">
                        <ImageManager
                          images={form.hotelImages}
                          onChange={(hotelImages) => patch({ hotelImages })}
                          cover={false}
                          max={MAX_EXTRA_IMAGES}
                          label="foto del hotel"
                          emptyText="Todavía no hay fotos del hotel."
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="space-y-3 rounded-xl border border-stone-200 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-brand-dark">Tour (opcional)</h3>
                      <p className="text-xs text-stone-500">Excursiones o paseos del viaje. Se muestra en el detalle, con carrusel si cargás fotos.</p>
                    </div>
                    <Field label="Descripción del tour" htmlFor="f-tour" error={errors.tour}>
                      <textarea id="f-tour" name="tour" rows="3" className={inputClass(errors.tour)} value={form.tour} onChange={onInput} placeholder="Ej: City tour de medio día con guía en español y entrada a los museos." />
                    </Field>
                    <Field label="Fotos del tour" error={errors.tourImages} hint={`Hasta ${MAX_EXTRA_IMAGES} fotos.`}>
                      <div id="f-tourImages" tabIndex={-1} className="outline-none">
                        <ImageManager
                          images={form.tourImages}
                          onChange={(tourImages) => patch({ tourImages })}
                          cover={false}
                          max={MAX_EXTRA_IMAGES}
                          label="foto del tour"
                          emptyText="Todavía no hay fotos del tour."
                        />
                      </div>
                    </Field>
                  </div>
                </>
              )}
            </Section>

            <Section title="Oferta" hint="Opcional. Se muestra en “Ofertas imperdibles” y con cartel en la tarjeta.">
              <OfferFields form={form} onChange={patch} errors={errors} price={form.price} currency={form.currency} />
            </Section>

            <Section title="Visibilidad">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#a6644b]" checked={form.active} onChange={(e) => patch({ active: e.target.checked })} />
                <span>
                  <span className="font-semibold text-brand-dark">Visible en la web</span>
                  <br />
                  <span className="text-stone-500">
                    Si lo desactivás se conserva (con su destino e imágenes) pero no se muestra al público. Podés reactivarlo cuando quieras.
                  </span>
                </span>
              </label>
            </Section>

            <div className="flex justify-end gap-2 pb-4">
              <Link to="/admin/viajes" className="btn-secondary">
                Cancelar
              </Link>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear viaje'}
              </button>
            </div>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Así se verá en la web</h2>
            <TripCard trip={preview} preview />
            {!form.active && <p className="rounded-lg bg-stone-200 p-3 text-xs text-stone-600">Está desactivado: no se mostrará en la web hasta que lo actives.</p>}
            {editing && editing.active && (
              <Link to={`/viaje/${editing.id}`} target="_blank" className="block text-center text-sm font-semibold text-accent hover:underline">
                Ver en la web ↗
              </Link>
            )}
          </aside>
        </div>
      </form>

      {/* Fuera del <form> para no anidar formularios */}
      {destModal && (
        <DestinationModal
          destination={destModal === 'edit' ? destination : null}
          onClose={() => setDestModal(null)}
          onSaved={(d) => patch({ destinationId: String(d.id) })}
        />
      )}
    </>
  )
}
