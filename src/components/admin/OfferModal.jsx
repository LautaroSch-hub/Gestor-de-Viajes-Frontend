import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Modal from './Modal.jsx'
import OfferFields from './OfferFields.jsx'
import { saveTripOffer } from '../../store/catalogSlice.js'
import { showToast } from '../../store/uiSlice.js'
import { buildOffer, offerToForm } from '../../utils/tripForm.js'
import { hasErrors, validateOffer } from '../../utils/validation.js'

// Ventana rápida para poner, cambiar o quitar la oferta de un viaje desde el listado.
export default function OfferModal({ trip, onClose }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState(() => offerToForm(trip.offer))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const patch = (changes) => {
    setForm((f) => ({ ...f, ...changes }))
    setErrors((e) => {
      const next = { ...e }
      Object.keys(changes).forEach((k) => delete next[k])
      return next
    })
  }

  const save = async (offer) => {
    const errs = validateOffer(offer, trip.price)
    if (hasErrors(errs)) {
      setErrors(errs)
      return
    }
    setSaving(true)
    const res = await dispatch(saveTripOffer({ id: trip.id, offer }))
    setSaving(false)
    if (saveTripOffer.fulfilled.match(res)) {
      dispatch(showToast(offer ? 'Oferta guardada.' : 'Oferta quitada.'))
      onClose()
    } else {
      setErrors(res.payload?.fields || {})
      dispatch(showToast(res.payload?.message || 'No se pudo guardar la oferta.', 'error'))
    }
  }

  return (
    <Modal title="Oferta del viaje" onClose={onClose}>
      <p className="mb-4 text-sm text-stone-600">
        <span className="font-semibold text-brand-dark">{trip.title}</span>
      </p>
      <OfferFields form={form} onChange={patch} errors={errors} price={trip.price} currency={trip.currency} />
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        {trip.offer && (
          <button type="button" disabled={saving} onClick={() => save(null)} className="btn-secondary !border-red-300 !text-red-700 hover:!bg-red-50">
            Quitar oferta
          </button>
        )}
        <button type="button" disabled={saving} onClick={() => save(buildOffer(form))} className="btn-primary disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  )
}
