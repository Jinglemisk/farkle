/**
 * Main entry point for the Farkle game client application
 * Responsible for:
 * - Initializing React application
 * - Setting up Socket.io connection
 * - Rendering the appropriate game component (Lobby or Game)
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { socket } from './socket';
import './styles/main.css';

// Create root and render app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>
); 