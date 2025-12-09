import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export const fetchTransactions = createAsyncThunk('transactions/fetch', async ({ page = 1, limit = 10, status = '' }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({ page, limit })
    if (status) params.append('status', status)
    const response = await axios.get(`${API_URL}/api/transactions?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
  }
})

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: { transactions: [], currentPage: 1, totalPages: 1, total: 0, loading: false, error: null },
  reducers: { clearTransactionError: (state) => { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false; state.transactions = action.payload.data.transactions; state.currentPage = action.payload.data.currentPage; state.totalPages = action.payload.data.totalPages; state.total = action.payload.data.total
      })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export const { clearTransactionError } = transactionSlice.actions
export default transactionSlice.reducer