import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed')
  }
})

export const getCurrentUser = createAsyncThunk('auth/currentUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token')
    const response = await axios.get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  console.log("token", response.data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get user')
  }
})

const initialState = {
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: !!(typeof window !== 'undefined' && localStorage.getItem('token')),
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null; state.isAuthenticated = false
      localStorage.removeItem('token'); localStorage.removeItem('user')
    },
    clearError: (state) => { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.data.user; state.token = action.payload.data.token; state.isAuthenticated = true
        localStorage.setItem('token', action.payload.data.token); localStorage.setItem('user', JSON.stringify(action.payload.data.user))
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.data.user; state.token = action.payload.data.token; state.isAuthenticated = true
        localStorage.setItem('token', action.payload.data.token); localStorage.setItem('user', JSON.stringify(action.payload.data.user))
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(getCurrentUser.fulfilled, (state, action) => { state.user = action.payload.data.user; state.isAuthenticated = true })
      .addCase(getCurrentUser.rejected, (state) => { state.user = null; state.token = null; state.isAuthenticated = false; localStorage.removeItem('token'); localStorage.removeItem('user') })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer