/**
 * Main entry point for the Farkle game client application
 * Responsible for:
 * - Initializing React application
 * - Setting up Socket.io connection
 * - Rendering the appropriate game component (Lobby or Game)
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import io from 'socket.io-client';
import App from './components/App';
import './styles/main.css';

// Initialize socket connection with auto-discovery
// This will work with any port the server is running on
const socket = io({
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: true,
  forceNew: true
});

// Socket connection error handling
socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});

// Create root and render app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>
); 