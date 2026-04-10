require('dotenv').config();
const { Pool } = require('pg');

const isRemote = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('render'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : false
});

async function applySchema() {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    console.log("Adding Google OAuth columns to users table...");
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
      ADD COLUMN IF NOT EXISTS google_access_token TEXT,
      ADD COLUMN IF NOT EXISTS google_token_expiry BIGINT;
    `);

    console.log("Adding Google Meet columns to online_classes table...");
    await client.query(`
      ALTER TABLE online_classes 
      ADD COLUMN IF NOT EXISTS gmeet_link TEXT,
      ADD COLUMN IF NOT EXISTS google_event_id TEXT;
    `);

    await client.query('COMMIT');
    console.log("Schema update successful!");
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Schema update failed:", err.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

applySchema();
