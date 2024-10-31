import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    if (!['client', 'service_provider'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    await transaction(async (connection) => {
      // Get current user roles
      const [[user]] = await connection.execute(
        'SELECT roles FROM users WHERE id = ?',
        [session.user.id]
      );

      const currentRoles = JSON.parse(user.roles);
      
      // Check if user already has the role
      if (currentRoles.includes(role)) {
        throw new Error('User already has this role');
      }

      // Add new role
      const updatedRoles = [...currentRoles, role];

      // Update user roles
      await connection.execute(
        'UPDATE users SET roles = ? WHERE id = ?',
        [JSON.stringify(updatedRoles), session.user.id]
      );

      // Create role-specific profile
      if (role === 'client') {
        await connection.execute(
          `INSERT INTO client_profiles (user_id, created_at, updated_at)
           VALUES (?, NOW(), NOW())`,
          [session.user.id]
        );
      } else {
        await connection.execute(
          `INSERT INTO service_provider_profiles (
            user_id, profile_completion, created_at, updated_at
          ) VALUES (?, 0, NOW(), NOW())`,
          [session.user.id]
        );
      }
    });

    return NextResponse.json({
      message: 'Role added successfully'
    });
  } catch (error) {
    console.error('Error adding role:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to add role' },
      { status: 500 }
    );
  }
}