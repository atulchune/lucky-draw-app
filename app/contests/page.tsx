import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ContestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all open contests
  const { data: contests } = await supabase
    .from('contests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  // Optional: check access for create button
  const { data: profile } = await supabase.from('profiles').select('has_access').eq('id', user.id).single();

  // Fetch all contest IDs the user has joined
  const contestIds = contests?.map(c => c.id) || [];
  let userParticipations: string[] = [];
  if (contestIds.length > 0) {
    const { data: participations } = await supabase
      .from('participants')
      .select('contest_id')
      .eq('user_id', user.id)
      .in('contest_id', contestIds);
    userParticipations = participations?.map(p => p.contest_id) || [];
  }

  // Fetch opened (assigned) card counts per contest
  // We get all positions for the displayed contests to compute counts
  let positionCountsByContest: Record<string, { total: number; opened: number }> = {};
  if (contestIds.length > 0) {
    const { data: positions } = await supabase
      .from('positions')
      .select('contest_id, assigned_user_id')
      .in('contest_id', contestIds);

    if (positions) {
      for (const pos of positions) {
        if (!positionCountsByContest[pos.contest_id]) {
          positionCountsByContest[pos.contest_id] = { total: 0, opened: 0 };
        }
        positionCountsByContest[pos.contest_id].total++;
        if (pos.assigned_user_id) {
          positionCountsByContest[pos.contest_id].opened++;
        }
      }
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 text-center md:text-left">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
              Available Contests
            </h1>
            <p className="text-slate-500 font-medium">Browse and join exciting lucky draw contests</p>
          </div>
          <div className="flex gap-3 justify-center">
             <Link href="/dashboard">
              <Button variant="outline" className="font-semibold h-11 px-6 rounded-xl border-slate-200">
                Dashboard
              </Button>
            </Link>
            {profile?.has_access && (
              <Link href="/contests/create">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 px-6 rounded-xl shadow-md">
                  + Create
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Contests Grid */}
        {contests && contests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contests.map((contest: any) => {
              const isJoined = userParticipations.includes(contest.id);
              const counts = positionCountsByContest[contest.id] || { total: contest.num_positions * 2, opened: 0 };
              const totalCards = counts.total;
              const openedCards = counts.opened;
              const progressPercent = totalCards > 0 ? Math.round((openedCards / totalCards) * 100) : 0;

              return (
              <Link href={`/contests/${contest.id}`} key={contest.id} className="block group">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group-active:scale-[0.98] flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold truncate pr-3">{contest.name}</h2>
                    <div className="flex items-center gap-2 shrink-0">
                      {isJoined && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-blue-50 text-blue-600 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          JOINED
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-green-50 text-green-600 rounded-md">
                        OPEN
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-5 line-clamp-2 min-h-[40px]">{contest.description || 'Join this contest and test your luck!'}</p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                       <span className="text-xs font-bold text-slate-500">{contest.team1_name}</span>
                       <span className="text-[10px] font-black text-slate-400">VS</span>
                       <span className="text-xs font-bold text-slate-500">{contest.team2_name}</span>
                    </div>

                    {/* Card Progress Section */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cards Opened</span>
                        <span className="text-xs font-bold text-slate-600">{openedCards} / {totalCards}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progressPercent >= 80 ? 'bg-amber-400' : progressPercent >= 50 ? 'bg-blue-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100/60">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Entry Fee</div>
                        <div className="text-sm font-bold text-slate-900">Free</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Cards</div>
                        <div className="text-sm font-bold text-slate-900">{totalCards} Cards</div>
                      </div>
                    </div>

                    {/* Joined status footer */}
                    {isJoined ? (
                      <div className="mt-4 pt-3 border-t border-slate-100/60 text-center">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">✅ You&apos;ve joined this contest</span>
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-slate-100/60 text-center">
                        <span className="text-sm font-bold text-blue-600">Join Now →</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 border-dashed p-12 text-center max-w-2xl mx-auto shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Open Contests</h2>
            <p className="text-slate-500 font-medium mb-6">There are currently no open contests. Check back soon!</p>
            {profile?.has_access && (
              <Link href="/contests/create">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 px-8 rounded-xl shadow-md">
                  Create First Contest
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
