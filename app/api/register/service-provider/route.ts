import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction, sqliteDb, isWebContainer } from '@/lib/mysql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      specialty,
      experience,
    } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !password || !specialty || !experience) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    if (isWebContainer && sqliteDb) {
      // Check if email exists
      const existingUser = await sqliteDb.get(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 409 }
        );
      }

      // Begin transaction
      await sqliteDb.run('BEGIN TRANSACTION');

      try {
        // Create user with service_provider role
        await sqliteDb.run(
          `INSERT INTO users (id, email, name, password, roles, active_role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, email, `${firstName} ${lastName}`, hashedPassword, JSON.stringify(['service_provider']), 'service_provider']
        );

        // Create service provider profile
        await sqliteDb.run(
          `INSERT INTO service_provider_profiles (
            user_id, specialty, experience, profile_completion,
            created_at, updated_at
          ) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, specialty, experience]
        );

        await sqliteDb.run('COMMIT');
      } catch (error) {
        await sqliteDb.run('ROLLBACK');
        throw error;
      }
    } else {
      await transaction(async (connection) => {
        // Check if email exists
        const [existingUser] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [email]
        );

        if (existingUser.length > 0) {
          throw new Error('Email already registered');
        }

        // Create user with service_provider role
        await connection.execute(
          `INSERT INTO users (id, email, name, password, roles, active_role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [userId, email, `${firstName} ${lastName}`, hashedPassword, JSON.stringify(['service_provider']), 'service_provider']
        );

        // Create service provider profile
        await connection.execute(
          `INSERT INTO service_provider_profiles (
            user_id, specialty, experience, profile_completion,
            created_at, updated_at
          ) VALUES (?, ?, ?, 0, NOW(), NOW())`,
          [userId, specialty, experience]
        );
      });
    }

    return NextResponse.json(
      {
        message: 'Registration successful',
        userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}