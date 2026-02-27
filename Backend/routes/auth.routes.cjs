const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../db.cjs");

const JWT_SECRET = process.env.JWT_SECRET || 'jwtscrt';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Email Transporter (Configure with your SMTP details in .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      student_id: user.student_id || null,
      employee_code: user.employee_code || null
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = rows[0];
    if (!user.password_hash) return res.status(400).json({ error: 'Please login with Google' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
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
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Password (from Settings)
router.post("/change-password", async (req, res) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = decoded.id;

  try {
    const [rows] = await pool.execute("SELECT password_hash FROM users WHERE id = ?", [userId]);
    if (!rows.length || !rows[0].password_hash) {
      return res.status(400).json({ error: "Password not set for this account (Social Login?)" });
    }

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: "Incorrect current password" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [hash, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Forgot Password (Request Reset)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.execute("SELECT id, name FROM users WHERE email = ?", [email]);
    if (!users.length) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await pool.execute(
      "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?",
      [token, expires, users[0].id]
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"EdulinkX Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${users[0].name},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset Password (with token)
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [users] = await pool.execute(
      "SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()",
      [token]
    );

    if (!users.length) return res.status(400).json({ error: "Invalid or expired token" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      "UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?",
      [hash, users[0].id]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Google Login
router.post("/google", async (req, res) => {
  const { idToken } = req.body; 
  
  if (!idToken) {
    console.error("[Google Auth] No idToken provided in request body");
    return res.status(400).json({ error: "No token provided" });
  }

  // Ensure Client ID is available
  const clientId = GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("[Google Auth] GOOGLE_CLIENT_ID is missing from environment variables");
    return res.status(500).json({ error: "Server configuration error: Missing Client ID" });
  }

  try {
    console.log("[Google Auth] Verifying token...");
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;
    console.log(`[Google Auth] Token verified for email: ${email}`);

    let [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    
    if (rows.length === 0) {
      console.warn(`[Google Auth] Login attempt for non-registered email: ${email}`);
      return res.status(403).json({ error: "Your account is not registered in the system. Please contact the administrator." });
    }

    const user = rows[0];
    // Update google_id if not present
    if (!user.google_id) {
      await pool.execute("UPDATE users SET google_id = ? WHERE id = ?", [googleId, user.id]);
    }

    const token = signToken(user);
    res.json({
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
    console.error("[Google Auth] Verification Error:", err.message);
    res.status(500).json({ error: `Google authentication failed: ${err.message}` });
  }
});

module.exports = router;
