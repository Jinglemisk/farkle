# Farkle Game - Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [File Structure](#file-structure)
5. [Core Type System](#core-type-system)
6. [Configuration Constants](#configuration-constants)
7. [Game Logic & State Management](#game-logic--state-management)
8. [Scoring System](#scoring-system)
9. [Component Architecture](#component-architecture)
10. [Game Flow & State Transitions](#game-flow--state-transitions)
11. [User Interface Design](#user-interface-design)
12. [Future Development Considerations](#future-development-considerations)

---

## Project Overview

**Farkle** is a classic dice game implemented as a single-player web application using React and TypeScript. The game follows traditional Farkle rules where players roll six dice, select scoring combinations, and attempt to reach a winning score without "farkling" (rolling no scoring dice).

### Game Objective
Accumulate 500 points by rolling dice and banking scoring combinations. Players can continue rolling to increase their turn score but risk losing all unbanked points if they farkle.

---

## Technology Stack

### Core Technologies
- **React 19.1.1** - UI framework with hooks and functional components
- **TypeScript 5.8.2** - Type-safe JavaScript superset
- **Vite 6.2.0** - Build tool and development server
- **Tailwind CSS** (via CDN) - Utility-first CSS framework

### Development Tools
- **@vitejs/plugin-react** - React support for Vite
- **@types/node** - Node.js type definitions

### Build Configuration
- ES2022 target with ESNext modules
- JSX transformation using react-jsx
- Path alias `@/*` for imports
- Development server on port 3000

---

## Architecture Overview

The codebase follows a **modular React architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           Entry Point (index.tsx)        │
│         ReactDOM.render(<App />)         │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│        App Component (App.tsx)           │
│   - Main game UI orchestration           │
│   - Uses useFarkleGame hook              │
│   - Renders Die and Modal components     │
└───────────┬───────────┬─────────────────┘
            │           │
┌───────────▼───┐   ┌───▼────────────────┐
│  useFarkleGame │   │    Components      │
│      Hook      │   │  - Die.tsx         │
│  (State Mgmt)  │   │  - Modal.tsx       │
└───────┬────────┘   └────────────────────┘
        │
┌───────▼────────────────────────────────┐
│          Utilities & Types              │
│  - scoring.ts (game logic)              │
│  - types.ts (TypeScript interfaces)     │
│  - constants.ts (game configuration)    │
└─────────────────────────────────────────┘
```

---

## File Structure

### Root Level Files

#### `index.html`
- **Purpose**: HTML entry point for the application
- **Key Features**:
  - Tailwind CSS loaded via CDN (`https://cdn.tailwindcss.com`)
  - Import map for React 19.1.1 modules from `aistudiocdn.com`
  - Custom font: Cinzel (serif) from Google Fonts for tavern theme
  - Root div with id `root` for React mounting
  - Imports `index.tsx` as module entry point

#### `index.tsx`
- **Purpose**: JavaScript entry point, renders React app
- **Location**: `/index.tsx`
- **Functionality**:
  - Creates React root using `ReactDOM.createRoot()`
  - Wraps App in `React.StrictMode` for development checks
  - Error handling if root element not found

#### `App.tsx`
- **Purpose**: Main application component and UI orchestrator
- **Location**: `/App.tsx`
- **Dependencies**:
  - `useFarkleGame` hook for state management
  - `Die` component for dice rendering
  - `Modal` component for game messages
  - `GameStatus` enum for game state
  - `WINNING_SCORE` constant
  - `calculateScore` utility
- **Responsibilities**:
  - Renders complete game UI
  - Manages user interactions
  - Displays dice, scores, and controls
  - Conditionally renders modals for game events

### Type Definitions

#### `types.ts`
- **Purpose**: Central type definitions for the entire application
- **Location**: `/types.ts`

**Type Definitions:**

1. **`DieValue`** (line 2)
   ```typescript
   export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
   ```
   - Union type for valid die face values
   - Ensures type safety for all die values

2. **`Die` Interface** (lines 4-8)
   ```typescript
   export interface Die {
     id: number;        // Unique identifier for each die
     value: DieValue;   // Current face value (1-6)
     isSelected: boolean; // Selection state for scoring
   }
   ```
   - Represents a single die in the game
   - `id`: Used for React keys and die tracking
   - `value`: Current rolled value
   - `isSelected`: Whether player has selected this die for keeping

3. **`GameStatus` Enum** (lines 10-16)
   ```typescript
   export enum GameStatus {
     NotStarted = 'NOT_STARTED',       // Initial state
     PlayerTurn = 'PLAYER_TURN',       // Can roll dice
     DiceRolled = 'DICE_ROLLED',       // Can select dice
     GameOverWin = 'GAME_OVER_WIN',    // Reached winning score
     GameOverFarkle = 'GAME_OVER_FARKLE' // No scoring dice rolled
   }
   ```
   - State machine for game flow
   - Controls UI button states and available actions

### Configuration

#### `constants.ts`
- **Purpose**: Game configuration values
- **Location**: `/constants.ts`

**Constants Defined:**

1. **`WINNING_SCORE`** (line 2)
   ```typescript
   export const WINNING_SCORE = 500;
   ```
   - Target score to win the game
   - Used in victory condition checks

2. **`DICE_COUNT`** (line 3)
   ```typescript
   export const DICE_COUNT = 6;
   ```
   - Number of dice in the game
   - Used for initialization and "hot dice" detection

---

## Core Type System

### Die Object Flow

```
Create Die → Roll Die → Select Die → Keep Die
    ↓           ↓           ↓           ↓
  {id: 0,   {id: 0,     {id: 0,     {id: 0,
   value: 1, value: 3,   value: 3,   value: 3,
   selected: selected:   selected:   selected:
   false}    false}      true}       false}
```

### State Relationships

```
GameStatus: Controls what actions are available
     ↓
Dice Array: Active dice that can be rolled/selected
     ↓
KeptDice Array: Dice removed from play this turn
     ↓
TurnScore: Points accumulated but not banked
     ↓
TotalScore: Banked points toward victory
```

---

## Game Logic & State Management

### `useFarkleGame` Hook
**Location**: `/hooks/useFarkleGame.ts`

This custom hook encapsulates all game state and logic, providing a clean interface to the App component.

#### State Variables

1. **`gameStatus`** (line 16)
   - Type: `GameStatus`
   - Initial: `GameStatus.NotStarted`
   - Purpose: Controls game flow and UI state

2. **`dice`** (line 17)
   - Type: `Die[]`
   - Initial: 6 dice with value 1, not selected
   - Purpose: Active dice currently in play

3. **`keptDice`** (line 18)
   - Type: `Die[]`
   - Initial: Empty array
   - Purpose: Dice removed from active play this turn

4. **`totalScore`** (line 19)
   - Type: `number`
   - Initial: 0
   - Purpose: Banked score across all turns

5. **`turnScore`** (line 20)
   - Type: `number`
   - Initial: 0
   - Purpose: Accumulated score for current turn (not yet banked)

#### Helper Functions

##### `createInitialDice()` (lines 7-13)
```typescript
const createInitialDice = (): Die[] => {
    return Array.from({ length: DICE_COUNT }, (_, i) => ({
        id: i,
        value: 1,
        isSelected: false
    }));
};
```
- Creates fresh set of 6 dice
- Sequential IDs (0-5)
- Default value 1 (cosmetic, overwritten on first roll)
- All unselected

##### `startTurn()` (lines 22-27)
```typescript
const startTurn = useCallback(() => {
    setTurnScore(0);
    setDice(createInitialDice());
    setKeptDice([]);
    setGameStatus(GameStatus.PlayerTurn);
}, []);
```
- Resets turn state
- Clears kept dice
- Resets turn score to 0
- Sets status to PlayerTurn (ready to roll)

#### Core Game Actions

##### `handleNewGame()` (lines 29-32)
**Trigger**: "Start Game" or "Play Again" button
**Flow**:
1. Reset total score to 0
2. Call `startTurn()` to initialize first turn

##### `handleRollDice()` (lines 34-54)
**Trigger**: "Roll Dice" or "Roll Again" button
**Flow**:
1. Determine number of dice to roll:
   - If `dice.length === 0` (hot dice scenario): roll all 6
   - Otherwise: roll remaining dice
2. Generate random values (1-6) for each die
3. Check for farkle using `checkForFarkle()`
4. **If Farkle**:
   - Set status to `GameOverFarkle`
   - Turn score is lost
   - Modal will trigger next action
5. **If Valid**:
   - Set status to `DiceRolled`
   - Player can now select dice

**Hot Dice Logic**: When all 6 dice are kept, player gets to roll all 6 again while preserving turn score.

##### `handleSelectDie(id)` (lines 65-71)
**Trigger**: Clicking a die in DiceRolled state
**Flow**:
- Toggles `isSelected` property of die with matching id
- Uses functional setState to ensure correct previous state
- Allows multiple selections before keeping

##### `handleKeepDice()` (lines 73-97)
**Trigger**: "Keep & Roll" button
**Flow**:
1. Filter dice into `selectedDice` and `remainingDice`
2. Calculate score for selected dice
3. **If score is 0** (invalid selection):
   - Do nothing (could show error in future)
4. **If valid**:
   - Add selected dice to `keptDice` (reset isSelected to false)
   - Increment `turnScore` by calculated score
   - **Check for Hot Dice** (kept 6 dice):
     - Reset dice to full set
     - Clear kept dice
     - Keep accumulated turn score
   - **Otherwise**:
     - Set dice to remaining dice
   - Set status to `PlayerTurn` (can roll again)

##### `handleBankScore()` (lines 99-116)
**Trigger**: "Bank Score" button
**Flow**:
1. Initialize `finalTurnScore` with current `turnScore`
2. **If banking from DiceRolled state**:
   - Calculate score for selected dice
   - Add to `finalTurnScore`
3. Add `finalTurnScore` to `totalScore`
4. **Check for victory**:
   - If `totalScore >= WINNING_SCORE`: Set status to `GameOverWin`
   - Otherwise: Call `startTurn()` for next turn

##### `handleFarkleAck()` (lines 56-62)
**Trigger**: Modal close button after farkle
**Flow**:
1. **If total score >= winning score**: Set status to `GameOverWin`
2. **Otherwise**: Start new turn

#### Return Interface
The hook returns an object with:
- State: `gameStatus`, `dice`, `keptDice`, `totalScore`, `turnScore`
- Actions: `handleNewGame`, `handleRollDice`, `handleSelectDie`, `handleKeepDice`, `handleBankScore`

**Note**: `handleNewGame` is overridden to `handleFarkleAck` when in farkle state (line 126).

---

## Scoring System

### `scoring.ts` Utilities
**Location**: `/utils/scoring.ts`

This module contains pure functions for score calculation and farkle detection.

#### Helper Function: `getCounts()` (lines 6-12)
```typescript
const getCounts = (dice: DieValue[]): Counts => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Counts;
  dice.forEach(value => {
    counts[value]++;
  });
  return counts;
};
```
- Counts frequency of each die value
- Returns object mapping die value to count
- Used by both scoring and farkle detection

#### `calculateScore(dice: DieValue[])` (lines 16-68)
**Purpose**: Calculates point value for a selection of dice

**Algorithm Flow**:

1. **Edge Case** (line 17): Empty array returns 0

2. **Straights Detection** (lines 24-31):
   - **Full Straight (1-2-3-4-5-6)**: 1500 points
     - Requires exactly 6 dice, each value appears once
   - **Partial Straight (1-2-3-4-5)**: 500 points
     - Requires exactly 5 dice with these values
   - **Partial Straight (2-3-4-5-6)**: 750 points
     - Requires exactly 5 dice with these values
   - Straights are exclusive (return immediately)

3. **N-of-a-Kind Detection** (lines 34-50):
   - Loop through each die value (1-6)
   - If count >= 3, calculate base score:
     - **Three 1s**: 1000 points
     - **Three of any other**: value × 100 (e.g., three 4s = 400)
   - **Multipliers for additional dice**:
     - 3 of a kind: base score × 1
     - 4 of a kind: base score × 2
     - 5 of a kind: base score × 4
     - 6 of a kind: base score × 8
   - Mark dice as used, reset count to 0

4. **Singles Scoring** (lines 52-60):
   - After N-of-a-kind, check remaining dice
   - **Single 1**: 100 points each
   - **Single 5**: 50 points each

5. **Validation** (lines 62-65):
   - If not all dice in selection were scored, return 0
   - Prevents invalid selections like [2, 3, 4] being kept

**Score Examples**:
```
[1]           → 100
[5]           → 50
[1, 5]        → 150
[1, 1, 1]     → 1000
[2, 2, 2]     → 200
[1, 1, 1, 1]  → 2000 (three 1s doubled)
[1,2,3,4,5,6] → 1500 (full straight)
[1, 5, 2, 3]  → 0 (invalid, 2 and 3 don't score)
```

#### `checkForFarkle(dice: DieValue[])` (lines 72-90)
**Purpose**: Determines if a roll has ANY scoring possibility

**Algorithm**:

1. **Check for single 1s or 5s** (line 76):
   - If count[1] > 0 or count[5] > 0: Not a farkle

2. **Check for 3-of-a-kind or more** (lines 79-81):
   - Any value with count >= 3: Not a farkle

3. **Check for straights** (lines 84-87):
   - Create unique sorted values string
   - Check if contains "12345" or "23456" or equals "123456"
   - If found: Not a farkle

4. **Return true** (line 89):
   - If none of above found, it's a farkle

**Note**: This function checks for ANY scoring possibility, not just valid full selections. Used immediately after roll to determine farkle.

---

## Component Architecture

### Die Component
**Location**: `/components/Die.tsx`

#### Component Structure

##### `Dot` Sub-component (lines 12-14)
```typescript
const Dot: React.FC<{ position: string }> = ({ position }) => (
    <div className={`absolute w-3 h-3 md:w-4 md:h-4 bg-stone-800 rounded-full ${position}`}></div>
);
```
- Renders single dot on die face
- Accepts Tailwind positioning classes
- Responsive sizing (w-3/h-3 on mobile, w-4/h-4 on desktop)

##### `DieFace` Sub-component (lines 16-41)
**Purpose**: Renders dot pattern for die value

**Dot Patterns** (lines 17-24):
- Defines dot positions for each value 1-6
- Maps to position keys like 'top-left', 'center', etc.

**Dot Position Mapping** (lines 26-34):
- Translates position keys to Tailwind classes
- Uses absolute positioning and transforms
- Handles edge, middle, and center positions

**Rendering** (lines 36-40):
- Container with relative positioning and padding
- Maps pattern array to Dot components
- Uses position key as React key

##### Main `Die` Component (lines 44-63)

**Props Interface** (lines 5-10):
```typescript
interface DieProps {
  value: DieValue;      // 1-6
  isSelected: boolean;  // Selected for keeping
  isKept: boolean;      // Already kept this turn
  onClick: () => void;  // Selection handler
}
```

**Styling Logic**:

1. **Base Classes** (line 45):
   - Size: `w-16 h-16` (mobile), `w-20 h-20` (desktop)
   - Background: `bg-amber-50` (off-white)
   - Shape: `rounded-lg` with `shadow-md`
   - Transitions: `transition-all duration-200`

2. **State-dependent Classes** (lines 47-55, memoized):
   - **If kept**:
     - Lime border (`border-4 border-lime-600`)
     - Reduced opacity (`opacity-80`)
     - Slightly smaller (`scale-90`)
   - **Else if selected**:
     - Amber border (`border-4 border-amber-400`)
     - Lifted animation (`-translate-y-2`)
     - Enlarged (`scale-105`)
     - Enhanced shadow (`shadow-xl`)
   - **Else** (default):
     - Thinner border (`border-2 border-amber-800`)
     - Cursor pointer
     - Hover effects (border color, scale)

**Rendering** (lines 58-62):
- Combines base and state classes
- Wraps DieFace component
- Attaches onClick handler

---

### Modal Component
**Location**: `/components/Modal.tsx`

#### Props Interface (lines 4-9)
```typescript
interface ModalProps {
  title: string;      // Modal heading
  message: string;    // Explanation text
  onClose: () => void; // Dismiss handler
  buttonText: string; // CTA text
}
```

#### Rendering Structure (lines 11-26)

1. **Backdrop** (line 13):
   - Fixed overlay covering viewport
   - Dark background with transparency (`bg-black/70`)
   - Flexbox centering
   - Z-index 50 (above all game elements)

2. **Modal Box** (line 14):
   - Stone background (`bg-stone-800`)
   - Thick amber border (`border-4 border-amber-700`)
   - Rounded corners with shadow
   - Max width 'sm', responsive margins

3. **Content**:
   - **Title** (line 15): Large amber text, bold
   - **Message** (line 16): Lighter amber, regular size
   - **Button** (lines 17-22): Amber background, hover effects

#### Usage in App
Called for two scenarios:
1. **Win State**: Title "You Win!", shows final score
2. **Farkle State**: Title "Farkle!", explains turn loss

---

## Game Flow & State Transitions

### State Transition Diagram

```
┌──────────────┐
│ NotStarted   │──[Start Game]──┐
└──────────────┘                 │
                                 ▼
                        ┌──────────────┐
                        │ PlayerTurn   │◄─────────┐
                        └──────┬───────┘          │
                               │                  │
                      [Roll Dice]                 │
                               │                  │
                               ▼                  │
                        ┌──────────────┐          │
                  ┌─────│ DiceRolled   │          │
                  │     └──────┬───────┘          │
                  │            │                  │
          [No scoring      [Select Dice]          │
            dice]              │                  │
                  │            ▼                  │
                  │    [Keep & Roll]──────────────┘
                  │            │
                  │    [Bank Score]───┐
                  │                   │
                  ▼                   ▼
         ┌──────────────┐    ┌──────────────┐
         │GameOverFarkle│    │ GameOverWin  │
         └──────┬───────┘    └──────┬───────┘
                │                   │
           [Next Turn]         [Play Again]
                │                   │
                └──────►┌───────┐◄──┘
                        │ Start │
                        └───────┘
```

### Action Flow Details

#### Starting a New Game
1. User clicks "Start Game"
2. `handleNewGame()` called
3. Total score set to 0
4. `startTurn()` called
5. State transitions to `PlayerTurn`
6. "Roll Dice (6)" button enabled

#### Rolling Dice
1. User clicks "Roll Dice"
2. `handleRollDice()` called
3. Random values generated for active dice
4. `checkForFarkle()` evaluates roll
5. **Branch A - Farkle**:
   - State → `GameOverFarkle`
   - Modal displays
   - Turn score lost
6. **Branch B - Valid Roll**:
   - State → `DiceRolled`
   - Dice become selectable

#### Selecting & Keeping Dice
1. User clicks dice to toggle selection (visual lift)
2. User clicks "Keep & Roll"
3. `handleKeepDice()` called
4. Score calculated for selected dice
5. Selected dice moved to kept area
6. Turn score incremented
7. **Branch A - Hot Dice** (all 6 kept):
   - Kept dice cleared
   - All 6 dice returned to play
   - Turn score preserved
8. **Branch B - Partial Keep**:
   - Remaining dice stay in play
9. State → `PlayerTurn`
10. User can roll again or bank

#### Banking Score
1. User clicks "Bank Score"
2. `handleBankScore()` called
3. Turn score added to total score
4. **Branch A - Victory**:
   - State → `GameOverWin`
   - Modal displays
5. **Branch B - Continue**:
   - `startTurn()` called
   - New turn begins

### UI State Changes

| GameStatus | Roll Button | Keep Button | Bank Button | Dice Clickable |
|-----------|------------|-------------|-------------|----------------|
| NotStarted | Hidden | Hidden | Hidden | No |
| PlayerTurn | Enabled | Hidden | Conditional* | No |
| DiceRolled | Hidden | Conditional** | Conditional*** | Yes |
| GameOverWin | Hidden | Hidden | Hidden | No |
| GameOverFarkle | Hidden | Hidden | Hidden | No |

*Bank enabled if turnScore > 0
**Keep enabled if selected dice have score > 0
***Bank enabled if turnScore > 0 OR valid selection exists

---

## User Interface Design

### App Component UI Structure
**Location**: `/App.tsx`

#### Layout Hierarchy
```
<Fullscreen Container> (min-h-screen, stone-900 background)
│
├─ <Modal> (conditional: win/farkle states)
│
└─ <Main Card> (max-w-4xl, stone-800, amber border)
   │
   ├─ <Header> (lines 60-63)
   │  ├─ Title: "FARKLE"
   │  └─ Subtitle: "Score 500 points to win!"
   │
   ├─ <Scoreboard> (lines 67-76)
   │  ├─ Total Score display
   │  └─ Turn Score display
   │
   ├─ <Game Area> (lines 79-119)
   │  ├─ [If NotStarted]
   │  │  └─ Start Game button
   │  └─ [If Started]
   │     ├─ Kept Dice Area (lines 92-98)
   │     └─ Rolled Dice Area (lines 100-116)
   │
   └─ <Controls> (lines 123-161)
      ├─ [If PlayerTurn]
      │  ├─ Roll Dice button
      │  └─ Bank Score button (conditional)
      └─ [If DiceRolled]
         ├─ Keep & Roll button
         └─ Bank Score button
```

#### Computed Values (lines 24-30)
```typescript
const selectedDice = useMemo(() => dice.filter(d => d.isSelected), [dice]);
const unselectedDice = useMemo(() => dice.filter(d => !d.isSelected), [dice]);
const scoreForSelection = useMemo(() => calculateScore(selectedDice.map(d => d.value)), [selectedDice]);

const canKeep = scoreForSelection > 0;
const canRoll = gameStatus === GameStatus.PlayerTurn;
const canBank = turnScore > 0 || (gameStatus === GameStatus.DiceRolled && canKeep);
```
- Memoized for performance
- Used to control button states
- Recalculate only when dependencies change

#### `renderDice()` Helper (lines 32-42)
**Purpose**: Reusable dice rendering logic

**Parameters**:
- `diceSet`: Array of dice to render
- `isKept`: Whether these are kept dice (affects styling and interactivity)

**Logic**:
- Maps each die to Die component
- Uses die.id as React key
- Passes isSelected state
- Attaches conditional onClick:
  - Only if not kept
  - Only if gameStatus is DiceRolled
  - Calls `handleSelectDie(d.id)`

#### Conditional Rendering Logic

##### Not Started State (lines 80-89)
- Centered message: "Ready to roll the dice?"
- Single "Start Game" button

##### Active Game State (lines 91-118)
- **Kept Dice Section**:
  - Shows count in header
  - Displays kept dice or "No dice kept yet" message
  - Dark background (`bg-black/20`)
  - Dice rendered with `isKept={true}`

- **Rolled Dice Section**:
  - Shows active dice count
  - Renders unselected dice first
  - Vertical separator if selections exist
  - Renders selected dice last (visual grouping)
  - Shows contextual messages if no dice

##### Control Buttons (lines 123-161)
**PlayerTurn State**:
- "Roll Dice (6)" or "Roll Again (X)" button
  - Label shows dice count
  - Disabled state managed by `canRoll`
- "Bank Score" button (if turnScore > 0)
  - Green color (`bg-lime-600`)
  - Disabled state managed by `canBank`

**DiceRolled State**:
- "Keep & Roll" button
  - Disabled if no valid selection
- "Bank Score" button
  - Always available if valid selection
  - Can bank immediately without keeping

### Design System

#### Color Palette
- **Background**: Stone-900 (dark brown)
- **Cards**: Stone-800 with transparency
- **Accents**: Amber-300 to Amber-800 (gold/yellow)
- **Success**: Lime-600 (banking actions)
- **Dice**: Amber-50 (off-white)
- **Borders**: Amber-700 to Amber-900

#### Theming
- **Font**: Cinzel (serif) - medieval tavern aesthetic
- **Textures**: Wood pattern background via transparenttextures.com
- **Shadows**: Heavy use of shadow-md, shadow-lg, shadow-xl
- **Borders**: Thick (border-4) for game elements
- **Transitions**: All interactive elements have hover and scale effects

#### Responsive Design
- Base: Mobile-first approach
- Breakpoint: `md:` for desktop adjustments
- Dice: w-16 → w-20 on desktop
- Padding and spacing adjust automatically
- Max-width constraint prevents too-wide layout

---

## Future Development Considerations

### Potential Features

#### 1. Multiplayer Support
**Required Changes**:
- Extend state to manage multiple players
- Add player turn rotation logic
- Update UI to show all player scores
- Implement turn indicator

**New Files**:
- `types.ts`: Add `Player` interface
- `hooks/useMultiplayerFarkle.ts`: Extended hook
- `components/PlayerCard.tsx`: Player info display

#### 2. Game Rules Variants
**Common Variants**:
- Different winning scores (10,000 is common)
- Must-score-500-to-enter rule
- Three pairs scoring (1500 points)
- Four pairs scoring (2000 points)
- Three pairs of 1-of-a-kind (1500 points)

**Implementation**:
- Add `gameMode` state variable
- Extend `calculateScore()` with variant logic
- Add settings modal for configuration
- Store preferences in localStorage

#### 3. Statistics & Achievements
**Potential Metrics**:
- Total games played
- Win/loss ratio
- Highest single turn score
- Most consecutive farkles
- Average score per game

**Implementation**:
- Create `utils/statistics.ts`
- Add localStorage persistence
- Create `components/StatsModal.tsx`
- Add achievement system with badges

#### 4. Animation Improvements
**Animation Opportunities**:
- Dice roll animation (tumbling effect)
- Scoring particles when dice are kept
- Smooth transitions between game states
- Celebratory animation on win

**Libraries to Consider**:
- Framer Motion for React animations
- React Spring for physics-based animations
- Custom CSS @keyframes for simple effects

#### 5. Sound Effects
**Audio Events**:
- Dice roll sound
- Dice selection click
- Scoring confirmation
- Bank success
- Farkle (sad trombone)
- Victory fanfare

**Implementation**:
- Create `hooks/useAudio.ts`
- Add audio toggle in settings
- Use Web Audio API or Howler.js

#### 6. AI Opponent
**Implementation Ideas**:
- Risk assessment algorithm
- Bank threshold based on total score
- Conservative vs. aggressive strategies
- Difficulty levels

**New Files**:
- `utils/aiPlayer.ts`: Decision logic
- Update `useFarkleGame` for AI turns

### Code Refactoring Opportunities

#### 1. Extract Magic Numbers
**Current**: Hardcoded values in components
**Improvement**: Move to constants or theme configuration
```typescript
// constants.ts
export const DICE_SIZE = { base: '4rem', md: '5rem' };
export const SCORE_THRESHOLDS = { safe: 300, risky: 200 };
```

#### 2. Separate Business Logic from UI Logic
**Current**: Some calculations in App.tsx
**Improvement**: Move all game logic to hook or utility functions
```typescript
// utils/gameRules.ts
export const canBankScore = (gameStatus, turnScore) => { ... };
export const canKeepDice = (selection) => { ... };
```

#### 3. Component Composition
**Current**: App.tsx is large (169 lines)
**Improvement**: Break into smaller components
- `components/GameBoard.tsx`: Dice areas
- `components/ScoreDisplay.tsx`: Scoreboard
- `components/GameControls.tsx`: Buttons
- `components/StartScreen.tsx`: Initial screen

#### 4. Custom Hooks
**Potential Extractions**:
- `useGameState()`: State management only
- `useGameActions()`: Action handlers only
- `useDiceRolls()`: Roll logic and farkle checking
- `useScoring()`: Score calculation wrapper

#### 5. Type Safety Improvements
**Enhancements**:
- Add branded types for scores
- Create discriminated union for GameStatus-specific state
- Add runtime validation with Zod or similar
- Generate OpenAPI types if adding backend

### Testing Strategy

#### Unit Tests
**Test Files to Create**:
1. `utils/scoring.test.ts`
   - Test all scoring combinations
   - Test edge cases (empty array, invalid selections)
   - Test farkle detection

2. `hooks/useFarkleGame.test.ts`
   - Test state transitions
   - Test action handlers
   - Mock random number generation

3. `components/Die.test.tsx`
   - Test rendering for all values
   - Test selection interactions
   - Test styling states

#### Integration Tests
- Full game flow tests
- User journey tests (Playwright or Cypress)
- Accessibility tests (axe-core)

### Performance Optimizations

#### Current Performance
- Memoization used in App.tsx (line 24-26)
- useMemo for die filtering
- useCallback for all handlers in hook

#### Future Optimizations
- Virtual scrolling if adding game history
- Web Workers for complex scoring calculations
- Code splitting for modals and settings
- Lazy loading for statistics/achievements

### Accessibility Improvements

#### Current State
- Semantic HTML structure
- Button elements for interactions
- Keyboard navigation possible

#### Enhancements Needed
- ARIA labels for dice state
- Screen reader announcements for scores
- Keyboard shortcuts for actions
- Focus management for modals
- High contrast mode support
- Reduced motion preference support

### Mobile Experience

#### Current Implementation
- Responsive sizing (md: breakpoint)
- Touch-friendly hit targets (dice size)
- Tailwind mobile-first approach

#### Potential Improvements
- PWA support (manifest.json, service worker)
- Install prompt
- Offline play capability
- Portrait/landscape optimization
- Gesture support (swipe to bank, etc.)

### Backend Integration

#### If Adding Server
**Potential Features**:
- User accounts and profiles
- Global leaderboards
- Online multiplayer
- Game replay system
- Cloud save

**Tech Stack Suggestions**:
- Node.js + Express or Fastify
- PostgreSQL or MongoDB
- Socket.io for real-time play
- Redis for session management
- JWT for authentication

### Development Workflow

#### Current Setup
- Vite dev server (fast hot reload)
- TypeScript for type safety
- React 19 (latest stable)

#### Recommended Additions
- **Linting**: ESLint with React hooks plugin
- **Formatting**: Prettier
- **Pre-commit**: Husky + lint-staged
- **Testing**: Vitest (Vite-native) or Jest
- **CI/CD**: GitHub Actions for builds
- **Documentation**: Storybook for components

### File Organization for Growth

#### Current Structure
```
farkle/
├── components/
├── hooks/
├── utils/
├── App.tsx
├── types.ts
├── constants.ts
└── index.tsx
```

#### Suggested Structure for Larger App
```
farkle/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Die/
│   │   │   ├── GameBoard/
│   │   │   └── ScoreDisplay/
│   │   ├── ui/
│   │   │   ├── Modal/
│   │   │   └── Button/
│   │   └── layout/
│   ├── hooks/
│   ├── utils/
│   │   ├── scoring/
│   │   └── validation/
│   ├── types/
│   ├── constants/
│   ├── styles/
│   ├── contexts/
│   ├── App.tsx
│   └── index.tsx
├── tests/
├── public/
└── docs/
```

---

## Summary

This Farkle implementation is a well-structured, type-safe React application with clear separation between:
- **Presentation** (components)
- **State Management** (hooks)
- **Business Logic** (utilities)
- **Type Definitions** (types)
- **Configuration** (constants)

The codebase is ready for expansion into multiplayer, AI opponents, enhanced UI/UX, and backend integration. The modular architecture makes it straightforward to add features without major refactoring.

**Key Strengths**:
- Strong TypeScript typing throughout
- Clean state management with custom hook
- Pure functions for game logic (testable)
- Memoization for performance
- Responsive design with Tailwind
- Clear game flow and state transitions

**Recommended Next Steps**:
1. Add unit tests for scoring logic
2. Implement game rules variants
3. Add animations for better UX
4. Consider PWA features for mobile
5. Add comprehensive error handling and user feedback