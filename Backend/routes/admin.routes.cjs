const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");
const bcrypt = require("bcrypt");
const { PdfReader } = require("pdfreader");
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer();

// Helper to generate sequential student ID: STU<Year><3-digit-seq>
async function generateStudentId() {
  const year = new Date().getFullYear();
  const prefix = `STU${year}`;
  
  const { rows } = await pool.query(
    `SELECT student_id FROM users 
     WHERE student_id LIKE $1 
     ORDER BY student_id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const lastId = rows[0].student_id;
    const lastSeqStr = lastId.substring(prefix.length); 
    const lastSeq = parseInt(lastSeqStr) || 0;
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
}

// Helper to generate sequential teacher ID: FAC<Year><3-digit-seq>
async function generateTeacherId() {
  const year = new Date().getFullYear();
  const prefix = `FAC${year}`;
  
  const { rows } = await pool.query(
    `SELECT employee_code FROM users 
     WHERE employee_code LIKE $1 
     ORDER BY employee_code DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const lastId = rows[0].employee_code;
    const lastSeqStr = lastId.substring(prefix.length); 
    const lastSeq = parseInt(lastSeqStr) || 0;
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
}

// Helper to generate course code based on department name
async function generateCourseCode(deptName) {
  if (!deptName) return "XX001";

  const words = deptName.trim().split(/\s+/);
  let prefix = "";

  if (words.length === 1) {
    const word = words[0];
    prefix = (word[0] + word[word.length - 1]).toUpperCase();
  } else {
    const word = words[0];
    prefix = (word[0] + (word[1] || 'X')).toUpperCase();
  }

  const { rows } = await pool.query("SELECT COUNT(*) as count FROM courses");
  const count = parseInt(rows[0].count) || 0;
  const nextSeq = count + 1;
  return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
}

// Middleware: Check if user is admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admins only." });
  }
}

router.use(isAdmin);

// --- DEPARTMENTS ---

router.get("/departments", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM departments ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/departments", async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error or department exists" });
  }
});

// --- COURSES ---

router.get("/courses/generate-code", async (req, res) => {
  const { department } = req.query;
  if (!department) return res.status(400).json({ error: "Department is required" });
  try {
    const code = await generateCourseCode(department);
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) as student_count,
             (SELECT COUNT(*) FROM course_teachers ct WHERE ct.course_id = c.id) as teacher_count
      FROM courses c 
      ORDER BY c.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/courses", async (req, res) => {
  let { course_name, course_code, course_description, credits, course_timing, department } = req.body;
  try {
    if (!course_code) {
      if (!department) return res.status(400).json({ error: "Department is required" });
      course_code = await generateCourseCode(department);
    }
    const [rows] = await pool.execute(
      "INSERT INTO courses (course_name, course_code, course_description, credits, course_timing, department) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
      [course_name, course_code, course_description || "", credits || 0, course_timing || "", department]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.put("/courses/:id", async (req, res) => {
  const { course_name, course_code, course_description, credits, course_timing, department } = req.body;
  try {
    await pool.query(
      "UPDATE courses SET course_name = $1, course_code = $2, course_description = $3, credits = $4, course_timing = $5, department = $6 WHERE id = $7",
      [course_name, course_code, course_description, credits, course_timing, department, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- ATTENDANCE ---

router.get("/attendance/stats", async (req, res) => {
  try {
    const { rows: overall } = await pool.query(`
      SELECT ROUND(COALESCE((SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0)) as percentage 
      FROM attendance_records`);

    const { rows: below75 } = await pool.query(`
      SELECT COUNT(*) as count FROM (
        SELECT student_user_id, 
               (SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100 as perc
        FROM attendance_records
        GROUP BY student_user_id
        HAVING (SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100 < 75
      ) as low_attendance`);

    const { rows: todayStats } = await pool.query(`
      SELECT 
        SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) as absent
      FROM attendance_records r
      JOIN attendance_sessions s ON r.session_id = s.id
      WHERE s.class_date = CURRENT_DATE`);

    res.json({
      overallPercentage: parseInt(overall[0]?.percentage || 0),
      below75Count: parseInt(below75[0]?.count || 0),
      todayPresent: parseInt(todayStats[0]?.present || 0),
      todayAbsent: parseInt(todayStats[0]?.absent || 0)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/attendance/departments", async (req, res) => {
  try {
    const { rows: depts } = await pool.query(`
      SELECT d.name, 
             ROUND(COALESCE((SUM(CASE WHEN r.status='present' THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(r.id), 0)) * 100, 0)) as percentage
      FROM departments d
      LEFT JOIN student_profiles sp ON sp.department = d.name
      LEFT JOIN attendance_records r ON r.student_user_id = sp.user_id
      GROUP BY d.name
      ORDER BY percentage DESC`);
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- HOLIDAYS ---

router.get("/holidays", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM holidays ORDER BY holiday_date ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/holidays", async (req, res) => {
  const { holiday_date, title, description, is_weekend } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO holidays (holiday_date, title, description, is_weekend) VALUES ($1, $2, $3, $4) ON CONFLICT (holiday_date) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_weekend = EXCLUDED.is_weekend RETURNING *",
      [holiday_date, title, description, is_weekend || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.put("/holidays/:id", async (req, res) => {
  const { holiday_date, title, description, is_weekend } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE holidays SET holiday_date = $1, title = $2, description = $3, is_weekend = $4 WHERE id = $5 RETURNING *",
      [holiday_date, title, description, is_weekend, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/holidays/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM holidays WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- TEACHERS ---

router.get("/teachers", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.employee_code, tp.department, tp.designation, tp.academic_status
      FROM users u
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'teacher'
      ORDER BY u.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/teachers", async (req, res) => {
  const { name, email, department, designation } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const empCode = await generateTeacherId();
    const hashedPassword = await bcrypt.hash('teacher', 10);
    const { rows: userRows } = await client.query(
      "INSERT INTO users (name, email, password_hash, role, employee_code) VALUES ($1, $2, $3, 'teacher', $4) RETURNING id",
      [name, email, hashedPassword, empCode]
    );
    await client.query(
      "INSERT INTO teacher_profiles (user_id, employee_code, full_name, email, department, designation) VALUES ($1, $2, $3, $4, $5, $6)",
      [userRows[0].id, empCode, name, email, department, designation]
    );
    await client.query('COMMIT');
    res.status(201).json({ success: true, employee_code: empCode });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Server error", details: err.message });
  } finally {
    client.release();
  }
});

// --- STUDENTS ---

router.get("/students", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.student_id, u.role, sp.department, sp.semester, sp.academic_status
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/students", async (req, res) => {
  const { name, email, department, semester } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const studentId = await generateStudentId();
    const hashedPassword = await bcrypt.hash('student', 10);
    const { rows: userRows } = await client.query(
      "INSERT INTO users (name, email, password_hash, role, student_id) VALUES ($1, $2, $3, 'student', $4) RETURNING id",
      [name, email, hashedPassword, studentId]
    );
    await client.query(
      "INSERT INTO student_profiles (user_id, student_id, full_name, email, department, semester, academic_status) VALUES ($1, $2, $3, $4, $5, $6, 'Active')",
      [userRows[0].id, studentId, name, email, department, semester]
    );
    await client.query('COMMIT');
    res.status(201).json({ success: true, student_id: studentId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Server error", details: err.message });
  } finally {
    client.release();
  }
});

// (Other student endpoints like delete, bulk upload etc can be added back if needed, 
// keeping it clean for now to ensure holidays work)

// --- DEPARTMENT-STUDENT MANAGEMENT ---

// GET /admin/students/eligible — students not assigned to any department
router.get("/students/eligible", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.student_id, sp.semester
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
        AND (sp.department IS NULL OR sp.department = '')
      ORDER BY u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /admin/departments/:name/students — students in a specific department
router.get("/departments/:name/students", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.student_id, sp.semester, sp.academic_status
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student' AND sp.department = $1
      ORDER BY u.name ASC
    `, [req.params.name]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/departments/:name/add-student — assign a student to a department
router.post("/departments/:name/add-student", async (req, res) => {
  const { studentId } = req.body;
  try {
    await pool.query(
      "UPDATE student_profiles SET department = $1 WHERE student_id = $2",
      [req.params.name, studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/departments/remove-student — remove a student from their department
router.post("/departments/remove-student", async (req, res) => {
  const { studentId } = req.body;
  try {
    await pool.query(
      "UPDATE student_profiles SET department = NULL WHERE student_id = $1",
      [studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/departments/validate-bulk — validate students from an Excel file for bulk assignment
router.post("/departments/validate-bulk", upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = [];
    for (const row of data) {
      const studentId = row['Student ID'] || row['student_id'] || row['StudentID'] || row['ID'] || '';
      const excelName = row['Name'] || row['name'] || row['Student Name'] || '';

      if (!studentId) continue;

      // Check if student exists
      const { rows: found } = await pool.query(`
        SELECT u.id, u.name, u.student_id, sp.department
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.student_id = $1 AND u.role = 'student'
      `, [String(studentId).trim()]);

      if (found.length > 0) {
        const student = found[0];
        results.push({
          student_id: student.student_id,
          excel_name: excelName,
          system_name: student.name,
          found: true,
          name_mismatch: excelName && student.name.toLowerCase() !== String(excelName).toLowerCase(),
          already_assigned: !!student.department,
          current_department: student.department || null
        });
      } else {
        results.push({
          student_id: String(studentId).trim(),
          excel_name: excelName,
          found: false,
          already_assigned: false
        });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Validation failed", details: err.message });
  }
});

// POST /admin/departments/:name/process-bulk — process bulk department assignment
router.post("/departments/:name/process-bulk", async (req, res) => {
  const { students } = req.body;
  const deptName = req.params.name;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    let moved = 0;

    for (const s of students) {
      if (s.found && s.move) {
        await client.query(
          "UPDATE student_profiles SET department = $1 WHERE student_id = $2",
          [deptName, s.student_id]
        );
        moved++;
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, moved });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Bulk process failed", details: err.message });
  } finally {
    client.release();
  }
});

// --- DEPARTMENT-TEACHER MANAGEMENT ---

// GET /admin/departments/:name/teachers — list teachers in a department with roles
router.get("/departments/:name/teachers", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.employee_code, tp.designation, dt.role as dept_role
      FROM department_teachers dt
      JOIN departments d ON dt.department_id = d.id
      JOIN users u ON dt.teacher_user_id = u.id
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE d.name = $1
      ORDER BY dt.role DESC, u.name ASC
    `, [req.params.name]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /admin/teachers/eligible-dept?department=X — teachers not in selected department
router.get("/teachers/eligible-dept", async (req, res) => {
  const { department } = req.query;
  try {
    const { rows: dept } = await pool.query("SELECT id FROM departments WHERE name = $1", [department]);
    if (dept.length === 0) return res.status(404).json({ error: "Department not found" });
    const deptId = dept[0].id;

    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.employee_code, tp.designation
      FROM users u
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'teacher'
        AND u.id NOT IN (SELECT teacher_user_id FROM department_teachers WHERE department_id = $1)
      ORDER BY u.name ASC
    `, [deptId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/departments/:name/add-teacher — assign teacher to dept with role
router.post("/departments/:name/add-teacher", async (req, res) => {
  const { teacherId, role } = req.body;
  try {
    const { rows: dept } = await pool.query("SELECT id FROM departments WHERE name = $1", [req.params.name]);
    if (dept.length === 0) return res.status(404).json({ error: "Department not found" });

    await pool.query(
      "INSERT INTO department_teachers (department_id, teacher_user_id, role) VALUES ($1, $2, $3) ON CONFLICT (department_id, teacher_user_id) DO UPDATE SET role = $3",
      [dept[0].id, teacherId, role || 'professor']
    );

    // Also update teacher_profiles department field
    await pool.query("UPDATE teacher_profiles SET department = $1 WHERE user_id = $2", [req.params.name, teacherId]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/departments/:name/update-teacher-role — change role
router.post("/departments/:name/update-teacher-role", async (req, res) => {
  const { teacherId, role } = req.body;
  try {
    const { rows: dept } = await pool.query("SELECT id FROM departments WHERE name = $1", [req.params.name]);
    if (dept.length === 0) return res.status(404).json({ error: "Department not found" });

    await pool.query(
      "UPDATE department_teachers SET role = $1 WHERE department_id = $2 AND teacher_user_id = $3",
      [role, dept[0].id, teacherId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/departments/remove-teacher — remove teacher from department
router.post("/departments/remove-teacher", async (req, res) => {
  const { teacherId } = req.body;
  try {
    await pool.query("DELETE FROM department_teachers WHERE teacher_user_id = $1", [teacherId]);
    // Clear department from teacher_profiles
    await pool.query("UPDATE teacher_profiles SET department = NULL WHERE user_id = $1", [teacherId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// --- COURSE PARTICIPANT MANAGEMENT ---

// GET /admin/courses/:id/participants — List all students and teachers enrolled in a course
router.get("/courses/:id/participants", async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Get Teachers
    const { rows: teachers } = await pool.query(`
      SELECT u.id, u.name, u.employee_code as identifier, 'Teacher' as role
      FROM course_teachers ct
      JOIN users u ON ct.teacher_user_id = u.id
      WHERE ct.course_id = $1
    `, [courseId]);

    // Get Students
    const { rows: students } = await pool.query(`
      SELECT u.id, u.name, u.student_id as identifier, 'Student' as role
      FROM course_students cs
      JOIN users u ON cs.student_user_id = u.id
      WHERE cs.course_id = $1
    `, [courseId]);

    // Combine and sort
    const participants = [...teachers, ...students].sort((a, b) => a.name.localeCompare(b.name));
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /admin/courses/:id/eligible — List users not yet enrolled, from the same department
router.get("/courses/:id/eligible", async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const { rows: courseQuery } = await pool.query("SELECT department FROM courses WHERE id = $1", [courseId]);
    if (courseQuery.length === 0) return res.status(404).json({ error: "Course not found" });
    const department = courseQuery[0].department;

    // Eligible Teachers (in department, not in this course)
    const { rows: eligibleTeachers } = await pool.query(`
      SELECT u.id, u.name, u.employee_code as identifier, 'Teacher' as role
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE tp.department = $1
        AND u.id NOT IN (SELECT teacher_user_id FROM course_teachers WHERE course_id = $2)
    `, [department, courseId]);

    // Eligible Students (in department, not in this course)
    const { rows: eligibleStudents } = await pool.query(`
      SELECT u.id, u.name, u.student_id as identifier, 'Student' as role
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sp.department = $1
        AND u.id NOT IN (SELECT student_user_id FROM course_students WHERE course_id = $2)
    `, [department, courseId]);

    const eligible = [...eligibleTeachers, ...eligibleStudents].sort((a, b) => a.name.localeCompare(b.name));
    res.json(eligible);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/courses/:id/add-participant — Enroll a student or teacher
router.post("/courses/:id/add-participant", async (req, res) => {
  const { userId, role } = req.body;
  const courseId = req.params.id;
  try {
    if (role === 'Teacher') {
      await pool.query("INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [courseId, userId]);
    } else {
      await pool.query("INSERT INTO course_students (course_id, student_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [courseId, userId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/courses/:id/remove-participant — Unenroll a student or teacher
router.post("/courses/:id/remove-participant", async (req, res) => {
  const { userId, role } = req.body;
  const courseId = req.params.id;
  try {
    if (role === 'Teacher') {
      await pool.query("DELETE FROM course_teachers WHERE course_id = $1 AND teacher_user_id = $2", [courseId, userId]);
    } else {
      await pool.query("DELETE FROM course_students WHERE course_id = $1 AND student_user_id = $2", [courseId, userId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/courses/bulk-enroll — Process Excel bulk enrollments
router.post("/courses/bulk-enroll", upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let success = 0;
    const warnings = [];

    for (const row of data) {
      const identifier = String(row['id'] || row['ID'] || row['Student ID'] || row['Teacher ID'] || '').trim().toUpperCase();
      const courseCode = String(row['course_code'] || row['Course Code'] || row['Course'] || '').trim().toUpperCase();

      if (!identifier || !courseCode) continue;

      // Find course
      const { rows: cRows } = await pool.query("SELECT id, department FROM courses WHERE UPPER(course_code) = $1", [courseCode]);
      if (cRows.length === 0) {
        warnings.push({ id: identifier, course_code: courseCode, reason: "Course not found" });
        continue;
      }
      const course = cRows[0];

      // Process based on identifier prefix
      if (identifier.startsWith('STU')) {
        const { rows: sRows } = await pool.query("SELECT u.id, sp.department FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE u.student_id = $1", [identifier]);
        if (sRows.length === 0) {
          warnings.push({ id: identifier, course_code: courseCode, reason: "Student ID not found" });
        } else if (sRows[0].department !== course.department) {
          warnings.push({ id: identifier, course_code: courseCode, reason: `Department mismatch (Student: ${sRows[0].department}, Course: ${course.department})` });
        } else {
          try {
            await pool.query("INSERT INTO course_students (course_id, student_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [course.id, sRows[0].id]);
            success++;
          } catch (e) {
            warnings.push({ id: identifier, course_code: courseCode, reason: "Enrollment failed" });
          }
        }
      } else if (identifier.startsWith('FAC')) {
        const { rows: tRows } = await pool.query("SELECT u.id, tp.department FROM users u JOIN teacher_profiles tp ON u.id = tp.user_id WHERE u.employee_code = $1", [identifier]);
        if (tRows.length === 0) {
          warnings.push({ id: identifier, course_code: courseCode, reason: "Teacher ID not found" });
        } else if (tRows[0].department !== course.department) {
          warnings.push({ id: identifier, course_code: courseCode, reason: `Department mismatch (Teacher: ${tRows[0].department}, Course: ${course.department})` });
        } else {
          try {
            await pool.query("INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [course.id, tRows[0].id]);
            success++;
          } catch (e) {
            warnings.push({ id: identifier, course_code: courseCode, reason: "Assignment failed" });
          }
        }
      } else {
        warnings.push({ id: identifier, course_code: courseCode, reason: "Invalid ID format (must start with STU or FAC)" });
      }
    }

    res.json({ success, warnings });
  } catch (err) {
    res.status(500).json({ error: "Bulk enrollment failed", details: err.message });
  }
});

// --- EXAM RESULTS MANAGEMENT ---

// GET /admin/exams — List all exams
router.get("/exams", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.title, e.exam_type as type, e.exam_date, e.start_time, e.duration_minutes, e.results_published, e.status, c.course_code, c.course_name, d.name as department
      FROM exams e
      JOIN courses c ON e.course_id = c.id
      JOIN departments d ON c.department = d.name
      ORDER BY e.exam_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /admin/exams/publish-results — Toggle result visibility
router.post("/exams/publish-results", async (req, res) => {
  const { scope, departmentId, courseId, published } = req.body;
  // scope: 'all', 'department', 'course'
  // published: boolean (true to reveal, false to hide)
  
  try {
    let query = "UPDATE exams SET results_published = $1";
    let params = [published];
    let condition = "";

    if (scope === 'course' && courseId) {
      condition = " WHERE course_id = $2";
      params.push(courseId);
    } else if (scope === 'department' && departmentId) {
      condition = " WHERE course_id IN (SELECT id FROM courses WHERE department = (SELECT name FROM departments WHERE id = $2))";
      params.push(departmentId);
    }

    await pool.query(query + condition, params);
    
    res.json({ success: true, message: `Exam results visibility updated successfully.` });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
