import { query, transaction, checkDatabaseHealth } from '../lib/mysql';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
  email: string;
  activeRole: string;
  created_at?: string;
  updated_at?: string;
}

async function initializeTestDatabase() {
  try {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        activeRole VARCHAR(20) DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);
  } catch (error) {
    console.error('Failed to initialize test database:', error);
    throw error;
  }
}

async function cleanupTestData() {
  await query('DELETE FROM users WHERE id LIKE ?', ['test-%']);
}

describe('Database Connection', () => {
  test('should connect to database', async () => {
    const result = await query('SELECT 1 as test');
    expect(result).toBeDefined();
  });
});

describe('Database Adapter Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Basic CRUD Operations', () => {
    test('should create a user', async () => {
      // Arrange
      const testUser: User = {
        id: `test-${uuidv4()}`,
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        activeRole: 'client'
      };

      // Act - Insert
      await query<any>(
        'INSERT INTO users (id, name, email, activeRole) VALUES (?, ?, ?, ?)',
        [testUser.id, testUser.name, testUser.email, testUser.activeRole]
      );

      // Act - Select
      const results = await query<User[]>(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [testUser.id]
      );

      const result = results[0];

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.name).toBe(testUser.name);
      expect(result.email).toBe(testUser.email);
      expect(result.activeRole).toBe(testUser.activeRole);
    });
  });

  // Close pool after all tests
  afterAll(async () => {
    const pool = require('../lib/mysql').default;
    await pool.end();
  });
});