import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchOffers = createAsyncThunk('offers/fetch', async (storeId) => {
  const res = await api.get('/api/offers', { params: storeId ? { storeId } : {} });
  return res.data.data.offers || [];
});

const slice = createSlice({
  name: 'offers',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOffers.pending, (state) => { state.loading = true; })
      .addCase(fetchOffers.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchOffers.rejected, (state) => { state.loading = false; });
  }
});

export default slice.reducer;