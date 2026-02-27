const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../db.cjs");
const dns = require("dns");

// Force IPv4 for all network requests in this file (Fixes Render ENETUNREACH)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const JWT_SECRET = process.env.JWT_SECRET || 'jwtscrt';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Email Transporter (Configure with your SMTP details in .env)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 15000,
  // Force IPv4 to avoid ENETUNREACH errors on cloud providers like Render
  family: 4 
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("[SMTP] Connection Error:", error.message);
  } else {
    console.log("[SMTP] Server is ready to take our messages");
  }
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
  console.log(`[Forgot Password] Request START for: ${email}`);
  
  try {
    const [users] = await pool.execute("SELECT id, name FROM users WHERE email = ?", [email]);
    if (!users.length) {
      console.warn(`[Forgot Password] Email not found: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    console.log("[Forgot Password] Updating token in DB...");
    await pool.execute(
      "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?",
      [token, expires, users[0].id]
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    console.log("[Forgot Password] Sending success response to client immediately...");
    res.json({ success: true, message: "Reset link has been sent to your email." });

    // Handle email sending in background with a slight delay to ensure the response was sent
    setTimeout(() => {
      console.log(`[Forgot Password] Background email dispatch starting for: ${email}`);
      transporter.sendMail({
        from: `"EdulinkX Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2>Password Reset</h2>
            <p>Hello ${users[0].name},</p>
            <p>You requested a password reset. Click the button below to set a new password:</p>
            <div style="margin: 20px 0;">
              <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            <p>Or copy this link: <br/> ${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `,
      }).then(() => {
        console.log(`[Forgot Password] Email sent successfully to: ${email}`);
      }).catch(err => {
        console.error(`[Forgot Password] Email ERROR:`, err.message);
      });
    }, 10);

  } catch (err) {
    console.error(`[Forgot Password] CRITICAL Error:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process request" });
    }
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
