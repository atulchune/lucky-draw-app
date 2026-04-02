# Lucky Draw - Player Position Selector

An interactive card flip game for randomly assigning player positions. Perfect for tournaments, team assignments, and games that need fair random position allocation.

## Features

### Core Features
- **Random Assignment Generator**: Uses Fisher-Yates shuffle algorithm to generate fair, random position assignments
- **Interactive Card Flip**: Beautiful 3D card flip animations with player names on front and positions on back
- **Responsive Design**: Works on mobile (2-3 cards per row), tablet (4 cards), and desktop (5 cards per row)

### Game Controls
- **Reveal All / Hide All**: Quickly show or hide all positions with a single click
- **Undo**: Step back through your flip history to correct mistakes
- **Reset**: Start over with new player counts and positions
- **Export Results**: Download assignments as CSV file for record-keeping

### User Experience
- **Smooth Animations**: CSS 3D flip animations with staggered card reveals
- **Live Results Table**: Always visible summary of assignments sorted by position
- **Input Validation**: Prevents invalid player/position counts
- **Error Feedback**: Clear error messages for invalid inputs

## How to Use

### Getting Started
1. Enter the number of players
2. Enter the number of positions (must be ≥ number of players)
3. Click "Start Game"

### Playing the Game
- Click any card to flip it and reveal the assigned position
- Click multiple cards to reveal different players' positions
- Use the control panel buttons for quick actions

### Game Flow
- **Setup Phase**: Configure player and position counts
- **Playing Phase**: Flip cards to reveal assignments, manage game state
- **Results Summary**: Always visible table showing all assignments

## Component Structure

### Components
- `PlayerForm`: Setup form for game configuration
- `FlipCard`: Interactive 3D card with flip animation
- `CardGrid`: Responsive grid layout for cards
- `AssignmentTable`: Results summary table
- `ControlPanel`: Action buttons for game control
- `AssignmentInput`: Manual assignment form (extensible for future features)
- `GameContainer`: Main game state management

### Utilities
- `game-utils.ts`: Core game logic including:
  - Fisher-Yates shuffle algorithm
  - Random assignment generation
  - Assignment validation

### Styling
- `animations.css`: All animation keyframes and effects
  - Flip animations with 3D perspective
  - Slide-in animations
  - Confetti effect (prepared for future use)

## Technical Details

### State Management
Uses React `useReducer` for managing game state:
- **Phases**: setup, playing
- **State tracking**: Assignments, flipped cards, history
- **Undo capability**: History stack for reverting actions

### Responsive Breakpoints
- Mobile: 2 columns (< 640px)
- Tablet: 3 columns (640px - 1024px)
- Desktop: 5 columns (> 1024px)

### Color Scheme
- Primary: Blue (game branding)
- Accent: Amber/Gold (position reveal)
- Neutral: Slate (background and text)

## Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancement Ideas
- Sound effects on card flip
- Auto-reveal feature with delay
- Confetti celebration animation
- Player/Position customization (names, colors)
- Multiple game modes (tournament brackets, team assignments)
- Statistics tracking
- Multiplayer support

## Installation & Running

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The application will be available at `http://localhost:3000`
