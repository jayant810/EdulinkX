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
    origin: "*", 
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
}

app.use(cors());
app.use(express.json());
const path = require('path');
const fs = require('fs');

// --- MySQL pool ---
const pool = require("./db.cjs");

// --- JWT helper ---
const JWT_SECRET = process.env.JWT_SECRET || 'jwtscrt';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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
    req.user = decoded; 
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Attach io to requests if needed
app.set('io', io);
if (redis) app.set('redis', redis);

// Import routes
const authRoutes = require("./routes/auth.routes.cjs");
const settingsRoutes = require("./routes/settings.routes.cjs");
const assignmentRoutes = require("./routes/assignments.routes.cjs");
const communityRoutes = require("./routes/community.routes.cjs")(io);
const messageRoutes = require("./routes/messages.routes.cjs")(io);
const studentRoutes = require("./routes/student.routes.cjs");
const teacherRoutes = require("./routes/teacher.routes.cjs");

// Auth routes (NO TOKEN REQUIRED)
app.use("/api/auth", authRoutes); 

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const multer = require('multer');
const uploadDir = path.join(__dirname, 'public/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Protected API Routes
app.post('/api/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.use("/api", verifyToken, assignmentRoutes);
app.use("/api", verifyToken, communityRoutes);
app.use("/api", verifyToken, messageRoutes);
app.use("/api", verifyToken, settingsRoutes);
app.use("/api/student", verifyToken, studentRoutes);
app.use("/api/teacher", verifyToken, teacherRoutes);

// Socket.io logic
io.on("connection", (socket) => {
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
