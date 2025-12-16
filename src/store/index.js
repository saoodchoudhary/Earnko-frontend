import { configureStore } from '@reduxjs/toolkit';
import storesReducer from './slices/storesSlice';
import offersReducer from './slices/offersSlice';
import conversionsReducer from './slices/conversionsSlice';
import walletReducer from './slices/walletSlice';
import payoutsReducer from './slices/payoutsSlice';

export const store = configureStore({
  reducer: {
    stores: storesReducer,
    offers: offersReducer,
    conversions: conversionsReducer,
    wallet: walletReducer,
    payouts: payoutsReducer,
  },
});

export const selectError = (s) => s.error;