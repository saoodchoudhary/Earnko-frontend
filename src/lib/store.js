import { configureStore } from '@reduxjs/toolkit'
import authSlice from '@/store/slices/authSlice'
import dashboardSlice from '@/store/slices/dashboardSlice'
import transactionSlice from '@/store/slices/transactionSlice'
import affiliateSlice from '@/store/slices/affiliateSlice'
import notificationSlice from '@/store/slices/notificationSlice'

export const makeStore = () => configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    transactions: transactionSlice,
    affiliate: affiliateSlice,
    notifications: notificationSlice
  }
})