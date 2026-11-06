import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../services/api.js'

const guard = (fn) => async (arg, { rejectWithValue }) => {
  try {
    return await fn(arg)
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Ocurrió un error inesperado.', fields: e.fields || null })
  }
}

export const fetchInquiries = createAsyncThunk('inquiries/fetch', guard(() => api.getInquiries()))
export const createInquiry = createAsyncThunk('inquiries/create', guard((data) => api.createInquiry(data)))
export const changeInquiryStatus = createAsyncThunk('inquiries/status', guard(({ id, status }) => api.setInquiryStatus(id, status)))
export const removeInquiry = createAsyncThunk('inquiries/remove', guard((id) => api.deleteInquiry(id)))

const slice = createSlice({
  name: 'inquiries',
  initialState: { items: [], status: 'idle' },
  extraReducers: (b) => {
    b.addCase(fetchInquiries.pending, (s) => void (s.status = 'loading'))
      .addCase(fetchInquiries.fulfilled, (s, { payload }) => {
        s.items = payload
        s.status = 'ready'
      })
      .addCase(fetchInquiries.rejected, (s) => void (s.status = 'error'))
      .addCase(createInquiry.fulfilled, (s, { payload }) => {
        if (s.status === 'ready') s.items.unshift(payload)
      })
      .addCase(changeInquiryStatus.fulfilled, (s, { payload }) => {
        const i = s.items.findIndex((x) => x.id === payload.id)
        if (i >= 0) s.items[i] = payload
      })
      .addCase(removeInquiry.fulfilled, (s, { payload }) => {
        s.items = s.items.filter((x) => x.id !== payload.id)
      })
  },
})

export default slice.reducer
export const selectInquiries = (s) => s.inquiries.items
export const selectInquiriesStatus = (s) => s.inquiries.status
export const selectNewInquiriesCount = (s) => s.inquiries.items.filter((x) => x.status === 'nueva').length
