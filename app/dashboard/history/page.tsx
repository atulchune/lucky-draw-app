import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { decryptPosition } from '@/lib/crypto';

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all positions where user is assigned to see their contest results
  const { data: userPositions } = await supabase
    .from('positions')
    .select(`
      id,
      team_name,
      position_number,
      winner_rank,
      contests (
        id,
        name,
        status,
        created_at
      )
    `)
    .eq('assigned_user_id', user.id)
    .order('created_at', { ascending: false });

  const contestResults = userPositions?.reduce((acc: any, pos: any) => {
    const contestId = pos.contests.id;
    if (!acc[contestId]) {
      // Decrypt position number
      let posNum = pos.position_number;
      if (typeof posNum === 'string' && posNum.length > 5) {
        try {
          posNum = decryptPosition(posNum);
        } catch {
          posNum = Number(posNum) || 0;
        }
      } else {
        posNum = Number(posNum);
      }

      acc[contestId] = {
        contest: pos.contests,
        position: posNum,
        team: pos.team_name,
        rank: pos.winner_rank,
      };
    }
    return acc;
  }, {});

  const results = contestResults ? Object.values(contestResults) : [];
  const wins = results.filter((r: any) => r.rank).length;
  const losses = results.filter((r: any) => !r.rank).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12">
          <Link href="/dashboard">
            <Button className="mb-6 bg-slate-600 hover:bg-slate-700">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Contest History</h1>
          <p className="text-lg text-slate-600">Track your wins, losses, and positions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="text-slate-600 text-sm font-semibold uppercase">Total Contests</div>
            <div className="text-4xl font-black text-yellow-600 mt-2">{results.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-slate-600 text-sm font-semibold uppercase">Wins</div>
            <div className="text-4xl font-black text-green-600 mt-2">{wins}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="text-slate-600 text-sm font-semibold uppercase">Losses/Participants</div>
            <div className="text-4xl font-black text-red-600 mt-2">{losses}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-slate-600 text-sm font-semibold uppercase">Win Rate</div>
            <div className="text-4xl font-black text-blue-600 mt-2">
              {results.length > 0 ? Math.round((wins / results.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Contest Results */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Results</h2>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{result.contest.name}</h3>
                      <p className="text-sm text-slate-500">
                        {new Date(result.contest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {result.rank && (
                      <div className="text-3xl">
                        {result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-xs text-slate-600 font-semibold uppercase">Team</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">{result.team}</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="text-xs text-slate-600 font-semibold uppercase">Position</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">{result.position}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-xs text-slate-600 font-semibold uppercase">Status</div>
                      <div className={`text-lg font-bold mt-1 ${
                        result.rank
                          ? 'text-green-600'
                          : 'text-slate-600'
                      }`}>
                        {result.rank ? `${result.rank}${result.rank === 1 ? 'st' : result.rank === 2 ? 'nd' : 'rd'}` : 'Participant'}
                      </div>
                    </div>
                  </div>

                  <Link href={`/contests/${result.contest.id}`}>
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      View Contest
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-slate-600 mb-4">No contest history yet</p>
              <Link href="/contests">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Join a Contest</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
