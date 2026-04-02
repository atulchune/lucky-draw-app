'use client';

import { FlipCard } from './flip-card';

interface CardGridProps {
  assignments: Record<string, number>;
  flippedCards: Record<string, boolean>;
  onCardFlip: (playerName: string) => void;
  disableFlips?: boolean;
  autoReveal?: boolean;
}

export function CardGrid({
  assignments,
  flippedCards,
  onCardFlip,
  disableFlips = false,
  autoReveal = false,
}: CardGridProps) {
  const players = Object.keys(assignments);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 justify-items-center py-6">
        {players.map((playerName, index) => (
          <FlipCard
            key={playerName}
            playerName={playerName}
            position={assignments[playerName]}
            isFlipped={flippedCards[playerName] || false}
            onFlip={() => onCardFlip(playerName)}
            disabled={disableFlips}
            autoReveal={autoReveal}
            autoRevealDelay={index * 300}
          />
        ))}
      </div>
    </div>
  );
}
