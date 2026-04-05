import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile and stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user's contests
  const { data: myContests } = await supabase
    .from('contests')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch contests user is participating in
  const { data: participatingContests } = await supabase
    .from('participants')
    .select('contest_id, contests(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch all positions assigned to user to find win/loss status
  const { data: userPositions } = await supabase
    .from('positions')
    .select('contest_id, winner_rank')
    .eq('assigned_user_id', user.id);

  const getPositionForContest = (contestId: string) => {
    return userPositions?.find(p => p.contest_id === contestId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Lucky Draw Dashboard
          </h1>
          <p className="text-lg text-slate-600">Welcome back, {profile?.full_name || user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border p-6 border-l-4 border-l-blue-500">
            <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">Total Wins</div>
            <div className="text-4xl font-black text-blue-600 mt-2">{profile?.total_wins || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 border-l-4 border-l-amber-500">
            <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">Contests Joined</div>
            <div className="text-4xl font-black text-amber-600 mt-2">{profile?.total_contests || participatingContests?.length || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 border-l-4 border-l-green-500">
            <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">Contests Created</div>
            <div className="text-4xl font-black text-green-600 mt-2">{myContests?.length || 0}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12 flex-wrap">
          <Link href="/contests/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm">
              + Create New Contest
            </Button>
          </Link>
          <Link href="/contests">
            <Button variant="outline" className="font-bold py-3 px-8 rounded-lg shadow-sm">
              Browse Contests
            </Button>
          </Link>
        </div>

        {/* My Contests Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            My Contests
          </h2>
          {myContests && myContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myContests.map((contest: any) => (
                <div key={contest.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{contest.name}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      contest.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {contest.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{contest.description || 'No description'}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm font-semibold text-slate-500">{contest.num_positions} cards per team</div>
                  </div>
                  <Link href={`/contests/${contest.id}`}>
                    <Button variant="secondary" className="w-full mt-4 font-bold">
                      Manage Contest
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500 mb-4 font-medium">No contests created yet</p>
              <Link href="/contests/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Create Your First Contest</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Participating Contests Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Contests I'm Joining</h2>
          {participatingContests && participatingContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participatingContests.map((participation: any) => {
                const contest = participation.contests;
                if (!contest) return null;
                const pos = getPositionForContest(contest.id);

                return (
                  <div key={contest.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Status Ribbon */}
                    {contest.status === 'closed' && pos && (
                      <div className={`absolute top-0 right-0 px-8 py-1 text-xs font-black text-white transform rotate-45 translate-x-6 translate-y-3 ${
                        pos.winner_rank ? 'bg-yellow-500' : 'bg-slate-500'
                      }`}>
                        {pos.winner_rank ? 'WINNER!' : 'LOST'}
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate pr-8">{contest.name}</h3>
                    
                    {contest.status === 'closed' && pos ? (
                      <div className="mb-4 mt-2">
                        {pos.winner_rank ? (
                          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                            <div className="font-bold">🎉 Congratulations!</div>
                            <div>You won <strong>{pos.winner_rank}{pos.winner_rank === 1 ? 'st' : pos.winner_rank === 2 ? 'nd' : 'rd'} Place</strong></div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3 rounded-lg text-sm">
                            <div className="font-bold">Better luck next time!</div>
                            <div>You participated but didn't place.</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4 mt-2">
                         <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                            <div className="font-bold">Contest Ongoing</div>
                            <div>Waiting for results...</div>
                          </div>
                      </div>
                    )}

                    <Link href={`/contests/${contest.id}`}>
                      <Button variant="outline" className="w-full mt-2 font-bold">
                        View Contest
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500 mb-4 font-medium">You haven't joined any contests yet</p>
              <Link href="/contests">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Browse Available Contests</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
