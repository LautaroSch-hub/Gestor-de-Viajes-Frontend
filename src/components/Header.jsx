import { Link, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '../store/authSlice.js'
import { setFilter } from '../store/tripsSlice.js'
import { openContact } from '../store/uiSlice.js'
import Logo from './Logo.jsx'
import { PHONE, WHATSAPP, WHATSAPP_DISPLAY } from '../config.js'

const NAV = [
  { label: 'Paquetes', category: 'paquete' },
  { label: 'Cruceros', category: 'crucero' },
  { label: 'Hoteles', category: 'hotel' },
  { label: 'Vuelos', category: 'vuelo' },
]

export default function Header() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  const goToTrips = (category) => {
    dispatch(setFilter({ key: 'category', value: category }))
    // A link to the current URL does not cause a new location update, so scroll
    // directly when the Home page is already open.
    if (window.location.pathname === '/') {
      window.requestAnimationFrame(() => {
        document.getElementById('todos-los-viajes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return (
    <header className="sticky top-0 z-30 shadow">
      <div className="bg-brand-dark text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span>Lun a Vie de 9 a 18 hs · {PHONE}</span>
          <div className="flex items-center gap-4">
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="hidden font-semibold hover:underline sm:inline">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <Link
              to={user ? '/admin' : '/admin/login'}
              className="rounded border border-white/30 px-2.5 py-0.5 font-semibold hover:bg-white/10"
            >
              {user ? 'Panel de administración' : 'Ingresar'}
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-brand">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4">
          <Link to="/" aria-label="Viajes con Karen, inicio">
            <Logo className="h-14 sm:h-16" />
          </Link>
          <nav className="order-last flex w-full gap-5 overflow-x-auto md:order-none md:w-auto md:gap-6">
            <NavLink
              to="/#todos-los-viajes"
              onClick={() => goToTrips('todos')}
              className="whitespace-nowrap text-sm font-medium text-white/90 hover:text-white"
            >
              Inicio
            </NavLink>
            {NAV.map((n) => (
              <Link
                key={n.category}
                to="/#todos-los-viajes"
                onClick={() => goToTrips(n.category)}
                className="whitespace-nowrap text-sm font-medium text-white/90 hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <button type="button" onClick={() => dispatch(openContact())} className="btn-primary !px-4 !py-2">
            Consultas personalizadas
          </button>
        </div>
      </div>
    </header>
  )
}
