const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

async function verify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    const email = 'student1@college.edu';
    console.log(`Checking for: ${email}`);

    const userRes = await client.query("SELECT id, name, email, role, student_id FROM users WHERE email = $1", [email]);
    console.log("User results:", userRes.rows);

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      const profileRes = await client.query("SELECT * FROM student_profiles WHERE user_id = $1", [user.id]);
      console.log("Profile results:", profileRes.rows);
    } else {
      console.log("User NOT found.");
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

verify();
