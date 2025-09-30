# Farkle Multiplayer - Deployment Guide

## Production Deployment

This guide explains how to deploy the Farkle multiplayer game to production.

### Architecture Overview

The application consists of two parts:
1. **Frontend**: React + Vite static site
2. **Backend**: Node.js + Express + Socket.io server

Both need to be deployed separately.

---

## Backend Deployment

### Option 1: Railway / Render / Heroku

1. **Prepare the backend**:
   - The `server.js` file is ready for deployment
   - It uses environment variables for configuration

2. **Set environment variables**:
   ```
   PORT=3001
   ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
   ```

3. **Deploy**:
   - Push your code to GitHub
   - Connect your repository to Railway/Render/Heroku
   - Set the start command: `node server.js`
   - Deploy!

### Option 2: VPS (DigitalOcean, AWS EC2, etc.)

1. **Install Node.js** on your server
2. **Clone your repository**
3. **Install dependencies**: `npm install`
4. **Set up PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start server.js --name farkle-server
   pm2 save
   pm2 startup
   ```
5. **Set environment variables** in a `.env` file or export them
6. **Configure Nginx** as reverse proxy (optional but recommended)

---

## Frontend Deployment

### Option 1: Vercel / Netlify

1. **Set environment variable** before building:
   ```
   VITE_SERVER_URL=https://your-backend-domain.com
   ```

2. **Build the frontend**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   - Connect your GitHub repository to Vercel/Netlify
   - Set the build command: `npm run build`
   - Set the output directory: `dist`
   - Add the environment variable `VITE_SERVER_URL`
   - Deploy!

### Option 2: Static Hosting (AWS S3, GitHub Pages, etc.)

1. **Set environment variable**:
   Create a `.env.production` file:
   ```
   VITE_SERVER_URL=https://your-backend-domain.com
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Upload** the `dist` folder contents to your static hosting

---

## Environment Variables Summary

### Frontend (.env or Vercel/Netlify settings)
```bash
VITE_SERVER_URL=https://your-backend-domain.com
```

### Backend (.env or Railway/Render settings)
```bash
PORT=3001
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

## Testing Production Build Locally

### 1. Build frontend with production server URL:
```bash
# Create .env.production file
echo "VITE_SERVER_URL=http://localhost:3001" > .env.production

# Build
npm run build
```

### 2. Start backend with production CORS:
```bash
# Set environment variables
export PORT=3001
export ALLOWED_ORIGINS=http://localhost:4173

# Start server
npm run server
```

### 3. Preview frontend build:
```bash
npm run preview
```

### 4. Test at http://localhost:4173

---

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend built with correct `VITE_SERVER_URL`
- [ ] CORS configured with frontend domain in `ALLOWED_ORIGINS`
- [ ] Both services can communicate (check browser console for errors)
- [ ] WebSocket connection working (test by creating a lobby)
- [ ] SSL/HTTPS enabled (required for production)
- [ ] Backend using WSS (secure WebSocket) if frontend is HTTPS

---

## Common Issues

### "Failed to connect to server"
- Check that `VITE_SERVER_URL` is correct
- Verify backend is running and accessible
- Check CORS configuration

### "WebSocket connection failed"
- Ensure backend allows WebSocket connections
- If using a proxy (Nginx/Apache), configure WebSocket support
- Check that ports are open in firewall

### "Mixed content" errors (HTTPS + WS)
- Frontend on HTTPS must use WSS (secure WebSocket)
- Update `VITE_SERVER_URL` to use `https://` not `http://`

---

## Example Production Setup

**Backend (Railway)**:
- Domain: `https://farkle-server.railway.app`
- Environment Variables:
  ```
  PORT=3001
  ALLOWED_ORIGINS=https://farkle-game.vercel.app
  ```

**Frontend (Vercel)**:
- Domain: `https://farkle-game.vercel.app`
- Environment Variables:
  ```
  VITE_SERVER_URL=https://farkle-server.railway.app
  ```

**Result**: Game accessible at `https://farkle-game.vercel.app`