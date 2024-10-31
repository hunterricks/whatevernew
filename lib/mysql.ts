import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { MOCK_USERS } from '@/app/api/auth/mock/route';

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

// Only import mysql2 if not in web container mode
let mysql;
if (!isWebContainer) {
  mysql = require('mysql2/promise');
}

export const shouldPopulateTestData = isWebContainer || process.env.NODE_ENV === 'development';

// Database configuration types
interface MySQLDbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectTimeout: number;
  waitForConnections: boolean;
  connectionLimit: number;
  maxIdle: number;
  idleTimeout: number;
  queueLimit: number;
  enableKeepAlive: boolean;
  keepAliveInitialDelay: number;
  ssl?: {
    rejectUnauthorized: boolean;
  };
  namedPlaceholders?: boolean;
  dateStrings?: boolean;
}

let pool: typeof mysql.Pool | null = null;
let sqliteDb: any = null;
let isSchemaInitialized = false;

// Initialize SQLite Database
const initializeSQLite = async () => {
  try {
    if (!sqliteDb) {
      sqliteDb = await open({
        filename: ':memory:',
        driver: sqlite3.Database
      });
      console.log('Initialized SQLite in-memory database');
    }
    return sqliteDb;
  } catch (error) {
    console.error('Error initializing SQLite:', error);
    throw error;
  }
};

// Transaction Helper
export const transaction = async <T>(callback: (db: any) => Promise<T>): Promise<T> => {
  if (isWebContainer) {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');
    try {
      const result = await callback(db);
      await db.run('COMMIT');
      return result;
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } else {
    if (!pool) initializeMySQL();
    const connection = await pool!.getConnection();
    await connection.beginTransaction();
    try {
      const result = await callback(connection);
      await connection.commit();
      connection.release();
      return result;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }
};

// Get Database Instance
export const getDb = async () => {
  if (isWebContainer) {
    if (!sqliteDb) {
      await initializeSQLite();
      if (!isSchemaInitialized) {
        await initializeSchema();
      }
    }
    return sqliteDb;
  }
  if (!pool) initializeMySQL();
  return pool;
};

// Initialize MySQL Pool
const initializeMySQL = () => {
  const config: MySQLDbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'whatever_db',
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    connectTimeout: 20000,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    keepAliveInitialDelay: 0,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: true
    } : undefined,
    namedPlaceholders: true,
    dateStrings: true,
  };

  pool = mysql.createPool(config);
};

// Query Helper Function
export const query = async (sql: string, params?: any[]) => {
  if (isWebContainer) {
    try {
      const db = await getDb();
      // Convert MySQL syntax to SQLite
      const sqliteSql = sql
        .replace(/`/g, '"')
        .replace(/NOW\(\)/g, 'CURRENT_TIMESTAMP')
        .replace(/ON DUPLICATE KEY UPDATE/g, 'ON CONFLICT(id) DO UPDATE SET')
        .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL')
        .replace(/VALUES\(([^)]+)\)/g, 'excluded.$1')
        .replace(/IGNORE/g, 'OR IGNORE');
      
      return await db.all(sqliteSql, params);
    } catch (error) {
      console.error('SQLite query error:', error);
      throw error;
    }
  } else {
    if (!pool) initializeMySQL();
    try {
      const [results] = await pool!.execute(sql, params);
      return results;
    } catch (error) {
      console.error('MySQL query error:', error);
      throw error;
    }
  }
};

// Schema Initialization
const initializeSchema = async () => {
  if (isSchemaInitialized) return;
  
  try {
    const db = await getDb();
    
    if (isWebContainer) {
      await db.exec(`
        BEGIN TRANSACTION;
        
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          activeRole TEXT DEFAULT 'client',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          budget REAL,
          status TEXT DEFAULT 'open',
          client_id TEXT NOT NULL,
          service_provider_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES users(id),
          FOREIGN KEY (service_provider_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS skills (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS job_skills (
          job_id TEXT NOT NULL,
          skill_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (job_id, skill_id),
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
          FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS proposals (
          id TEXT PRIMARY KEY,
          job_id TEXT NOT NULL,
          service_provider_id TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          cover_letter TEXT,
          price REAL,
          estimated_duration INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
          FOREIGN KEY (service_provider_id) REFERENCES users(id)
        );
        
        COMMIT;
      `);
      
      // Populate initial data
      await populateTestData();
      
      isSchemaInitialized = true;
      console.log('SQLite schema and initial data initialized successfully');
    } else {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          activeRole VARCHAR(50) DEFAULT 'client',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          budget DECIMAL(10,2),
          status VARCHAR(50) DEFAULT 'open',
          client_id VARCHAR(255) NOT NULL,
          service_provider_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES users(id),
          FOREIGN KEY (service_provider_id) REFERENCES users(id)
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS skills (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS job_skills (
          job_id VARCHAR(255) NOT NULL,
          skill_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (job_id, skill_id),
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
          FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS user_skills (
          user_id VARCHAR(255) NOT NULL,
          skill_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, skill_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS proposals (
          id VARCHAR(255) PRIMARY KEY,
          job_id VARCHAR(255) NOT NULL,
          service_provider_id VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          cover_letter TEXT,
          price DECIMAL(10,2),
          estimated_duration INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
          FOREIGN KEY (service_provider_id) REFERENCES users(id)
        );
      `);
    }

    console.log(`${isWebContainer ? 'SQLite' : 'MySQL'} schema initialized successfully`);
  } catch (error) {
    console.error('Schema initialization error:', error);
    throw error;
  }
};

// Initialize Database
const initializeDatabase = async () => {
  try {
    await getDb(); // This will handle both initialization and schema creation
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    if (isWebContainer) {
      console.log('Continuing in web container mode despite database initialization failure');
    } else {
      throw error;
    }
  }
};

// Populate Test Data
const populateTestData = async () => {
  try {
    // Insert users
    for (const user of Object.values(MOCK_USERS)) {
      await sqliteDb.run(`
        INSERT OR REPLACE INTO users (id, email, name, activeRole)
        VALUES (?, ?, ?, ?)
      `, [user.id, user.email, user.name, user.activeRole]);
    }

    // Insert sample skills
    const sampleSkills = [
      { id: 'skill-1', name: 'JavaScript' },
      { id: 'skill-2', name: 'Python' },
      { id: 'skill-3', name: 'React' },
      { id: 'skill-4', name: 'Node.js' }
    ];

    for (const skill of sampleSkills) {
      await sqliteDb.run(`
        INSERT OR REPLACE INTO skills (id, name)
        VALUES (?, ?)
      `, [skill.id, skill.name]);
    }

    // Insert sample jobs
    const sampleJobs = [
      {
        id: 'job-1',
        title: 'Sample Job 1',
        description: 'This is a sample job',
        budget: 1000.00,
        client_id: MOCK_USERS.client.id,
        status: 'open',
        skills: ['skill-1', 'skill-2']
      },
      {
        id: 'job-2',
        title: 'Sample Job 2',
        description: 'Another sample job',
        budget: 2000.00,
        client_id: MOCK_USERS.dual.id,
        status: 'open',
        skills: ['skill-3', 'skill-4']
      }
    ];

    for (const job of sampleJobs) {
      await sqliteDb.run(`
        INSERT OR REPLACE INTO jobs (id, title, description, budget, client_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [job.id, job.title, job.description, job.budget, job.client_id, job.status]);

      // Insert job skills
      for (const skillId of job.skills) {
        await sqliteDb.run(`
          INSERT OR REPLACE INTO job_skills (job_id, skill_id)
          VALUES (?, ?)
        `, [job.id, skillId]);
      }
    }

    // Add sample proposals
    const sampleProposals = [
      {
        id: 'proposal-1',
        job_id: 'job-1',
        service_provider_id: MOCK_USERS.serviceProvider.id,
        status: 'pending',
        cover_letter: 'I would love to work on this project!',
        price: 950.00,
        estimated_duration: 14
      },
      {
        id: 'proposal-2',
        job_id: 'job-2',
        service_provider_id: MOCK_USERS.dual.id,
        status: 'pending',
        cover_letter: 'I have experience with similar projects.',
        price: 1800.00,
        estimated_duration: 30
      }
    ];

    for (const proposal of sampleProposals) {
      await sqliteDb.run(`
        INSERT OR REPLACE INTO proposals (
          id, job_id, service_provider_id, status, cover_letter, price, estimated_duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        proposal.id,
        proposal.job_id,
        proposal.service_provider_id,
        proposal.status,
        proposal.cover_letter,
        proposal.price,
        proposal.estimated_duration
      ]);
    }

    console.log('Test data populated successfully');
  } catch (error) {
    console.error('Error populating test data:', error);
    throw error;
  }
};

// Initialize database on module load (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase().catch(console.error);
}

export { sqliteDb, pool };


