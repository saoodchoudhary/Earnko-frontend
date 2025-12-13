'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from '@/store/slices/notificationSlice'
import { fetchDashboardStats } from '@/store/slices/dashboardSlice'
import { fetchTransactions } from '@/store/slices/transactionSlice'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080', {
        auth: { token: localStorage.getItem('token') }
      })

      newSocket.emit('join-user', user.id)

      newSocket.on('transaction-update', (data) => {
        dispatch(addNotification({
          type: 'success',
          title: 'Transaction Updated',
          message: `Your transaction from ${data.store?.name || 'store'} is now ${data.status}`,
          action: '/dashboard/transactions'
        }))
        dispatch(fetchDashboardStats())
        dispatch(fetchTransactions({ limit: 5 }))
      })

      newSocket.on('withdrawal-update', (data) => {
        dispatch(addNotification({
          type: 'info',
          title: 'Withdrawal Update',
          message: `Your withdrawal of ₹${data.amount} is ${data.status}`,
          action: '/dashboard/withdraw'
        }))
      })

      setSocket(newSocket)
      return () => newSocket.close()
    }
  }, [isAuthenticated, user, dispatch])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}