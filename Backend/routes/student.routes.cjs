const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");

// Middleware to verify token is already applied in server.cjs

// 1. Dashboard Summary
router.get("/dashboard/summary", async (req, res) => {
  const studentId = req.user.id;
  try {
    // Attendance % - Fixed division by zero for PostgreSQL
    const [[attendance]] = await pool.execute(`
      SELECT ROUND(COALESCE((SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0)) as percentage 
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
      WHERE cs.student_user_id = ? AND s.id IS NULL AND a.due_date > CURRENT_TIMESTAMP`, [studentId, studentId]);

    res.json({
      attendance: parseInt(attendance?.percentage || 0),
      cgpa: parseFloat(profile?.current_cgpa || 0),
      courses: parseInt(courses?.count || 0),
      pendingAssignments: parseInt(pendingAssignments?.count || 0)
    });
  } catch (err) {
    console.error("[Student Summary] Error:", err);
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

// 3. Profile
router.get("/profile/me", async (req, res) => {
  const userId = req.user.id;
  try {
    const [[profile]] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.role, u.student_id, sp.*
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE u.id = ?`, [userId]);
    
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    
    res.json({ profile });
  } catch (err) {
    console.error("[Profile ME] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Courses
router.get("/courses", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, 
             (SELECT name FROM users u JOIN course_teachers ct ON ct.teacher_user_id = u.id WHERE ct.course_id = c.id LIMIT 1) as teacher_name
      FROM courses c
      JOIN course_students cs ON cs.course_id = c.id
      WHERE cs.student_user_id = ?`, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 5. Attendance Subjects
router.get("/attendance/subjects", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT c.id, c.course_name as name, c.course_code as code,
             COUNT(s.id) as total_classes,
             SUM(CASE WHEN r.status = 'present' THEN 1 ELSE 0 END) as present_classes
      FROM courses c
      JOIN course_students cs ON cs.course_id = c.id
      LEFT JOIN attendance_sessions s ON s.course_id = c.id
      LEFT JOIN attendance_records r ON r.session_id = s.id AND r.student_user_id = ?
      WHERE cs.student_user_id = ?
      GROUP BY c.id, c.course_name, c.course_code`, [studentId, studentId]);
    
    const result = rows.map(r => ({
      ...r,
      percentage: r.total_classes > 0 ? Math.round((parseInt(r.present_classes || 0) / parseInt(r.total_classes)) * 100) : 0
    }));
    res.json(result);
  } catch (err) {
    console.error("[Attendance Subjects] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 6. Attendance Calendar
router.get("/attendance/calendar", async (req, res) => {
  const studentId = req.user.id;
  const { month, year, courseId } = req.query;
  try {
    let query = `
      SELECT s.class_date, r.status
      FROM attendance_sessions s
      JOIN attendance_records r ON r.session_id = s.id
      WHERE r.student_user_id = ?
    `;
    const params = [studentId];

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM s.class_date) = ? AND EXTRACT(YEAR FROM s.class_date) = ?`;
      params.push(month, year);
    }
    if (courseId) {
      query += ` AND s.course_id = ?`;
      params.push(courseId);
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 7. Course Lectures
router.get("/course/:courseId/lectures", async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;
  try {
    // Verify enrollment
    const [[enrolled]] = await pool.execute("SELECT id FROM course_students WHERE course_id = ? AND student_user_id = ?", [courseId, studentId]);
    if (!enrolled) return res.status(403).json({ error: "Not enrolled in this course" });

    const [rows] = await pool.execute(`
      SELECT l.*, l.id as lecture_id,
             p.completed, p.answered_interactions
      FROM course_lectures l
      LEFT JOIN student_lecture_progress p ON p.lecture_id = l.id AND p.student_user_id = ?
      WHERE l.course_id = ?
      ORDER BY l.lecture_order ASC`, [studentId, courseId]);
    
    res.json({ lectures: rows });
  } catch (err) {
    console.error("[Course Lectures] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 8. Mark Lecture Completed
router.post("/lecture/:lectureId/complete", async (req, res) => {
  const studentId = req.user.id;
  const { lectureId } = req.params;
  try {
    await pool.execute(`
      INSERT INTO student_lecture_progress (student_user_id, lecture_id, completed, completed_at)
      VALUES (?, ?, TRUE, CURRENT_TIMESTAMP)
      ON CONFLICT (student_user_id, lecture_id) DO UPDATE SET completed = TRUE, completed_at = CURRENT_TIMESTAMP`,
      [studentId, lectureId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 9. Save Lecture Interaction
router.post("/lecture/:lectureId/interaction", async (req, res) => {
  const studentId = req.user.id;
  const { lectureId } = req.params;
  const { time } = req.body;
  try {
    const [[progress]] = await pool.execute("SELECT answered_interactions FROM student_lecture_progress WHERE student_user_id = ? AND lecture_id = ?", [studentId, lectureId]);
    
    let interactions = [];
    if (progress) {
      interactions = typeof progress.answered_interactions === 'string' ? JSON.parse(progress.answered_interactions) : (progress.answered_interactions || []);
    }
    
    if (!interactions.includes(time)) {
      interactions.push(time);
      await pool.execute(`
        INSERT INTO student_lecture_progress (student_user_id, lecture_id, answered_interactions)
        VALUES (?, ?, ?)
        ON CONFLICT (student_user_id, lecture_id) DO UPDATE SET answered_interactions = EXCLUDED.answered_interactions`,
        [studentId, lectureId, JSON.stringify(interactions)]);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 9.5 Update Lecture Summary (Student can trigger AI summary update)
router.post("/lecture/:lectureId/summary", async (req, res) => {
  const { lectureId } = req.params;
  const { summary } = req.body;
  try {
    await pool.execute("UPDATE course_lectures SET ai_summary = ? WHERE id = ?", [summary, lectureId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 10. Exams (Placeholder table needed if missing)
router.get("/exams/upcoming", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.course_name as subject
      FROM exams e
      JOIN courses c ON c.id = e.course_id
      JOIN course_students cs ON cs.course_id = c.id
      WHERE cs.student_user_id = ? AND e.exam_date >= CURRENT_DATE
      ORDER BY e.exam_date ASC`, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 11. Grades
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

// 12. Fees
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

