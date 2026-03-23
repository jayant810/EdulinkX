require('dotenv').config();
const { pool } = require('./db.cjs');

async function test() {
  const teacherId = 2; 
  try {
    const res = await pool.query(`
      SELECT s.id, s.assignment_id as source_id, s.student_user_id, s.submission_text, s.file_url, CAST(s.status AS VARCHAR) as status, CAST(s.score AS DECIMAL) as score, s.feedback, s.submitted_at, 
             u.name as student, a.title as assignment, c.course_name as course, a.type, a.max_score, 'assignment' as submit_type
      FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN users u ON u.id = s.student_user_id
      JOIN courses c ON c.id = a.course_id
      JOIN course_teachers ct ON ct.course_id = c.id
      WHERE ct.teacher_user_id = $1 AND CAST(s.status AS VARCHAR) = 'submitted'
      UNION ALL
      SELECT s.id, s.exam_id as source_id, s.student_id as student_user_id, CAST(s.answers AS TEXT) as submission_text, s.file_url, CAST(s.status AS VARCHAR) as status, CAST(s.score AS DECIMAL) as score, s.feedback, s.submitted_at,
             u.name as student, e.title as assignment, c.course_name as course, e.exam_type as type, e.total_marks as max_score, 'exam' as submit_type
      FROM exam_submissions s
      JOIN exams e ON e.id = s.exam_id
      JOIN users u ON u.id = s.student_id
      JOIN courses c ON c.id = e.course_id
      JOIN course_teachers ct ON ct.course_id = c.id
      WHERE ct.teacher_user_id = $2 AND CAST(s.status AS VARCHAR) = 'submitted'
      ORDER BY submitted_at ASC`, [teacherId, teacherId]);
    console.log("Success:", res.rows.length);
  } catch (e) {
    console.error("Error running query:", e);
  } finally {
    process.exit(0);
  }
}

test();
