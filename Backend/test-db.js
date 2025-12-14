// test-db.js
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const [rows] = await pool.execute('SELECT 1 + 1 AS sum');
    console.log('DB OK:', rows);
    // optional: list the user
    const [urows] = await pool.execute('SELECT id,email,role FROM users LIMIT 5');
    console.log('Sample users:', urows);
    process.exit(0);
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
})();
