import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export const getAffiliateStats = createAsyncThunk('affiliate/stats', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/api/affiliate/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch affiliate stats')
  }
})

const affiliateSlice = createSlice({
  name: 'affiliate',
  initialState: { stats: null, loading: false, error: null },
  reducers: { clearAffiliateError: (state) => { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(getAffiliateStats.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getAffiliateStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload.data })
      .addCase(getAffiliateStats.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export default affiliateSlice.reducer