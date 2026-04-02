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
        relative w-full max-w-sm transition-all duration-500 cursor-pointer
        ${!displayFlipped ? 'h-24' : 'h-auto'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      style={{
        perspective: '1000px',
      }}
    >
      {!displayFlipped ? (
        /* Front side - Compact view with only ? */
        <div
          className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-2xl p-4 flex flex-col items-center justify-center text-white font-bold text-center hover:shadow-xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
          onClick={handleClick}
        >
          <div className="text-6xl md:text-7xl font-black animate-bounce">?</div>
          <div className="text-xs mt-2 opacity-90">Tap to reveal</div>
        </div>
      ) : (
        /* Back side - Expanded view with input */
        <div className="w-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 rounded-xl shadow-2xl p-8 space-y-6 border-4 border-amber-600">
          {/* Team Name */}
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-xs font-bold opacity-80 text-white uppercase tracking-widest">Team Assigned</div>
            <div className="text-3xl font-black text-white mt-2 drop-shadow-lg">{teamName}</div>
          </div>

          {/* Position Display */}
          <div className="text-center">
            <div className="text-xs font-bold opacity-80 text-white uppercase tracking-widest">Your Lucky Position</div>
            <div className="text-7xl font-black text-white mt-3 drop-shadow-xl animate-pulse">
              {position || '?'}
            </div>
          </div>

          {/* Input Section */}
          <div className="border-t-4 border-white/40 pt-6 space-y-4">
            <label className="text-sm font-bold text-white block uppercase tracking-wider">Enter Your Name</label>
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Type your name"
              onKeyPress={(e) => e.key === 'Enter' && handleAssign()}
              className="text-center text-lg font-semibold bg-white/90 text-slate-900 placeholder-slate-400 rounded-lg py-3"
              disabled={!!assignedPlayer}
            />
            {!assignedPlayer ? (
              <Button
                onClick={handleAssign}
                disabled={!playerName.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                ✓ Save Assignment
              </Button>
            ) : (
              <div className="bg-green-500/30 border-2 border-white rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-xs text-white opacity-90 font-bold uppercase">Successfully Assigned</div>
                <div className="text-xl font-black text-white mt-2 drop-shadow-lg">{assignedPlayer}</div>
              </div>
            )}
          </div>

          <Button
            onClick={handleClick}
            className="w-full bg-red-500/80 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            ✕ Close Card
          </Button>
        </div>
      )}
    </div>
  );
}
