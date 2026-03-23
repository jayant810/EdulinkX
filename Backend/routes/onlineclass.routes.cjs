// Backend/routes/onlineclass.routes.cjs
const express = require('express');
const router = express.Router();
const { pool } = require('../db.cjs');
const crypto = require('crypto');

// ─── Teacher: Create a new online class (instant or scheduled) ───
router.post('/online-classes', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can create classes' });

    const { title, courseId, scheduledAt, instant } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const roomId = crypto.randomUUID();
    const status = instant ? 'live' : 'scheduled';
    const startedAt = instant ? new Date().toISOString() : null;

    const [rows] = await pool.execute(
      `INSERT INTO online_classes (room_id, title, teacher_user_id, course_id, status, scheduled_at, started_at)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [roomId, title, req.user.id, courseId || null, status, scheduledAt || null, startedAt]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[OnlineClass] Create error:', err);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// ─── Teacher: List own classes ───
router.get('/online-classes', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `SELECT oc.*, c.course_name, c.course_code, c.department
       FROM online_classes oc
       LEFT JOIN courses c ON oc.course_id = c.id
       WHERE oc.teacher_user_id = ?
       ORDER BY oc.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('[OnlineClass] List error:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// ─── Teacher: Start a scheduled class (set to live) ───
router.patch('/online-classes/:id/start', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `UPDATE online_classes SET status = 'live', started_at = NOW()
       WHERE id = ? AND teacher_user_id = ? AND status = 'scheduled' RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Class not found or already started' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[OnlineClass] Start error:', err);
    res.status(500).json({ error: 'Failed to start class' });
  }
});

// ─── Teacher: End a live class ───
router.patch('/online-classes/:id/end', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `UPDATE online_classes SET status = 'ended', ended_at = NOW()
       WHERE id = ? AND teacher_user_id = ? AND status = 'live' RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Class not found or not live' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[OnlineClass] End error:', err);
    res.status(500).json({ error: 'Failed to end class' });
  }
});

// ─── Teacher: Delete a scheduled class ───
router.delete('/online-classes/:id', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `DELETE FROM online_classes WHERE id = ? AND teacher_user_id = ? AND status = 'scheduled' RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Class not found or cannot be deleted' });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    console.error('[OnlineClass] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// ─── Student: List live + scheduled classes for enrolled courses ───
router.get('/student/online-classes', async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `SELECT oc.*, c.course_name, c.course_code, c.department, u.name AS teacher_name
       FROM online_classes oc
       LEFT JOIN courses c ON oc.course_id = c.id
       JOIN users u ON oc.teacher_user_id = u.id
       WHERE oc.status IN ('live', 'scheduled')
         AND (oc.course_id IS NULL OR oc.course_id IN (
           SELECT cs.course_id FROM course_students cs WHERE cs.student_user_id = ?
         ))
       ORDER BY CASE WHEN oc.status = 'live' THEN 0 ELSE 1 END, oc.scheduled_at ASC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('[OnlineClass] Student list error:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// ─── Admin: List ALL classes with full metadata ───
router.get('/admin/online-classes', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `SELECT oc.*, c.course_name, c.course_code, c.department, u.name AS teacher_name
       FROM online_classes oc
       LEFT JOIN courses c ON oc.course_id = c.id
       LEFT JOIN users u ON oc.teacher_user_id = u.id
       ORDER BY oc.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('[OnlineClass] Admin list error:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// ─── Admin: Force-end any live class ───
router.patch('/admin/online-classes/:id/end', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `UPDATE online_classes SET status = 'ended', ended_at = NOW()
       WHERE id = ? AND status = 'live' RETURNING *`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Class not found or not live' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[OnlineClass] Admin end error:', err);
    res.status(500).json({ error: 'Failed to end class' });
  }
});

module.exports = router;
