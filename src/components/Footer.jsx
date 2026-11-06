import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Logo from './Logo.jsx'
import IndigoLogo from './Logo Indigo.jsx'
import { setFilter } from '../store/tripsSlice.js'

export default function Footer() {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const subscribe = (e) => {
    e.preventDefault()
    // TODO backend: POST /api/newsletter
    console.log('Suscripción:', email)
    setDone(true)
    setEmail('')
  }

  const goTo = (category) => dispatch(setFilter({ key: 'category', value: category }))

  return (
    <footer className="mt-12 bg-brand-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="h-24" />
          <IndigoLogo className="h-24" />
          <p className="mt-3 text-sm text-white/70">
            Armamos tu viaje a medida: paquetes, cruceros y hoteles con asesoramiento personalizado.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Viajes</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/" onClick={() => goTo('paquete')} className="hover:text-white">Paquetes</Link></li>
            <li><Link to="/" onClick={() => goTo('crucero')} className="hover:text-white">Cruceros</Link></li>
            <li><Link to="/" onClick={() => goTo('hotel')} className="hover:text-white">Hoteles</Link></li>
            <li><Link to="/" onClick={() => goTo('vuelo')} className="hover:text-white">Vuelos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Contacto</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>WhatsApp: +54 9 3435 36-1144 </li>
            <li>viajesconkaren.asesora@gmail.com</li>
            <li >Lun a Vie de 9 a 18 hs</li>
          </ul>
          <br></br>
           <h4 className="mb-3 font-semibold">Domicilio</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>La paz 82, Paraná, Entre Ríos </li>
          </ul>
                    <br></br>

           <h4 className="mb-3 font-semibold">Operador responsable</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>TRAVEL SERVICES ARGENTINA</li>
            <li>LEGAJO EVT202</li>
          </ul>

        </div>

        <div>
          <h4 className="mb-3 font-semibold">Seguinos</h4>
          <div className="flex gap-3 text-sm text-white/70">
            <a target="_blank" href="https://www.instagram.com/viajesconkaren" className="hover:text-white">Instagram</a>
          </div>
          <p className="mt-5 text-xs text-white/50">@viajesconkaren</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Viajes con Karen. Todos los derechos reservados. | Diseñado por: <a  href='https://www.linkedin.com/in/rodrigo-perez-yones/' target="_blank" className="hover:text-white">Rodrigo Perez Yones
</a> | <a href='https://www.linkedin.com/in/lautaro-schroeder-736950359/' target="_blank" className="hover:text-white">Lautaro Schroeder
</a></p>
          <p>
            <Link to="/politica-de-privacidad" className="hover:text-white">Política de privacidad</Link> ·{' '}
            <Link to="/terminos-y-condiciones" className="hover:text-white">Términos y condiciones</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
