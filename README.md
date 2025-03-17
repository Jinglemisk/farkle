# Farkle!
My hobby attempt at making Farkle, the dice game.

# Game Design Document

## Summary

**Description: Farkle is a multiplayer dice-rolling game where 2-4 players take turns in rolling dice, bank points or continue rolling and risk a loss, and ultimately reach the required amount of points to win.** 

**Win Conditions:** The first player to reach the score threshold wins. 

- **Rush: 2000 points**
- **Sprint: 4000 points**
- **Marathon: 7000 points**

## Features

- Lobby: All players will join a lobby before starting the game.
    - Players enter their name and click “Join Game”, whereby they are placed on a “Players” list.
    - The host chooses between three game modes (Rush, Sprint, Marathon) before starting the game, which sets the win condition.
- Game Screen: A top-down roundtable view of the game table.
    - Shows the present players in the game
    - Shows the scoreboard, which is made of banked points
    - Shows the dice rolls of the actively rolling player
    - Shows the pre-banked points (dice that have been set aside) of the actively rolling player

### Multiplayer Component

Farkle uses “NGROK” to facilitate player inviting to this locally-hosted browser game.

### Game Flow Summary

- Players join the lobby by entering their name and press “Join”
- When all players join the game, the host starts the game.
- Each player and host rolls one 6-sided die to determine the start order.
    - If two or more players roll a 6, then they must reroll until one of them is the sole winner.
- Players are placed on the table such that the game starts with the highest-rolling player, and successive players are placed clockwise from the highest-rolling player based on their dice throws.

## Playing Farkle

### **Game Steps**

Each player throws one die to determine the round order. The player who scored the highest (6) wins, and it goes clockwise from there. The following explains how one player completes their turn:

- The player with their turn rolls all of their six die at once.
- After each throw, at least one scoring die must be set aside to continue the turn. This is called a “pre-bank”.
- The player may then either end their turn and bank the score accumulated so far or continue to throw the remaining dice.
- If the player has scored all six dice they have, they have "hot dice" and may continue their turn with a new throw of all six dice, adding to the score they have already accumulated.
    - In this case, the points that have been
- If none of the dice score in any given throw, the player has "farkled" and all pre-banked points for that turn are lost.
- At the end of the player's turn, the dice are handed to the next player in succession (clockwise) and they have their turn.

### Winning Farkle

Once a player has achieved a winning point total, each other player has one last turn to score enough points to surpass that high-score. Should the game extend because of this, each player’s score is halved to the maximum of the game mode selected.

For example, if three players are in a Sprint game, and two players managed to exceed the score of 4000 points:

- The third player who couldn’t make it is eliminated from the game.
- Other two players’ scores are halved to 2000 each, and the turn order continues regularly.

## **Scoring Rules**

The following are the points awarded by the scoring die that have been banked at the end of a player’s turn. 

### **Single Dice Scores:**

- **Single 1:** 100 points
- **Single 5:** 50 points

### **Straights:**

- **Partial Straight (1, 2, 3, 4, 5):** 500 points
- **Partial Straight (2, 3, 4, 5, 6):** 750 points
- **Full Straight (1, 2, 3, 4, 5, 6):** 1,500 points

### **Three of a Kind:**

- **Three 1s:** 1,000 points
- **Three 2s:** 200 points
- **Three 3s:** 300 points
- **Three 4s:** 400 points
- **Three 5s:** 500 points
- **Three 6s:** 600 points

### **Four or More of a Kind:**

- **Four of a Kind:** Double the points of Three of a Kind
    - (e.g., Four 4s = 800 points, since Three 4s = 400 points)
- **Five of a Kind:** Double the points of Four of a Kind
    - (e.g., Five 4s = 1,600 points, since Four 4s = 800 points)
- **Six of a Kind:** Double the points of Five of a Kind
    - (e.g., Six 4s = 3,200 points, since Five 4s = 1,600 points)

## User Story

Three example descriptions of how **the lobby host** and **invited** **players** navigate through the screens.

### Lobby Host

- The host launches the game via localhost.
- As they are waiting in the lobby, they can choose between **Rush**, **Sprint** and **Marathon** game modes.
- When all players join, the host clicks “Start Farkle!” to launch the game.
- All players roll a single die to determine who goes first.
- Host has rolled 2, Player A has rolled 6 and Player B has rolled a 4.
    - Player A, Player B and the Host are placed on the table in clockwise order.
- Player A plays their turn.
- Player B plays their turn.
- Lobby Host begins their turn by rolling all of their six dice.
    - Host has rolled a one, a one, a one, a five, a five, and a five
    - Three ones equal to 1000 points, and three fives equal 500 points.
    - They pre-bank all their dice for 1500 points
    - Since all of their dice have been put aside, they have “Hot dice!”, whereby they can roll all of their six dice again without losing their pre-banked points.
- Lobby Host rolls all of their six dice with 1500 pre-banked points.
    - Host has rolled a five, a five, a one, a six, a two, and a three
    - Host decides to bank the two fives and one one, resulting in 200 points.
    - They decide to end their turn with 1500+200 = 1700 banked, safe points.
- Now it is the turn of Player A again.

## Player A POV

- Player A has received a link to visit the game lobby.
- Player A enters their name on the screen and clicks “Join”
    - Their name is now present in the “Players” list
- They wait for the host to click “Start Farkle!” to launch the game.
- All players roll a single die to determine who goes first.
- Host has rolled 2, Player A has rolled 6 and Player B has rolled a 4.
    - Player A, Player B and the Host are placed on the table in clockwise order.
- Player A begins the game by rolling all of their six dice.
    - Player A has rolled a one, a three, a three, a six, a five, and a two
    - Since “one” has the highest score among the 6 dice, they “pre-bank” the one, and roll again
- Player A rolls again with five dice, with their one die pre-banked for 100 points.
    - Player A has rolled a two, a six, a six, a six, and a five.
    - Player A pre-banks the three sixes, pre-banking 600 points worth of die.
- Now that Player A has only two dice remaining, they decide to bank their pre-banked dice for a total sum of 700 points. Player A ends their turn with 700 points in the bank.

## Player B POV

- Player B has received a link to visit the game lobby.
- Player B enters their name on the screen and clicks “Join”
    - Their name is now present in the “Players” list
- They wait for the host to click “Start Farkle!” to launch the game.
- All players roll a single die to determine who goes first.
- Host has rolled 2, Player A has rolled 6 and Player B has rolled a 4.
    - Player A, Player B and the Host are placed on the table in clockwise order.
- Player B waits until the Player A’s turn is up.
- When it is their turn, Player A begins the game by rolling all of their six dice.
    - Player B has rolled a three, a three, a three, a one, and a one
    - They decide to pre-bank all their scoring die, 3x3 and 1x1, for a total of 300+100 = 400 points.
- Player B rolls again with the remaining two dice, with other four dice pre-banked.
    - Player B has rolled a two, and a three
    - Since there is no scoring die on the field, they have Farkled!
    - Player B loses all their pre-banked points
- Now that Player A has only two dice remaining, they decide to bank their pre-banked dice for a total sum of 700 points. Player A ends their turn with 700 points in the bank.

# Art / UI Design

## Theme

- Medieval aesthetic
- Medieval tavern
- Theme applied to both lobby and main game screen

## Lobby Design

- Simple waiting room UI with medieval aesthethic

## Game Room Design

- Top-down view of a Medieval table

# Technical Design Document

## Repo Hierarchy

```markdown
farkle-game/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── dice/
│   │   │   ├── ui/
│   │   │   └── backgrounds/
│   │   ├── sounds/
│   │   └── fonts/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── client/
│   │   ├── components/
│   │   │   ├── Lobby.js
│   │   │   ├── Game.js
│   │   │   ├── Dice.js
│   │   │   ├── Scoreboard.js
│   │   │   └── PlayerView.js
│   │   ├── styles/
│   │   │   ├── main.css
│   │   │   ├── lobby.css
│   │   │   └── game.css
│   │   ├── utils/
│   │   │   ├── gameLogic.js
│   │   │   └── diceUtils.js
│   │   └── index.js
│   ├── server/
│   │   ├── gameState.js
│   │   ├── socketHandlers.js
│   │   └── server.js
├── package.json
├── .gitignore
└── README.md
```

## Technical Requirements

### Frontend Technologies

- **HTML/CSS/JavaScript**: Core web technologies
- **React.js**: For building the user interface components
- **Socket.io-client**: For real-time communication with the server

### Backend Technologies

- **Node.js**: JavaScript runtime for the server
- **Express.js**: Web server framework
- **Socket.io**: For real-time bidirectional communication
- **ngrok**: For exposing your localhost to the internet for multiplayer

### Core Technical Requirements

1. **Real-time Game State Management**
    - Synchronize game state across all connected players
    - Handle dice rolls, scoring, and turn management
2. **User Authentication (Simple)**
    - Basic player identification using names
    - No need for accounts or passwords
3. **Game Logic**
    - Implement all Farkle rules (scoring, "hot dice", farkle)
    - Track player scores and determine winners
4. **Networking**
    - Enable real-time updates between players
    - Handle player disconnections gracefully
5. **Game Session Management**
    - Create game lobbies
    - Start/end game sessions
