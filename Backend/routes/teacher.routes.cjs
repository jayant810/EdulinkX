const express = require("express");
const router = express.Router();
const pool = require("../db.cjs");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBmvOCu_n0ytqPrkKHu9b7ME0BO0Ou3-7E");

function getModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
}

// Helper to generate summary
async function generateSummary(title, subTitle) {
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-pro"
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Attempting summary with model: ${modelName}`);
      const model = getModel(modelName);
      const prompt = `Generate a concise, professional educational summary for a lecture titled "${title}" with description: "${subTitle || 'No description provided'}". Keep it under 100 words. Focus on core learning objectives.`;
      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      console.log(`[AI] Successfully generated summary using ${modelName}`);
      return summary;
    } catch (err) {
      console.warn(`[AI] Model ${modelName} failed:`, err.message);
      if (err.message.includes("401") || err.message.includes("API key")) break;
      continue; 
    }
  }
  
  // --- SMART FALLBACK (Free/Offline) ---
  console.log("[AI] Using template-based fallback summary.");
  return `This lecture on "${title}" covers key concepts and learning objectives. ${subTitle ? subTitle : 'It provides an in-depth exploration of the subject matter to help students build a strong foundational understanding.'}`;
}

// 1. Teacher Dashboard Summary
router.get("/dashboard", async (req, res) => {
  const teacherId = req.user.id;
  console.log(`[Dashboard] Fetching stats for teacher ID: ${teacherId}`);
  try {
    // Total Students
    const [[students]] = await pool.execute(`
      SELECT COUNT(DISTINCT student_user_id) as count 
      FROM course_students cs
      JOIN course_teachers ct ON cs.course_id = ct.course_id
      WHERE ct.teacher_user_id = ?`, [teacherId]);
    console.log(`[Dashboard] Students raw:`, students);

    // Active Courses
    const [[courses]] = await pool.execute(`
      SELECT COUNT(*) as count FROM course_teachers WHERE teacher_user_id = ?`, [teacherId]);
    console.log(`[Dashboard] Courses raw:`, courses);

    // Pending Grading (Assignments)
    const [[pendingAssignments]] = await pool.execute(`
      SELECT COUNT(*) as count FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN course_teachers ct ON ct.course_id = a.course_id
      WHERE ct.teacher_user_id = ? AND s.status = 'submitted'`, [teacherId]);

    // Avg Attendance
    const [[attendance]] = await pool.execute(`
      SELECT ROUND(AVG(CASE WHEN status='present' THEN 1 ELSE 0 END)*100) as percentage 
      FROM attendance_records r
      JOIN attendance_sessions s ON s.id = r.session_id
      WHERE s.teacher_user_id = ?`, [teacherId]);

    // Today's Classes
    const [classes] = await pool.execute(`
      SELECT c.course_name as subject, cl.section, cl.room, 
             TO_CHAR(cl.start_time, 'HH12:MI AM') as time,
             (SELECT COUNT(*) FROM course_students WHERE course_id = cl.course_id) as students
      FROM classes cl
      JOIN courses c ON c.id = cl.course_id
      WHERE cl.teacher_user_id = ? AND cl.class_date = CURRENT_DATE
      ORDER BY cl.start_time ASC`, [teacherId]);

    // Recent Submissions
    const [submissions] = await pool.execute(`
      SELECT u.name as student, a.title as assignment, c.course_name as course,
             TO_CHAR(s.submitted_at, 'YYYY-MM-DD HH24:MI:SS') as time
      FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN users u ON u.id = s.student_user_id
      JOIN courses c ON c.id = a.course_id
      JOIN course_teachers ct ON ct.course_id = c.id
      WHERE ct.teacher_user_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT 5`, [teacherId]);

    res.json({
      stats: {
        totalStudents: parseInt(students?.count || 0),
        activeCourses: parseInt(courses?.count || 0),
        pendingGrading: parseInt(pendingAssignments?.count || 0),
        avgAttendance: parseInt(attendance?.percentage || 0)
      },
      classes,
      submissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Get Teacher's Courses with Details
router.get("/courses", async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.id, c.course_name as name, c.course_code as code, c.course_timing,
        (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) as students,
        (SELECT COUNT(*) FROM course_lectures cl WHERE cl.course_id = c.id) as totalLectures,
        (SELECT COUNT(*) FROM course_materials cm WHERE cm.course_id = c.id) as materials
      FROM courses c
      JOIN course_teachers ct ON ct.course_id = c.id
      WHERE ct.teacher_user_id = ?`, [teacherId]);
    
    // Add dummy progress for UI
    const result = rows.map(r => ({ ...r, progress: 100 }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Get Specific Course Details
router.get("/courses/:courseId", async (req, res) => {
  const teacherId = req.user.id;
  const { courseId } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT c.* FROM courses c
      JOIN course_teachers ct ON ct.course_id = c.id
      WHERE c.id = ? AND ct.teacher_user_id = ?`, [courseId, teacherId]);

    if (rows.length === 0) return res.status(403).json({ error: "Not authorized to manage this course" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Get Course Lectures
router.get("/courses/:courseId/lectures", async (req, res) => {
  const teacherId = req.user.id;
  const { courseId } = req.params;
  try {
    // Verify ownership
    const [[owner]] = await pool.execute("SELECT id FROM course_teachers WHERE course_id = ? AND teacher_user_id = ?", [courseId, teacherId]);
    if (!owner) return res.status(403).json({ error: "Not authorized" });

    const [rows] = await pool.execute("SELECT * FROM course_lectures WHERE course_id = ? ORDER BY lecture_order ASC", [courseId]);
    
    // Ensure interactions is always an object/array
    const result = rows.map(r => ({
      ...r,
      interactions: typeof r.interactions === 'string' ? JSON.parse(r.interactions) : r.interactions
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 5. Add Course Lecture
router.post("/courses/:courseId/lectures", async (req, res) => {
  const teacherId = req.user.id;
  const { courseId } = req.params;
  let { title, sub_title, video_url, notes_url, lecture_order, is_interactive, interactions, video_type, ai_summary } = req.body;
  try {
    const [[owner]] = await pool.execute("SELECT id FROM course_teachers WHERE course_id = ? AND teacher_user_id = ?", [courseId, teacherId]);
    if (!owner) return res.status(403).json({ error: "Not authorized" });

    // Auto-generate summary if missing
    if (!ai_summary && title) {
      ai_summary = await generateSummary(title, sub_title);
    }

    await pool.execute(
      "INSERT INTO course_lectures (course_id, title, sub_title, video_url, notes_url, lecture_order, is_interactive, interactions, video_type, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [courseId, title, sub_title, video_url, notes_url || null, lecture_order || 1, is_interactive || false, JSON.stringify(interactions) || null, video_type || 'url', ai_summary || null]
    );
    res.status(201).json({ message: "Lecture added successfully with AI summary" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 5.5 Delete Course Lecture
router.delete("/courses/:courseId/lectures/:lectureId", async (req, res) => {
  const teacherId = req.user.id;
  const { courseId, lectureId } = req.params;

  try {
    // 1. Verify ownership
    const [[owner]] = await pool.execute("SELECT id FROM course_teachers WHERE course_id = ? AND teacher_user_id = ?", [courseId, teacherId]);
    if (!owner) return res.status(403).json({ error: "Not authorized" });

    // 2. Get lecture info to delete file if needed
    const [[lecture]] = await pool.execute("SELECT video_url, video_type FROM course_lectures WHERE id = ? AND course_id = ?", [lectureId, courseId]);
    if (!lecture) return res.status(404).json({ error: "Lecture not found" });

    // 3. Delete local file if it exists
    if (lecture.video_type === 'local' && lecture.video_url) {
      try {
        const fileName = lecture.video_url.split('/').pop();
        const filePath = path.join(__dirname, '../public/uploads', fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[File System] Deleted video: ${filePath}`);
        }
      } catch (fileErr) {
        console.warn("[File System] Could not delete file:", fileErr.message);
        // Continue anyway to delete from DB
      }
    }

    // 4. Delete from database
    await pool.execute("DELETE FROM course_lectures WHERE id = ?", [lectureId]);
    res.json({ success: true, message: "Lecture deleted successfully" });
  } catch (err) {
    console.error("[Lecture DELETE] Error:", err.message);
    res.status(500).json({ error: "Server error deleting lecture", details: err.message });
  }
});

// 6. Exams
router.get("/exams", async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [upcoming] = await pool.execute(`
      SELECT e.*, c.course_code, c.course_name,
             (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as questions,
             (SELECT COUNT(*) FROM course_students WHERE course_id = e.course_id) as enrolled
      FROM exams e
      JOIN courses c ON c.id = e.course_id
      WHERE e.teacher_id = ? AND e.exam_date >= CURRENT_DATE
      ORDER BY e.exam_date ASC`, [teacherId]);

    const [past] = await pool.execute(`
      SELECT e.*, c.course_code, c.course_name,
             (SELECT COUNT(*) FROM exam_submissions WHERE exam_id = e.id) as submitted,
             (SELECT COUNT(*) FROM exam_submissions WHERE exam_id = e.id AND status = 'graded') as graded,
             (SELECT ROUND(AVG(score/total_marks*100)) FROM exam_submissions WHERE exam_id = e.id) as avgScore
      FROM exams e
      JOIN courses c ON c.id = e.course_id
      WHERE e.teacher_id = ? AND e.exam_date < CURRENT_DATE
      ORDER BY e.exam_date DESC`, [teacherId]);

    res.json({ upcoming, past });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/exams", async (req, res) => {
  const teacherId = req.user.id;
  const { title, course_id, exam_type, duration, date, time, instructions, total_marks, questions } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: resultRows } = await client.query(
      "INSERT INTO exams (course_id, teacher_id, title, exam_type, duration_minutes, exam_date, start_time, instructions, total_marks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
      [course_id, teacherId, title, exam_type, duration, date, time, instructions, total_marks]
    );
    const examId = resultRows[0].id;
    if (questions && questions.length > 0) {
      for (const q of questions) {
        await client.query(
          "INSERT INTO exam_questions (exam_id, question_text, options, correct_answer, marks) VALUES ($1, $2, $3, $4, $5)",
          [examId, q.question, q.options ? JSON.stringify(q.options) : null, q.correctAnswer, q.marks]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ id: examId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// 7. Attendance
router.get("/courses/:courseId/students", async (req, res) => {
  const { courseId } = req.params;
  const { date } = req.query;
  const teacherId = req.user.id;
  try {
    const [[owner]] = await pool.execute("SELECT id FROM course_teachers WHERE course_id = ? AND teacher_user_id = ?", [courseId, teacherId]);
    if (!owner) return res.status(403).json({ error: "Not authorized" });

    let sessionId = null;
    let existingRecords = {};
    if (date) {
      const [[session]] = await pool.execute("SELECT id FROM attendance_sessions WHERE course_id = ? AND class_date = ?", [courseId, date]);
      if (session) {
        sessionId = session.id;
        const [records] = await pool.execute("SELECT student_user_id, status FROM attendance_records WHERE session_id = ?", [sessionId]);
        records.forEach(r => existingRecords[r.student_user_id] = r.status === 'present');
      }
    }
    const [students] = await pool.execute(`
      SELECT u.id, u.name, u.student_id, sp.roll_number
      FROM course_students cs
      JOIN users u ON u.id = cs.student_user_id
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE cs.course_id = ?`, [courseId]);
    res.json({ students, existingRecords, sessionId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/attendance", async (req, res) => {
  const teacherId = req.user.id;
  const { courseId, date, records } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: sessionRows } = await client.query("SELECT id FROM attendance_sessions WHERE course_id = $1 AND class_date = $2", [courseId, date]);
    let sessionId;
    if (sessionRows.length > 0) {
      sessionId = sessionRows[0].id;
    } else {
      const { rows: insertRows } = await client.query("INSERT INTO attendance_sessions (course_id, teacher_user_id, class_date) VALUES ($1, $2, $3) RETURNING id", [courseId, teacherId, date]);
      sessionId = insertRows[0].id;
    }
    await client.query("DELETE FROM attendance_records WHERE session_id = $1", [sessionId]);
    for (const [studentId, status] of Object.entries(records)) {
      await client.query("INSERT INTO attendance_records (session_id, student_user_id, status) VALUES ($1, $2, $3)", [sessionId, studentId, status ? 'present' : 'absent']);
    }
    await client.query('COMMIT');
    res.status(201).json({ message: "Attendance updated" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.get("/attendance/history", async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT s.class_date as date, c.course_name as course, 'A' as section,
             SUM(CASE WHEN r.status='present' THEN 1 ELSE 0 END) as present, 
             SUM(CASE WHEN r.status='absent' THEN 1 ELSE 0 END) as absent,
             ROUND(AVG(CASE WHEN r.status='present' THEN 1 ELSE 0 END)*100) as percentage
      FROM attendance_sessions s
      JOIN courses c ON c.id = s.course_id
      JOIN attendance_records r ON r.session_id = s.id
      WHERE s.teacher_user_id = ?
      GROUP BY s.id, s.class_date, c.course_name ORDER BY s.class_date DESC`, [teacherId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 8. Assignments
router.get("/assignments", async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [active] = await pool.execute(`
      SELECT a.*, 
             a.max_score,
             c.course_name, c.course_code,
             (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submissions,
             (SELECT COUNT(*) FROM course_students WHERE course_id = a.course_id) as total
      FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.teacher_user_id = ? AND a.due_date >= NOW()
      ORDER BY a.due_date ASC`, [teacherId]);

    const [past] = await pool.execute(`
      SELECT a.*, 
             a.max_score,
             c.course_name, c.course_code,
             (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submissions,
             (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id AND status = 'graded') as graded,
             (SELECT COUNT(*) FROM course_students WHERE course_id = a.course_id) as total
      FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.teacher_user_id = ? AND a.due_date < NOW()
      ORDER BY a.due_date DESC`, [teacherId]);
    res.json({ active, past });
  } catch (err) {
    console.error("[Assignments GET] Error:", err.message);
    res.status(500).json({ error: "Server error fetching assignments", details: err.message });
  }
});

router.post("/assignments", async (req, res) => {
  const teacherId = req.user.id;
  const { course_id, title, description, type, due_date, max_score, questions, duration_minutes } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify ownership
    const { rows: ownerRows } = await client.query("SELECT id FROM course_teachers WHERE course_id = $1 AND teacher_user_id = $2", [course_id, teacherId]);
    if (ownerRows.length === 0) {
      return res.status(403).json({ error: "Not authorized to add assignments to this course" });
    }

    const { rows: resultRows } = await client.query(
      "INSERT INTO assignments (course_id, teacher_user_id, title, description, type, due_date, max_score, duration_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [course_id, teacherId, title, description, type || 'pdf', due_date, max_score || 100, duration_minutes || 0]
    );

    const assignmentId = resultRows[0].id;

    if (questions && questions.length > 0) {
      for (const q of questions) {
        await client.query(
          "INSERT INTO assignment_questions (assignment_id, question_text, options, correct_answer, marks) VALUES ($1, $2, $3, $4, $5)",
          [assignmentId, q.question_text, q.options ? JSON.stringify(q.options) : null, q.correct_answer, q.marks || 1]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ id: assignmentId, message: "Assignment created successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// 8.5 Get Single Assignment with Questions
router.get("/assignments/:id", async (req, res) => {
  const teacherId = req.user.id;
  const { id } = req.params;

  try {
    const [[assignment]] = await pool.execute(`
      SELECT a.*, a.max_score 
      FROM assignments a
      JOIN course_teachers ct ON ct.course_id = a.course_id
      WHERE a.id = ? AND ct.teacher_user_id = ?`, [id, teacherId]);

    if (!assignment) return res.status(404).json({ error: "Assignment not found or unauthorized" });

    const [questions] = await pool.execute(
      "SELECT * FROM assignment_questions WHERE assignment_id = ?",
      [id]
    );

    res.json({ 
      ...assignment, 
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

// 8.6 Update Assignment
router.put("/assignments/:id", async (req, res) => {
  const teacherId = req.user.id;
  const { id } = req.params;
  const { title, description, type, due_date, max_score, questions, duration_minutes } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify ownership
    const { rows: ownerRows } = await client.query(`
      SELECT a.id FROM assignments a
      JOIN course_teachers ct ON ct.course_id = a.course_id
      WHERE a.id = $1 AND ct.teacher_user_id = $2`, [id, teacherId]);

    if (ownerRows.length === 0) {
      return res.status(403).json({ error: "Not authorized to update this assignment" });
    }

    await client.query(
      "UPDATE assignments SET title = $1, description = $2, type = $3, due_date = $4, max_score = $5, duration_minutes = $6 WHERE id = $7",
      [title, description, type, due_date, max_score, duration_minutes || 0, id]
    );

    // Update questions: simpler to delete and re-insert for this scale
    await client.query("DELETE FROM assignment_questions WHERE assignment_id = $1", [id]);

    if (questions && questions.length > 0) {
      for (const q of questions) {
        await client.query(
          "INSERT INTO assignment_questions (assignment_id, question_text, options, correct_answer, marks) VALUES ($1, $2, $3, $4, $5)",
          [id, q.question_text, q.options ? JSON.stringify(q.options) : null, q.correct_answer, q.marks || 1]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: "Assignment updated successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// 9. Students (List all students in teacher's courses)
router.get("/students", async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [students] = await pool.execute(`
      SELECT DISTINCT u.id, u.name, sp.student_id, c.course_name as course, sp.section, sp.current_cgpa as cgpa, sp.academic_status
      FROM course_teachers ct
      JOIN course_students cs ON cs.course_id = ct.course_id
      JOIN users u ON u.id = cs.student_user_id
      JOIN student_profiles sp ON sp.user_id = u.id
      JOIN courses c ON c.id = ct.course_id
      WHERE ct.teacher_user_id = ?
      ORDER BY u.name`, [teacherId]);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 10. Submissions & Grading
router.get("/submissions/pending", async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, u.name as student, a.title as assignment, c.course_name as course, a.type, a.total_marks as max_score
      FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN users u ON u.id = s.student_user_id
      JOIN courses c ON c.id = a.course_id
      JOIN course_teachers ct ON ct.course_id = c.id
      WHERE ct.teacher_user_id = ? AND s.status = 'submitted'
      ORDER BY s.submitted_at ASC`, [teacherId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/submissions/graded", async (req, res) => {
  const teacherId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, u.name as student, a.title as assignment, c.course_name as course, a.type, a.total_marks as max_score, sp.student_id
      FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN users u ON u.id = s.student_user_id
      JOIN courses c ON c.id = a.course_id
      JOIN course_teachers ct ON ct.course_id = c.id
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE ct.teacher_user_id = ? AND s.status = 'graded'
      ORDER BY s.submitted_at DESC`, [teacherId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/submissions/:id/grade", async (req, res) => {
  const teacherId = req.user.id;
  const { id } = req.params;
  const { score, feedback } = req.body;

  try {
    // Verify ownership
    const [[submission]] = await pool.execute(`
      SELECT s.id FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN course_teachers ct ON ct.course_id = a.course_id
      WHERE s.id = ? AND ct.teacher_user_id = ?`, [id, teacherId]);

    if (!submission) return res.status(403).json({ error: "Not authorized" });

    await pool.execute(
      "UPDATE assignment_submissions SET score = ?, status = 'graded' WHERE id = ?",
      [score, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
