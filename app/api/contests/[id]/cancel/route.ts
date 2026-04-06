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

  // Update contest status to 'abandoned'
  await supabase
    .from('contests')
    .update({ status: 'abandoned', closed_at: new Date().toISOString() })
    .eq('id', id);

  // We don't increment user stats because the contest is abandoned and no result is valid.
  
  return NextResponse.redirect(new URL(`/contests/${id}`, request.url), { status: 303 });
}
