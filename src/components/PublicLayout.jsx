import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ContactModal from './ContactModal.jsx'

// Estructura de la web pública (header + contenido + footer).
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ContactModal />
    </div>
  )
}
