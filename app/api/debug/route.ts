import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';

const TIMEOUT_MS = 10000; // 10 second timeout

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    await transaction(async (connection) => {
      try {
        // Insert test user if none exist
        await connection.execute(`
          INSERT IGNORE INTO users (
            id, email, name, role, created_at, updated_at
          ) VALUES (
            'test-1',
            'test@example.com',
            'Test User',
            'client',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `);

        // Insert test service provider if none exist
        await connection.execute(`
          INSERT IGNORE INTO users (
            id, email, name, role, created_at, updated_at
          ) VALUES (
            'test-2',
            'provider@example.com',
            'Test Provider',
            'service_provider',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `);

        // Insert test job if none exist
        await connection.execute(`
          INSERT IGNORE INTO jobs (
            id, title, description, category, location, 
            budget, budget_type, scope, duration, experience_level, 
            posted_by, status, created_at, updated_at
          ) VALUES (
            'job-1', 
            'Test Job', 
            'Test Description', 
            'Development',
            'Remote',
            1000,
            'fixed',
            'small',
            '1-week',
            'entry',
            'test-1',
            'open',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `);

        // Get all tables
        const [tables] = await connection.execute(`
          SELECT table_name as name 
          FROM information_schema.tables
          WHERE table_schema = DATABASE()
        `);

        // Get table counts
        const [[userCount]] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [[jobCount]] = await connection.execute('SELECT COUNT(*) as count FROM jobs');
        const [[reviewCount]] = await connection.execute('SELECT COUNT(*) as count FROM reviews');
        const [[providerCount]] = await connection.execute('SELECT COUNT(*) as count FROM service_provider_profiles');

        return {
          tables,
          counts: {
            users: userCount.count,
            jobs: jobCount.count,
            reviews: reviewCount.count,
            providers: providerCount.count
          }
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      );
    }
    
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { 
      status: error instanceof Error ? 500 : 400 
    });
  } finally {
    clearTimeout(timeoutId);
  }
}