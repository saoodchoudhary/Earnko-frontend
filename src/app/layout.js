import './globals.css';
import { Providers } from '../context/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Earnko',
  description: 'EarnKaro-style affiliate and cashback platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}