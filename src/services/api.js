// Punto único de entrada a "el servidor". Elige la implementación según el .env:
//   VITE_API_URL definida  -> api.remote.js  (backend real: Next.js + PostgreSQL + Cloudinary)
//   sin definir            -> api.demo.js    (datos guardados en el navegador, para probar sin backend)
// Las dos tienen las mismas funciones, así que el resto de la app no sabe cuál se usa.
import * as demo from './api.demo.js'
import * as remote from './api.remote.js'

const impl = import.meta.env?.VITE_API_URL ? remote : demo

export { ApiError } from './errors.js'
export const DEMO_MODE = impl.DEMO_MODE
export const DEMO_CREDENTIALS = impl.DEMO_CREDENTIALS
export const IMAGE_UPLOAD_MODE = impl.IMAGE_UPLOAD_MODE

export const getCatalog = (...a) => impl.getCatalog(...a)
export const resetDemoData = (...a) => impl.resetDemoData(...a)
export const createTrip = (...a) => impl.createTrip(...a)
export const updateTrip = (...a) => impl.updateTrip(...a)
export const setTripActive = (...a) => impl.setTripActive(...a)
export const setTripOffer = (...a) => impl.setTripOffer(...a)
export const duplicateTrip = (...a) => impl.duplicateTrip(...a)
export const createDestination = (...a) => impl.createDestination(...a)
export const updateDestination = (...a) => impl.updateDestination(...a)
export const deleteDestination = (...a) => impl.deleteDestination(...a)
export const uploadImage = (...a) => impl.uploadImage(...a)
export const getSession = (...a) => impl.getSession(...a)
export const login = (...a) => impl.login(...a)
export const logout = (...a) => impl.logout(...a)
export const createInquiry = (...a) => impl.createInquiry(...a)
export const getInquiries = (...a) => impl.getInquiries(...a)
export const setInquiryStatus = (...a) => impl.setInquiryStatus(...a)
export const deleteInquiry = (...a) => impl.deleteInquiry(...a)
