'use client';

import { useState } from 'react';
import { PlayerForm } from './player-form';
import { FlipCard } from './flip-card';
import { AssignmentTable } from './assignment-table';
import { Button } from '@/components/ui/button';
import { shuffleArray } from '@/lib/game-utils';
import { exportToPDF } from '@/lib/pdf-utils';

type Assignment = {
  teamName: string;
  position: number;
  playerName: string;
};

type Card = {
  id: string;
  teamName: string;
  position: number;
  isFlipped: boolean;
};

type GameState = {
  phase: 'setup' | 'playing';
  playerCount: number;
  team1Name: string;
  team2Name: string;
  cards: Card[];
  assignments: Assignment[];
};

export function GameContainer() {
  const [state, setState] = useState<GameState>({
    phase: 'setup',
    playerCount: 0,
    team1Name: '',
    team2Name: '',
    cards: [],
    assignments: [],
  });

  const handleStartGame = (data: { playerCount: number; team1Name: string; team2Name: string }) => {
    // Create N cards for each team (1 to N positions for each)
    const cards: Card[] = [];
    let cardId = 0;

    // Team 1 cards
    for (let i = 1; i <= data.playerCount; i++) {
      cards.push({
        id: `card-${cardId++}`,
        teamName: data.team1Name,
        position: i,
        isFlipped: false,
      });
    }

    // Team 2 cards
    for (let i = 1; i <= data.playerCount; i++) {
      cards.push({
        id: `card-${cardId++}`,
        teamName: data.team2Name,
        position: i,
        isFlipped: false,
      });
    }

    setState({
      phase: 'playing',
      playerCount: data.playerCount,
      team1Name: data.team1Name,
      team2Name: data.team2Name,
      cards: shuffleArray(cards),
      assignments: [],
    });
  };

  const handleFlipCard = (cardId: string) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.id === cardId ? { ...card, isFlipped: !card.isFlipped } : card
      ),
    }));
  };

  const handleAssignPlayer = (cardId: string, playerName: string) => {
    const card = state.cards.find((c) => c.id === cardId);
    if (!card) return;

    const assignment: Assignment = {
      teamName: card.teamName,
      position: card.position,
      playerName,
    };

    setState((prev) => ({
      ...prev,
      assignments: [...prev.assignments, assignment],
      cards: prev.cards.filter((c) => c.id !== cardId),
    }));
  };

  const handleReset = () => {
    setState({
      phase: 'setup',
      playerCount: 0,
      team1Name: '',
      team2Name: '',
      cards: [],
      assignments: [],
    });
  };

  const handleExportPDF = () => {
    exportToPDF(state.assignments, state.team1Name, state.team2Name);
  };

  const handleExportCSV = () => {
    const csv = [
      'Team,Position,Player Name',
      ...state.assignments
        .sort((a, b) => a.position - b.position)
        .map((a) => `${a.teamName},${a.position},${a.playerName}`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucky-draw-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (state.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
              Lucky Draw
            </h1>
            <p className="text-lg text-slate-600">
              Assign player positions to teams
            </p>
          </div>
          <PlayerForm onSubmit={handleStartGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
            Lucky Draw Game
          </h1>
          <p className="text-slate-600 mb-2">
            {state.assignments.length} / {state.playerCount * 2} assignments completed
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <span className="font-semibold text-blue-600">{state.team1Name}</span>: {state.assignments.filter((a) => a.teamName === state.team1Name).length} / {state.playerCount}
            </div>
            <div>
              <span className="font-semibold text-amber-600">{state.team2Name}</span>: {state.assignments.filter((a) => a.teamName === state.team2Name).length} / {state.playerCount}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Cards Grid */}
          <div className="flex flex-wrap gap-6 justify-center">
            {state.cards.map((card) => (
              <FlipCard
                key={card.id}
                cardId={card.id}
                teamName={card.teamName}
                position={card.position}
                isFlipped={card.isFlipped}
                onFlip={() => handleFlipCard(card.id)}
                onAssign={(playerName) => handleAssignPlayer(card.id, playerName)}
                disabled={false}
              />
            ))}
          </div>

          {/* Assignment Table */}
          {state.assignments.length > 0 && (
            <AssignmentTable assignments={state.assignments} />
          )}

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {state.assignments.length > 0 && (
              <>
                <Button
                  onClick={handleExportPDF}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6"
                >
                  Export PDF
                </Button>
                <Button
                  onClick={handleExportCSV}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6"
                >
                  Export CSV
                </Button>
              </>
            )}
            <Button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6"
            >
              Reset Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
