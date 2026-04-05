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

  // Fetch contest
  const { data: contest } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .single();

  if (!contest) {
    redirect('/contests');
  }

  // Fetch positions
  const { data: positions } = await supabase
    .from('positions')
    .select('*')
    .eq('contest_id', id)
    .order('team_name', { ascending: true })
    .order('position_number', { ascending: true });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="text-xs font-bold text-blue-700 uppercase">Team 1</div>
                <div className="text-lg font-bold text-blue-900">{contest.team1_name}</div>
              </div>
              <div className="bg-amber-100 rounded-lg p-4">
                <div className="text-xs font-bold text-amber-700 uppercase">Team 2</div>
                <div className="text-lg font-bold text-amber-900">{contest.team2_name}</div>
              </div>
              <div className="bg-slate-100 rounded-lg p-4">
                <div className="text-xs font-bold text-slate-700 uppercase">Positions</div>
                <div className="text-lg font-bold text-slate-900">
                  {contest.num_positions} each
                </div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4">
                <div className="text-xs font-bold text-purple-700 uppercase">Total Cards</div>
                <div className="text-lg font-bold text-purple-900">{contest.num_positions * 2}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCreator && contest.status === 'open' && !participation && (
          <div className="mb-8">
            <Link href={`/contests/${id}/join`}>
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 text-lg rounded-lg">
                Join This Contest
              </Button>
            </Link>
          </div>
        )}

        {participation && (
          <div className="mb-8 bg-blue-100 border-2 border-blue-400 text-blue-700 px-6 py-4 rounded-lg font-bold">
            You are participating in this contest
          </div>
        )}

        {/* Contest Client Component */}
        <ContestClient
          contestId={id}
          isCreator={isCreator}
          userId={user.id}
          contestStatus={contest.status}
          initialPositions={positions || []}
        />
      </div>
    </div>
  );
}
