import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

// Log full connection details for debugging
console.log('Full connection details:', {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]',
  database: process.env.DB_NAME || 'whatever',
});

async function testConnection() {
  if (isWebContainer) {
    try {
      const db = await open({
        filename: './auth.db', // Persistent SQLite database file
        driver: sqlite3.Database,
      });

      await db.get('SELECT 1');
      console.log('SQLite connection successful');
      await db.close();
    } catch (error) {
      console.error('SQLite connection failed:', error);
      throw error;
    }
  } else {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
      });

      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'whatever'}\``
      );
      console.log('Database created or already exists');

      await connection.query(`USE \`${process.env.DB_NAME || 'whatever'}\``);
      console.log('Switched to database successfully');

      await connection.query('SELECT 1');
      console.log('MySQL connection successful');
      await connection.end();
    } catch (error) {
      console.error('MySQL connection failed:', error);
      throw error;
    }
  }
}

// Migration logic (example: running SQL files)
async function runMigrations() {
  try {
    await testConnection();

    const migrationsPath = path.join(__dirname, 'sql');
    const files = await fs.readdir(migrationsPath);

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsPath, file);
        const sql = await fs.readFile(filePath, 'utf-8');

        if (isWebContainer) {
          const db = await open({
            filename: './auth.db',
            driver: sqlite3.Database,
          });
          await db.exec(sql);
          await db.close();
        } else {
          const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'whatever',
          });
          await connection.query(sql);
          await connection.end();
        }

        console.log(`Executed migration: ${file}`);
      }
    }

    console.log('All migrations executed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();