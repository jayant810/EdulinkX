const express = require("express");
const router = express.Router();
const pool = require("../db.cjs");

// Middleware to verify token is already applied in server.cjs

// 1. Dashboard Summary
router.get("/dashboard/summary", async (req, res) => {
  const studentId = req.user.id;
  try {
    // Attendance %
    const [[attendance]] = await pool.execute(`
      SELECT ROUND((SUM(status='present')/COUNT(*))*100) as percentage 
      FROM attendance_records WHERE student_user_id = ?`, [studentId]);

    // CGPA
    const [[profile]] = await pool.execute(`
      SELECT current_cgpa FROM student_profiles WHERE user_id = ?`, [studentId]);

    // Enrolled Courses count
    const [[courses]] = await pool.execute(`
      SELECT COUNT(*) as count FROM course_students WHERE student_user_id = ?`, [studentId]);

    // Pending Assignments count
    const [[pendingAssignments]] = await pool.execute(`
      SELECT COUNT(*) as count FROM assignments a
      JOIN course_students cs ON cs.course_id = a.course_id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_user_id = ?
      WHERE cs.student_user_id = ? AND s.id IS NULL AND a.due_date > NOW()`, [studentId, studentId]);

    res.json({
      attendance: attendance?.percentage || 0,
      cgpa: profile?.current_cgpa || 0,
      courses: courses?.count || 0,
      pendingAssignments: pendingAssignments?.count || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Upcoming Classes (Simulated for now based on timing)
router.get("/dashboard/upcoming-classes", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT c.course_name as subject, c.course_timing as time, 'Room 301' as room, 'Lecture' as type
      FROM courses c
      JOIN course_students cs ON cs.course_id = c.id
      WHERE cs.student_user_id = ?
      LIMIT 3`, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Exams (Placeholder table needed if missing)
router.get("/exams/upcoming", async (req, res) => {
  // Simulating for now
  res.json([
    { id: 1, subject: "Data Structures", date: "2024-12-20", time: "10:00 AM", duration: "2 Hours", type: "Main Exam" }
  ]);
});

// 5. Grades
router.get("/grades", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT c.course_name as subject, c.course_code as code, 'A' as grade, 4 as credits, 90 as marks
      FROM courses c
      JOIN course_students cs ON cs.course_id = c.id
      WHERE cs.student_user_id = ?`, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 6. Fees
router.get("/fees", async (req, res) => {
  // Simulating for now
  res.json({
    total: 5000,
    paid: 4500,
    pending: 500,
    history: [
      { id: 1, invoice: "INV-001", date: "2024-08-15", amount: 4500, status: "paid", method: "Online" }
    ]
  });
});

module.exports = router;
