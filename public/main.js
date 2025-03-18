/**
 * Farkle Game - Client Side JavaScript
 * Handles the lobby functionality and socket.io communication
 */

// Connect to Socket.io server
const socket = io();

// DOM Elements
const playerNameInput = document.getElementById('playerName');
const joinBtn = document.getElementById('joinBtn');
const playersList = document.getElementById('playersList');
const rushModeBtn = document.getElementById('rushMode');
const sprintModeBtn = document.getElementById('sprintMode');
const marathonModeBtn = document.getElementById('marathonMode');
const startBtn = document.getElementById('startBtn');
const hostControlsSection = document.querySelector('.host-controls');

// Game state variables
let currentPlayer = null;
let isHost = false;
let gameMode = 'Sprint'; // Default game mode

// Show or hide host controls
function toggleHostControls(isVisible) {
  hostControlsSection.style.display = isVisible ? 'block' : 'none';
}

// Update the players list in the UI
function updatePlayersList(players) {
  playersList.innerHTML = '';
  
  players.forEach(player => {
    const playerItem = document.createElement('li');
    
    // Add host indicator
    if (player.isHost) {
      playerItem.classList.add('host');
    }
    
    // Add ready indicator
    if (player.isReady) {
      playerItem.classList.add('ready');
    }
    
    // Create player name with appropriate indicator
    let playerName = player.name;
    if (player.isHost) {
      playerName += ' (Host)';
    }
    if (player.isReady) {
      playerName += ' (Ready)';
    }
    
    playerItem.textContent = playerName;
    
    // Add "This is you" indicator for the current player
    if (currentPlayer && player.id === currentPlayer.id) {
      const youIndicator = document.createElement('span');
      youIndicator.textContent = '(You)';
      youIndicator.style.marginLeft = '10px';
      playerItem.appendChild(youIndicator);
    }
    
    playersList.appendChild(playerItem);
  });
  
  // Enable start button if there's at least one player and current player is host
  if (isHost && players.length >= 1) {
    startBtn.disabled = false;
  } else {
    startBtn.disabled = true;
  }
}

// Update the selected game mode in the UI
function updateGameModeSelection(mode) {
  rushModeBtn.classList.remove('selected');
  sprintModeBtn.classList.remove('selected');
  marathonModeBtn.classList.remove('selected');
  
  switch(mode) {
    case 'Rush':
      rushModeBtn.classList.add('selected');
      break;
    case 'Sprint':
      sprintModeBtn.classList.add('selected');
      break;
    case 'Marathon':
      marathonModeBtn.classList.add('selected');
      break;
  }
  
  gameMode = mode;
}

// Event: Join button click
joinBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  
  if (playerName === '') {
    alert('Please enter your name');
    return;
  }
  
  // Send join request to server
  socket.emit('joinGame', { playerName });
  
  // Disable join form after joining
  playerNameInput.disabled = true;
  joinBtn.disabled = true;
});

// Event: Game mode button clicks
rushModeBtn.addEventListener('click', () => {
  if (isHost) {
    socket.emit('setGameMode', { mode: 'Rush' });
  }
});

sprintModeBtn.addEventListener('click', () => {
  if (isHost) {
    socket.emit('setGameMode', { mode: 'Sprint' });
  }
});

marathonModeBtn.addEventListener('click', () => {
  if (isHost) {
    socket.emit('setGameMode', { mode: 'Marathon' });
  }
});

// Event: Start game button click
startBtn.addEventListener('click', () => {
  if (isHost) {
    socket.emit('startGame');
  }
});

// Socket.io event handlers
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('gameState', (state) => {
  updateGameModeSelection(state.gameMode);
  updatePlayersList(state.players);
});

socket.on('playerJoined', ({ player, players }) => {
  if (!currentPlayer && player.id === socket.id) {
    currentPlayer = player;
    isHost = player.isHost;
    toggleHostControls(isHost);
  }
  
  updatePlayersList(players);
});

socket.on('hostAssigned', () => {
  isHost = true;
  toggleHostControls(true);
});

socket.on('gameModeChanged', ({ gameMode }) => {
  updateGameModeSelection(gameMode);
});

socket.on('playerReadyChanged', ({ playerId, isReady }) => {
  // This will be used in the future when implementing ready functionality
});

socket.on('playerLeft', ({ playerId, players }) => {
  updatePlayersList(players);
});

socket.on('gameStarted', () => {
  alert('Game is starting!');
  // In the future, this will transition to the game screen
});

socket.on('error', ({ message }) => {
  alert(`Error: ${message}`);
});

// Initialize the UI
toggleHostControls(false); // Hide host controls by default 