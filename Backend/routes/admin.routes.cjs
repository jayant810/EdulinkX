const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");
const bcrypt = require("bcrypt");
const pdf = require("pdf-parse");
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
    const lastSeq = parseInt(lastId.substring(7)); // STU2026XXX -> index 7 is where XXX starts
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
// Assumes PDF text contains lines like: "Name, Email, Department, Semester"
router.post("/students/bulk-pdf", upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

  try {
    const data = await pdf(req.file.buffer);
    const lines = data.text.split('
').filter(line => line.trim().length > 0);
    const students = [];

    // Simple parser: skip header if any, expect CSV-like lines in PDF
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 4 && parts[1].includes('@')) {
        students.push({
          name: parts[0],
          email: parts[1],
          department: parts[2],
          semester: parseInt(parts[3])
        });
      }
    }

    if (students.length === 0) return res.status(400).json({ error: "No valid student data found in PDF. Format: Name, Email, Department, Semester" });

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
      res.json({ message: "Bulk upload completed", results });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: "Error parsing PDF", details: err.message });
  }
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
