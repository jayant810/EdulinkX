const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function runSeed() {
  console.log("DATABASE_URL check:", process.env.DATABASE_URL ? "URL is present" : "URL is MISSING");
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("✅ Connected to Supabase.");

    const users = [
      { name: 'System Admin', email: 'admin@edulinkx.com', password: 'admin123', role: 'admin', student_id: null, employee_code: 'ADM001' },
      { name: 'Professor Smith', email: 'teacher@edulinkx.com', password: 'teacher123', role: 'teacher', student_id: null, employee_code: 'FAC001' },
      { name: 'John Student', email: 'student@edulinkx.com', password: 'student123', role: 'student', student_id: 'STU001', employee_code: null }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      try {
        console.log(`Inserting user: ${user.email}`);
        await client.query(
          `INSERT INTO users (name, email, password_hash, role, student_id, employee_code) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
          [user.name, user.email, hashedPassword, user.role, user.student_id, user.employee_code]
        );
        console.log(`✅ User ${user.email} seeded.`);
      } catch (e) {
        console.error(`❌ Error for ${user.email}:`, e);
      }
    }
  } catch (err) {
    console.error("Critical connection error:", err);
  } finally {
    await client.end();
  }
}

runSeed();
