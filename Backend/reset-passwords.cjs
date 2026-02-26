const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function reset() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    const studentPass = 'student123';
    const teacherPass = 'teacher123';

    console.log("Hashing...");
    const studentHash = await bcrypt.hash(studentPass, 10);
    const teacherHash = await bcrypt.hash(teacherPass, 10);

    console.log(`Student Hash: ${studentHash}`);
    console.log(`Teacher Hash: ${teacherHash}`);

    const res1 = await client.query("UPDATE users SET password_hash = $1 WHERE role = 'student'", [studentHash]);
    console.log(`Updated ${res1.rowCount} students.`);

    const res2 = await client.query("UPDATE users SET password_hash = $1 WHERE role = 'teacher'", [teacherHash]);
    console.log(`Updated ${res2.rowCount} teachers.`);

    console.log("Success.");
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

reset();
