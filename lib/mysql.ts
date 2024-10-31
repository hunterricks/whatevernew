import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false  // Allow self-signed certs for AWS RDS
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (sql: string, params?: any[]) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const transaction = async (queries: { sql: string; params?: any[] }[]) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const results = [];
    for (const q of queries) {
      const [result] = await connection.execute(q.sql, q.params);
      results.push(result);
    }
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
