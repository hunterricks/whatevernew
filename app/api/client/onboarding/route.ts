import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Registration data:', data);

    // First check if email exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Email already registered',
        code: 'EMAIL_EXISTS'
      }, { status: 409 }); // 409 Conflict
    }

    const userId = uuidv4();
    
    // Insert new user
    await query(
      'INSERT INTO users (id, email, name, activeRole) VALUES (?, ?, ?, ?)',
      [
        userId,
        data.email,
        `${data.firstName} ${data.lastName}`,
        'client'
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId: userId
    });
    
  } catch (error) {
    console.error('Client registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
