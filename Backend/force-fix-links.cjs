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
    console.log("Connected. Fixing links based on your ID ranges...");

    // 1. Clear existing links to start fresh
    await client.query("DELETE FROM course_teachers");
    await client.query("DELETE FROM course_students");

    const courseIds = Array.from({length: 20}, (_, i) => i + 1); // 1-20
    const teacherIds = Array.from({length: 20}, (_, i) => i + 6); // 6-25
    const studentIds = Array.from({length: 75}, (_, i) => i + 26); // 26-100

    console.log("Linking Teachers (6-25) to Courses (1-20)...");
    for (const cid of courseIds) {
      // Assign 2 teachers to each course systematically
      const t1 = teacherIds[(cid - 1) % teacherIds.length];
      const t2 = teacherIds[cid % teacherIds.length];
      await client.query("INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [cid, t1]);
      await client.query("INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [cid, t2]);
    }

    console.log("Linking Students (26-100) to Courses (1-20)...");
    for (const sid of studentIds) {
      // Assign each student to 5 random courses from the 1-20 range
      const shuffled = [...courseIds].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      for (const cid of selected) {
        await client.query("INSERT INTO course_students (course_id, student_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [cid, sid]);
      }
    }

    console.log("✅ Force fix complete!");
    console.log("Teachers 6-25 and Students 26-100 are now linked to Courses 1-20.");

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

fix();
