import { createClient } from '@/lib/supabase/server';
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

  // Update contest status
  await supabase
    .from('contests')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id);

  // Update User Stats
  // 1. Fetch all participants to increment total_contests
  const { data: participants } = await supabase
    .from('participants')
    .select('user_id')
    .eq('contest_id', id);

  if (participants) {
    for (const p of participants) {
      // Supabase does not have an easy increment, so we fetch and update.
      // Wait, we can use RPC if we had it, but let's just do it directly or using a simple strategy.
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_contests')
        .eq('id', p.user_id)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_contests: (profile.total_contests || 0) + 1 })
          .eq('id', p.user_id);
      }
    }
  }

  // 2. Fetch all winning positions to increment total_wins
  const { data: winners } = await supabase
    .from('positions')
    .select('assigned_user_id, winner_rank')
    .eq('contest_id', id)
    .not('winner_rank', 'is', null)
    .not('assigned_user_id', 'is', null);

  if (winners) {
    for (const w of winners) {
      if (w.assigned_user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_wins')
          .eq('id', w.assigned_user_id)
          .single();
        
        if (profile) {
          await supabase
            .from('profiles')
            .update({ total_wins: (profile.total_wins || 0) + 1 })
            .eq('id', w.assigned_user_id);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(`/contests/${id}`, request.url), { status: 303 });
}
