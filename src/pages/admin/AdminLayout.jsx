import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUser } from '../../store/authSlice.js'
import { fetchInquiries, selectNewInquiriesCount } from '../../store/inquiriesSlice.js'
import { fetchCatalog, selectCatalogError, selectCatalogStatus } from '../../store/catalogSlice.js'

const NAV = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/viajes', label: 'Viajes' },
  { to: '/admin/destinos', label: 'Destinos' },
  { to: '/admin/consultas', label: 'Consultas', badge: true },
]

// Estructura del panel de administración: barra superior con navegación y contenido.
export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const status = useSelector(selectCatalogStatus)
  const error = useSelector(selectCatalogError)
  const newInquiries = useSelector(selectNewInquiriesCount)

  // Al entrar al panel se pide todo de nuevo: con el backend real, el público solo recibe los viajes
  // activos, y el panel necesita también los desactivados y todos los destinos.
  useEffect(() => {
    dispatch(fetchCatalog())
    dispatch(fetchInquiries())
  }, [dispatch])

  const onLogout = async () => {
    await dispatch(logout())
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-brand-dark text-white shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/admin" className="text-lg font-bold tracking-tight">
            Viajes con <span className="text-gold">Karen</span>
            <span className="ml-2 rounded bg-white/10 px-2 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-wide text-white/80">Admin</span>
          </Link>

          <nav className="order-last flex w-full gap-1 overflow-x-auto md:order-none md:w-auto">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {n.label}
                {n.badge && newInquiries > 0 && (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">{newInquiries}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-white/70 hover:text-white">
              Ver sitio ↗
            </Link>
            <span className="hidden text-white/50 sm:inline">{user?.email}</span>
            <button type="button" onClick={onLogout} className="rounded-lg border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {status === 'ready' ? (
          <Outlet />
        ) : status === 'error' ? (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
            <p className="font-semibold text-brand-dark">No se pudieron cargar los datos.</p>
            <p className="mt-1 text-sm text-stone-500">{error}</p>
            <button type="button" onClick={() => dispatch(fetchCatalog())} className="btn-primary mt-4">
              Reintentar
            </button>
          </div>
        ) : (
          <p className="py-20 text-center text-stone-500">Cargando…</p>
        )}
      </main>
    </div>
  )
}
