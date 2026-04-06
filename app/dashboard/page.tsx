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

  // Fetch top 2 available contests
  const { data: availableContests } = await supabase
    .from('contests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(2);

  // Fetch contests user is participating in
  const { data: participatingContests } = await supabase
    .from('participants')
    .select('contest_id, contests(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch user's created contests just for the stat counter
  const { count: createdContestsCount } = await supabase
    .from('contests')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', user.id);

  // Fetch all positions assigned to user to find win/loss status
  const { data: userPositions } = await supabase
    .from('positions')
    .select('contest_id, winner_rank')
    .eq('assigned_user_id', user.id);

  const getPositionForContest = (contestId: string) => {
    return userPositions?.find(p => p.contest_id === contestId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium">Welcome back, {profile?.full_name || user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Wins</div>
            <div className="text-3xl font-black text-slate-800">{profile?.total_wins || 0}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Joined</div>
            <div className="text-3xl font-black text-slate-800">{profile?.total_contests || participatingContests?.length || 0}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center col-span-2 md:col-span-1">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Created</div>
            <div className="text-3xl font-black text-slate-800">{createdContestsCount || 0}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          {profile?.has_access && (
            <Link href="/contests/create" className="w-full sm:w-auto overflow-hidden rounded-xl">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-all active:scale-[0.98]">
                + Create Contest
              </Button>
            </Link>
          )}
          <Link href="/contests" className="w-full sm:w-auto overflow-hidden rounded-xl">
            <Button variant="outline" className="w-full font-semibold py-6 px-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 transition-all active:scale-[0.98]">
              Browse All Contests
            </Button>
          </Link>
        </div>

        {/* Available Contests Section */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold tracking-tight">Available Contests</h2>
            <Link href="/contests" className="text-sm font-semibold text-blue-600 hover:underline">
              View All &rarr;
            </Link>
          </div>
          
          {availableContests && availableContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableContests.map((contest: any) => (
                <Link href={`/contests/${contest.id}`} key={contest.id} className="block group">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group-active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold truncate pr-4">{contest.name}</h3>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-green-50 text-green-600 rounded-md">
                        OPEN
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{contest.description || 'Join this contest and test your luck!'}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <div className="text-xs font-semibold text-slate-400">{contest.num_positions * 2} Cards Total</div>
                      <div className="text-sm font-bold text-blue-600">Join Now</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 border-dashed p-8 text-center">
              <p className="text-slate-500 text-sm font-medium">No open contests at the moment.</p>
            </div>
          )}
        </div>

        {/* Participating Contests Section */}
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-6">My Recent Contests</h2>
          {participatingContests && participatingContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participatingContests.map((participation: any) => {
                const contest = participation.contests;
                if (!contest) return null;
                const pos = getPositionForContest(contest.id);

                return (
                  <Link href={`/contests/${contest.id}`} key={contest.id} className="block group">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all duration-300 group-active:scale-[0.98] relative overflow-hidden flex flex-col h-full">
                      {/* Ribbon */}
                      {contest.status === 'closed' && pos && (
                        <div className={`absolute top-0 right-0 px-6 py-1 text-[10px] font-black tracking-wider text-white transform rotate-45 translate-x-5 translate-y-2 ${
                          pos.winner_rank ? 'bg-amber-400' : 'bg-slate-300'
                        }`}>
                          {pos.winner_rank ? 'WON' : 'LOST'}
                        </div>
                      )}
                      
                      <h3 className="text-lg font-bold mb-2 truncate pr-6">{contest.name}</h3>
                      
                      <div className="grow mt-2">
                        {contest.status === 'closed' && pos ? (
                          pos.winner_rank ? (
                            <div className="bg-amber-50 text-amber-900 px-3 py-2 rounded-xl text-sm font-medium">
                              🏆 You won {pos.winner_rank}{pos.winner_rank === 1 ? 'st' : pos.winner_rank === 2 ? 'nd' : 'rd'} Place!
                            </div>
                          ) : (
                            <div className="bg-slate-50 text-slate-500 px-3 py-2 rounded-xl text-sm font-medium">
                              Better luck next time.
                            </div>
                          )
                        ) : (
                          <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm justify-between flex items-center font-medium">
                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Ongoing</span>
                            <span className="text-xs opacity-70">Waiting for picks...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
              <p className="text-slate-500 text-sm font-medium mb-3">You haven't joined any contests yet</p>
              <Link href="/contests">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-6">Find a Contest</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
