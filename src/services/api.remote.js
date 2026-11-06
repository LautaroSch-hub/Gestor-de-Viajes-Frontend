import { ApiError } from './errors.js'
import { validateInquiry, hasErrors } from '../utils/validation.js'

// =============================================================================
// CAPA DE SERVICIOS  (modo servidor)
// Se usa cuando está definida VITE_API_URL (por ejemplo http://localhost:3000).
// Tiene las mismas funciones y resultados que api.demo.js, pero habla con la API de Next.js.
// La sesión vive en una cookie httpOnly que pone el servidor (el navegador la envía sola);
// en localStorage solo se guarda el e-mail y nombre para mostrar en pantalla.
// =============================================================================

export { ApiError }
export const DEMO_MODE = false
export const DEMO_CREDENTIALS = null
// Las imágenes van a Cloudinary con una firma que entrega el servidor.
export const IMAGE_UPLOAD_MODE = 'cloudinary'

const BASE = String(import.meta.env?.VITE_API_URL || '').replace(/\/+$/, '')
const SESSION_KEY = 'vck.sesion.v1'
const TOKEN_KEY = 'vck.token.v1'

// Si el servidor tiene ALLOW_BEARER_TOKEN=true, el login devuelve un token y se envía en el header
// Authorization (sirve cuando el navegador bloquea la cookie entre dominios distintos).
// Si no, el token no existe y la sesión va solo por cookie.
const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* nada que limpiar */
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include', // envía la cookie de sesión
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* respuesta sin cuerpo */
  }
  if (res.ok) return data

  // Sesión vencida o inválida: se limpia y se vuelve al login.
  if (res.status === 401 && path !== '/api/auth/login') {
    clearSession()
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.assign('/admin/login')
    }
  }
  if (res.status === 429) {
    const wait = Number(res.headers.get('Retry-After'))
    throw new ApiError(data?.error || (wait ? `Demasiados intentos. Probá de nuevo en ${Math.ceil(wait / 60)} min.` : 'Demasiados intentos.'))
  }
  throw new ApiError(data?.error || `El servidor respondió con un error (${res.status}).`, data?.fields || null)
}

// ---------- Catálogo ----------
export const getCatalog = () => request('/api/catalogo')

export async function resetDemoData() {
  throw new ApiError('Los datos de ejemplo solo se pueden restaurar en el modo demo.')
}

// ---------- Viajes ----------
export const createTrip = (data) => request('/api/viajes', { method: 'POST', body: data })
export const updateTrip = (id, data) => request(`/api/viajes/${id}`, { method: 'PUT', body: data })
export const setTripActive = (id, active) => request(`/api/viajes/${id}/estado`, { method: 'PATCH', body: { active } })
export const setTripOffer = (id, offer) =>
  offer ? request(`/api/viajes/${id}/oferta`, { method: 'PUT', body: offer }) : request(`/api/viajes/${id}/oferta`, { method: 'DELETE' })
export const duplicateTrip = (id) => request(`/api/viajes/${id}/duplicar`, { method: 'POST', body: {} })

// ---------- Destinos ----------
export const createDestination = (data) => request('/api/destinos', { method: 'POST', body: data })
export const updateDestination = (id, data) => request(`/api/destinos/${id}`, { method: 'PUT', body: data })
export const deleteDestination = (id) => request(`/api/destinos/${id}`, { method: 'DELETE' })

// ---------- Imágenes ----------
// 1) pide una firma al servidor  2) sube el archivo directo a Cloudinary  3) devuelve el link seguro.
export async function uploadImage(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) throw new ApiError('El archivo tiene que ser una imagen.')
  if (file.size > 10 * 1024 * 1024) throw new ApiError('La imagen pesa más de 10 MB.')

  const sig = await request('/api/imagenes/firma', { method: 'POST', body: {} })
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', String(sig.timestamp))
  form.append('folder', sig.folder)
  form.append('allowed_formats', sig.allowedFormats)
  form.append('signature', sig.signature)

  let res
  try {
    res = await fetch(sig.uploadUrl, { method: 'POST', body: form })
  } catch {
    throw new ApiError('No se pudo conectar con Cloudinary. Revisá tu conexión.')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.secure_url) throw new ApiError(json?.error?.message || 'Cloudinary rechazó la imagen.')
  return json.secure_url
}

// ---------- Sesión de administrador ----------
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function login(email, password) {
  const { token, ...session } = await request('/api/auth/login', { method: 'POST', body: { email, password } })
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* la sesión queda solo en memoria */
  }
  return session
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST', body: {} })
  } catch {
    /* aunque falle, se cierra la sesión en este navegador */
  }
  clearSession()
}

// ---------- Consultas ----------
export async function createInquiry(data) {
  const errors = validateInquiry(data)
  if (hasErrors(errors)) throw new ApiError('Revisá los datos de la consulta.', errors)
  return request('/api/consultas', { method: 'POST', body: data })
}
export const getInquiries = () => request('/api/consultas')
export const setInquiryStatus = (id, status) => request(`/api/consultas/${id}`, { method: 'PATCH', body: { status } })
export const deleteInquiry = (id) => request(`/api/consultas/${id}`, { method: 'DELETE' })
