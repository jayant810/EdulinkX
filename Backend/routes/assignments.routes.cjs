const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===== Multer PDF Upload Setup =====
const uploadDir = path.join(__dirname, '../public/uploads/submissions');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 1. GET Pending Assignments for Student
router.get("/student/assignments/pending", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        a.id, a.title, a.type, a.description, a.max_score,
        c.course_name, c.course_code,
        TO_CHAR(a.due_date,'YYYY-MM-DD HH24:MI') AS due_date,
        DATE_PART('day', a.due_date - NOW()) AS daysLeft
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN course_students cs ON cs.course_id = c.id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_user_id = ?
      WHERE cs.student_user_id = ?
      AND s.id IS NULL
      AND a.due_date >= NOW()
    `, [studentId, studentId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. GET Submitted Assignments for Student
router.get("/student/assignments/submitted", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        s.id, a.title, c.course_name, c.course_code, s.status, s.score as total_score,
        TO_CHAR(s.submitted_at,'YYYY-MM-DD HH24:MI') AS submitted_at
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.student_user_id = ?
      ORDER BY s.submitted_at DESC
    `, [studentId]);

    res.json(rows);
  } catch (err) {
    console.error("[Student Submitted Assignments] Error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 3. GET Questions for Assignment
router.get("/assignments/:id/questions", async (req, res) => {
  const assignmentId = req.params.id;
  try {
    const [[assignment]] = await pool.execute("SELECT type FROM assignments WHERE id = ?", [assignmentId]);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    const [questions] = await pool.execute(
      "SELECT id, question_text, options, marks FROM assignment_questions WHERE assignment_id = ?",
      [assignmentId]
    );

    res.json({
      type: assignment.type,
      questions: questions.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4. POST PDF Assignment Submission
router.post("/assignments/:id/submit/pdf", upload.single("pdf"), async (req, res) => {
  const assignmentId = req.params.id;
  const studentId = req.user.id;
  const { notes } = req.body;

  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

    await pool.execute(
      "INSERT INTO assignment_submissions (assignment_id, student_user_id, file_url, submission_text) VALUES (?, ?, ?, ?)",
      [assignmentId, studentId, `/uploads/submissions/${req.file.filename}`, notes || null]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 5. POST Short/MCQ Assignment Submission
router.post("/assignments/:id/submit/short", async (req, res) => {
  const assignmentId = req.params.id;
  const studentId = req.user.id;
  const { answers } = req.body; // { question_id: answer_text_or_option_index }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get assignment type
    const { rows: assignmentRows } = await client.query("SELECT type FROM assignments WHERE id = $1", [assignmentId]);
    const assignment = assignmentRows[0];
    
    let totalScore = null;
    let status = 'submitted';

    // 2. Auto-grade if MCQ
    if (assignment.type === 'mcq') {
      const { rows: questions } = await client.query(
        "SELECT id, correct_answer, marks FROM assignment_questions WHERE assignment_id = $1",
        [assignmentId]
      );

      totalScore = 0;
      for (const q of questions) {
        const studentAnswer = String(answers[q.id]);
        if (studentAnswer === String(q.correct_answer)) {
          totalScore += (q.marks || 1);
        }
      }
      status = 'graded';
    }

    // 3. Insert submission
    await client.query(
      "INSERT INTO assignment_submissions (assignment_id, student_user_id, submission_text, score, status) VALUES ($1, $2, $3, $4, $5)",
      [assignmentId, studentId, JSON.stringify(answers), totalScore, status]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, score: totalScore, status });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
