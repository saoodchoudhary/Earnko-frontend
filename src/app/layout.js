'use client'
import './globals.css'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { SocketProvider } from '../context/SocketContext'
import { Toaster } from 'react-hot-toast'

const store = makeStore()

// export const metadata = {
//   title: 'Earnko',
//   description: 'Affiliate & cashback platform'
// }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <SocketProvider>
            <Toaster position="top-right" />
            {children}
          </SocketProvider>
        </Provider>
      </body>
    </html>
  )
}