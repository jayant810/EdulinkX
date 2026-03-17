const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");

// Middleware: Check if user is HOD
async function isHOD(req, res, next) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: "Access denied. Teachers only." });
  }

  try {
    const { rows } = await pool.query(`
      SELECT dt.role, d.name as department_name, d.id as department_id
      FROM department_teachers dt
      JOIN departments d ON dt.department_id = d.id
      WHERE dt.teacher_user_id = $1 AND dt.role = 'hod'
    `, [req.user.id]);

    if (rows.length === 0) {
      return res.status(403).json({ error: "Access denied. HOD privileges required." });
    }

    req.hodDepartment = rows[0].department_name;
    req.hodDepartmentId = rows[0].department_id;
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

router.use(isHOD);

// GET /hod/department — get HOD's department info
router.get("/department", async (req, res) => {
  try {
    const { rows: students } = await pool.query(
      "SELECT COUNT(*) as count FROM student_profiles WHERE department = $1",
      [req.hodDepartment]
    );
    const { rows: teachers } = await pool.query(
      "SELECT COUNT(*) as count FROM department_teachers WHERE department_id = $1",
      [req.hodDepartmentId]
    );
    const { rows: courses } = await pool.query(
      "SELECT COUNT(*) as count FROM courses WHERE department = $1",
      [req.hodDepartment]
    );

    res.json({
      name: req.hodDepartment,
      student_count: parseInt(students[0].count),
      teacher_count: parseInt(teachers[0].count),
      course_count: parseInt(courses[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// --- STUDENT MANAGEMENT ---

// GET /hod/students — list students in HOD's department
router.get("/students", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.student_id, sp.semester, sp.academic_status
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student' AND sp.department = $1
      ORDER BY u.name ASC
    `, [req.hodDepartment]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /hod/students/eligible — students not in any department
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

// POST /hod/students/add — add student to department
router.post("/students/add", async (req, res) => {
  const { studentId } = req.body;
  try {
    await pool.query(
      "UPDATE student_profiles SET department = $1 WHERE student_id = $2",
      [req.hodDepartment, studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /hod/students/remove — remove student from department
router.post("/students/remove", async (req, res) => {
  const { studentId } = req.body;
  try {
    // Only allow removing from HOD's own department
    const { rows } = await pool.query(
      "SELECT department FROM student_profiles WHERE student_id = $1",
      [studentId]
    );
    if (rows.length === 0 || rows[0].department !== req.hodDepartment) {
      return res.status(403).json({ error: "Can only manage students in your department" });
    }

    await pool.query(
      "UPDATE student_profiles SET department = NULL WHERE student_id = $1",
      [studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// --- COURSE MANAGEMENT ---

// GET /hod/courses — list courses in HOD's department
router.get("/courses", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) as student_count,
        (SELECT COUNT(*) FROM course_teachers ct WHERE ct.course_id = c.id) as teacher_count
      FROM courses c
      WHERE c.department = $1
      ORDER BY c.course_name ASC
    `, [req.hodDepartment]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /hod/courses/:id/students — list students in a course
router.get("/courses/:id/students", async (req, res) => {
  try {
    // Verify course belongs to HOD's department
    const { rows: course } = await pool.query(
      "SELECT department FROM courses WHERE id = $1", [req.params.id]
    );
    if (course.length === 0 || course[0].department !== req.hodDepartment) {
      return res.status(403).json({ error: "Course not in your department" });
    }

    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.student_id, sp.semester
      FROM course_students cs
      JOIN users u ON cs.student_user_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE cs.course_id = $1
      ORDER BY u.name ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /hod/courses/:id/eligible-students — dept students not in this course
router.get("/courses/:id/eligible-students", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.student_id, sp.semester
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sp.department = $1
        AND u.id NOT IN (SELECT student_user_id FROM course_students WHERE course_id = $2)
      ORDER BY u.name ASC
    `, [req.hodDepartment, req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /hod/courses/:id/add-student — enroll student in course
router.post("/courses/:id/add-student", async (req, res) => {
  const { studentUserId } = req.body;
  try {
    await pool.query(
      "INSERT INTO course_students (course_id, student_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.params.id, studentUserId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /hod/courses/:id/remove-student — unenroll student
router.post("/courses/:id/remove-student", async (req, res) => {
  const { studentUserId } = req.body;
  try {
    await pool.query(
      "DELETE FROM course_students WHERE course_id = $1 AND student_user_id = $2",
      [req.params.id, studentUserId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// --- TEACHER ASSIGNMENT TO COURSES ---

// GET /hod/courses/:id/teachers — list teachers in a course
router.get("/courses/:id/teachers", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.employee_code, tp.designation
      FROM course_teachers ct
      JOIN users u ON ct.teacher_user_id = u.id
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE ct.course_id = $1
      ORDER BY u.name ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /hod/courses/:id/eligible-teachers — dept teachers not in this course
router.get("/courses/:id/eligible-teachers", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.employee_code, tp.designation
      FROM department_teachers dt
      JOIN departments d ON dt.department_id = d.id
      JOIN users u ON dt.teacher_user_id = u.id
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE d.name = $1
        AND u.id NOT IN (SELECT teacher_user_id FROM course_teachers WHERE course_id = $2)
      ORDER BY u.name ASC
    `, [req.hodDepartment, req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /hod/courses/:id/add-teacher — assign teacher to course
router.post("/courses/:id/add-teacher", async (req, res) => {
  const { teacherUserId } = req.body;
  try {
    await pool.query(
      "INSERT INTO course_teachers (course_id, teacher_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.params.id, teacherUserId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /hod/courses/:id/remove-teacher — remove teacher from course
router.post("/courses/:id/remove-teacher", async (req, res) => {
  const { teacherUserId } = req.body;
  try {
    await pool.query(
      "DELETE FROM course_teachers WHERE course_id = $1 AND teacher_user_id = $2",
      [req.params.id, teacherUserId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
