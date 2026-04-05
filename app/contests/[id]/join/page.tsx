'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function JoinContestPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;
  const supabase = createClient();

  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in');
        return;
      }

      // Check if already participating
      const { data: existing } = await supabase
        .from('participants')
        .select('*')
        .eq('contest_id', contestId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        setError('You are already participating in this contest');
        return;
      }

      // Join contest
      const { error: joinError } = await supabase.from('participants').insert([
        {
          contest_id: contestId,
          user_id: user.id,
          team_number: selectedTeam,
        },
      ]);

      if (joinError) throw joinError;

      // Redirect to contest
      router.push(`/contests/${contestId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join contest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Link href={`/contests/${contestId}`}>
          <Button variant="outline" className="mb-8">
            ← Back to Contest
          </Button>
        </Link>

        <Card className="bg-white shadow-xl p-12 rounded-xl">
          <h1 className="text-4xl font-black text-slate-900 mb-2 text-center">
            Select Your Team
          </h1>
          <p className="text-center text-slate-600 mb-12">
            Choose which team you want to join for this contest
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Team 1 */}
            <div
              onClick={() => setSelectedTeam(1)}
              className={`p-8 rounded-xl border-4 cursor-pointer transition-all transform hover:scale-105 ${
                selectedTeam === 1
                  ? 'border-blue-600 bg-blue-50 scale-105'
                  : 'border-blue-200 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-center">
                <div className="text-5xl font-black text-blue-600 mb-4">Team 1</div>
                <p className="text-slate-600">Click to select this team</p>
              </div>
            </div>

            {/* Team 2 */}
            <div
              onClick={() => setSelectedTeam(2)}
              className={`p-8 rounded-xl border-4 cursor-pointer transition-all transform hover:scale-105 ${
                selectedTeam === 2
                  ? 'border-amber-600 bg-amber-50 scale-105'
                  : 'border-amber-200 bg-white hover:border-amber-400'
              }`}
            >
              <div className="text-center">
                <div className="text-5xl font-black text-amber-600 mb-4">Team 2</div>
                <p className="text-slate-600">Click to select this team</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          <Button
            onClick={handleJoin}
            disabled={!selectedTeam || loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 text-lg rounded-lg disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Contest'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
