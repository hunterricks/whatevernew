import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction, sqliteDb, isWebContainer } from '@/lib/mysql';
import { homeownerFormSchema } from '@/app/register/homeowner/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validatedData = homeownerFormSchema.parse(body);
    const { basicInfo, address, preferences, initialProject } = validatedData;

    // Hash password
    const hashedPassword = await bcrypt.hash(basicInfo.password, 12);
    const userId = uuidv4();

    if (isWebContainer && sqliteDb) {
      // Check if email exists
      const existingUser = await sqliteDb.get(
        'SELECT id FROM users WHERE email = ?',
        [basicInfo.email]
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
          `INSERT INTO users (
            id, email, name, password, roles, active_role, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            userId,
            basicInfo.email,
            `${basicInfo.firstName} ${basicInfo.lastName}`,
            hashedPassword,
            JSON.stringify(['client']),
            'client'
          ]
        );

        // Create client profile
        await sqliteDb.run(
          `INSERT INTO client_profiles (
            user_id, address_street, address_city, address_state,
            address_zip, service_preferences, budget_range,
            service_frequency, preferred_times, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            userId,
            address.street,
            address.city,
            address.state,
            address.zipCode,
            JSON.stringify(preferences.serviceTypes),
            preferences.budgetRange,
            preferences.serviceFrequency,
            JSON.stringify(preferences.preferredTimes)
          ]
        );

        // Create initial project
        if (initialProject.projectType) {
          await sqliteDb.run(
            `INSERT INTO jobs (
              id, title, description, budget, timeline,
              posted_by, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              uuidv4(),
              `New ${initialProject.projectType} Project`,
              initialProject.description,
              initialProject.budget,
              initialProject.timeline,
              userId
            ]
          );
        }

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
          [basicInfo.email]
        );

        if (existingUser.length > 0) {
          throw new Error('Email already registered');
        }

        // Create user with client role
        await connection.execute(
          `INSERT INTO users (
            id, email, name, password, roles, active_role, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            basicInfo.email,
            `${basicInfo.firstName} ${basicInfo.lastName}`,
            hashedPassword,
            JSON.stringify(['client']),
            'client'
          ]
        );

        // Create client profile
        await connection.execute(
          `INSERT INTO client_profiles (
            user_id, address_street, address_city, address_state,
            address_zip, service_preferences, budget_range,
            service_frequency, preferred_times, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            address.street,
            address.city,
            address.state,
            address.zipCode,
            JSON.stringify(preferences.serviceTypes),
            preferences.budgetRange,
            preferences.serviceFrequency,
            JSON.stringify(preferences.preferredTimes)
          ]
        );

        // Create initial project
        if (initialProject.projectType) {
          await connection.execute(
            `INSERT INTO jobs (
              id, title, description, budget, timeline,
              posted_by, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
            [
              uuidv4(),
              `New ${initialProject.projectType} Project`,
              initialProject.description,
              initialProject.budget,
              initialProject.timeline,
              userId
            ]
          );
        }
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