'use client';

import { useState, useReducer } from 'react';
import { PlayerForm } from './player-form';
import { CardGrid } from './card-grid';
import { AssignmentTable } from './assignment-table';
import { ControlPanel } from './control-panel';
import { generateRandomAssignment, shuffleArray } from '@/lib/game-utils';

type GameState = {
  phase: 'setup' | 'playing' | 'results';
  playerCount: number;
  positionCount: number;
  assignments: Record<string, number>;
  flippedCards: Record<string, boolean>;
  history: Array<{ assignments: Record<string, number>; flipped: Record<string, boolean> }>;
};

type GameAction =
  | { type: 'START_GAME'; playerCount: number; positionCount: number }
  | { type: 'FLIP_CARD'; playerName: string }
  | { type: 'REVEAL_ALL' }
  | { type: 'HIDE_ALL' }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'FINISH_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const assignments = generateRandomAssignment(action.playerCount, action.positionCount);
      return {
        ...state,
        phase: 'playing',
        playerCount: action.playerCount,
        positionCount: action.positionCount,
        assignments,
        flippedCards: {},
        history: [],
      };
    }

    case 'FLIP_CARD': {
      const newFlipped = {
        ...state.flippedCards,
        [action.playerName]: !state.flippedCards[action.playerName],
      };
      return {
        ...state,
        flippedCards: newFlipped,
        history: [
          ...state.history,
          { assignments: state.assignments, flipped: state.flippedCards },
        ],
      };
    }

    case 'REVEAL_ALL': {
      const revealed: Record<string, boolean> = {};
      Object.keys(state.assignments).forEach((player) => {
        revealed[player] = true;
      });
      return {
        ...state,
        flippedCards: revealed,
        history: [
          ...state.history,
          { assignments: state.assignments, flipped: state.flippedCards },
        ],
      };
    }

    case 'HIDE_ALL': {
      return {
        ...state,
        flippedCards: {},
        history: [
          ...state.history,
          { assignments: state.assignments, flipped: state.flippedCards },
        ],
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const previousState = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        ...state,
        flippedCards: previousState.flipped,
        history: newHistory,
      };
    }

    case 'RESET': {
      return {
        phase: 'setup',
        playerCount: 0,
        positionCount: 0,
        assignments: {},
        flippedCards: {},
        history: [],
      };
    }

    case 'FINISH_GAME': {
      return {
        ...state,
        phase: 'results',
      };
    }

    default:
      return state;
  }
}

export function GameContainer() {
  const [state, dispatch] = useReducer(gameReducer, {
    phase: 'setup',
    playerCount: 0,
    positionCount: 0,
    assignments: {},
    flippedCards: {},
    history: [],
  });

  const handleStartGame = (playerCount: number, positionCount: number) => {
    dispatch({ type: 'START_GAME', playerCount, positionCount });
  };

  const handleFlipCard = (playerName: string) => {
    dispatch({ type: 'FLIP_CARD', playerName });
  };

  const handleRevealAll = () => {
    dispatch({ type: 'REVEAL_ALL' });
  };

  const handleHideAll = () => {
    dispatch({ type: 'HIDE_ALL' });
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  const handleExport = () => {
    const csv = Object.entries(state.assignments)
      .sort((a, b) => a[1] - b[1])
      .map(([player, position]) => `${player},${position}`)
      .join('\n');

    const blob = new Blob([`Player,Position\n${csv}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucky-draw-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const allRevealed = Object.keys(state.assignments).every(
    (player) => state.flippedCards[player]
  );

  if (state.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
              Lucky Draw
            </h1>
            <p className="text-lg text-slate-600">
              Assign player positions randomly with an interactive card flip experience
            </p>
          </div>
          <PlayerForm onSubmit={handleStartGame} />
        </div>
      </div>
    );
  }

  if (state.phase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Lucky Draw Game
            </h1>
            <p className="text-slate-600">
              Click cards to flip and reveal positions
            </p>
          </div>

          <div className="space-y-6">
            <CardGrid
              assignments={state.assignments}
              flippedCards={state.flippedCards}
              onCardFlip={handleFlipCard}
            />

            <ControlPanel
              onReset={handleReset}
              onUndo={handleUndo}
              onExport={handleExport}
              onRevealAll={handleRevealAll}
              onHideAll={handleHideAll}
              canUndo={state.history.length > 0}
              allRevealed={allRevealed}
            />

            <AssignmentTable assignments={state.assignments} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
