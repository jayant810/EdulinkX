// Force trigger rebuild for student routes - v1.0.1
const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { gradeSubmissionFile } = require("../utils/autograder.cjs");

// ===== Cloudinary Setup for Exam Uploads =====
const { cloudinaryUpload } = require("../utils/cloudinary.cjs");
// Use cloudinaryUpload for the PDF route below.

// Middleware to verify token is already applied in server.cjs

// 1. Dashboard Summary
router.get("/dashboard/summary", async (req, res) => {
  const studentId = req.user.id;
  try {
    // Attendance % - Only count marked records
    const [[attendance]] = await pool.execute(`
      SELECT ROUND(COALESCE((SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(CASE WHEN status != 'not_marked' THEN 1 END), 0)) * 100, 0)) as percentage 
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
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
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
      SELECT 
        c.id, 
        c.course_name as name, 
        c.course_code as code, 
        c.course_description, 
        c.credits, 
        c.course_timing, 
        c.department,
        (SELECT name FROM users u JOIN course_teachers ct ON ct.teacher_user_id = u.id WHERE ct.course_id = c.id LIMIT 1) as teacher_name,
        (SELECT name FROM users u JOIN course_teachers ct ON ct.teacher_user_id = u.id WHERE ct.course_id = c.id LIMIT 1) as instructor,
        (SELECT COUNT(*) FROM course_lectures cl WHERE cl.course_id = c.id) as totalLectures,
        (SELECT COUNT(*) FROM student_lecture_progress slp 
         JOIN course_lectures cl ON slp.lecture_id = cl.id 
         WHERE cl.course_id = c.id AND slp.student_user_id = ? AND slp.completed = true) as completedLectures,
        (SELECT COUNT(*) FROM course_materials cm WHERE cm.course_id = c.id) as materials
      FROM courses c
      JOIN course_students cs ON cs.course_id = c.id
      WHERE cs.student_user_id = ?`, [studentId, studentId]);

    // Add progress calculation
    const result = rows.map(r => {
      const total = parseInt(r.totalLectures) || 0;
      const completed = parseInt(r.completedLectures) || 0;
      return {
        ...r,
        progress: total > 0 ? (completed / total) * 100 : 0
      };
    });

    res.json(result);
  } catch (err) {
    console.error("[Student Courses] Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 5. Attendance Subjects
router.get("/attendance/subjects", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT c.id, c.course_name as name, c.course_code as code,
             COUNT(CASE WHEN r.status != 'not_marked' THEN s.id END) as total_classes,
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
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 6.5 Attendance Summary
router.get("/attendance/summary", async (req, res) => {
  const studentId = req.user.id;
  try {
    // Overall Stats - Only count records that are marked
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status != 'not_marked' THEN 1 END) as total_classes,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count
      FROM attendance_records 
      WHERE student_user_id = ?`, [studentId]);

    // Breakdown by subject
    const [breakdown] = await pool.execute(`
      SELECT c.course_name as subject,
             COUNT(CASE WHEN r.status != 'not_marked' THEN r.id END) as total,
             SUM(CASE WHEN r.status = 'present' THEN 1 ELSE 0 END) as present
      FROM courses c
      JOIN course_students cs ON cs.course_id = c.id
      LEFT JOIN attendance_sessions s ON s.course_id = c.id
      LEFT JOIN attendance_records r ON r.session_id = s.id AND r.student_user_id = ?
      WHERE cs.student_user_id = ?
      GROUP BY c.id, c.course_name`, [studentId, studentId]);

    const totalClasses = parseInt(stats?.total_classes || 0);
    const presentCount = parseInt(stats?.present_count || 0);
    const absentCount = parseInt(stats?.absent_count || 0);

    res.json({
      overall: totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0,
      present: presentCount,
      absent: absentCount,
      total: totalClasses,
      breakdown: breakdown.map(b => ({
        subject: b.subject,
        percentage: parseInt(b.total) > 0 ? Math.round((parseInt(b.present) / parseInt(b.total)) * 100) : 0
      }))
    });
  } catch (err) {
    console.error("[Attendance Summary] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 6.6 Holidays
router.get("/holidays", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT holiday_date, title, description, is_weekend FROM holidays ORDER BY holiday_date ASC");
    res.json(rows);
  } catch (err) {
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
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
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
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
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
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
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 10. Exams
router.get("/exams/upcoming", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.course_name as subject
      FROM exams e
      JOIN courses c ON c.id = e.course_id
      JOIN course_students cs ON cs.course_id = c.id
      LEFT JOIN exam_submissions s ON s.exam_id = e.id AND s.student_id = ?
      WHERE cs.student_user_id = ? AND e.exam_date >= CURRENT_DATE AND s.id IS NULL
      ORDER BY e.exam_date ASC`, [studentId, studentId]);
    res.json(rows);
  } catch (err) {
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.get("/exams/past", async (req, res) => {
  const studentId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, c.course_name as subject, s.score as student_score, s.feedback
      FROM exams e
      JOIN courses c ON c.id = e.course_id
      JOIN course_students cs ON cs.course_id = c.id
      JOIN exam_submissions s ON s.exam_id = e.id AND s.student_id = ?
      WHERE cs.student_user_id = ?
      ORDER BY e.exam_date DESC`, [studentId, studentId]);
    
    // Only send scores/feedback if results_published is true
    const sanitizedRows = rows.map(r => {
      if (!r.results_published) {
        return { ...r, student_score: null, feedback: "Results pending admin approval" };
      }
      return r;
    });

    res.json(sanitizedRows);
  } catch (err) {
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.get("/exams/:id", async (req, res) => {
  const studentId = req.user.id;
  const examId = req.params.id;
  try {
    // 1. Fetch exam details and verify enrollment
    const [[exam]] = await pool.execute(`
      SELECT e.*, c.course_name as subject
      FROM exams e
      JOIN courses c ON c.id = e.course_id
      JOIN course_students cs ON cs.course_id = c.id
      WHERE e.id = ? AND cs.student_user_id = ?`, [examId, studentId]);

    if (!exam) {
      return res.status(404).json({ error: "Exam not found or you are not enrolled" });
    }

    // 2. Fetch questions
    const [questions] = await pool.execute(
      "SELECT id, question_text, options, marks FROM exam_questions WHERE exam_id = ?",
      [examId]
    );

    res.json({ exam, questions });
  } catch (err) {
    console.error(`[Get Exam] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 10.1 POST PDF/Image Exam Submission
router.post("/exams/:id/submit/pdf", cloudinaryUpload.single("pdf"), async (req, res) => {
  const examId = req.params.id;
  const studentId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

    // Fetch exam details to check if AI grading is enabled
    const { rows: examRows } = await client.query(
      "SELECT grading_method, answer_key_url, ai_grading_prompt FROM exams WHERE id = $1",
      [examId]
    );
    const exam = examRows[0];

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    let score = null;
    let feedback = null;
    let status = 'submitted';

    if (exam.grading_method !== 'manual' && exam.answer_key_url) {
      try {
        // --- Ensure Answer Key is in the Autograder ---
        // The answer key URL is typically a Cloudinary URL, so we need to
        // download it and forward it to the Autograder's /upload-answer-key endpoint.
        const { parseAnswerKeyUpload } = require("../utils/autograder.cjs");
        
        let answerKeyBuffer = null;
        const akUrl = exam.answer_key_url;
        
        if (akUrl.startsWith('http://') || akUrl.startsWith('https://')) {
          // Download from remote URL (Cloudinary)
          console.log(`[Autograder] Downloading answer key from: ${akUrl}`);
          const akResponse = await fetch(akUrl);
          if (akResponse.ok) {
            const arrayBuf = await akResponse.arrayBuffer();
            answerKeyBuffer = Buffer.from(arrayBuf);
          } else {
            console.error(`[Autograder] Failed to download answer key: ${akResponse.status}`);
          }
        } else {
          // Try local path
          const localPath = path.join(__dirname, '../public', akUrl);
          if (fs.existsSync(localPath)) {
            answerKeyBuffer = fs.readFileSync(localPath);
          }
        }

        if (answerKeyBuffer) {
          console.log(`[Autograder] Forwarding answer key to Autograder for exam ${examId} (${answerKeyBuffer.length} bytes)`);
          try {
            await parseAnswerKeyUpload(answerKeyBuffer, 'answer_key.pdf', examId);
            console.log(`[Autograder] Answer key forwarded successfully`);
          } catch (akErr) {
            console.error(`[Autograder] Failed to forward answer key:`, akErr.message);
          }
        } else {
          console.error(`[Autograder] Could not obtain answer key file from: ${akUrl}`);
        }

        // --- Grade the student's submission ---
        // Fetch the file from Cloudinary to send to Autograder
        const studentPdfUrl = req.file.path;
        console.log(`[Autograder] Downloading student PDF from Cloudinary: ${studentPdfUrl}`);
        const stResponse = await fetch(studentPdfUrl);
        const stArrayBuf = await stResponse.arrayBuffer();
        const fileBuffer = Buffer.from(stArrayBuf);

        const method = exam.grading_method === 'auto_similarity' ? 'similarity' : 'gemini';
        
        console.log(`[Autograder] Triggering grading for exam ${examId} using ${method}`);
        const result = await gradeSubmissionFile(
          fileBuffer, 
          req.file.originalname, 
          req.file.mimetype || "application/pdf", 
          examId, 
          0, 
          method, 
          exam.ai_grading_prompt
        );

        if (result && result.grading_result) {
          score = result.grading_result.score;
          feedback = result.grading_result.feedback || result.grading_result.raw;
          status = 'graded';
        } else if (result && result.final_marks !== undefined) {
          score = result.final_marks;
          feedback = `Similarity Score: ${result.similarity_score}%`;
          status = 'graded';
        }
      } catch (autoErr) {
        console.error(`[Autograder] Failed to grade exam ${examId}:`, autoErr.message);
        feedback = `AI Grading failed: ${autoErr.message}. Pending manual review.`;
      }
    }

    await client.query(
      "INSERT INTO exam_submissions (exam_id, student_id, file_url, status, score, feedback) VALUES ($1, $2, $3, $4, $5, $6)",
      [examId, studentId, req.file.path, status, score, feedback]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, status, score, feedback });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// 10.2 POST MCQ Exam Submission
router.post("/exams/:id/submit/mcq", async (req, res) => {
  const examId = req.params.id;
  const studentId = req.user.id;
  const { answers } = req.body; // { question_id: answer_text_or_option_index }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let totalScore = 0;
    
    // Auto-grade MCQ
    const { rows: questions } = await client.query(
      "SELECT id, correct_answer, marks FROM exam_questions WHERE exam_id = $1",
      [examId]
    );

    for (const q of questions) {
      const studentAnswer = String(answers[q.id]);
      if (studentAnswer === String(q.correct_answer)) {
        totalScore += (q.marks || 1);
      }
    }

    await client.query(
      "INSERT INTO exam_submissions (exam_id, student_id, status, score, answers) VALUES ($1, $2, 'graded', $3, $4)",
      [examId, studentId, totalScore, JSON.stringify(answers)]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, score: totalScore, status: 'graded' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// 10.3 POST Short Answer Exam Submission (AI Graded)
router.post("/exams/:id/submit/short", async (req, res) => {
  const examId = req.params.id;
  const studentId = req.user.id;
  const { answers } = req.body; // { question_id: answer_text }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch exam and questions with expected answers
    const { rows: examRows } = await client.query(
      "SELECT grading_method, ai_grading_prompt FROM exams WHERE id = $1",
      [examId]
    );
    const exam = examRows[0];
    const { rows: questions } = await client.query(
      "SELECT id, question_text, correct_answer, marks FROM exam_questions WHERE exam_id = $1",
      [examId]
    );

    let totalScore = 0;
    let detailedFeedback = [];

    // 2. Grade each question
    const { gradeSubmissionText } = require("../utils/autograder.cjs");
    
    for (const q of questions) {
      const studentAnswer = answers[q.id] || "";
      const expectedAnswer = q.correct_answer;
      
      let qScore = 0;
      let qFeedback = "";

      console.log(`[Short Grade] Q${q.id}: student="${studentAnswer.substring(0, 100)}" expected="${(expectedAnswer || '').substring(0, 100)}" marks=${q.marks}`);

      if (studentAnswer.trim()) {
        try {
          // Default to gemini if not manual
          const method = exam.grading_method === 'manual' ? 'gemini' : (exam.grading_method === 'auto_similarity' ? 'similarity' : 'gemini');
          
          console.log(`[Short Grade] Using method: ${method} (grading_method=${exam.grading_method})`);

          const result = await gradeSubmissionText(
            studentAnswer, 
            expectedAnswer, 
            method, 
            q.question_text
          );

          console.log(`[Short Grade] Autograder response:`, JSON.stringify(result).substring(0, 500));

          if (result && result.grading_result) {
            // score is 0-100, scale to question marks
            qScore = (result.grading_result.score / 100) * (q.marks || 1);
            qFeedback = result.grading_result.feedback;
            console.log(`[Short Grade] Gemini score=${result.grading_result.score}/100, scaled=${qScore}/${q.marks}`);
          } else if (result && result.similarity_score !== undefined) {
            qScore = result.passed ? (q.marks || 1) : 0;
            qFeedback = `Similarity: ${result.similarity_score}%`;
            console.log(`[Short Grade] Similarity score=${result.similarity_score}%, passed=${result.passed}, qScore=${qScore}`);
          } else {
            console.log(`[Short Grade] Unexpected result format:`, JSON.stringify(result).substring(0, 300));
          }
        } catch (gradErr) {
          console.error(`[AI Grade Error] Question ${q.id}:`, gradErr.message);
          qFeedback = "AI Grading failed. Pending manual review.";
        }
      } else {
        console.log(`[Short Grade] Q${q.id}: Empty answer, score=0`);
      }

      totalScore += qScore;
      detailedFeedback.push({
        question_id: q.id,
        score: qScore,
        feedback: qFeedback
      });
    }

    // 3. Save submission
    await client.query(
      "INSERT INTO exam_submissions (exam_id, student_id, status, score, feedback, answers) VALUES ($1, $2, 'graded', $3, $4, $5)",
      [examId, studentId, totalScore, JSON.stringify(detailedFeedback), JSON.stringify(answers)]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, score: totalScore, status: 'graded' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("[Submit Short Exam] Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  } finally {
    client.release();
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
    console.error(`[Student Courses] Error:`, err.message);
    res.status(500).json({ error: "Server error", details: err.message });
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
