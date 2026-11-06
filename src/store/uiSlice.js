import { createSlice } from '@reduxjs/toolkit'

// Estado de la interfaz:
// - contactOpen: modal de "Consultas personalizadas" de la web pública.
// - toasts: avisos breves del panel ("Viaje guardado", errores, etc.).
let toastCounter = 0

const uiSlice = createSlice({
  name: 'ui',
  initialState: { contactOpen: false, toasts: [] },
  reducers: {
    openContact(state) {
      state.contactOpen = true
    },
    closeContact(state) {
      state.contactOpen = false
    },
    showToast: {
      reducer(state, { payload }) {
        state.toasts.push(payload)
      },
      prepare(message, type = 'success') {
        toastCounter += 1
        return { payload: { id: toastCounter, message, type } }
      },
    },
    dismissToast(state, { payload }) {
      state.toasts = state.toasts.filter((t) => t.id !== payload)
    },
  },
})

export const { openContact, closeContact, showToast, dismissToast } = uiSlice.actions
export const selectContactOpen = (s) => s.ui.contactOpen
export const selectToasts = (s) => s.ui.toasts
export default uiSlice.reducer
