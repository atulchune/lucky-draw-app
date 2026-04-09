import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Fetch contest to ensure current user is creator
  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('creator_id, status')
    .eq('id', id)
    .single();

  if (contestError || !contest || contest.creator_id !== user.id || contest.status !== 'open') {
    return NextResponse.redirect(new URL(`/contests/${id}`, request.url));
  }

  // Use admin client to bypass RLS for cross-user profile updates
  const adminSupabase = createAdminClient();

  // Update contest status
  await adminSupabase
    .from('contests')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id);

  // Update User Stats
  // 1. Fetch all participants to increment contests_participated
  const { data: participants } = await adminSupabase
    .from('participants')
    .select('user_id')
    .eq('contest_id', id);

  if (participants) {
    for (const p of participants) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('contests_participated')
        .eq('id', p.user_id)
        .single();
      
      if (profile) {
        await adminSupabase
          .from('profiles')
          .update({ contests_participated: (profile.contests_participated || 0) + 1 })
          .eq('id', p.user_id);
      }
    }
  }

  // 2. Fetch all winning positions to increment wins_first / wins_second / wins_third
  const { data: winners } = await adminSupabase
    .from('positions')
    .select('assigned_user_id, winner_rank')
    .eq('contest_id', id)
    .not('winner_rank', 'is', null)
    .not('assigned_user_id', 'is', null);

  if (winners) {
    for (const w of winners) {
      if (w.assigned_user_id && w.winner_rank) {
        // Determine which column to increment based on rank
        const columnMap: Record<number, string> = {
          1: 'wins_first',
          2: 'wins_second',
          3: 'wins_third',
        };
        const column = columnMap[w.winner_rank];
        if (!column) continue;

        const { data: profile } = await adminSupabase
          .from('profiles')
          .select(column)
          .eq('id', w.assigned_user_id)
          .single();
        
        if (profile) {
          await adminSupabase
            .from('profiles')
            .update({ [column]: ((profile as any)[column] || 0) + 1 })
            .eq('id', w.assigned_user_id);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(`/contests/${id}`, request.url), { status: 303 });
}
