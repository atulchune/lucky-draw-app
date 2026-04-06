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

  const handleRemoveWinner = async (positionId: string) => {
    if (!isCreator || contestStatus !== 'open') return;

    setLoadingCardId(positionId);
    try {
      const { error } = await supabase
        .from('positions')
        .update({ winner_rank: null })
        .eq('id', positionId);

      if (error) throw error;

      setPositions(prev =>
        prev.map(p => p.id === positionId ? { ...p, winner_rank: null } : p)
      );
    } catch (err) {
      console.error('Error removing winner:', err);
      alert('Failed to remove winner');
    } finally {
      setLoadingCardId(null);
    }
  };

  // Find all unique teams
  const teams = Array.from(new Set(positions.map(p => p.team_name)));

  const handleCopy = () => {
    let clipboardText = `${document.title || 'Contest'} - Participants List\n\n`;

    teams.forEach(team => {
      clipboardText += `--- ${team} ---\n`;
      const teamPositions = positions.filter(p => p.team_name === team).sort((a, b) => a.position_number - b.position_number);
      teamPositions.forEach(p => {
        const name = p.profiles?.full_name || 'Participant';
        if (p.assigned_user_id) {
          clipboardText += `Position ${p.position_number}: ${name}${p.winner_rank ? ` (Rank ${p.winner_rank})` : ''}\n`;
        }
      });
      clipboardText += '\n';
    });

    navigator.clipboard.writeText(clipboardText).then(() => {
      alert("List copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="space-y-12">
      {contestStatus === 'abandoned' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-bold text-center shadow-sm">
          🚨 This contest was cancelled by the creator. Results are void.
        </div>
      )}
      {hasUserPickedCard && contestStatus === 'open' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-xl font-bold text-center shadow-sm">
          ✅ You have successfully locked your card! Wait for the creator to announce winners.
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
            onRemoveWinner={() => handleRemoveWinner(position.id)}
            loading={loadingCardId === position.id}
            isClosed={contestStatus !== 'open'}
          />
        ))}
      </div>

      {/* Participants List */}
      <div className="mt-16 bg-white rounded-xl shadow-sm border p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">Participants List</h2>
          <Button onClick={handleCopy} variant="outline" className="font-bold">
            📋 Copy List
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teams.map(team => {
            const teamPositions = positions.filter(p => p.team_name === team && p.assigned_user_id).sort((a, b) => a.position_number - b.position_number);
            
            return (
              <div key={team} className="bg-slate-50 rounded-lg p-6 border">
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">{team}</h3>
                {teamPositions.length === 0 ? (
                  <p className="text-slate-500 italic text-sm">No members joined yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {teamPositions.map(p => (
                      <li key={p.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-400 w-6">#{p.position_number}</span>
                          <span className="font-semibold text-slate-700">{p.profiles?.full_name || 'Participant'}</span>
                        </div>
                        {p.winner_rank && (
                          <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-1 rounded">Rank {p.winner_rank}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CardComponentProps {
  position: Position;
  onFlip: () => void;
  isCreator: boolean;
  onMarkWinner: (rank: 1 | 2 | 3) => void;
  onRemoveWinner: () => void;
  loading: boolean;
  isClosed: boolean;
}

function CardComponent({
  position,
  onFlip,
  isCreator,
  onMarkWinner,
  onRemoveWinner,
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
            <button 
              onClick={isCreator && !isClosed ? onRemoveWinner : undefined}
              title={isCreator && !isClosed ? "Click to remove winner rank" : undefined}
              className={`px-3 py-1 rounded-full text-xs font-black shadow-sm mx-auto w-max mt-2 transition-transform ${
                isCreator && !isClosed ? 'hover:scale-105 active:scale-95 cursor-pointer bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-400'
              } text-yellow-900 border-none`}
            >
              {position.winner_rank === 1 ? '🥇 1st Place' : position.winner_rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
              {isCreator && !isClosed && <span className="ml-1 opacity-75 font-semibold text-[10px]">(×)</span>}
            </button>
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

  // Blind Card State with Flip Animation
  return (
    <div
      onClick={!isClosed && !loading ? onFlip : undefined}
      className={`relative w-full h-48 rounded-xl perspective-1000 ${
        isClosed ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer group'
      }`}
    >
      <div className={`w-full h-full duration-500 preserve-3d relative ${loading ? 'transform-[rotateY(180deg)]' : 'group-hover:-translate-y-1'}`}>
        {/* Front of card (Unassigned) */}
        <div className={`absolute w-full h-full backface-hidden rounded-xl shadow-md p-6 flex flex-col items-center justify-center transition-colors ${
          isClosed ? 'bg-slate-200' : 'bg-slate-900 border border-slate-700'
        }`}>
          <div className={`text-4xl font-black ${isClosed ? 'text-slate-400' : 'text-slate-100'}`}>?</div>
          <div className={`text-xs font-bold uppercase tracking-widest mt-4 ${isClosed ? 'text-slate-500' : 'text-slate-400'}`}>
            {isClosed ? 'Locked' : 'Tap to Reveal'}
          </div>
        </div>
        
        {/* Back of card (Loading state) */}
        <div className="absolute w-full h-full backface-hidden transform-[rotateY(180deg)] rounded-xl shadow-md p-6 flex items-center justify-center bg-blue-50 border border-blue-100">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}

