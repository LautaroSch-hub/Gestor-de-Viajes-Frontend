import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../store/authSlice.js'

// Protege las rutas del panel: sin sesión redirige al login (y vuelve a la página pedida al entrar).
// Ojo: esto solo oculta pantallas. La protección real de los datos la da el backend.
export default function RequireAdmin({ children }) {
  const user = useSelector(selectUser)
  const location = useLocation()
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return children
}
