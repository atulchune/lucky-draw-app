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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
              Available Contests
            </h1>
            <p className="text-lg text-slate-600">Browse and join exciting lucky draw contests</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-slate-600 hover:bg-slate-700 text-white font-bold">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Contests Grid */}
        {contests && contests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest: any) => (
              <div key={contest.id} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{contest.name}</h2>
                  <p className="text-slate-600">{contest.description}</p>
                </div>

                {/* Teams */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-4">
                    <div className="text-xs font-bold text-blue-700 uppercase mb-2">Team 1</div>
                    <div className="text-lg font-bold text-blue-900">{contest.team1_name}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg p-4">
                    <div className="text-xs font-bold text-amber-700 uppercase mb-2">Team 2</div>
                    <div className="text-lg font-bold text-amber-900">{contest.team2_name}</div>
                  </div>
                </div>

                {/* Positions */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="text-sm font-bold text-slate-700 uppercase">Positions per Team</div>
                  <div className="text-3xl font-black text-slate-900">{contest.num_positions}</div>
                </div>

                {/* Created By */}
                <div className="text-xs text-slate-500 mb-6">
                  Created on {new Date(contest.created_at).toLocaleDateString()}
                </div>

                {/* Join Button */}
                <Link href={`/contests/${contest.id}`}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg">
                    View & Join
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Open Contests</h2>
            <p className="text-slate-600 mb-8">There are currently no open contests. Check back soon!</p>
            <Link href="/contests/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8">
                Create a Contest
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
