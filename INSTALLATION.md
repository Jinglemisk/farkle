# Farkle Game - Installation Guide

This document provides instructions on how to set up and run the Farkle game locally.

## Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)

## Installation Steps

1. Clone the repository or download the project files

2. Open a terminal/command prompt and navigate to the project directory

3. Install the dependencies:
   ```
   npm install
   ```

## Running the Game

### Development Mode

To run the game in development mode with auto-reloading:

```
npm run dev
```

This will start the server with nodemon, which automatically restarts the server when you make changes to the code.

### Production Mode

To run the game in production mode:

```
npm start
```

## Accessing the Game

Once the server is running, you can access the game by opening a web browser and navigating to:

```
http://localhost:8765
```

## Multiplayer Setup

By default, the game runs on your local machine and can be accessed by other devices on your local network by using your machine's local IP address instead of "localhost".

For example:
```
http://192.168.1.100:8765
```

To make the game accessible over the internet (for friends to join from anywhere), you'll need to set up NGROK:

1. Sign up for a free account at [ngrok.com](https://ngrok.com/)
2. Download and install ngrok
3. With your game server running, open a new terminal and start ngrok:
   ```
   ngrok http 8765
   ```
4. Ngrok will provide a public URL that you can share with your friends to join your game

## Troubleshooting

### Common Issues

1. **Port already in use**  
   If you see an error that port 8765 is already in use, you can either:
   - Close the other application using that port
   - Change the port in `src/server/server.js` (look for `PORT` variable)

2. **Socket.io connection issues**  
   If players are having trouble connecting:
   - Make sure your firewall isn't blocking the connection
   - Check that all players are using the same URL to connect
   - Verify that the server is running properly

### Getting Help

If you encounter any issues not covered here, please check the project's GitHub repository for more information or to report an issue. 