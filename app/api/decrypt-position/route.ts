import { createClient } from '@/lib/supabase/server';
import { decryptPosition } from '@/lib/crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/decrypt-position
 * 
 * Decrypts an encrypted position number. Only authenticated users can call this.
 * 
 * Request Body:
 *   { "encrypted_value": "base64-encoded-encrypted-string" }
 *   OR
 *   { "encrypted_values": ["base64-string-1", "base64-string-2", ...] }
 * 
 * Response:
 *   { "position_number": 5 }
 *   OR
 *   { "position_numbers": [5, 3, 1, ...] }
 * 
 * Errors:
 *   401 - Not authenticated
 *   400 - Missing encrypted value(s)
 *   500 - Decryption failure (tampered data or wrong key)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in.' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { encrypted_value, encrypted_values } = body;

    // 3. Handle single value decryption
    if (encrypted_value) {
      if (typeof encrypted_value !== 'string') {
        return NextResponse.json(
          { error: 'encrypted_value must be a string' },
          { status: 400 }
        );
      }

      const positionNumber = decryptPosition(encrypted_value);
      return NextResponse.json({ position_number: positionNumber });
    }

    // 4. Handle batch decryption
    if (encrypted_values && Array.isArray(encrypted_values)) {
      if (encrypted_values.length === 0) {
        return NextResponse.json(
          { error: 'encrypted_values array must not be empty' },
          { status: 400 }
        );
      }

      if (encrypted_values.length > 100) {
        return NextResponse.json(
          { error: 'Maximum 100 values can be decrypted at once' },
          { status: 400 }
        );
      }

      const positionNumbers = encrypted_values.map((val: string) =>
        decryptPosition(val)
      );
      return NextResponse.json({ position_numbers: positionNumbers });
    }

    // 5. No valid input
    return NextResponse.json(
      { error: 'Provide either "encrypted_value" (string) or "encrypted_values" (array)' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Decryption error:', err);
    return NextResponse.json(
      {
        error: 'Decryption failed. The data may be tampered or the key is incorrect.',
        details: err.message,
      },
      { status: 500 }
    );
  }
}
