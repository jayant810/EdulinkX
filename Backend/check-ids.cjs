const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected.");

    const teachers = await client.query("SELECT MIN(id), MAX(id), COUNT(*) FROM users WHERE role = 'teacher'");
    console.log("Teachers ID Range:", teachers.rows[0]);

    const students = await client.query("SELECT MIN(id), MAX(id), COUNT(*) FROM users WHERE role = 'student'");
    console.log("Students ID Range:", students.rows[0]);

    const courses = await client.query("SELECT MIN(id), MAX(id), COUNT(*) FROM courses");
    console.log("Courses ID Range:", courses.rows[0]);

    const links = await client.query("SELECT COUNT(*) FROM course_teachers");
    console.log("Teacher-Course Links:", links.rows[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
