const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');
const fs = require('fs');

async function importData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // Define the data to import in order to satisfy foreign keys
    const data = {
      users: [
        [3, 'Test Student', 'student1@college.edu', '$2b$12$R9y2RZ2wWHZdeGJKx/211.5QwLkSSQInZ33SCoEUxhGI6hQpFVmPu', 'student', 'STU2025001', null],
        [4, 'Test teacher', 'teacher@college.edu', '$2b$12$KfaSSaT6Kpt0LlIl/4zsC.OzXjaOvaO7iqy4sjOAPg1s.7fu6.wCO', 'teacher', null, 'TEACHER2025001'],
        [5, 'Test admin', 'admin@college.edu', '$2b$12$SwxkdzK2upSMB0/5YazqjOFGIg7NdWGko.KA3dpo39iG2U6KSqOiW', 'admin', null, 'ADM2025001']
      ],
      student_profiles: [
        [3, 'STU2025001', 'Test Student', 'Computer Science Engineering', 'B.Tech', 6, 'A', '2021-2025', '2003-03-15', 'Male', 'O+', 'test.student1@student.edu', '+91-9000000001', '123 College Road, City, State 12345', 'Test Parent1', '+91-9000000002', 'Test Parent2', '+91-9000000003', 'test.parent@email.com', '21CS101', 'REG2021CS0156', 2021, 8.50, 'Active', 'Test Mentor']
      ],
      courses: [
        [1, 'CS301', 'Data Structures', '6 months'],
        [2, 'CS302', 'Algorithms', '3 months'],
        [3, 'CS303', 'Databases', 'Mon–Fri 2:00 PM – 3:00 PM']
      ],
      course_students: [
        [1, 1, 3],
        [2, 2, 3],
        [3, 3, 3]
      ],
      course_teachers: [
        [7, 1, 4],
        [8, 2, 4],
        [9, 3, 4]
      ],
      course_lectures: [
        [1, 1, 'Introduction to Data Structures', 'What are data structures and why we need them', 'https://www.youtube.com/watch?v=HBcHlWCDOT0', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1],
        [2, 1, 'Arrays and Linked Lists', 'Understanding linear data structures', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 2],
        [3, 1, 'Stacks and Queues', 'LIFO and FIFO structures explained', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', null, 3],
        [4, 2, 'Introduction to Algorithms', 'Algorithm basics and complexity', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1],
        [5, 2, 'Sorting Algorithms', 'Bubble, Merge and Quick sort', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', null, 2],
        [6, 3, 'Introduction to Databases', 'What is DBMS and RDBMS', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1],
        [7, 3, 'SQL Basics', 'Writing SELECT, INSERT, UPDATE queries', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', null, 2]
      ],
      course_materials: [
        [1, 1, 'Data Structures Complete Notes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
        [2, 2, 'Algorithms Quick Reference', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
        [3, 3, 'Database SQL Handbook', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
      ],
      attendance_sessions: [
        [1, 1, 4, '2024-12-01', '10:00:00', '11:00:00'],
        [2, 1, 4, '2024-12-02', '10:00:00', '11:00:00'],
        [3, 1, 4, '2024-12-03', '10:00:00', '11:00:00'],
        [4, 2, 4, '2024-12-01', '11:00:00', '12:00:00'],
        [5, 2, 4, '2024-12-02', '11:00:00', '12:00:00'],
        [6, 2, 4, '2024-12-03', '11:00:00', '12:00:00'],
        [7, 3, 4, '2024-12-01', '12:00:00', '13:00:00'],
        [8, 3, 4, '2024-12-02', '12:00:00', '13:00:00'],
        [9, 3, 4, '2024-12-03', '12:00:00', '13:00:00']
      ],
      attendance_records: [
        [1, 1, 3, 'present'],
        [2, 2, 3, 'present'],
        [3, 3, 3, 'absent'],
        [4, 4, 3, 'present'],
        [5, 5, 3, 'present'],
        [6, 6, 3, 'present'],
        [7, 7, 3, 'absent'],
        [8, 8, 3, 'present'],
        [9, 9, 3, 'present']
      ],
      classes: [
        [1, 1, 4, '2025-12-15', '09:00:00', '10:00:00', 'Room 301', 'CS-A'],
        [2, 2, 4, '2025-12-15', '11:00:00', '12:00:00', 'Room 302', 'CS-B'],
        [3, 1, 4, '2025-12-16', '10:00:00', '11:00:00', 'Lab 105', 'CS-A']
      ],
      student_lecture_progress: [
        [1, 3, 1, true, '2026-01-18 20:17:18'],
        [2, 3, 2, true, '2026-01-18 20:17:18'],
        [3, 3, 4, true, '2026-01-18 20:17:18']
      ]
    };

    console.log("Starting import...");

    // Import Users
    for (const u of data.users) {
      await client.query(
        "INSERT INTO users (id, name, email, password_hash, role, student_id, employee_code) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email",
        u
      );
    }
    console.log("Users imported.");

    // Import Student Profiles
    for (const p of data.student_profiles) {
      await client.query("DELETE FROM student_profiles WHERE user_id = $1", [p[0]]);
      await client.query(
        "INSERT INTO student_profiles (user_id, student_id, full_name, department, program, semester, section, batch, date_of_birth, gender, blood_group, email, phone, address, father_name, father_phone, mother_name, mother_phone, guardian_email, roll_number, registration_number, admission_year, current_cgpa, academic_status, mentor_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)",
        p
      );
    }
    console.log("Student profiles imported.");

    // Import Courses
    for (const c of data.courses) {
      await client.query(
        "INSERT INTO courses (id, course_code, course_name, course_timing) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
        c
      );
    }
    console.log("Courses imported.");

    // Import Course Students
    for (const cs of data.course_students) {
      await client.query(
        "INSERT INTO course_students (id, course_id, student_user_id) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
        cs
      );
    }
    console.log("Course-Student links imported.");

    // Import Course Teachers
    for (const ct of data.course_teachers) {
      await client.query(
        "INSERT INTO course_teachers (id, course_id, teacher_user_id) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
        ct
      );
    }
    console.log("Course-Teacher links imported.");

    // Import Lectures
    for (const l of data.course_lectures) {
      await client.query(
        "INSERT INTO course_lectures (id, course_id, title, sub_title, video_url, notes_url, lecture_order) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING",
        l
      );
    }
    console.log("Lectures imported.");

    // Import Materials
    for (const m of data.course_materials) {
      await client.query(
        "INSERT INTO course_materials (id, course_id, title, file_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
        m
      );
    }
    console.log("Materials imported.");

    // Import Attendance Sessions
    for (const as of data.attendance_sessions) {
      await client.query(
        "INSERT INTO attendance_sessions (id, course_id, teacher_user_id, class_date, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING",
        as
      );
    }
    console.log("Attendance sessions imported.");

    // Import Attendance Records
    for (const ar of data.attendance_records) {
      await client.query(
        "INSERT INTO attendance_records (id, session_id, student_user_id, status) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
        ar
      );
    }
    console.log("Attendance records imported.");

    // Import Classes
    for (const cl of data.classes) {
      await client.query(
        "INSERT INTO classes (id, course_id, teacher_user_id, class_date, start_time, end_time, room, section) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING",
        cl
      );
    }
    console.log("Classes imported.");

    // Import Progress
    for (const slp of data.student_lecture_progress) {
      await client.query(
        "INSERT INTO student_lecture_progress (id, student_user_id, lecture_id, completed, completed_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING",
        slp
      );
    }
    console.log("Lecture progress imported.");

    // Sync serial sequences
    const tables = ['users', 'courses', 'course_students', 'course_teachers', 'course_lectures', 'course_materials', 'attendance_sessions', 'attendance_records', 'classes', 'student_lecture_progress'];
    for (const table of tables) {
      await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1)) FROM ${table}`);
    }
    console.log("Serial sequences synchronized.");

    console.log("✅ All data from edulinkx (1).sql has been imported successfully.");

  } catch (err) {
    console.error("Critical error during import:", err.message);
  } finally {
    await client.end();
  }
}

importData();
