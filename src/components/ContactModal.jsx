import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createInquiry } from '../store/inquiriesSlice.js'
import { closeContact, selectContactOpen } from '../store/uiSlice.js'
import { EMAIL, WHATSAPP } from '../config.js'
import { normalizePhone, validateInquiry } from '../utils/validation.js'

const EMPTY = { name: '', phone: '', email: '', destination: '', message: '' }

function ContactDialog() {
  const dispatch = useDispatch()
  const [form, setForm] = useState(EMPTY)
  const [channel, setChannel] = useState(null) // 'whatsapp' | 'mail' una vez enviado
  const [error, setError] = useState('')
  const formRef = useRef(null)
  const firstFieldRef = useRef(null)

  const close = () => dispatch(closeContact())
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const onPhoneBlur = (e) => setForm((current) => ({ ...current, phone: normalizePhone(e.target.value) }))

  // Cierra con Escape, bloquea el scroll del fondo y enfoca el primer campo.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && dispatch(closeContact())
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstFieldRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [dispatch])

  const buildText = () =>
    [
      'Hola! Quiero hacer una consulta personalizada.',
      `Nombre: ${form.name}`,
      form.destination ? `Destino o viaje de interés: ${form.destination}` : null,
      form.phone ? `Teléfono: ${form.phone}` : null,
      form.email ? `E-mail: ${form.email}` : null,
      '',
      form.message,
    ]
      .filter((line) => line !== null)
      .join('\n')

  // Backend: la consulta ya se guarda vía createInquiry (POST /api/consultas); el mail lo puede enviar el servidor.
  // que envíe el mail desde el servidor.
  const send = (kind) => {
    if (!formRef.current.reportValidity()) return
    const validationErrors = validateInquiry(form)
    if (validationErrors.phone) {
      setError(validationErrors.phone)
      return
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError('Dejanos un e-mail o un teléfono para poder responderte.')
      return
    }
    setError('')
    const text = buildText()
    // Se guarda la consulta para el panel (el envío por WhatsApp/mail se abre igual).
    dispatch(createInquiry({ ...form, subject: form.destination, source: 'modal', channel: kind }))
    if (kind === 'whatsapp') {
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Consulta personalizada')}&body=${encodeURIComponent(text)}`
    }
    setChannel(kind)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="contact-title" className="text-xl font-bold text-brand-dark">Consultas personalizadas</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 rounded-full px-2 text-2xl leading-none text-stone-400 hover:text-stone-700"
          >
            ×
          </button>
        </div>

        <p className="mt-3 rounded-lg bg-brand-light p-3 text-sm text-brand-dark">
          <span className="font-semibold">Tu consulta no molesta.</span> Contanos qué tenés en mente y armamos tu viaje a
          tu medida, sin compromiso.
        </p>

        <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="cm-name">Nombre y apellido *</label>
            <input id="cm-name" ref={firstFieldRef} name="name" required className="input" value={form.name} onChange={onChange} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cm-phone">Teléfono</label>
              <input id="cm-phone" name="phone" type="tel" className="input" value={form.phone} onChange={onChange} onBlur={onPhoneBlur} aria-invalid={Boolean(error && form.phone.trim())} />
            </div>
            <div>
              <label className="label" htmlFor="cm-email">E-mail</label>
              <input id="cm-email" name="email" type="email" className="input" value={form.email} onChange={onChange} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="cm-destination">Destino o tipo de viaje (opcional)</label>
            <input
              id="cm-destination"
              name="destination"
              placeholder="Ej: Japón en abril, luna de miel, viaje en familia"
              className="input"
              value={form.destination}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="cm-message">Tu consulta *</label>
            <textarea id="cm-message" name="message" required rows="4" className="input" value={form.message} onChange={onChange} />
          </div>

          <div className="grid gap-3 pt-1 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => send('whatsapp')}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Enviar por WhatsApp
            </button>
            <button type="button" onClick={() => send('mail')} className="btn-primary">
              Enviar por mail
            </button>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

          {channel && (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
              {channel === 'whatsapp'
                ? 'Se abrió WhatsApp con tu consulta lista para enviar.'
                : `Se abrió tu correo con la consulta lista para enviar. Si no se abrió, escribinos a ${EMAIL}.`}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// Se monta solo cuando está abierto, así el formulario siempre arranca vacío.
export default function ContactModal() {
  const open = useSelector(selectContactOpen)
  return open ? <ContactDialog /> : null
}
