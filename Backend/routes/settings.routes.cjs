const express = require("express");
const router = express.Router();
const pool = require("../db.cjs");

// Get Notification Settings
router.get("/settings/notifications", async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.execute("SELECT * FROM user_settings WHERE user_id = ?", [userId]);
    
    if (!rows.length) {
      // Default settings if none exist
      return res.json({
        email_notifications: true,
        windows_notifications: true,
        assignment_updates: true,
        exam_reminders: true,
        grade_updates: true,
        fee_reminders: true,
        attendance_alerts: true,
        two_factor_enabled: false
      });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update Notification Settings
router.post("/settings/notifications", async (req, res) => {
  const userId = req.user.id;
  const { 
    email_notifications, 
    windows_notifications, 
    assignment_updates, 
    exam_reminders, 
    grade_updates, 
    fee_reminders, 
    attendance_alerts,
    two_factor_enabled 
  } = req.body;

  try {
    await pool.execute(`
      INSERT INTO user_settings (
        user_id, email_notifications, windows_notifications, 
        assignment_updates, exam_reminders, grade_updates, 
        fee_reminders, attendance_alerts, two_factor_enabled, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON CONFLICT (user_id) DO UPDATE SET 
        email_notifications = EXCLUDED.email_notifications,
        windows_notifications = EXCLUDED.windows_notifications,
        assignment_updates = EXCLUDED.assignment_updates,
        exam_reminders = EXCLUDED.exam_reminders,
        grade_updates = EXCLUDED.grade_updates,
        fee_reminders = EXCLUDED.fee_reminders,
        attendance_alerts = EXCLUDED.attendance_alerts,
        two_factor_enabled = EXCLUDED.two_factor_enabled,
        updated_at = NOW()
    `, [
      userId, email_notifications, windows_notifications, 
      assignment_updates, exam_reminders, grade_updates, 
      fee_reminders, attendance_alerts, two_factor_enabled
    ]);

    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
