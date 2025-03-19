import io from 'socket.io-client';

// Initialize socket connection with auto-discovery
const socket = io('http://localhost:8765', {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: true,
  forceNew: true,
  transports: ['websocket', 'polling']
});

// Socket connection error handling
socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});

socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

export { socket }; 