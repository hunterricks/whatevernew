import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

console.log('Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]',
  DB_NAME: process.env.DB_NAME,
});

async function testConnection() {
  try {
    if (isWebContainer) {
      console.log('Attempting to connect to SQLite...');
      const db = await open({
        filename: ':memory:', // In-memory database for testing
        driver: sqlite3.Database,
      });

      console.log('Connected to SQLite successfully');

      // Create a sample table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS sample (
          id TEXT PRIMARY KEY,
          data TEXT
        )
      `);

      // Insert sample data
      await db.run('INSERT INTO sample (id, data) VALUES (?, ?)', ['1', 'test data']);

      // Retrieve sample data
      const row = await db.get('SELECT * FROM sample WHERE id = ?', ['1']);
      console.log('Sample data retrieved:', row);

      await db.close();
      console.log('SQLite connection closed successfully');
    } else {
      console.log('Attempting to connect to MySQL...');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
      });

      console.log('Connected to MySQL successfully');

      // Create database if it doesn't exist
      console.log('Creating database...');
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'whatever'}\``
      );
      console.log('Database created or already exists');

      // Switch to the database
      console.log('Switching to database...');
      await connection.query(`USE \`${process.env.DB_NAME || 'whatever'}\``);
      console.log('Switched to database successfully');

      // Test query
      const [result] = await connection.query('SELECT 1 as test');
      console.log('Test query result:', result);

      await connection.end();
      console.log('Connection closed successfully');
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection(); 