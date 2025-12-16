import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchStores = createAsyncThunk('stores/fetch', async () => {
  const res = await api.get('/api/stores');
  return res.data.data.stores || [];
});

const slice = createSlice({
  name: 'stores',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchStores.pending, (state) => { state.loading = true; })
      .addCase(fetchStores.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchStores.rejected, (state) => { state.loading = false; });
  }
});

export default slice.reducer;