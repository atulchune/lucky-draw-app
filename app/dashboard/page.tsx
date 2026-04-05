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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Lucky Draw Contests
          </h1>
          <p className="text-lg text-slate-600">Welcome back, {profile?.full_name || user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-slate-600 text-sm font-semibold uppercase">Total Wins</div>
            <div className="text-4xl font-black text-blue-600 mt-2">{profile?.total_wins || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="text-slate-600 text-sm font-semibold uppercase">Contests Joined</div>
            <div className="text-4xl font-black text-amber-600 mt-2">{participatingContests?.length || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-slate-600 text-sm font-semibold uppercase">Contests Created</div>
            <div className="text-4xl font-black text-green-600 mt-2">{myContests?.length || 0}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12 flex-wrap">
          <Link href="/contests/create">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg">
              Create New Contest
            </Button>
          </Link>
          <Link href="/contests">
            <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg">
              Browse Contests
            </Button>
          </Link>
        </div>

        {/* My Contests Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Contests</h2>
          {myContests && myContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myContests.map((contest: any) => (
                <div key={contest.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{contest.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{contest.description}</p>
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{contest.team1_name}</div>
                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{contest.team2_name}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">{contest.num_positions} positions</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      contest.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {contest.status}
                    </span>
                  </div>
                  <Link href={`/contests/${contest.id}`}>
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-slate-600 mb-4">No contests created yet</p>
              <Link href="/contests/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Your First Contest</Button>
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
                return (
                  <div key={contest.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{contest.name}</h3>
                    <p className="text-slate-600 text-sm mb-4">{contest.description}</p>
                    <div className="flex gap-4 mb-4 text-sm">
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{contest.team1_name}</div>
                      <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{contest.team2_name}</div>
                    </div>
                    <Link href={`/contests/${contest.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Open Contest
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-slate-600 mb-4">You haven't joined any contests yet</p>
              <Link href="/contests">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse Available Contests</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
