import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

export async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  if (isWebContainer) {
    try {
      // Use SQLite for web container
      const db = await open({
        filename: ':memory:', // In-memory database for web container
        driver: sqlite3.Database
      });
      
      // Test connection
      await db.get('SELECT 1');
      console.log('SQLite connection successful (web container mode)');
      
      await db.close();
      return true;
    } catch (error) {
      console.error('SQLite connection failed:', error);
      throw error;
    }
  } else {
    try {
      // Use MySQL for non-web container environments
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root'
      });

      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'whatever'}\``
      );
      await connection.query(`USE \`${process.env.DB_NAME || 'whatever'}\``);
      
      await connection.query('SELECT 1');
      console.log('MySQL connection successful');
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('MySQL connection failed:', error);
      throw error;
    }
  }
} 