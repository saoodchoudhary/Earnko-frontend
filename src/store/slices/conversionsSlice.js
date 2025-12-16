import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchMyConversions = createAsyncThunk('conversions/me', async () => {
  const res = await api.get('/api/conversions/me');
  return res.data.data.conversions || [];
});

export const fetchAllConversions = createAsyncThunk('conversions/all', async () => {
  const res = await api.get('/api/conversions');
  return res.data.data.conversions || [];
});

const slice = createSlice({
  name: 'conversions',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMyConversions.pending, (state) => { state.loading = true; })
      .addCase(fetchMyConversions.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchMyConversions.rejected, (state) => { state.loading = false; })
      .addCase(fetchAllConversions.pending, (state) => { state.loading = true; })
      .addCase(fetchAllConversions.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchAllConversions.rejected, (state) => { state.loading = false; });
  }
});

export default slice.reducer;