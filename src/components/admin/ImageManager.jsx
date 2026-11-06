import { useRef, useState } from 'react'
import { IMAGE_UPLOAD_MODE, uploadImage } from '../../services/api.js'
import { isUrl } from '../../utils/validation.js'

// Gestor de imágenes: subir archivos, pegar links, reordenar y quitar.
// Por defecto es el de los destinos: la primera imagen es la portada de la tarjeta y todas se ven en el
// carrusel del detalle. Con cover={false} (fotos del hotel o del tour) no hay portada.
export default function ImageManager({ images, onChange, error, cover = true, max = null, emptyText, label = 'imagen' }) {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [uploading, setUploading] = useState(0)
  const [uploadErrors, setUploadErrors] = useState([])
  const fileRef = useRef(null)
  const imagesRef = useRef(images)
  imagesRef.current = images

  const addUrl = () => {
    const value = url.trim()
    if (!isUrl(value)) return setUrlError('Pegá un link que empiece con http:// o https://')
    if (images.includes(value)) return setUrlError('Esa imagen ya está en la lista.')
    if (max && images.length >= max) return setUrlError(`Máximo ${max} imágenes.`)
    onChange([...images, value])
    setUrl('')
    setUrlError('')
  }

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setUploadErrors([])
    setUploading((n) => n + files.length)
    const added = []
    const errors = []
    for (const file of files) {
      try {
        added.push(await uploadImage(file))
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
    const room = max ? Math.max(0, max - imagesRef.current.length) : added.length
    if (added.length > room) errors.push(`Máximo ${max} imágenes: se agregaron solo las primeras ${room}.`)
    if (added.length) onChange([...imagesRef.current, ...added.slice(0, room)])
    setUploadErrors(errors)
  }

  const move = (i, to) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(i, 1)
    next.splice(to, 0, item)
    onChange(next)
  }
  const remove = (i) => onChange(images.filter((_, k) => k !== i))

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setUrlError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addUrl()
            }
          }}
          placeholder="Pegá el link de una imagen (https://...)"
          aria-label={`Link de ${label}`}
          className="input"
        />
        <button type="button" onClick={addUrl} className="btn-secondary whitespace-nowrap">
          Agregar link
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-primary whitespace-nowrap">
          Subir archivos
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} data-testid="image-file-input" />
      </div>

      {urlError && <p className="text-xs font-medium text-red-600">{urlError}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {uploading > 0 && <p className="text-xs text-stone-500">Subiendo {uploading} imagen(es)…</p>}
      {uploadErrors.map((m) => (
        <p key={m} className="text-xs font-medium text-red-600">
          {m}
        </p>
      ))}

      <p className="text-xs text-stone-500">
        {IMAGE_UPLOAD_MODE === 'cloudinary'
          ? 'Las imágenes se suben a Cloudinary.'
          : 'Cloudinary todavía no está configurado: las imágenes subidas se guardan comprimidas en este navegador (solo para probar). Completá VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env.'}{' '}
        {cover ? 'La primera imagen es la portada de la tarjeta.' : 'Se muestran en un carrusel en el detalle del viaje.'}
      </p>

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          {emptyText || 'Todavía no hay imágenes. Mientras tanto la web muestra un degradado.'}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, i) => (
            <li key={src} className="overflow-hidden rounded-lg bg-white ring-1 ring-stone-200">
              <div className="relative">
                <img src={src} alt={`Imagen ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full bg-stone-100 object-cover" />
                {cover && i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">Portada</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5 text-xs">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Mover antes" className="rounded px-2 py-1 font-semibold text-brand hover:bg-brand-light disabled:opacity-30">
                    ◀
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} aria-label="Mover después" className="rounded px-2 py-1 font-semibold text-brand hover:bg-brand-light disabled:opacity-30">
                    ▶
                  </button>
                  {cover && i > 0 && (
                    <button type="button" onClick={() => move(i, 0)} className="rounded px-2 py-1 font-semibold text-brand hover:bg-brand-light">
                      Portada
                    </button>
                  )}
                </div>
                <button type="button" onClick={() => remove(i)} aria-label="Quitar imagen" className="rounded px-2 py-1 font-semibold text-red-700 hover:bg-red-50">
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
