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
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{contest.name}</h1>
                <p className="text-slate-600">{contest.description}</p>
              </div>
              <div
                className={`px-4 py-2 rounded-full font-bold text-sm ${
                  contest.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {contest.status === 'open' ? 'Open' : 'Closed'}
              </div>
            </div>

            {/* Contest Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-100 rounded-lg p-4">
                <div className="text-xs font-bold text-slate-700 uppercase">Positions per Team</div>
                <div className="text-lg font-bold text-slate-900">
                  {contest.num_positions}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-xs font-bold text-blue-700 uppercase">Total Cards</div>
                <div className="text-lg font-bold text-blue-900">{contest.num_positions * 2} Cards</div>
              </div>
            </div>
            {isCreator && contest.status === 'open' && (
              <div className="mt-6 flex justify-end">
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
       <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">Save & Close Contest</Button>
    </form>
  )
}
