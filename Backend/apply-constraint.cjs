const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

async function apply() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected.");

    // Add unique constraint if not exists
    await client.query(`
      ALTER TABLE student_profiles 
      ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);
    `);
    
    console.log("✅ Unique constraint added.");

  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log("Constraint already exists.");
    } else {
      console.error(err);
    }
  } finally {
    await client.end();
  }
}

apply();
