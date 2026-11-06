import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchCatalog } from './store/catalogSlice.js'
import PublicLayout from './components/PublicLayout.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import Toasts from './components/Toasts.jsx'
import Home from './pages/Home.jsx'
import TripDetail from './pages/TripDetail.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Login from './pages/admin/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import TripsAdmin from './pages/admin/TripsAdmin.jsx'
import TripForm from './pages/admin/TripForm.jsx'
import DestinationsAdmin from './pages/admin/DestinationsAdmin.jsx'
import InquiriesAdmin from './pages/admin/InquiriesAdmin.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsConditions from './pages/TermsConditions.jsx'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCatalog())
  }, [dispatch])

  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/viaje/:id" element={<TripDetail />} />
          <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos-y-condiciones" element={<TermsConditions />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="viajes" element={<TripsAdmin />} />
          <Route path="viajes/nuevo" element={<TripForm />} />
          <Route path="viajes/:id/editar" element={<TripForm />} />
          <Route path="destinos" element={<DestinationsAdmin />} />
          <Route path="consultas" element={<InquiriesAdmin />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
      <Toasts />
    </>
  )
}
