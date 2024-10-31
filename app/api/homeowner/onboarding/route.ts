import { NextResponse } from 'next/server';
import { query, sqliteDb, isWebContainer } from '@/lib/mysql'; // Adjust the import path as necessary
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // For web container testing, skip session check or get userId from request
    let userId: string;
    const body = await request.json(); // Parse body early to use in both modes

    if (isWebContainer && sqliteDb) {
      userId = body.userId; // Pass userId from client in web container mode
      if (!userId) {
        return NextResponse.json(
          { message: 'Missing userId in request body' },
          { status: 400 }
        );
      }
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      userId = session.user.id as string;
    }

    const { address, phone, preferences } = body;

    if (isWebContainer && sqliteDb) {
      // Update homeowner profile in SQLite
      await sqliteDb.run(
        `UPDATE homeowner_profiles SET 
          address = ?,
          phone = ?,
          preferences = ?,
          profile_completion = 100,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          address,
          phone,
          JSON.stringify(preferences),
          userId,
        ]
      );
    } else {
      // Update homeowner profile in MySQL
      await query(
        `UPDATE homeowner_profiles SET 
          address = ?,
          phone = ?,
          preferences = ?,
          profile_completion = 100,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          address,
          phone,
          JSON.stringify(preferences),
          userId,
        ]
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 