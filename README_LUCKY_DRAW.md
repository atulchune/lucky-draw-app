# Lucky Draw - Player Position Selector

A modern, interactive web application for randomly assigning players to team positions using a card flip mechanic.

## Features

### Setup Phase
1. **Input Configuration**
   - Number of Players (1-50)
   - Team 1 Name (e.g., "Red Team", "Team A")
   - Team 2 Name (e.g., "Blue Team", "Team B")

### Game Phase
1. **Interactive Card Flip**
   - Front of card shows: "Click to Flip"
   - Back of card shows:
     - Team Name
     - Position Number
     - Input field to assign player name
     - Save button to confirm assignment

2. **Assignment Flow**
   - Click "Click to Flip" to reveal the card back
   - Read the Team name and Position
   - Enter the player's name in the input field
   - Click "Save" to record the assignment
   - Card is removed from the game after assignment
   - Remaining cards continue to be available

3. **Live Results Table**
   - Shows all completed assignments
   - Columns: Team, Position, Player Name
   - Sorted by position number

### Export Options
- **Export PDF**: Download results as a formatted PDF document
- **Export CSV**: Download results as a CSV file for spreadsheets
- **Reset Game**: Start over with a new setup

## Flow Diagram

```
┌─────────────────────────────────────┐
│      Setup Phase                    │
│  - Number of Players                │
│  - Team 1 Name                      │
│  - Team 2 Name                      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Game Phase - Card Flip         │
│  Front: "Click to Flip"             │
│  Back:  Team Name + Position        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Assign Player Name to Position    │
│   Input Field + Save Button         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Display in Results Table          │
│   Team | Position | Player Name     │
└────────────┬────────────────────────┘
             │
    Repeat until all cards assigned
             │
             ▼
┌─────────────────────────────────────┐
│   Export (PDF/CSV) or Reset         │
└─────────────────────────────────────┘
```

## Technical Details

### State Management
- Uses React `useState` for game state management
- Tracks cards with their team, position, and flip status
- Maintains a list of completed assignments

### Card Shuffling
- Uses Fisher-Yates shuffle algorithm for fair randomization
- Cards are shuffled when the game starts

### Export Functionality
- **PDF Export**: Uses html2pdf.js library for client-side PDF generation
- **CSV Export**: Creates a downloadable CSV file with proper formatting

### Data Structure

**Card Object:**
```typescript
{
  id: string;
  teamName: string;
  position: number;
  isFlipped: boolean;
}
```

**Assignment Object:**
```typescript
{
  teamName: string;
  position: number;
  playerName: string;
}
```

## Technologies Used

- **Framework**: Next.js 16
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Export**: html2pdf.js
- **Language**: TypeScript
- **State**: React Hooks (useState)

## Responsive Design

- **Mobile**: Optimized card layout for small screens
- **Tablet**: Medium-sized card displays
- **Desktop**: Full-featured layout with side-by-side display

## Color Scheme

- **Primary Blue**: Card flip animation and highlights
- **Amber/Gold**: Card back (reveal) side
- **Green**: Export button
- **Red**: Reset button
- **Purple**: PDF export button

## How to Use

1. **Start the Application**
   ```bash
   pnpm dev
   ```

2. **Configure the Game**
   - Enter number of players
   - Name your teams
   - Click "Start Game"

3. **Play the Game**
   - Click each card to flip and reveal
   - Enter player names
   - Click Save to confirm
   - Watch results update in real-time

4. **Export Results**
   - Choose PDF or CSV export
   - File will download to your computer
   - Use Reset Game to start over

## Customization

### Change Number of Teams
Edit `game-container.tsx` to support more than 2 teams:
```typescript
const teams = [team1Name, team2Name, team3Name, ...];
const cards = positions.map((position, index) => ({
  teamName: teams[index % teams.length],
  ...
}));
```

### Modify Styling
Update colors in component files using Tailwind classes:
- Card front: `from-blue-500 to-blue-600`
- Card back: `from-amber-400 to-amber-500`

### Adjust Card Sizes
Edit `FlipCard` component dimensions in `flip-card.tsx`:
```typescript
className="relative w-80 min-h-96 cursor-pointer"
```

## Accessibility

- Semantic HTML structure
- Proper button and form labels
- Keyboard navigation support
- High contrast colors for readability

## Future Enhancements

- [ ] Multi-team support (3+ teams)
- [ ] Player name autocomplete
- [ ] Undo assignment feature
- [ ] Duplicate assignment prevention
- [ ] Sound effects for card flip
- [ ] Animation speed control
- [ ] Dark mode support

---

Built with care for managing team assignments efficiently!
