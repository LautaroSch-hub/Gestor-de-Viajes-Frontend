import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { changeInquiryStatus, removeInquiry, selectInquiries, selectInquiriesStatus } from '../../store/inquiriesSlice.js'
import { showToast } from '../../store/uiSlice.js'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'

const fmt = (iso) => new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
const FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'nueva', label: 'Nuevas' },
  { value: 'atendida', label: 'Atendidas' },
]

export default function InquiriesAdmin() {
  const dispatch = useDispatch()
  const items = useSelector(selectInquiries)
  const status = useSelector(selectInquiriesStatus)
  const [filter, setFilter] = useState('nueva')
  const [toDelete, setToDelete] = useState(null)

  const list = useMemo(() => items.filter((x) => filter === 'todas' || x.status === filter), [items, filter])

  const toggle = async (x) => {
    const res = await dispatch(changeInquiryStatus({ id: x.id, status: x.status === 'nueva' ? 'atendida' : 'nueva' }))
    if (changeInquiryStatus.rejected.match(res)) dispatch(showToast(res.payload?.message || 'No se pudo actualizar.', 'error'))
  }
  const confirmDelete = async () => {
    const res = await dispatch(removeInquiry(toDelete.id))
    setToDelete(null)
    dispatch(removeInquiry.fulfilled.match(res) ? showToast('Consulta eliminada.') : showToast(res.payload?.message || 'No se pudo eliminar.', 'error'))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Consultas</h1>
        <p className="text-sm text-stone-500">Mensajes enviados desde el formulario de la web. Marcalos como atendidos cuando respondas.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${filter === f.value ? 'bg-brand text-white ring-brand' : 'bg-white text-stone-600 ring-stone-200 hover:bg-stone-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {status !== 'ready' ? (
        <p className="py-10 text-center text-stone-500">Cargando…</p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
          <p className="font-semibold text-brand-dark">{filter === 'nueva' ? 'No hay consultas nuevas' : 'No hay consultas para mostrar'}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((x) => {
            const phone = x.phone.replace(/\D/g, '')
            return (
              <li key={x.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-brand-dark">
                      {x.name}{' '}
                      <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${x.status === 'nueva' ? 'bg-accent/15 text-accent-dark' : 'bg-stone-100 text-stone-500'}`}>
                        {x.status === 'nueva' ? 'Nueva' : 'Atendida'}
                      </span>
                    </p>
                    <p className="text-xs text-stone-500">
                      {fmt(x.createdAt)} · {x.source === 'detalle' ? 'Desde el detalle de un viaje' : 'Consulta personalizada'}
                      {x.channel !== 'formulario' && ` · por ${x.channel === 'whatsapp' ? 'WhatsApp' : 'mail'}`}
                    </p>
                  </div>
                  {x.tripId && (
                    <Link to={`/admin/viajes/${x.tripId}/editar`} className="text-xs font-semibold text-accent hover:underline">
                      Viaje: {x.tripTitle} →
                    </Link>
                  )}
                </div>
                {x.subject && <p className="mt-2 text-sm text-stone-600">Interés: {x.subject}</p>}
                <p className="mt-2 whitespace-pre-line text-sm text-brand-dark">{x.message}</p>
                <p className="mt-3 text-sm text-stone-600">
                  <span className="font-semibold text-brand-dark">Correo de contacto:</span>{' '}
                  {x.email ? (
                    <span className="font-medium text-accent hover:underline">{x.email}</span>
                  ) : (
                    <span>No dejó un correo electrónico.</span>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {x.email && (
                    <a
                      className="btn-secondary !px-3 !py-1.5 !text-xs"
                      href={`mailto:${x.email}?subject=${encodeURIComponent(`Respuesta a tu consulta${x.subject ? `: ${x.subject}` : ''}`)}`}
                    >
                      Responder por mail
                    </a>
                  )}
                  {phone && (
                    <a className="btn-secondary !px-3 !py-1.5 !text-xs" target="_blank" rel="noreferrer" href={`https://wa.me/${phone}`}>
                      WhatsApp {x.phone}
                    </a>
                  )}
                  <button type="button" onClick={() => toggle(x)} className="btn-secondary !px-3 !py-1.5 !text-xs">
                    {x.status === 'nueva' ? 'Marcar atendida' : 'Marcar como nueva'}
                  </button>
                  <button type="button" onClick={() => setToDelete(x)} className="btn-secondary !px-3 !py-1.5 !text-xs !text-red-700 hover:!bg-red-50">
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar consulta"
          message={`Vas a eliminar la consulta de “${toDelete.name}”. No se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
