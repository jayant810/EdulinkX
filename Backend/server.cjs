// server.cjs
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors()); // In production, restrict origin: cors({ origin: 'https://yourdomain.com' })
app.use(express.json());

// --- MySQL pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edulinkx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- JWT helper ---
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  // include minimal, necessary fields in token
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      student_id: user.student_id || null,
      employee_code: user.employee_code || null
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// --- Middleware: verify token ---
function verifyToken(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization header format' });
  }
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach decoded payload to request
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/* ------------------------------------------------------------------
  AUTH: LOGIN
------------------------------------------------------------------ */
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student_id,
        employeeCode: user.employee_code
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------------------------------------------------
  AUTH: SIGNUP
------------------------------------------------------------------ */
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role, studentId, employeeCode } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

  try {
    const [exists] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists && exists.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, role, student_id, employee_code)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name || null, email, password_hash, role, studentId || null, employeeCode || null]
    );

    const userId = result.insertId;
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student_id,
        employeeCode: user.employee_code
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------------------------------------------------
  TEST: list users (no password)
------------------------------------------------------------------ */
app.get('/api/test/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role, student_id, employee_code, created_at FROM users LIMIT 50');
    return res.json({ users: rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Database fetch failed' });
  }
});

/* ------------------------------------------------------------------
  PROFILE: GET by studentId
  - Protected: requires Bearer token
  - Allowed if:
     * requester is the same student (matching student_id),
     * OR requester.role is 'teacher' or 'admin'
------------------------------------------------------------------ */
app.get('/api/student/profile/:studentId', verifyToken, async (req, res) => {
  const { studentId } = req.params;
  try {
    const requester = req.user; // { id, email, role, student_id, employee_code }
    if (!requester) return res.status(401).json({ error: 'Unauthorized' });

    // Authorization: allow if same student or teacher/admin
    if (requester.role !== 'admin' && requester.role !== 'teacher' && requester.student_id !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, student_id, employee_code, created_at FROM users WHERE student_id = ? LIMIT 1',
      [studentId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const profile = rows[0];
    return res.json({ profile });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------------------------------------------------
  PROFILE: GET me (based on token)
  - Protected: returns the profile for the token owner (if they have student_id)
------------------------------------------------------------------ */
app.get('/api/student/profile/me', verifyToken, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ error: 'Unauthorized' });

    // If the token owner has a student_id, fetch by that; else error
    if (!requester.student_id) {
      // If admin/teacher request, you may prefer to return their user record:
      const [rowsSelf] = await pool.execute('SELECT id, name, email, role, student_id, employee_code, created_at FROM users WHERE id = ? LIMIT 1', [requester.id]);
      if (!rowsSelf || rowsSelf.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.json({ profile: rowsSelf[0] });
    }

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, student_id, employee_code, created_at FROM users WHERE student_id = ? LIMIT 1',
      [requester.student_id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Profile me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------------------------------------------------
  OPTIONAL: simple healthcheck
------------------------------------------------------------------ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

/* ------------------------------------------------------------------
  START SERVER
------------------------------------------------------------------ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
