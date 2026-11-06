import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Modal from './Modal.jsx'
import Field, { inputClass } from './Field.jsx'
import Pills from './Pills.jsx'
import ImageManager from './ImageManager.jsx'
import { SCOPES } from '../../data/constants.js'
import { saveDestination } from '../../store/catalogSlice.js'
import { showToast } from '../../store/uiSlice.js'

const SCOPE_OPTIONS = SCOPES.filter((s) => s.value !== 'todos')

// Alta y edición de un destino (nombre, país, alcance e imágenes).
// Los destinos se reutilizan: varios viajes pueden apuntar al mismo destino y compartir sus imágenes.
export default function DestinationModal({ destination = null, onClose, onSaved }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState(() => ({
    name: destination?.name || '',
    country: destination?.country || '',
    scope: destination?.scope || 'internacional',
    images: destination?.images || [],
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => {
      const { [name]: _removed, ...rest } = e
      return rest
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await dispatch(saveDestination({ id: destination?.id ?? null, data: form }))
    setSaving(false)
    if (saveDestination.fulfilled.match(res)) {
      dispatch(showToast(destination ? 'Destino actualizado.' : 'Destino creado.'))
      onSaved?.(res.payload)
      onClose()
    } else {
      setErrors(res.payload?.fields || {})
      dispatch(showToast(res.payload?.message || 'No se pudo guardar el destino.', 'error'))
    }
  }

  return (
    <Modal title={destination ? 'Editar destino' : 'Nuevo destino'} onClose={onClose} size="lg">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre *" htmlFor="d-name" error={errors.name}>
            <input id="d-name" className={inputClass(errors.name)} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Tokio" />
          </Field>
          <Field label="País *" htmlFor="d-country" error={errors.country}>
            <input id="d-country" className={inputClass(errors.country)} value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Ej: Japón" />
          </Field>
        </div>

        <Field label="Alcance *" error={errors.scope}>
          <Pills options={SCOPE_OPTIONS} value={form.scope} onChange={(v) => set('scope', v)} />
        </Field>

        <div>
          <p className="label">Imágenes</p>
          <ImageManager images={form.images} onChange={(imgs) => set('images', imgs)} error={errors.images} />
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar destino'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
