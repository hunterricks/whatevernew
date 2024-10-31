import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction, sqliteDb, isWebContainer } from '@/lib/mysql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    if (isWebContainer && sqliteDb) {
      // Check if email already exists
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
        // Create user with client role
        await sqliteDb.run(
          `INSERT INTO users (id, email, name, password, roles, active_role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, email, `${firstName} ${lastName}`, hashedPassword, JSON.stringify(['client']), 'client']
        );

        // Create client profile
        await sqliteDb.run(
          `INSERT INTO client_profiles (user_id, created_at, updated_at)
           VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId]
        );

        await sqliteDb.run('COMMIT');
      } catch (error) {
        await sqliteDb.run('ROLLBACK');
        throw error;
      }
    } else {
      // Use MySQL in other environments
      await transaction(async (connection) => {
        // Check if email exists
        const [existingUser] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [email]
        );

        if (existingUser.length > 0) {
          throw new Error('Email already registered');
        }

        // Create user with client role
        await connection.execute(
          `INSERT INTO users (id, email, name, password, roles, active_role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [userId, email, `${firstName} ${lastName}`, hashedPassword, JSON.stringify(['client']), 'client']
        );

        // Create client profile
        await connection.execute(
          `INSERT INTO client_profiles (user_id, created_at, updated_at)
           VALUES (?, NOW(), NOW())`,
          [userId]
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