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
        relative w-80 min-h-96 cursor-pointer
        transition-transform duration-300 hover:scale-105
        ${disabled ? 'opacity-75 cursor-not-allowed hover:scale-100' : ''}
      `}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className={`
          relative w-full h-full transition-transform duration-600
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: displayFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front side - Click to flip */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white font-bold text-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          onClick={handleClick}
        >
          <div className="text-2xl">Click to Flip</div>
        </div>

        {/* Back side - Team + Position + Input */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="space-y-4 w-full">
            <div className="text-center">
              <div className="text-sm opacity-75 text-white">Team</div>
              <div className="text-2xl font-bold text-white">{teamName}</div>
            </div>

            <div className="text-center">
              <div className="text-sm opacity-75 text-white">Position</div>
              <div className="text-5xl font-black text-white">{position}</div>
            </div>

            <div className="border-t-2 border-white/30 pt-4 space-y-3">
              <label className="text-sm font-semibold text-white block">Assign Player</label>
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name"
                onKeyPress={(e) => e.key === 'Enter' && handleAssign()}
                className="text-center text-lg"
              />
              <Button
                onClick={handleAssign}
                disabled={!playerName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                Save
              </Button>
            </div>

            {assignedPlayer && (
              <div className="bg-white/20 rounded p-2 text-center">
                <div className="text-xs text-white opacity-75">Assigned to</div>
                <div className="text-sm font-bold text-white">{assignedPlayer}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
