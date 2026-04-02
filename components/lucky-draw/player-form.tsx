'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface GameSetupData {
  playerCount: number;
  team1Name: string;
  team2Name: string;
}

interface PlayerFormProps {
  onSubmit: (data: GameSetupData) => void;
  isLoading?: boolean;
}

export function PlayerForm({ onSubmit, isLoading = false }: PlayerFormProps) {
  const [playerCount, setPlayerCount] = useState('4');
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const players = parseInt(playerCount, 10);

    if (isNaN(players) || players < 1) {
      setError('Please enter a valid number of players (minimum 1)');
      return;
    }

    if (!team1Name.trim()) {
      setError('Please enter Team 1 name');
      return;
    }

    if (!team2Name.trim()) {
      setError('Please enter Team 2 name');
      return;
    }

    onSubmit({ playerCount: players, team1Name: team1Name.trim(), team2Name: team2Name.trim() });
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="players" className="text-base font-semibold text-slate-700">
            Number of Players
          </Label>
          <Input
            id="players"
            type="number"
            min="1"
            max="50"
            value={playerCount}
            onChange={(e) => setPlayerCount(e.target.value)}
            className="text-lg font-medium"
            placeholder="Enter number of players"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team1" className="text-base font-semibold text-slate-700">
            Team 1 Name
          </Label>
          <Input
            id="team1"
            type="text"
            value={team1Name}
            onChange={(e) => setTeam1Name(e.target.value)}
            className="text-lg font-medium"
            placeholder="Enter Team 1 name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team2" className="text-base font-semibold text-slate-700">
            Team 2 Name
          </Label>
          <Input
            id="team2"
            type="text"
            value={team2Name}
            onChange={(e) => setTeam2Name(e.target.value)}
            className="text-lg font-medium"
            placeholder="Enter Team 2 name"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
        >
          {isLoading ? 'Preparing Game...' : 'Start Game'}
        </Button>
      </form>
    </Card>
  );
}
