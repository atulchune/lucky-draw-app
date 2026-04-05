'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Position {
  id: string;
  team_name: string;
  position_number: number;
  assigned_user_id: string | null;
  winner_rank: number | null;
  profiles?: { full_name: string } | null;
}

interface ContestClientProps {
  contestId: string;
  isCreator: boolean;
  userId: string;
  userName: string;
  contestStatus: string;
  initialPositions: Position[];
}

export default function ContestClient({
  contestId,
  isCreator,
  userId,
  userName,
  contestStatus,
  initialPositions,
}: ContestClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);

  // Shuffle positions only once on mount to keep cards consistent in UI (or we could use stable IDs if we want them to stay in the same visual place)
  // Actually, if we shuffle on client and someone refreshes, the cards jump. That might be okay for a "blind" deck before revealing.
  // To keep it simple, we sort by ID so it's consistent, or we shuffle based on a seed. 
  // Let's just create a stable random order.
  const displayPositions = useMemo(() => {
    return [...positions].sort((a, b) => a.id.localeCompare(b.id)); // Not truly random, but visually arbitrary to user. Or let's hash it.
  }, [positions]);

  // Is the current user locked?
  const hasUserPickedCard = positions.some(p => p.assigned_user_id === userId);

  const handleCardFlip = async (positionId: string) => {
    if (contestStatus !== 'open') {
      alert("Contest is closed.");
      return;
    }

    if (hasUserPickedCard) {
      alert("You have already picked a card in this contest!");
      return;
    }

    const position = positions.find(p => p.id === positionId);
    if (!position || position.assigned_user_id) return;

    setLoadingCardId(positionId);
    try {
      // Opt into the card
      const { error } = await supabase
        .from('positions')
        .update({
          assigned_user_id: userId,
        })
        .eq('id', positionId)
        // ensure optimistic concurrency / safety (only if empty)
        .is('assigned_user_id', null);

      if (error) throw error;

      // Also ensure user is in participants table
      await supabase.from('participants').upsert({
        contest_id: contestId,
        user_id: userId,
        team_number: 0, // Unused/legacy, just keep 0 or handle server-side
      }, { onConflict: 'contest_id, user_id' });

      // Add to local state
      setPositions(prev =>
        prev.map(p =>
          p.id === positionId ? { ...p, assigned_user_id: userId, profiles: { full_name: userName } } : p
        )
      );

    } catch (err) {
      console.error('Error assigning card:', err);
      alert('Card is already taken or another error occurred.');
    } finally {
      setLoadingCardId(null);
    }
  };

  const handleMarkWinner = async (positionId: string, rank: 1 | 2 | 3) => {
    if (!isCreator || contestStatus !== 'open') return;

    setLoadingCardId(positionId); // reuse loading state
    try {
      const { error } = await supabase
        .from('positions')
        .update({ winner_rank: rank })
        .eq('id', positionId);

      if (error) throw error;

      setPositions(prev =>
        prev.map(p => p.id === positionId ? { ...p, winner_rank: rank } : p)
      );
    } catch (err) {
      console.error('Error marking winner:', err);
      alert('Failed to mark winner');
    } finally {
      setLoadingCardId(null);
    }
  };

  return (
    <div className="space-y-8">
      {hasUserPickedCard && contestStatus === 'open' && (
        <div className="bg-blue-100 border-2 border-blue-400 text-blue-700 px-6 py-4 rounded-lg font-bold text-center">
          You have successfully locked your card! Wait for the creator to announce winners.
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayPositions.map((position, index) => (
          <CardComponent
            key={position.id}
            position={position}
            onFlip={() => handleCardFlip(position.id)}
            isCreator={isCreator && contestStatus === 'open'}
            onMarkWinner={(rank) => handleMarkWinner(position.id, rank)}
            loading={loadingCardId === position.id}
            isClosed={contestStatus !== 'open'}
          />
        ))}
      </div>
    </div>
  );
}

interface CardComponentProps {
  position: Position;
  onFlip: () => void;
  isCreator: boolean;
  onMarkWinner: (rank: 1 | 2 | 3) => void;
  loading: boolean;
  isClosed: boolean;
}

function CardComponent({
  position,
  onFlip,
  isCreator,
  onMarkWinner,
  loading,
  isClosed,
}: CardComponentProps) {
  const isAssigned = !!position.assigned_user_id;

  if (isAssigned) {
    const isWinner = !!position.winner_rank;
    const name = position.profiles?.full_name || 'Participant';

    return (
      <div className={`rounded-xl shadow-lg p-6 border-2 flex flex-col h-full ${
        isWinner ? 'bg-linear-to-br from-yellow-50 to-yellow-100 border-yellow-300' : 'bg-white border-slate-200'
      }`}>
        <div className="grow text-center space-y-3">
          {/* We show team name and position number here now that it's open */}
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{position.team_name}</div>
          <div className="text-4xl font-black text-slate-800">#{position.position_number}</div>
          <div className="text-sm font-bold text-blue-600 bg-blue-50 py-1 rounded inline-block px-2">{name}</div>
          
          {isWinner && (
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black shadow-sm mx-auto w-max mt-2">
              {position.winner_rank === 1 ? '🥇 1st Place' : position.winner_rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
            </div>
          )}
        </div>

        {isCreator && !isWinner && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
            <Button size="sm" onClick={() => onMarkWinner(1)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] h-7 px-0" disabled={loading}>
              1st
            </Button>
            <Button size="sm" onClick={() => onMarkWinner(2)} className="bg-slate-400 hover:bg-slate-500 text-white text-[10px] h-7 px-0" disabled={loading}>
              2nd
            </Button>
            <Button size="sm" onClick={() => onMarkWinner(3)} className="bg-orange-400 hover:bg-orange-500 text-white text-[10px] h-7 px-0" disabled={loading}>
              3rd
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Blind Card State
  return (
    <div
      onClick={!isClosed && !loading ? onFlip : undefined}
      className={`rounded-xl shadow-lg p-6 h-48 flex items-center justify-center transition-all ${
        isClosed 
          ? 'bg-slate-200 opacity-50 cursor-not-allowed' 
          : 'bg-linear-to-br from-blue-500 to-indigo-600 cursor-pointer hover:shadow-2xl hover:scale-105 active:scale-95'
      }`}
    >
      <div className="text-center">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mx-auto"></div>
        ) : (
          <>
            <div className="text-6xl font-black text-white/50">?</div>
            <div className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-4">Card</div>
          </>
        )}
      </div>
    </div>
  );
}

