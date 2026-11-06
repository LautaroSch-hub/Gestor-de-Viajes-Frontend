import Modal from './Modal.jsx'

// Pregunta de confirmación antes de una acción delicada.
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', danger = false, busy = false, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-stone-600">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
            danger ? 'bg-red-700 hover:bg-red-800' : 'bg-accent hover:bg-accent-dark'
          }`}
        >
          {busy ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
