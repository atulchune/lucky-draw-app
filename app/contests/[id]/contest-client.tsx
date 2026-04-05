'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Position {
  id: string;
  team_name: string;
  position_number: number;
  assigned_user_id: string | null;
  winner_rank: number | null;
}

interface ContestClientProps {
  contestId: string;
  isCreator: boolean;
  userId: string;
  contestStatus: string;
  initialPositions: Position[];
}

export default function ContestClient({
  contestId,
  isCreator,
  userId,
  contestStatus,
  initialPositions,
}: ContestClientProps) {
  const supabase = createClient();
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const [revealedPositions, setRevealedPositions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleCardFlip = (positionId: string) => {
    if (flippedCards.has(positionId)) {
      // Closing card
      setFlippedCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(positionId);
        return newSet;
      });
    } else {
      // Opening card - reveal random position if not yet revealed
      if (!revealedPositions[positionId]) {
        const position = positions.find((p) => p.id === positionId);
        if (position) {
          // Get available positions for this team
          const usedPositions = positions
            .filter((p) => p.team_name === position.team_name && p.assigned_user_id)
            .map((p) => p.position_number);

          const availablePositions = Array.from(
            { length: 10 }, // Assuming max 10 positions
            (_, i) => i + 1
          ).filter(
            (pos) =>
              pos <= (positions.length / 2) &&
              !usedPositions.includes(pos) &&
              !Object.values(revealedPositions).includes(pos)
          );

          if (availablePositions.length > 0) {
            const randomPos =
              availablePositions[Math.floor(Math.random() * availablePositions.length)];
            setRevealedPositions((prev) => ({
              ...prev,
              [positionId]: randomPos,
            }));
          }
        }
      }

      setFlippedCards((prev) => {
        const newSet = new Set(prev);
        newSet.add(positionId);
        return newSet;
      });
    }
  };

  const handleSavePlayer = async (positionId: string) => {
    const playerName = playerNames[positionId];
    if (!playerName || !playerName.trim()) return;

    setLoading(true);
    try {
      const revealedPos = revealedPositions[positionId];
      const position = positions.find((p) => p.id === positionId);

      if (!position || !revealedPos) return;

      // Update position with assigned user
      const { error } = await supabase
        .from('positions')
        .update({
          assigned_user_id: userId,
          position_number: revealedPos,
        })
        .eq('id', positionId);

      if (error) throw error;

      // Update local state
      setPositions((prev) =>
        prev.map((p) =>
          p.id === positionId
            ? { ...p, assigned_user_id: userId, position_number: revealedPos }
            : p
        )
      );

      // Clear inputs
      setPlayerNames((prev) => {
        const newNames = { ...prev };
        delete newNames[positionId];
        return newNames;
      });

      // Close card
      setFlippedCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(positionId);
        return newSet;
      });
    } catch (err) {
      console.error('Error saving player:', err);
      alert('Failed to save player assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWinner = async (positionId: string, rank: 1 | 2 | 3) => {
    if (!isCreator) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('positions')
        .update({ winner_rank: rank })
        .eq('id', positionId);

      if (error) throw error;

      setPositions((prev) =>
        prev.map((p) => (p.id === positionId ? { ...p, winner_rank: rank } : p))
      );
    } catch (err) {
      console.error('Error marking winner:', err);
      alert('Failed to mark winner');
    } finally {
      setLoading(false);
    }
  };

  // Group positions by team
  const team1Positions = positions.filter((p) => p.team_name === positions[0]?.team_name);
  const team2Positions = positions.filter((p) => p.team_name === positions[1]?.team_name);

  return (
    <div className="space-y-12">
      {/* Team 1 */}
      {team1Positions.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-blue-900 mb-6">{team1Positions[0].team_name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {team1Positions.map((position) => (
              <CardComponent
                key={position.id}
                position={position}
                isFlipped={flippedCards.has(position.id)}
                onFlip={() => handleCardFlip(position.id)}
                revealedPosition={revealedPositions[position.id]}
                playerName={playerNames[position.id] || ''}
                onPlayerNameChange={(name) =>
                  setPlayerNames((prev) => ({ ...prev, [position.id]: name }))
                }
                onSave={() => handleSavePlayer(position.id)}
                isCreator={isCreator}
                onMarkWinner={(rank) => handleMarkWinner(position.id, rank)}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Team 2 */}
      {team2Positions.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-amber-900 mb-6">{team2Positions[0].team_name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {team2Positions.map((position) => (
              <CardComponent
                key={position.id}
                position={position}
                isFlipped={flippedCards.has(position.id)}
                onFlip={() => handleCardFlip(position.id)}
                revealedPosition={revealedPositions[position.id]}
                playerName={playerNames[position.id] || ''}
                onPlayerNameChange={(name) =>
                  setPlayerNames((prev) => ({ ...prev, [position.id]: name }))
                }
                onSave={() => handleSavePlayer(position.id)}
                isCreator={isCreator}
                onMarkWinner={(rank) => handleMarkWinner(position.id, rank)}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CardComponentProps {
  position: Position;
  isFlipped: boolean;
  onFlip: () => void;
  revealedPosition?: number;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onSave: () => void;
  isCreator: boolean;
  onMarkWinner: (rank: 1 | 2 | 3) => void;
  loading: boolean;
}

function CardComponent({
  position,
  isFlipped,
  onFlip,
  revealedPosition,
  playerName,
  onPlayerNameChange,
  onSave,
  isCreator,
  onMarkWinner,
  loading,
}: CardComponentProps) {
  if (position.assigned_user_id && position.assigned_user_id) {
    // Card already assigned
    return (
      <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg shadow-lg p-6 border-2 border-green-300">
        <div className="text-center space-y-4">
          <div className="text-5xl font-black text-green-700">{position.position_number}</div>
          <div className="text-sm font-bold text-green-600 uppercase">Assigned</div>
          {position.winner_rank && (
            <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
              {position.winner_rank === 1
                ? '🥇 1st Place'
                : position.winner_rank === 2
                  ? '🥈 2nd Place'
                  : '🥉 3rd Place'}
            </div>
          )}
          {isCreator && !position.winner_rank && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => onMarkWinner(1)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
              >
                1st
              </Button>
              <Button
                size="sm"
                onClick={() => onMarkWinner(2)}
                className="bg-gray-400 hover:bg-gray-500 text-white text-xs"
              >
                2nd
              </Button>
              <Button
                size="sm"
                onClick={() => onMarkWinner(3)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              >
                3rd
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isFlipped) {
    return (
      <div
        onClick={onFlip}
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 h-32 flex items-center justify-center cursor-pointer hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95"
      >
        <div className="text-center">
          <div className="text-6xl font-black text-white">?</div>
          <div className="text-xs text-blue-100 mt-2">Tap to reveal</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg p-4 space-y-4">
      <div className="text-center">
        <div className="text-sm font-bold text-white opacity-75">Position</div>
        <div className="text-5xl font-black text-white">{revealedPosition || '?'}</div>
      </div>

      <Input
        type="text"
        value={playerName}
        onChange={(e) => onPlayerNameChange(e.target.value)}
        placeholder="Your name"
        className="text-center font-semibold text-base"
      />

      <div className="space-y-2">
        <Button
          onClick={onSave}
          disabled={!playerName.trim() || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button
          onClick={onFlip}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
