import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createInquiry } from '../store/inquiriesSlice.js'
import { WHATSAPP } from '../config.js'
import { normalizePhone, validateInquiry } from '../utils/validation.js'

export default function ContactForm({ trip }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const onPhoneBlur = (e) => setForm((current) => ({ ...current, phone: normalizePhone(e.target.value) }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateInquiry(form)
    if (validationErrors.phone) {
      setError(validationErrors.phone)
      return
    }
    setSending(true)
    setError('')
    const res = await dispatch(
      createInquiry({ ...form, tripId: trip.id, tripTitle: trip.title, source: 'detalle', channel: 'formulario' })
    )
    setSending(false)
    if (createInquiry.fulfilled.match(res)) setSent(true)
    else setError(Object.values(res.payload?.fields || {})[0] || res.payload?.message || 'No pudimos enviar tu consulta. Probá de nuevo.')
  }

  const waText = encodeURIComponent(`Hola! Quiero consultar por el viaje "${trip.title}" (${trip.destination}).`)

  if (sent) {
    return (
      <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">¡Gracias por tu consulta!</p>
        <p className="mt-1">Un asesor se va a comunicar con vos a la brevedad.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h3 className="font-semibold text-brand-dark">Consultá por este viaje</h3>
      <div>
        <label className="label" htmlFor="name">Nombre y apellido</label>
        <input id="name" name="name" required className="input" value={form.name} onChange={onChange} />
      </div>
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required className="input" value={form.email} onChange={onChange} />
      </div>
      <div>
        <label className="label" htmlFor="phone">Teléfono</label>
        <input id="phone" name="phone" type="tel" required className="input" value={form.phone} onChange={onChange} onBlur={onPhoneBlur} aria-invalid={Boolean(error)} />
      </div>
      <div>
        <label className="label" htmlFor="message">Mensaje</label>
        <textarea id="message" name="message" rows="3" className="input" value={form.message} onChange={onChange} />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60">
        {sending ? 'Enviando...' : 'Enviar consulta'}
      </button>
      <a
        href={`https://wa.me/${WHATSAPP}?text=${waText}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center rounded-lg border border-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
      >
        Escribir por WhatsApp
      </a>
    </form>
  )
}
