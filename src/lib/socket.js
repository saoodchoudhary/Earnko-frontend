import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  socket = io(url, {
    autoConnect: !!token,
    transports: ['websocket', 'polling'],
    auth: { token }
  });

  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('[socket] connect_error', err.message);
  });

  return socket;
}

export function reconnectSocket() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const s = getSocket();
  s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}