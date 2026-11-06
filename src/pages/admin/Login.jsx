import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearAuthError, login, selectUser } from '../../store/authSlice.js'
import { DEMO_CREDENTIALS, DEMO_MODE } from '../../services/api.js'
import Field, { inputClass } from '../../components/admin/Field.jsx'

export default function Login() {
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector(selectUser)
  const status = useSelector((s) => s.auth.status)
  const error = useSelector((s) => s.auth.error)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const from = location.state?.from || '/admin'

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  if (user) return <Navigate to={from} replace />

  const submit = (e) => {
    e.preventDefault()
    dispatch(login(form))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-10">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center text-2xl font-bold tracking-tight text-white">
          Viajes con <span className="text-gold">Karen</span>
          <span className="ml-2 rounded bg-white/10 px-2 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide text-white/80">Admin</span>
        </p>

        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-xl">
          <div>
            <h1 className="text-xl font-bold text-brand-dark">Ingresar al panel</h1>
            <p className="text-sm text-stone-500">Solo para el equipo de la agencia.</p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <Field label="E-mail" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              className={inputClass(false)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label="Contraseña" htmlFor="login-password">
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className={`${inputClass(false)} pr-20`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-light"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </Field>

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full disabled:opacity-60">
            {status === 'loading' ? 'Ingresando...' : 'Ingresar'}
          </button>

          {DEMO_MODE && (
            <div className="rounded-lg bg-brand-light p-3 text-xs text-brand-dark">
              <p className="font-semibold">Modo demo</p>
              <p className="mt-1">
                E-mail: <code>{DEMO_CREDENTIALS.email}</code>
                <br />
                Contraseña: <code>{DEMO_CREDENTIALS.password}</code>
              </p>
              <p className="mt-1 text-stone-600">Este acceso es de prueba y se reemplaza por el login real cuando se conecte el backend.</p>
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/" className="text-white/70 hover:text-white">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  )
}
