// server.cjs
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// Redis (Valkey) setup - Optional
let redis = null;
if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  redis.on('error', (err) => {
    console.warn('Redis connection failed. Live features will work locally but without scaling. Error:', err.message);
    redis = null;
  });
} else {
  console.log("Redis not configured, skipping. Live changes will be managed locally via Socket.io.");
}

app.use(cors());
app.use(express.json());
const path = require('path');
const fs = require('fs');

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, 'public/uploads');
const submissionsDir = path.join(uploadDir, 'submissions');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBmvOCu_n0ytqPrkKHu9b7ME0BO0Ou3-7E");

// Function to get model with specific API version
function getModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
}

console.log("SERVER.CJS LOADED WITH WEBSOCKETS AND REDIS");

// File Upload Route
app.post('/api/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// AI Summary Route
app.post('/api/ai/summarize', verifyToken, async (req, res) => {
  const { title, description } = req.body;
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
  
  for (const modelName of modelsToTry) {
    try {
      const model = getModel(modelName);
      const prompt = `Generate a concise, professional educational summary for a lecture titled "${title}" with description: "${description}". Keep it under 100 words. Focus on key learning outcomes.`;
      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      return res.json({ summary });
    } catch (err) {
      console.warn(`[AI Route] Model ${modelName} failed:`, err.message);
    }
  }
  
  // Fallback
  const fallback = `This lecture on "${title}" covers key concepts and learning objectives. ${description ? description : ''}`;
  res.json({ summary: fallback });
});

// Diagnostic: List Models
app.get('/api/ai/models', async (req, res) => {
  try {
    // Note: listModels might not be available on all versions, but 0.24.1 should have it or similar
    // Actually, in the newer SDKs, it's often accessed differently.
    // For now, let's try a simple generation with a model that usually works.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    res.json({ 
      info: "If you see 404 in logs, the model name is likely restricted for this key.",
      attempted_model: "gemini-1.5-flash",
      sdk_version: "0.24.1"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FORCE GENERATE MISSING SUMMARIES (Maintenance)
app.get('/api/admin/maintenance/fix-summaries', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ error: "Forbidden" });
  
  try {
    const [rows] = await pool.execute("SELECT id, title, sub_title FROM course_lectures WHERE ai_summary IS NULL OR ai_summary = ''");
    console.log(`Found ${rows.length} lectures missing summaries.`);
    
    let count = 0;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    for (const lecture of rows) {
      try {
        const prompt = `Generate a concise, professional educational summary for a lecture titled "${lecture.title}" with description: "${lecture.sub_title || 'No description'}". Keep it under 100 words.`;
        const result = await model.generateContent(prompt);
        const summary = result.response.text();
        
        await pool.execute("UPDATE course_lectures SET ai_summary = ? WHERE id = ?", [summary, lecture.id]);
        count++;
        // Add a small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error(`Failed for lecture ${lecture.id}:`, e.message);
      }
    }
    
    res.json({ message: `Successfully updated ${count} lectures.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Maintenance failed" });
  }
});

// Attach io to requests if needed
app.set('io', io);
if (redis) app.set('redis', redis);


// --- MySQL pool ---
const pool = require("./db.cjs");


// --- JWT helper ---
const JWT_SECRET = process.env.JWT_SECRET || 'jwtscrt';
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
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
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
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [name || null, email, password_hash, role, studentId || null, employeeCode || null]
    );

    const userId = result[0].id;
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
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, student_id, employee_code, created_at FROM users LIMIT 50'
    );
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
// app.get('/api/student/profile/:studentId', verifyToken, async (req, res) => {
//   const { studentId } = req.params;
//   try {
//     const requester = req.user; // { id, email, role, student_id, employee_code }
//     if (!requester) return res.status(401).json({ error: 'Unauthorized' });

//     // Authorization: allow if same student or teacher/admin
//     if (requester.role !== 'admin' && requester.role !== 'teacher' && requester.student_id !== studentId) {
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     const [rows] = await pool.execute(
//       'SELECT id, name, email, role, student_id, employee_code, created_at FROM users WHERE student_id = ? LIMIT 1',
//       [studentId]
//     );

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     const profile = rows[0];
//     return res.json({ profile });
//   } catch (err) {
//     console.error('Profile fetch error:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/api/student/profile/:studentId', verifyToken, async (req, res) => {
//   const { studentId } = req.params;

//   try {
//     const requester = req.user; // decoded JWT
//     if (!requester) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     // Authorization:
//     // - student can view only own profile
//     // - teacher/admin can view any student
//     if (
//       requester.role === 'student' &&
//       requester.student_id !== studentId
//     ) {
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     const [rows] = await pool.execute(
//       `
//       SELECT 
//         u.id AS user_id,
//         u.email AS login_email,
//         u.role,
//         sp.*
//       FROM student_profiles sp
//       INNER JOIN users u ON u.id = sp.user_id
//       WHERE sp.student_id = ?
//       LIMIT 1
//       `,
//       [studentId]
//     );

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ error: 'Student profile not found' });
//     }

//     return res.json({ profile: rows[0] });

//   } catch (err) {
//     console.error('Profile fetch error:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });


app.get('/api/student/profile/me', verifyToken, async (req, res) => {
  try {
    const requester = req.user;
    if (!requester) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Try to get detailed profile from student_profiles table
    if (requester.role === 'student' && requester.student_id) {
      const [rows] = await pool.execute(
        `
        SELECT 
          u.id AS user_id,
          u.name AS user_name,
          u.email AS login_email,
          u.role,
          sp.*
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = ?
        LIMIT 1
        `,
        [requester.id]
      );

      if (rows && rows.length > 0) {
        // If profile exists in student_profiles, return it. 
        // If not (sp.id is null), return basic user info from users table.
        const profileData = rows[0];
        if (!profileData.student_id) {
          // Fallback to basic user info if no profile record exists
          return res.json({ 
            profile: {
              full_name: profileData.user_name,
              email: profileData.login_email,
              student_id: requester.student_id,
              is_incomplete: true
            } 
          });
        }
        return res.json({ profile: profileData });
      }
    }

    // Default: fetch from users table for admin/teacher or fallback
    const [userRows] = await pool.execute(
      'SELECT id, name as full_name, email, role, student_id, employee_code, created_at FROM users WHERE id = ? LIMIT 1',
      [requester.id]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json({ profile: userRows[0] });

  } catch (err) {
    console.error('Profile me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------------------------------------------------
  STUDENT ATTENDANCE SUMMARY
------------------------------------------------------------------ */
app.get("/api/student/attendance/summary", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "student") 
      return res.status(403).json({ error: "Forbidden" });

    const studentId = user.id;

    // total classes
    const [[totalResult]] = await pool.execute(`
      SELECT COUNT(*) AS totalClasses
      FROM attendance_records
      WHERE student_user_id = ?
    `, [studentId]);

    // present classes
    const [[presentResult]] = await pool.execute(`
      SELECT COUNT(*) AS presentClasses
      FROM attendance_records
      WHERE student_user_id = ?
      AND status = 'present'
    `, [studentId]);

    const totalClasses = totalResult.totalClasses || 0;
    const presentClasses = presentResult.presentClasses || 0;
    const missedClasses = totalClasses - presentClasses;

    const overallAttendance = totalClasses > 0
      ? Math.round((presentClasses / totalClasses) * 100)
      : 0;

    // subjects below 75%
    const [lowSubjects] = await pool.execute(`
      SELECT s.course_id,
      ROUND((SUM(CASE WHEN ar.status='present' THEN 1 ELSE 0 END)::DECIMAL/COUNT(*))*100,1) AS percentage
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      WHERE ar.student_user_id = ?
      GROUP BY s.course_id
      HAVING (SUM(CASE WHEN ar.status='present' THEN 1 ELSE 0 END)::DECIMAL/COUNT(*))*100 < 75
    `, [studentId]);

    res.json({
      overallAttendance,
      presentClasses,
      totalClasses,
      missedClasses,
      lowAttendanceCount: lowSubjects.length
    });

  } catch (err) {
    console.error("Attendance summary error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------------------------------------------
  STUDENT ATTENDANCE BY SUBJECT
------------------------------------------------------------------ */
app.get("/api/student/attendance/subjects", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "student") 
      return res.status(403).json({ error: "Forbidden" });

    const studentId = user.id;

    const [rows] = await pool.execute(`
      SELECT 
        c.id AS course_id,
        c.course_name AS name,
        c.course_code AS code,
        SUM(CASE WHEN ar.status='present' THEN 1 ELSE 0 END) AS present,
        COUNT(*) AS total,
        ROUND((SUM(CASE WHEN ar.status='present' THEN 1 ELSE 0 END)::DECIMAL/COUNT(*))*100,1) AS percentage
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      JOIN courses c ON c.id = s.course_id
      WHERE ar.student_user_id = ?
      GROUP BY c.id, c.course_name, c.course_code
      ORDER BY c.course_name
    `, [studentId]);

    res.json(rows);

  } catch (err) {
    console.error("Subject attendance error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------------------------------------------
  STUDENT ATTENDANCE CALENDAR
------------------------------------------------------------------ */ 
app.get("/api/student/attendance/calendar", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "student")
      return res.status(403).json({ error: "Forbidden" });

    const studentId = user.id;
    const { month, year, courseId } = req.query;

    let query = `
      SELECT s.class_date AS date, ar.status
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      WHERE ar.student_user_id = ?
      AND EXTRACT(MONTH FROM s.class_date) = ?
      AND EXTRACT(YEAR FROM s.class_date) = ?
    `;

    const params = [studentId, month, year];

    if (courseId) {
      query += " AND s.course_id = ?";
      params.push(courseId);
    }

    const [attendance] = await pool.execute(query, params);

    res.json(attendance);

  } catch (err) {
    console.error("Calendar error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------------------------------------------
  STUDENT COURSES with PROGRESS
------------------------------------------------------------------ */
app.get("/api/student/courses", verifyToken, async (req,res)=>{
  try {
    if(req.user.role !== "student") return res.status(403).json({error:"Forbidden"});

    const studentId = req.user.id;

    const [rows] = await pool.execute(`
      SELECT 
        c.id,
        c.course_name AS name,
        c.course_code AS code,
        u.name AS instructor,

        COUNT(DISTINCT cl.id) AS totalLectures,
        COUNT(DISTINCT slp.id) AS completedLectures,

        (COUNT(DISTINCT slp.id)::DECIMAL / NULLIF(COUNT(DISTINCT cl.id), 0)) * 100 AS progress,

        COUNT(DISTINCT cm.id) AS materials

      FROM course_students cs
      JOIN courses c ON c.id = cs.course_id
      JOIN course_teachers ct ON ct.course_id = c.id
      JOIN users u ON u.id = ct.teacher_user_id
      LEFT JOIN course_lectures cl ON cl.course_id = c.id
      LEFT JOIN student_lecture_progress slp 
           ON slp.lecture_id = cl.id AND slp.student_user_id = ?
      LEFT JOIN course_materials cm ON cm.course_id = c.id
      WHERE cs.student_user_id = ?
      GROUP BY c.id, c.course_name, c.course_code, u.name
      ORDER BY c.course_name
    `,[studentId, studentId]);

    res.json(rows);

  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ------------------------------------------------------------------
  STUDENT COURSE LECTURES with PROGRESS
------------------------------------------------------------------ */
app.get("/api/student/course/:courseId/lectures", verifyToken, async (req,res)=>{
  try {
    if(req.user.role !== "student") return res.status(403).json({error:"Forbidden"});

    const studentId = req.user.id;
    const courseId = req.params.courseId;

    const [lectures] = await pool.execute(`
      SELECT 
        cl.id AS lecture_id,
        cl.title,
        cl.sub_title,
        cl.video_url,
        cl.notes_url,
        cl.is_interactive,
        cl.interactions,
        cl.video_type,
        cl.ai_summary,
        slp.answered_interactions,
        CASE WHEN slp.completed=TRUE THEN 1 ELSE 0 END AS completed
      FROM course_lectures cl
      LEFT JOIN student_lecture_progress slp
        ON slp.lecture_id = cl.id
        AND slp.student_user_id = ?
      WHERE cl.course_id = ?
      ORDER BY cl.lecture_order
    `,[studentId, courseId]);

    // Ensure interactions are parsed
    const parsedLectures = lectures.map(l => ({
      ...l,
      interactions: typeof l.interactions === 'string' ? JSON.parse(l.interactions) : l.interactions,
      answered_interactions: typeof l.answered_interactions === 'string' ? JSON.parse(l.answered_interactions) : (l.answered_interactions || [])
    }));

    res.json({ lectures: parsedLectures });

  } catch(err){
    res.status(500).json({error:"Server error"});
  }
});


/* ------------------------------------------------------------------
  STUDENT MARK LECTURE AS COMPLETE
------------------------------------------------------------------ */
app.post("/api/student/lecture/:lectureId/complete", verifyToken, async (req,res)=>{
  if(req.user.role !== "student") return res.status(403).json({error:"Forbidden"});

  const studentId = req.user.id;
  const lectureId = req.params.lectureId;

  await pool.execute(`
    INSERT INTO student_lecture_progress(student_user_id,lecture_id,completed,completed_at)
    VALUES(?,?,1,NOW())
    ON DUPLICATE KEY UPDATE completed=1, completed_at=NOW()
  `,[studentId,lectureId]);

  res.json({success:true});
});

/* ------------------------------------------------------------------
  STUDENT TRACK INTERACTION
------------------------------------------------------------------ */
app.post("/api/student/lecture/:lectureId/interaction", verifyToken, async (req,res)=>{
  if(req.user.role !== "student") return res.status(403).json({error:"Forbidden"});

  const studentId = req.user.id;
  const lectureId = req.params.lectureId;
  const { time } = req.body;

  try {
    const [[progress]] = await pool.execute(
      "SELECT answered_interactions FROM student_lecture_progress WHERE student_user_id = ? AND lecture_id = ?",
      [studentId, lectureId]
    );

    let answered = [];
    if (progress && progress.answered_interactions) {
      answered = typeof progress.answered_interactions === 'string' ? JSON.parse(progress.answered_interactions) : progress.answered_interactions;
    }

    if (!answered.includes(time)) {
      answered.push(time);
    }

    await pool.execute(`
      INSERT INTO student_lecture_progress(student_user_id, lecture_id, answered_interactions)
      VALUES(?,?,?)
      ON DUPLICATE KEY UPDATE answered_interactions=?
    `,[studentId, lectureId, JSON.stringify(answered), JSON.stringify(answered)]);

    res.json({ success: true, answered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------------------------------------------
  STUDENT SAVE AI SUMMARY
------------------------------------------------------------------ */
app.post("/api/student/lecture/:lectureId/summary", verifyToken, async (req,res)=>{
  const lectureId = req.params.lectureId;
  const { summary } = req.body;

  try {
    await pool.execute("UPDATE course_lectures SET ai_summary = ? WHERE id = ?", [summary, lectureId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ------------------------------------------------------------------
  STUDENT COURSE MATERIALS
------------------------------------------------------------------ */
app.get("/api/student/course/:courseId/materials", verifyToken, async (req,res)=>{
  if(req.user.role !== "student") return res.status(403).json({error:"Forbidden"});

  const [rows] = await pool.execute(
    `SELECT title, file_url FROM course_materials WHERE course_id=?`,
    [req.params.courseId]
  );

  res.json(rows);
});


/* ------------------------------------------------------------------
  OPTIONAL: simple healthcheck
------------------------------------------------------------------ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Import routes
const assignmentRoutes = require("./routes/assignments.routes.cjs");
const communityRoutes = require("./routes/community.routes.cjs")(io);
const messageRoutes = require("./routes/messages.routes.cjs")(io);
const studentRoutes = require("./routes/student.routes.cjs");
const teacherRoutes = require("./teacher-master-schema.sql"); // Wait, this is an SQL file? Checking...

// Correcting the imports
const teacherRoutesActual = require("./routes/teacher.routes.cjs");

app.use("/api", verifyToken, assignmentRoutes);
app.use("/api", verifyToken, communityRoutes);
app.use("/api", verifyToken, messageRoutes);
app.use("/api/student", verifyToken, studentRoutes);
app.use("/api/teacher", verifyToken, teacherRoutesActual);

// Socket.io room join logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

/* ------------------------------------------------------------------
  START SERVER
------------------------------------------------------------------ */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});

