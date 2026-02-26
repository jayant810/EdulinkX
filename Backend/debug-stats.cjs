const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

async function debug() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected.");

    // Check course_teachers
    const ct = await client.query("SELECT COUNT(*) FROM course_teachers");
    console.log("Total entries in course_teachers:", ct.rows[0].count);

    // Check course_students
    const cs = await client.query("SELECT COUNT(*) FROM course_students");
    console.log("Total entries in course_students:", cs.rows[0].count);

    // Check a sample teacher
    const sampleTeacher = await client.query("SELECT id, name FROM users WHERE role = 'teacher' LIMIT 1");
    if (sampleTeacher.rows.length > 0) {
      const tid = sampleTeacher.rows[0].id;
      console.log(`Checking stats for teacher: ${sampleTeacher.rows[0].name} (ID: ${tid})`);
      
      const courses = await client.query("SELECT course_id FROM course_teachers WHERE teacher_user_id = $1", [tid]);
      console.log("Course IDs linked to this teacher:", courses.rows.map(r => r.course_id));

      if (courses.rows.length > 0) {
        const cids = courses.rows.map(r => r.course_id);
        const students = await client.query("SELECT COUNT(DISTINCT student_user_id) FROM course_students WHERE course_id = ANY($1)", [cids]);
        console.log("Students in these courses:", students.rows[0].count);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

debug();
