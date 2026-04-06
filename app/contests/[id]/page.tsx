import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ContestClient from './contest-client';

export default async function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const userName = profile?.full_name || user.email || 'User';

  // Fetch contest
  const { data: contest } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .single();

  if (!contest) {
    redirect('/contests');
  }

  // Fetch positions without invalid profile relation
  const { data: positionsData, error: posError } = await supabase
    .from('positions')
    .select('*') 
    .eq('contest_id', id);

  if (posError) console.error("Positions fetch error:", posError);

  let positions = positionsData || [];
  
  // Hydrate profiles manually
  const assigned_ids = positions.map(p => p.assigned_user_id).filter(Boolean);
  if (assigned_ids.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', assigned_ids);

    if (profiles) {
      positions = positions.map(p => ({
        ...p,
        profiles: profiles.find(pr => pr.id === p.assigned_user_id) || null
      }));
    }
  }

  // Check if user is creator
  const isCreator = contest.creator_id === user.id;

  // Check if user is participating
  const { data: participation } = await supabase
    .from('participants')
    .select('*')
    .eq('contest_id', id)
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-block mb-6">
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900 pl-0">
              &larr; Back to Dashboard
            </Button>
          </Link>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{contest.name}</h1>
                <p className="text-slate-500 font-medium">{contest.description}</p>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider ${
                  contest.status === 'open'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {contest.status}
              </div>
            </div>

            {/* Contest Info */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Positions Focus</div>
                <div className="text-xl md:text-2xl font-black text-slate-800">
                  {contest.num_positions} / Team
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 md:p-5">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Total Cards</div>
                <div className="text-xl md:text-2xl font-black text-blue-900">{contest.num_positions * 2} Cards</div>
              </div>
            </div>
            {isCreator && contest.status === 'open' && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                 <ContestCloseButton contestId={id} />
              </div>
            )}
          </div>
        </div>

        {/* Contest Client Component */}
        <ContestClient
          contestId={id}
          isCreator={isCreator}
          userId={user.id}
          userName={userName}
          contestStatus={contest.status}
          initialPositions={positions}
        />
      </div>
    </div>
  );
}

function ContestCloseButton({ contestId }: { contestId: string }) {
  return (
    <form action={`/api/contests/${contestId}/close`} method="POST">
       <Button type="submit" className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-8 rounded-xl h-12 shadow-sm transition-transform active:scale-[0.98]">
         Close Contest Event
       </Button>
    </form>
  )
}
