import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../services/api.js'

// Estado del catálogo (viajes y destinos). Todas las operaciones pasan por la capa de servicios,
// así que cuando exista el backend este archivo no cambia.

// Convierte los errores de la API en un payload serializable { message, fields }.
const guard = (fn) => async (arg, { rejectWithValue }) => {
  try {
    return await fn(arg)
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Ocurrió un error inesperado.', fields: e.fields || null })
  }
}

export const fetchCatalog = createAsyncThunk('catalog/fetch', guard(() => api.getCatalog()))
export const resetDemoData = createAsyncThunk('catalog/resetDemo', guard(() => api.resetDemoData()))

export const saveTrip = createAsyncThunk(
  'catalog/saveTrip',
  guard(({ id, data }) => (id ? api.updateTrip(id, data) : api.createTrip(data)))
)
export const toggleTripActive = createAsyncThunk('catalog/toggleTripActive', guard(({ id, active }) => api.setTripActive(id, active)))
export const saveTripOffer = createAsyncThunk('catalog/saveTripOffer', guard(({ id, offer }) => api.setTripOffer(id, offer)))
export const duplicateTrip = createAsyncThunk('catalog/duplicateTrip', guard((id) => api.duplicateTrip(id)))

export const saveDestination = createAsyncThunk(
  'catalog/saveDestination',
  guard(({ id, data }) => (id ? api.updateDestination(id, data) : api.createDestination(data)))
)
export const removeDestination = createAsyncThunk('catalog/removeDestination', guard((id) => api.deleteDestination(id)))

const upsert = (list, item) => {
  const i = list.findIndex((x) => x.id === item.id)
  if (i >= 0) list[i] = item
  else list.push(item)
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    trips: [],
    destinations: [],
    status: 'idle', // idle | loading | ready | error
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCatalog.fulfilled, (state, { payload }) => {
        state.trips = payload.trips
        state.destinations = payload.destinations
        state.status = 'ready'
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload?.message || 'No se pudieron cargar los viajes.'
      })
      .addCase(resetDemoData.fulfilled, (state, { payload }) => {
        state.trips = payload.trips
        state.destinations = payload.destinations
        state.status = 'ready'
      })
      .addCase(saveTrip.fulfilled, (state, { payload }) => upsert(state.trips, payload))
      .addCase(toggleTripActive.fulfilled, (state, { payload }) => upsert(state.trips, payload))
      .addCase(saveTripOffer.fulfilled, (state, { payload }) => upsert(state.trips, payload))
      .addCase(duplicateTrip.fulfilled, (state, { payload }) => upsert(state.trips, payload))
      .addCase(saveDestination.fulfilled, (state, { payload }) => upsert(state.destinations, payload))
      .addCase(removeDestination.fulfilled, (state, { payload }) => {
        state.destinations = state.destinations.filter((d) => d.id !== payload.id)
      })
  },
})

export default catalogSlice.reducer

export const selectCatalogStatus = (s) => s.catalog.status
export const selectCatalogError = (s) => s.catalog.error
export const selectAllTrips = (s) => s.catalog.trips
export const selectAllDestinations = (s) => s.catalog.destinations
