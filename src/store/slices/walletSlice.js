import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchWallet = createAsyncThunk('wallet/fetch', async () => {
  const res = await api.get('/api/wallet/me');
  return res.data.data.wallet || {};
});

const slice = createSlice({
  name: 'wallet',
  initialState: { summary: null, loading: false },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchWallet.pending, (state) => { state.loading = true; })
      .addCase(fetchWallet.fulfilled, (state, action) => { state.summary = action.payload; state.loading = false; })
      .addCase(fetchWallet.rejected, (state) => { state.loading = false; });
  }
});

export default slice.reducer;