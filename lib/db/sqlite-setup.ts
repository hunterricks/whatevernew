import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initializeSQLite() {
  try {
    const db = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        password TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create any other necessary tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    console.log('SQLite database schema initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw error;
  }
} 