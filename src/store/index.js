import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import catalogReducer from './catalogSlice.js'
import tripsReducer from './tripsSlice.js'
import inquiriesReducer from './inquiriesSlice.js'
import uiReducer from './uiSlice.js'

export const store = configureStore({
  reducer: { catalog: catalogReducer, trips: tripsReducer, auth: authReducer, ui: uiReducer, inquiries: inquiriesReducer },
})
