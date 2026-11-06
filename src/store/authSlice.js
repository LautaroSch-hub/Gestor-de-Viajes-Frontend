import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../services/api.js'

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await api.login(email, password)
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo iniciar sesión.')
  }
})

export const logout = createAsyncThunk('auth/logout', () => api.logout())

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: api.getSession(), status: 'idle', error: null },
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.status = 'idle'
        state.user = payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload || 'No se pudo iniciar sesión.'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer

export const selectUser = (s) => s.auth.user
