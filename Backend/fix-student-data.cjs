const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected.");

    const email = 'student1@college.edu';
    
    // 1. Update user name in users table
    await client.query("UPDATE users SET name = $1, student_id = $2 WHERE email = $3", 
      ['Test Student', 'STU2025001', email]);
    
    const userRes = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      console.log("User not found.");
      return;
    }
    
    const userId = userRes.rows[0].id;
    
    // 2. Ensure profile exists and matches
    await client.query(`
      INSERT INTO student_profiles (user_id, student_id, full_name, email, department, academic_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET 
        student_id = EXCLUDED.student_id,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email
    `, [userId, 'STU2025001', 'Test Student', email, 'Computer Science', 'Active']);

    console.log("✅ Data fixed for student1@college.edu");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

fix();
