'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface PlayerFormProps {
  onSubmit: (playerCount: number, positionCount: number) => void;
  isLoading?: boolean;
}

export function PlayerForm({ onSubmit, isLoading = false }: PlayerFormProps) {
  const [playerCount, setPlayerCount] = useState('4');
  const [positionCount, setPositionCount] = useState('5');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const players = parseInt(playerCount, 10);
    const positions = parseInt(positionCount, 10);

    if (isNaN(players) || players < 1) {
      setError('Please enter a valid number of players (minimum 1)');
      return;
    }

    if (isNaN(positions) || positions < 1) {
      setError('Please enter a valid number of positions (minimum 1)');
      return;
    }

    if (players > positions) {
      setError('Number of players cannot exceed number of positions');
      return;
    }

    onSubmit(players, positions);
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
          <Label htmlFor="positions" className="text-base font-semibold text-slate-700">
            Number of Positions
          </Label>
          <Input
            id="positions"
            type="number"
            min="1"
            max="50"
            value={positionCount}
            onChange={(e) => setPositionCount(e.target.value)}
            className="text-lg font-medium"
            placeholder="Enter number of positions"
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
