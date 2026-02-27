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
  
  // Find the highest sequence number for the current year
  const { rows } = await pool.query(
    `SELECT student_id FROM users 
     WHERE student_id LIKE $1 
     ORDER BY student_id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const lastId = rows[0].student_id;
    // Handle cases where the sequence might be longer than 3 digits
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

// Bulk add students to department via Excel
router.post("/departments/:deptName/bulk-students", upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const { deptName } = req.params;

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const warnings = [];
    let successCount = 0;

    for (const row of data) {
      const studentId = row.student_id || row.ID;
      const name = row.name || row.Name;

      if (!studentId) {
        warnings.push({ row, reason: "Missing student_id" });
        continue;
      }

      const { rows: user } = await pool.query("SELECT id, name FROM users WHERE student_id = $1", [studentId]);
      
      if (user.length === 0) {
        warnings.push({ student_id: studentId, reason: "Student ID not found in system" });
        continue;
      }

      // Optional name check if provided in excel
      if (name && user[0].name.toLowerCase() !== name.toLowerCase()) {
        warnings.push({ student_id: studentId, reason: `Name mismatch: System has "${user[0].name}", Excel has "${name}"` });
        // We still update the department even if name mismatches slightly? 
        // User said: "if some students name or id are not matching rest of the students will be added"
        // Let's assume name must match if provided.
        continue;
      }

      await pool.query(
        "UPDATE student_profiles SET department = $1 WHERE student_id = $2",
        [deptName, studentId]
      );
      successCount++;
    }

    res.json({ successCount, warnings });
  } catch (err) {
    res.status(500).json({ error: "Error processing file" });
  }
});

// --- COURSES ---

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
  const { name, code, description, credits, timing, department } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO courses (course_name, course_code, course_description, credits, course_timing, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, code, description, credits, timing, department]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error or code exists" });
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

// Bulk Enrollment (Mixed Data)
router.post("/courses/bulk-enroll", upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const results = { success: 0, warnings: [] };

    for (const row of data) {
      const { id, course_code } = row; // id can be student_id or faculty_id
      if (!id || !course_code) {
        results.warnings.push({ row, reason: "Missing ID or Course Code" });
        continue;
      }

      // 1. Get Course Info
      const { rows: course } = await pool.query("SELECT id, department FROM courses WHERE course_code = $1", [course_code]);
      if (course.length === 0) {
        results.warnings.push({ id, course_code, reason: "Course not found" });
        continue;
      }
      const courseId = course[0].id;
      const courseDept = course[0].department;

      // 2. Identify if student or teacher
      const isTeacher = id.startsWith('FAC');
      const isStudent = id.startsWith('STU');

      if (isTeacher) {
        const { rows: teacher } = await pool.query("SELECT user_id, department FROM teacher_profiles WHERE employee_code = $1", [id]);
        if (teacher.length === 0) {
          results.warnings.push({ id, reason: "Teacher ID not found" });
        } else if (teacher[0].department !== courseDept) {
          results.warnings.push({ id, reason: `Department mismatch: Teacher is ${teacher[0].department}, Course is ${courseDept}` });
        } else {
          await pool.query("INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [courseId, teacher[0].user_id]);
          results.success++;
        }
      } else if (isStudent) {
        const { rows: student } = await pool.query("SELECT user_id, department FROM student_profiles WHERE student_id = $1", [id]);
        if (student.length === 0) {
          results.warnings.push({ id, reason: "Student ID not found" });
        } else if (student[0].department !== courseDept) {
          results.warnings.push({ id, reason: `Department mismatch: Student is ${student[0].department}, Course is ${courseDept}` });
        } else {
          await pool.query("INSERT INTO course_students (course_id, student_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [courseId, student[0].user_id]);
          results.success++;
        }
      } else {
        results.warnings.push({ id, reason: "Invalid ID format (must start with STU or FAC)" });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error processing file" });
  }
});

// Get participants for a course
router.get("/courses/:id/participants", async (req, res) => {
  try {
    const { rows: students } = await pool.query(`
      SELECT u.id, u.name, u.student_id as identifier, 'Student' as role
      FROM course_students cs
      JOIN users u ON cs.student_user_id = u.id
      WHERE cs.course_id = $1`, [req.params.id]);
    
    const { rows: teachers } = await pool.query(`
      SELECT u.id, u.name, u.employee_code as identifier, 'Teacher' as role
      FROM course_teachers ct
      JOIN users u ON ct.teacher_user_id = u.id
      WHERE ct.course_id = $1`, [req.params.id]);

    res.json([...teachers, ...students]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Remove participant from course
router.post("/courses/:id/remove-participant", async (req, res) => {
  const { userId, role } = req.body;
  try {
    if (role === 'Teacher') {
      await pool.query("DELETE FROM course_teachers WHERE course_id = $1 AND teacher_user_id = $2", [req.params.id, userId]);
    } else {
      await pool.query("DELETE FROM course_students WHERE course_id = $1 AND student_user_id = $2", [req.params.id, userId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get unassigned students/teachers for a course department
router.get("/courses/:id/eligible", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: course } = await pool.query("SELECT department FROM courses WHERE id = $1", [id]);
    if (course.length === 0) return res.status(404).json({ error: "Course not found" });
    const dept = course[0].department;

    const { rows: students } = await pool.query(`
      SELECT u.id, u.name, u.student_id as identifier, 'Student' as role
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sp.department = $1 
      AND u.id NOT IN (SELECT student_user_id FROM course_students WHERE course_id = $2)`, 
      [dept, id]);

    const { rows: teachers } = await pool.query(`
      SELECT u.id, u.name, u.employee_code as identifier, 'Teacher' as role
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE tp.department = $1
      AND u.id NOT IN (SELECT teacher_user_id FROM course_teachers WHERE course_id = $2)`, 
      [dept, id]);

    res.json([...teachers, ...students]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add participant to course
router.post("/courses/:id/add-participant", async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.body;
  try {
    if (role === 'Teacher') {
      await pool.query("INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [id, userId]);
    } else {
      await pool.query("INSERT INTO course_students (course_id, student_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [id, userId]);
    }
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

router.put("/teachers/:id", async (req, res) => {
  const { name, email, department, designation, academic_status } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, req.params.id]);
    await client.query(
      "UPDATE teacher_profiles SET department = $1, designation = $2, academic_status = $3 WHERE user_id = $4",
      [department, designation, academic_status, req.params.id]
    );
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.delete("/teachers/:id", async (req, res) => {
  try {
    await pool.query("UPDATE teacher_profiles SET academic_status = 'Inactive' WHERE user_id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- STUDENTS (Existing) ---

// 1. List all students (including inactive)
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
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get students NOT in any department
router.get("/students/eligible", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.student_id, sp.semester
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student' AND (sp.department IS NULL OR sp.department = '')
      ORDER BY u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Remove student from department
router.post("/departments/remove-student", async (req, res) => {
  const { studentId } = req.body;
  try {
    await pool.query(
      "UPDATE student_profiles SET department = NULL WHERE student_id = $1",
      [studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Validate bulk students before assignment
router.post("/departments/validate-bulk", upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = xlsx.utils.sheet_to_json(sheet);

    const validatedStudents = [];
    for (const row of excelData) {
      const studentId = row.student_id || row.ID;
      const excelName = row.name || row.Name;
      if (!studentId) continue;

      const { rows: user } = await pool.query(`
        SELECT u.name, u.student_id, sp.department 
        FROM users u 
        JOIN student_profiles sp ON u.id = sp.user_id 
        WHERE u.student_id = $1`, [studentId]);
      
      if (user.length > 0) {
        const systemName = user[0].name;
        const nameMismatch = excelName && systemName.toLowerCase() !== excelName.toLowerCase();
        
        validatedStudents.push({
          student_id: user[0].student_id,
          system_name: systemName,
          excel_name: excelName || "Not provided",
          current_department: user[0].department || "None",
          already_assigned: !!user[0].department,
          found: true,
          name_mismatch: nameMismatch
        });
      } else {
        validatedStudents.push({
          student_id: studentId,
          excel_name: excelName || "Not provided",
          found: false,
          reason: "Student ID not found in system"
        });
      }
    }
    res.json(validatedStudents);
  } catch (err) {
    res.status(500).json({ error: "Error validating file" });
  }
});

// Process bulk assignment
router.post("/departments/:deptName/process-bulk", async (req, res) => {
  const { deptName } = req.params;
  const { students } = req.body; // Array of { student_id, move: boolean }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const s of students) {
      if (s.move) {
        await client.query(
          "UPDATE student_profiles SET department = $1 WHERE student_id = $2",
          [deptName, s.student_id]
        );
      }
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// Add single student to department
router.post("/departments/:deptName/add-student", async (req, res) => {
  const { deptName } = req.params;
  const { studentId } = req.body;
  try {
    await pool.query(
      "UPDATE student_profiles SET department = $1 WHERE student_id = $2",
      [deptName, studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get students in a specific department
router.get("/departments/:deptName/students", async (req, res) => {
  const { deptName } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.student_id, sp.semester, sp.academic_status
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sp.department = $1
      ORDER BY u.name ASC
    `, [deptName]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Get student details
router.get("/students/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.*, sp.*
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = $1 AND u.role = 'student'
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Update student details
router.put("/students/:id", async (req, res) => {
  const { name, email, department, semester, academic_status } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3",
      [name, email, req.params.id]
    );

    await client.query(
      "UPDATE student_profiles SET department = $1, semester = $2, academic_status = $3 WHERE user_id = $4",
      [department, semester, academic_status, req.params.id]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// 4. Add student manual
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

    const userId = userRows[0].id;

    await client.query(
      "INSERT INTO student_profiles (user_id, student_id, full_name, email, department, semester, academic_status) VALUES ($1, $2, $3, $4, $5, $6, 'Active')",
      [userId, studentId, name, email, department, semester]
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

// 5. Bulk entry using PDF
// Assumes PDF text contains rows like: "Name, Email, Department, Semester"
router.post("/students/bulk-pdf", upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

  const rows = {}; // Organize items by y-coordinate
  const students = [];

  new PdfReader().parseBuffer(req.file.buffer, async (err, item) => {
    if (err) {
      console.error("PDF Parsing Error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Error parsing PDF" });
      return;
    } 
    
    if (!item) {
      // End of file - Process collected rows
      Object.keys(rows).sort((a, b) => Number(a) - Number(b)).forEach(y => {
        const line = rows[y].join(", ").trim();
        const parts = line.split(",").map(p => p.trim());
        // Simple logic to identify a student row: 4 parts and second part is an email
        if (parts.length >= 4 && parts[1].includes('@')) {
          students.push({
            name: parts[0],
            email: parts[1],
            department: parts[2],
            semester: parseInt(parts[3])
          });
        }
      });

      if (students.length === 0) {
        if (!res.headersSent) res.status(400).json({ error: "No valid student data found in PDF. Format: Name, Email, Department, Semester" });
        return;
      }

      const client = await pool.connect();
      const results = { success: 0, failed: 0 };
      try {
        for (const s of students) {
          try {
            await client.query('BEGIN');
            const studentId = await generateStudentId();
            const hashedPassword = await bcrypt.hash('student', 10);

            const { rows: userRows } = await client.query(
              "INSERT INTO users (name, email, password_hash, role, student_id) VALUES ($1, $2, $3, 'student', $4) RETURNING id",
              [s.name, s.email, hashedPassword, studentId]
            );
            const userId = userRows[0].id;
            await client.query(
              "INSERT INTO student_profiles (user_id, student_id, full_name, email, department, semester, academic_status) VALUES ($1, $2, $3, $4, $5, $6, 'Active')",
              [userId, studentId, s.name, s.email, s.department, s.semester]
            );
            await client.query('COMMIT');
            results.success++;
          } catch (e) {
            await client.query('ROLLBACK');
            results.failed++;
          }
        }
        if (!res.headersSent) res.json({ message: "Bulk upload completed", results });
      } catch (dbErr) {
        if (!res.headersSent) res.status(500).json({ error: "Database error during bulk upload" });
      } finally {
        client.release();
      }
    } else if (item.text) {
      // Collect text by row
      (rows[item.y] = rows[item.y] || []).push(item.text);
    }
  });
});

// 6. "Delete" student (Mark as Inactive)
router.delete("/students/:id", async (req, res) => {
  try {
    await pool.query(
      "UPDATE student_profiles SET academic_status = 'Inactive' WHERE user_id = $1",
      [req.params.id]
    );
    res.json({ success: true, message: "Student marked as Inactive" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
