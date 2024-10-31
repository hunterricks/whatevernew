import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Service Provider registration data:', data);

    // Check if email exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Email already registered',
        code: 'EMAIL_EXISTS'
      }, { status: 409 });
    }

    const userId = uuidv4();
    const businessProfileId = uuidv4();
    
    // Use transaction to create both user and business profile
    await transaction([
      {
        sql: 'INSERT INTO users (id, email, name, activeRole) VALUES (?, ?, ?, ?)',
        params: [
          userId,
          data.email,
          `${data.firstName} ${data.lastName}`,
          'service_provider'
        ]
      },
      {
        sql: 'INSERT INTO business_profiles (id, user_id, business_name, business_type, description) VALUES (?, ?, ?, ?, ?)',
        params: [
          businessProfileId,
          userId,
          data.businessName || `${data.firstName}'s Business`,
          data.businessType || 'General Contractor',
          data.description || 'Professional service provider'
        ]
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Service Provider registered successfully',
      userId: userId,
      businessProfileId: businessProfileId
    });
    
  } catch (error) {
    console.error('Service Provider registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
