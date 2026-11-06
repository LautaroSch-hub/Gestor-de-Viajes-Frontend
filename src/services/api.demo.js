import { SEED_DESTINATIONS, SEED_TRIPS } from '../data/seed.js'
import { ApiError } from './errors.js'
import { hasErrors, validateDestination, validateInquiry, validateOffer, validateTrip } from '../utils/validation.js'

// =============================================================================
// CAPA DE SERVICIOS  (modo demo)
//
// Es el ÚNICO archivo que habla con "el servidor". Hoy simula el backend guardando
// los datos en el navegador (localStorage) para que el panel funcione desde ya.
// Cuando exista la API (Next + PostgreSQL), cada función de abajo se reemplaza por un
// fetch con la misma firma y el mismo resultado; ninguna pantalla necesita cambios.
//
//   getCatalog()                      -> GET    /api/catalogo            { trips, destinations }
//   createTrip(data)                  -> POST   /api/viajes              trip
//   updateTrip(id, data)              -> PUT    /api/viajes/:id          trip
//   setTripActive(id, active)         -> PATCH  /api/viajes/:id/estado   trip
//   setTripOffer(id, offer | null)    -> PUT/DELETE /api/viajes/:id/oferta  trip
//   duplicateTrip(id)                 -> POST   /api/viajes/:id/duplicar trip
//   createDestination(data)           -> POST   /api/destinos            destination
//   updateDestination(id, data)       -> PUT    /api/destinos/:id        destination
//   deleteDestination(id)             -> DELETE /api/destinos/:id        { id }
//   login(email, password)            -> POST   /api/auth/login          { email, name }
//   logout()                          -> POST   /api/auth/logout
//
// Errores de validación: lanzar ApiError(mensaje, { campo: 'mensaje' }) (en el backend, un 422).
// =============================================================================

export const DEMO_MODE = true

export { ApiError }

// ---------- Configuración (variables de entorno de Vite, ver .env.example) ----------
const ADMIN_EMAIL = import.meta.env?.VITE_ADMIN_EMAIL || 'admin@viajesconkaren.com'
const ADMIN_PASSWORD = import.meta.env?.VITE_ADMIN_PASSWORD || 'admin1234'
const CLOUD_NAME = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET

// 'cloudinary' si están las dos variables; si no, 'local' (imágenes comprimidas en el navegador).
export const IMAGE_UPLOAD_MODE = CLOUD_NAME && UPLOAD_PRESET ? 'cloudinary' : 'local'

export const DEMO_CREDENTIALS = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }

// ---------- Almacenamiento simulado ----------
const DB_KEY = 'rumbo.catalogo.v1'
const SESSION_KEY = 'rumbo.sesion.v1'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = (value) => JSON.parse(JSON.stringify(value))
const nowISO = () => new Date().toISOString()
const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1

const isQuotaError = (e) =>
  e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014)

let cache = null

function persist(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
    return 'ok'
  } catch (e) {
    return isQuotaError(e) ? 'quota' : 'unavailable' // 'unavailable': navegación privada, etc. (sigue en memoria)
  }
}

function read() {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      cache = JSON.parse(raw)
      return cache
    }
  } catch {
    /* sin almacenamiento o datos dañados: se parte de los datos de ejemplo */
  }
  cache = { destinations: clone(SEED_DESTINATIONS), trips: clone(SEED_TRIPS) }
  persist(cache)
  return cache
}

function commit(db) {
  if (persist(db) === 'quota') {
    throw new ApiError('No hay espacio para guardar. Probá con imágenes más livianas o configurá Cloudinary.')
  }
  cache = db
}

const tripIndex = (db, id) => {
  const i = db.trips.findIndex((t) => t.id === Number(id))
  if (i < 0) throw new ApiError('El viaje no existe.')
  return i
}
const destinationIndex = (db, id) => {
  const i = db.destinations.findIndex((d) => d.id === Number(id))
  if (i < 0) throw new ApiError('El destino no existe.')
  return i
}

// ---------- Catálogo ----------
export async function getCatalog() {
  await delay()
  return clone(read())
}

export async function resetDemoData() {
  await delay()
  commit({ destinations: clone(SEED_DESTINATIONS), trips: clone(SEED_TRIPS) })
  return clone(read())
}

// ---------- Viajes ----------
export async function createTrip(data) {
  await delay()
  const db = clone(read())
  const errors = validateTrip(data, { destinations: db.destinations })
  if (hasErrors(errors)) throw new ApiError('Revisá los campos marcados.', errors)
  const now = nowISO()
  const trip = { ...data, id: nextId(db.trips), active: data.active !== false, createdAt: now, updatedAt: now }
  db.trips.push(trip)
  commit(db)
  return clone(trip)
}

export async function updateTrip(id, data) {
  await delay()
  const db = clone(read())
  const i = tripIndex(db, id)
  const errors = validateTrip(data, { destinations: db.destinations })
  if (hasErrors(errors)) throw new ApiError('Revisá los campos marcados.', errors)
  const old = db.trips[i]
  const trip = { ...data, id: old.id, createdAt: old.createdAt, updatedAt: nowISO() }
  db.trips[i] = trip
  commit(db)
  return clone(trip)
}

// Desactivar en lugar de borrar: el viaje deja de verse en la web pero se conserva
// (con su destino e imágenes) para reactivarlo o duplicarlo más adelante.
export async function setTripActive(id, active) {
  await delay()
  const db = clone(read())
  const i = tripIndex(db, id)
  db.trips[i] = { ...db.trips[i], active: Boolean(active), updatedAt: nowISO() }
  commit(db)
  return clone(db.trips[i])
}

// offer = null quita la oferta.
export async function setTripOffer(id, offer) {
  await delay()
  const db = clone(read())
  const i = tripIndex(db, id)
  const errors = validateOffer(offer, db.trips[i].price)
  if (hasErrors(errors)) throw new ApiError('Revisá los campos de la oferta.', errors)
  db.trips[i] = { ...db.trips[i], offer: offer || null, updatedAt: nowISO() }
  commit(db)
  return clone(db.trips[i])
}

// Crea una copia desactivada y sin oferta, para armar un viaje parecido (otra fecha, otro precio...).
export async function duplicateTrip(id) {
  await delay()
  const db = clone(read())
  const old = db.trips[tripIndex(db, id)]
  const now = nowISO()
  const copy = { ...clone(old), id: nextId(db.trips), title: `${old.title} (copia)`, offer: null, active: false, createdAt: now, updatedAt: now }
  db.trips.push(copy)
  commit(db)
  return clone(copy)
}

// ---------- Destinos ----------
const cleanDestination = (data) => ({
  name: (data.name || '').trim(),
  country: (data.country || '').trim(),
  scope: data.scope,
  images: Array.isArray(data.images) ? data.images : [],
})

export async function createDestination(data) {
  await delay()
  const db = clone(read())
  const clean = cleanDestination(data)
  const errors = validateDestination(clean, { destinations: db.destinations })
  if (hasErrors(errors)) throw new ApiError('Revisá los campos marcados.', errors)
  const dest = { ...clean, id: nextId(db.destinations) }
  db.destinations.push(dest)
  commit(db)
  return clone(dest)
}

export async function updateDestination(id, data) {
  await delay()
  const db = clone(read())
  const i = destinationIndex(db, id)
  const clean = cleanDestination(data)
  const errors = validateDestination(clean, { destinations: db.destinations, ignoreId: db.destinations[i].id })
  if (hasErrors(errors)) throw new ApiError('Revisá los campos marcados.', errors)
  db.destinations[i] = { ...clean, id: db.destinations[i].id }
  commit(db)
  return clone(db.destinations[i])
}

export async function deleteDestination(id) {
  await delay()
  const db = clone(read())
  const i = destinationIndex(db, id)
  if (db.trips.some((t) => t.destinationId === db.destinations[i].id)) {
    throw new ApiError('No se puede eliminar: tiene viajes asociados. Desactivá esos viajes y dejá el destino para reutilizarlo.')
  }
  const [removed] = db.destinations.splice(i, 1)
  commit(db)
  return { id: removed.id }
}

// ---------- Imágenes ----------
// Con Cloudinary configurado sube el archivo y devuelve su link seguro. Sin configurar,
// lo comprime y lo guarda como data URL (solo para probar: ocupa espacio del navegador).
export async function uploadImage(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) throw new ApiError('El archivo tiene que ser una imagen.')
  if (file.size > 10 * 1024 * 1024) throw new ApiError('La imagen pesa más de 10 MB.')

  if (IMAGE_UPLOAD_MODE === 'cloudinary') {
    const body = new FormData()
    body.append('file', file)
    body.append('upload_preset', UPLOAD_PRESET)
    body.append('folder', 'viajes-con-karen')
    let res
    try {
      res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body })
    } catch {
      throw new ApiError('No se pudo conectar con Cloudinary. Revisá tu conexión.')
    }
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json.secure_url) throw new ApiError(json?.error?.message || 'Cloudinary rechazó la imagen.')
    return json.secure_url
  }
  return fileToDataUrl(file)
}

function fileToDataUrl(file, maxSide = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new ApiError('No se pudo leer la imagen.'))
    }
    img.src = objectUrl
  })
}

// ---------- Sesión de administrador ----------
// OJO: este login es SOLO DE DEMOSTRACIÓN. Las credenciales viven en el código del navegador,
// así que no protegen nada. La seguridad real llega con el backend (login contra la base de
// datos, contraseña con hash y sesión en cookie httpOnly) y con las rutas de la API protegidas.
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function login(email, password) {
  await delay(250)
  if ((email || '').trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    const session = { email: ADMIN_EMAIL, name: 'Administrador' }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      /* la sesión queda solo en memoria */
    }
    return session
  }
  throw new ApiError('E-mail o contraseña incorrectos.')
}

export async function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* nada que limpiar */
  }
}

// ───────────────────────── Consultas (formularios de la web pública) ─────────────────────────
// Backend: POST /api/consultas (público), GET /api/consultas, PATCH /api/consultas/:id { status },
// DELETE /api/consultas/:id (estos tres con sesión de admin).
const INQ_KEY = 'rumbo.consultas.v1'

function readInquiries() {
  try {
    const raw = localStorage.getItem(INQ_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
function writeInquiries(list) {
  try {
    localStorage.setItem(INQ_KEY, JSON.stringify(list))
  } catch (e) {
    throw new ApiError('No hay espacio para guardar la consulta en este navegador.')
  }
}

export async function createInquiry(data) {
  await delay()
  const errors = validateInquiry(data)
  if (hasErrors(errors)) throw new ApiError('Revisá los datos de la consulta.', errors)
  const list = readInquiries()
  const item = {
    id: nextId(list),
    name: data.name.trim(),
    email: (data.email || '').trim(),
    phone: (data.phone || '').trim(),
    subject: (data.subject || '').trim(),
    message: data.message.trim(),
    tripId: data.tripId ?? null,
    tripTitle: data.tripTitle || null,
    source: data.source || 'web', // 'detalle' | 'modal'
    channel: data.channel || 'formulario', // 'formulario' | 'whatsapp' | 'mail'
    status: 'nueva', // 'nueva' | 'atendida'
    createdAt: nowISO(),
  }
  list.push(item)
  writeInquiries(list)
  return clone(item)
}

export async function getInquiries() {
  await delay(60)
  return clone(readInquiries()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function setInquiryStatus(id, status) {
  await delay(60)
  if (!['nueva', 'atendida'].includes(status)) throw new ApiError('Estado inválido.')
  const list = readInquiries()
  const i = list.findIndex((x) => x.id === id)
  if (i < 0) throw new ApiError('La consulta no existe.')
  list[i] = { ...list[i], status }
  writeInquiries(list)
  return clone(list[i])
}

export async function deleteInquiry(id) {
  await delay(60)
  const list = readInquiries()
  if (!list.some((x) => x.id === id)) throw new ApiError('La consulta no existe.')
  writeInquiries(list.filter((x) => x.id !== id))
  return { id }
}
