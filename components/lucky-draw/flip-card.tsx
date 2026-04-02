'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import '@/styles/animations.css';

interface FlipCardProps {
  cardId: string;
  teamName: string;
  position: number;
  isFlipped: boolean;
  onFlip: () => void;
  onAssign: (playerName: string) => void;
  assignedPlayer?: string;
  disabled?: boolean;
}

export function FlipCard({
  cardId,
  teamName,
  position,
  isFlipped,
  onFlip,
  onAssign,
  assignedPlayer = '',
  disabled = false,
}: FlipCardProps) {
  const [displayFlipped, setDisplayFlipped] = useState(isFlipped);
  const [playerName, setPlayerName] = useState(assignedPlayer);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setDisplayFlipped(isFlipped);
  }, [isFlipped]);

  useEffect(() => {
    setPlayerName(assignedPlayer);
  }, [assignedPlayer]);

  const handleClick = () => {
    if (!disabled && !isAnimating) {
      setIsAnimating(true);
      onFlip();
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const handleAssign = () => {
    if (playerName.trim()) {
      onAssign(playerName.trim());
      setPlayerName('');
    }
  };

  return (
    <div
      className={`
        relative w-full max-w-sm transition-all duration-300 cursor-pointer
        ${!displayFlipped ? 'h-20' : 'h-auto'}
        ${disabled ? 'opacity-75 cursor-not-allowed' : ''}
      `}
      style={{
        perspective: '1000px',
      }}
    >
      {!displayFlipped ? (
        /* Front side - Compact view with only ? */
        <div
          className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-white font-bold text-center hover:shadow-xl transition-shadow hover:from-blue-600 hover:to-blue-700"
          onClick={handleClick}
        >
          <div className="text-5xl md:text-6xl font-black">?</div>
        </div>
      ) : (
        /* Back side - Expanded view with input */
        <div className="w-full bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg p-6 space-y-4">
          <div className="text-center">
            <div className="text-sm opacity-75 text-white">Team</div>
            <div className="text-2xl font-bold text-white">{teamName}</div>
          </div>

          <div className="text-center">
            <div className="text-sm opacity-75 text-white">Position</div>
            <div className="text-5xl font-black text-white animate-pulse">
              {position || '?'}
            </div>
          </div>

          <div className="border-t-2 border-white/30 pt-4 space-y-3">
            <label className="text-sm font-semibold text-white block">Player Name</label>
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              onKeyPress={(e) => e.key === 'Enter' && handleAssign()}
              className="text-center text-base font-medium"
              disabled={!!assignedPlayer}
            />
            {!assignedPlayer ? (
              <Button
                onClick={handleAssign}
                disabled={!playerName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                Save
              </Button>
            ) : (
              <div className="bg-white/20 rounded p-3 text-center">
                <div className="text-xs text-white opacity-75 mb-1">Assigned to</div>
                <div className="text-base font-bold text-white">{assignedPlayer}</div>
              </div>
            )}
          </div>

          <Button
            onClick={handleClick}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
