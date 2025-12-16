import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchPayouts = createAsyncThunk('payouts/fetch', async () => {
  const res = await api.get('/api/admin/payouts');
  return res.data.data.payouts || [];
});

const slice = createSlice({
  name: 'payouts',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPayouts.pending, (state) => { state.loading = true; })
      .addCase(fetchPayouts.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchPayouts.rejected, (state) => { state.loading = false; });
  }
});

export default slice.reducer;