import { createClient } from '@/lib/supabase/server';
import { encryptPosition } from '@/lib/crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/contests/create
 * 
 * Creates a new contest with encrypted position numbers.
 * This is a server-side route because encryption uses Node.js crypto
 * which is not available in client components.
 * 
 * Request Body:
 *   {
 *     name: string,
 *     description: string,
 *     team1_name: string,
 *     team2_name: string,
 *     num_positions: number
 *   }
 * 
 * Response:
 *   { contest_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a contest' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, team1_name, team2_name, num_positions } = body;

    // Validate
    if (!name || !team1_name || !team2_name || !num_positions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (num_positions < 1 || num_positions > 20) {
      return NextResponse.json(
        { error: 'Positions must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Create contest
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .insert([
        {
          creator_id: user.id,
          name,
          description,
          team1_name,
          team2_name,
          num_positions,
          status: 'open',
        },
      ])
      .select()
      .single();

    if (contestError) {
      console.error('Contest creation error:', contestError);
      return NextResponse.json(
        { error: contestError.message },
        { status: 500 }
      );
    }

    // Create positions with ENCRYPTED position numbers
    const positions = [];
    for (let i = 1; i <= num_positions; i++) {
      positions.push({
        contest_id: contest.id,
        team_name: team1_name,
        position_number: encryptPosition(i), // Encrypted!
      });
      positions.push({
        contest_id: contest.id,
        team_name: team2_name,
        position_number: encryptPosition(i), // Encrypted!
      });
    }

    const { error: positionError } = await supabase
      .from('positions')
      .insert(positions);

    if (positionError) {
      console.error('Position creation error:', positionError);
      // Rollback contest if positions fail
      await supabase.from('contests').delete().eq('id', contest.id);
      return NextResponse.json(
        { error: positionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ contest_id: contest.id });
  } catch (err: any) {
    console.error('Create contest error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create contest' },
      { status: 500 }
    );
  }
}
