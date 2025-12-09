import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export const fetchDashboardStats = createAsyncThunk('dashboard/stats', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/api/transactions/stats`, { headers: { Authorization: `Bearer ${token}` } })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
  }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null, loading: false, error: null },
  reducers: { clearDashboardError: (state) => { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload.data })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export const { clearDashboardError } = dashboardSlice.actions
export default dashboardSlice.reducer