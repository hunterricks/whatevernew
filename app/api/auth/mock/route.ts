import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

// Define constant mock users with strict typing
export const MOCK_USERS = {
  client: {
    id: 'test-user-1',
    name: 'John Doe',
    email: 'john@example.com',
    activeRole: 'client',
    roles: ['client'] as const,
    token: 'mock-token-client'
  },
  serviceProvider: {
    id: 'test-user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    activeRole: 'service_provider',
    roles: ['service_provider'] as const,
    token: 'mock-token-service-provider'
  },
  dual: {
    id: 'test-user-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    activeRole: 'client',
    roles: ['client', 'service_provider'] as const,
    token: 'mock-token-dual'
  }
} as const;

type MockUserType = keyof typeof MOCK_USERS;
type UserRole = 'client' | 'service_provider';

interface MockAuthRequest {
  email?: string;
  role?: UserRole;
  userType?: MockUserType;
}

export async function GET() {
  if (!isWebContainer) {
    return NextResponse.json(
      { error: 'Mock auth endpoints only available in web container' },
      { status: 403 }
    );
  }
  return NextResponse.json(MOCK_USERS);
}

export async function POST(request: Request) {
  if (!isWebContainer) {
    return NextResponse.json(
      { error: 'Mock auth only available in web container' },
      { status: 403 }
    );
  }

  try {
    const { email, role, userType = 'dual' }: MockAuthRequest = await request.json();
    
    // If email provided, find specific user
    if (email) {
      const user = Object.values(MOCK_USERS).find(u => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Update user role if provided
      const updatedUser = {
        ...user,
        activeRole: role || user.activeRole
      };

      try {
        // Update user in database with SQLite compatibility
        await query(`
          INSERT INTO users (id, email, name, activeRole)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
          activeRole = EXCLUDED.activeRole
        `, [updatedUser.id, updatedUser.email, updatedUser.name, updatedUser.activeRole]);

        return NextResponse.json({ user: updatedUser });
      } catch (dbError) {
        console.error('Database error during mock auth:', dbError);
        // Continue with the response even if database update fails
        return NextResponse.json({ user: updatedUser });
      }
    }

    // Use userType to get mock user
    const mockUser = MOCK_USERS[userType];
    if (!mockUser) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    try {
      // Ensure mock user exists in database with SQLite compatibility
      await query(`
        INSERT INTO users (id, email, name, activeRole)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        name = EXCLUDED.name
      `, [mockUser.id, mockUser.email, mockUser.name, mockUser.activeRole]);

      return NextResponse.json({ user: mockUser });
    } catch (dbError) {
      console.error('Database error during mock auth:', dbError);
      // Continue with the response even if database update fails
      return NextResponse.json({ user: mockUser });
    }
  } catch (error) {
    console.error('Mock auth error:', error);
    return NextResponse.json(
      { error: 'Error during mock authentication' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request); // Alias for POST
}

export async function DELETE() {
  if (!isWebContainer) {
    return NextResponse.json(
      { error: 'Mock auth only available in web container' },
      { status: 403 }
    );
  }
  
  return NextResponse.json(
    { message: 'Mock logout successful' },
    { status: 200 }
  );
}

