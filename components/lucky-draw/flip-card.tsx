'use client';

import { useState, useEffect } from 'react';
import '@/styles/animations.css';

interface FlipCardProps {
  playerName: string;
  position: number | null;
  isFlipped: boolean;
  onFlip: () => void;
  disabled?: boolean;
  autoReveal?: boolean;
  autoRevealDelay?: number;
}

export function FlipCard({
  playerName,
  position,
  isFlipped,
  onFlip,
  disabled = false,
  autoReveal = false,
  autoRevealDelay = 0,
}: FlipCardProps) {
  const [displayFlipped, setDisplayFlipped] = useState(isFlipped);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoReveal && autoRevealDelay > 0) {
      const timer = setTimeout(() => {
        handleClick();
      }, autoRevealDelay);
      return () => clearTimeout(timer);
    }
  }, [autoReveal, autoRevealDelay]);

  useEffect(() => {
    setDisplayFlipped(isFlipped);
  }, [isFlipped]);

  const handleClick = () => {
    if (!disabled && !isAnimating) {
      setIsAnimating(true);
      onFlip();
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative w-24 h-32 md:w-28 md:h-40 cursor-pointer
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
          ${displayFlipped ? 'flip' : 'flip-reverse'}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: displayFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front side - Player Name */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 flex flex-col items-center justify-center text-white font-bold text-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="text-xs md:text-sm opacity-75">Player</div>
          <div className="text-sm md:text-lg break-words line-clamp-3">{playerName}</div>
        </div>

        {/* Back side - Position */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg p-4 flex items-center justify-center text-white font-bold"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs md:text-sm opacity-75">Position</div>
            <div className="text-3xl md:text-5xl font-black">{position || '?'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
