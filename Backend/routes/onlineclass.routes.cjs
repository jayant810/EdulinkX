// Backend/routes/onlineclass.routes.cjs
const express = require('express');
const router = express.Router();
const { pool } = require('../db.cjs');
const crypto = require('crypto');

// ─── Admin: Get all departments with courses ───
router.get('/admin/departments-courses', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `SELECT id, course_name, course_code, department
       FROM courses
       WHERE department IS NOT NULL
       ORDER BY department, course_name`
    );

    // Group by department
    const grouped = {};
    rows.forEach(c => {
      if (!grouped[c.department]) grouped[c.department] = [];
      grouped[c.department].push({ id: c.id, name: c.course_name, code: c.course_code });
    });

    const departments = Object.entries(grouped).map(([name, courses]) => ({ name, courses }));
    res.json(departments);
  } catch (err) {
    console.error('[OnlineClass] Departments error:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

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
      `INSERT INTO online_classes (room_id, title, teacher_user_id, course_id, status, scheduled_at, started_at, created_by_role, audience_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'teacher', 'course') RETURNING *`,
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

// ─── Student: List live + scheduled classes (enrolled courses + targeted) ───
router.get('/student/online-classes', async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

    const [studentCourses] = await pool.execute(
      `SELECT c.id, c.department FROM courses c JOIN course_students cs ON c.id = cs.course_id WHERE cs.student_user_id = ?`,
      [req.user.id]
    );
    const myCourseIds = studentCourses.map(c => c.id);
    const myDepartments = [...new Set(studentCourses.map(c => c.department).filter(Boolean))];

    const [rows] = await pool.execute(
      `SELECT oc.*, c.course_name, c.course_code, c.department, u.name AS teacher_name
       FROM online_classes oc
       LEFT JOIN courses c ON oc.course_id = c.id
       JOIN users u ON oc.teacher_user_id = u.id
       WHERE oc.status IN ('live', 'scheduled')
       ORDER BY CASE WHEN oc.status = 'live' THEN 0 ELSE 1 END, oc.scheduled_at ASC`
    );

    const visibleRows = rows.filter(oc => {
      if (oc.audience_type === 'course' && oc.created_by_role === 'teacher') {
         return !oc.course_id || myCourseIds.includes(oc.course_id);
      }
      if (oc.audience_type === 'everyone' || oc.audience_type === 'students_only' || oc.audience_type === 'teachers_and_students') {
        return true;
      }
      if (oc.audience_type === 'department' && oc.audience_target) {
        try {
          const target = JSON.parse(oc.audience_target);
          let deptsArray = Array.isArray(target) ? target : (target && target.depts) ? target.depts : [];
          let userType = Array.isArray(target) ? 'both' : (target && target.userType) ? target.userType : 'both';

          if (userType === 'teachers') return false;
          
          return deptsArray.some(d => {
            if (myDepartments.includes(d.department)) {
               if (d.courseIds === 'all') return true;
               if (Array.isArray(d.courseIds)) {
                 return d.courseIds.some(cid => myCourseIds.includes(cid));
               }
            }
            return false;
          });
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    res.json(visibleRows);
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

// ─── Admin: End ALL live meetings ───
router.patch('/admin/online-classes/end-all', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const [rows] = await pool.execute(
      `UPDATE online_classes SET status = 'ended', ended_at = NOW()
       WHERE status = 'live' RETURNING id, room_id`
    );

    res.json({ ended: rows.length, rooms: rows.map(r => r.room_id) });
  } catch (err) {
    console.error('[OnlineClass] Admin end-all error:', err);
    res.status(500).json({ error: 'Failed to end all classes' });
  }
});

// ─── Admin: Create a targeted meeting ───
router.post('/admin/online-classes', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { title, audienceType, audienceTarget, scheduledAt, instant } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!audienceType) return res.status(400).json({ error: 'Audience type is required' });

    const roomId = crypto.randomUUID();
    const status = instant ? 'live' : 'scheduled';
    const startedAt = instant ? new Date().toISOString() : null;
    // audienceTarget is a JSON string of department names or course IDs
    const targetStr = audienceTarget ? JSON.stringify(audienceTarget) : null;

    const [rows] = await pool.execute(
      `INSERT INTO online_classes (room_id, title, teacher_user_id, course_id, status, scheduled_at, started_at, created_by_role, audience_type, audience_target)
       VALUES (?, ?, ?, NULL, ?, ?, ?, 'admin', ?, ?) RETURNING *`,
      [roomId, title, req.user.id, status, scheduledAt || null, startedAt, audienceType, targetStr]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[OnlineClass] Admin create error:', err);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// ─── Teacher: List live + scheduled classes visible to teachers ───
router.get('/teacher/online-classes/visible', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });

    const [teacherCourses] = await pool.execute(
      `SELECT id, department FROM courses WHERE teacher_user_id = ?`,
      [req.user.id]
    );
    const myCourseIds = teacherCourses.map(c => c.id);
    const myDepartments = [...new Set(teacherCourses.map(c => c.department).filter(Boolean))];

    const [rows] = await pool.execute(
      `SELECT oc.*, c.course_name, c.course_code, c.department, u.name AS teacher_name
       FROM online_classes oc
       LEFT JOIN courses c ON oc.course_id = c.id
       JOIN users u ON oc.teacher_user_id = u.id
       WHERE oc.status IN ('live', 'scheduled')
         AND oc.created_by_role = 'admin'
       ORDER BY CASE WHEN oc.status = 'live' THEN 0 ELSE 1 END, oc.scheduled_at ASC`
    );

    const visibleRows = rows.filter(oc => {
      if (oc.audience_type === 'everyone' || oc.audience_type === 'teachers_only' || oc.audience_type === 'teachers_and_students') {
        return true;
      }
      if (oc.audience_type === 'department' && oc.audience_target) {
        try {
          const target = JSON.parse(oc.audience_target);
          let deptsArray = Array.isArray(target) ? target : (target && target.depts) ? target.depts : [];
          let userType = Array.isArray(target) ? 'both' : (target && target.userType) ? target.userType : 'both';

          if (userType === 'students') return false;

          return deptsArray.some(d => {
            if (myDepartments.includes(d.department)) {
               if (d.courseIds === 'all') return true;
               if (Array.isArray(d.courseIds)) {
                 return d.courseIds.some(cid => myCourseIds.includes(cid));
               }
            }
            return false;
          });
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    res.json(visibleRows);
  } catch (err) {
    console.error('[OnlineClass] Teacher visible list error:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// ─── Bot/Admin: Upload Meeting Recording ───
const { cloudinaryUpload } = require('../utils/cloudinary.cjs');

router.post('/admin/recordings', cloudinaryUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const roomId = req.body.roomId;
    if (!roomId) return res.status(400).json({ error: 'Missing roomId' });

    // Validate the token context belongs to personnel allowed to authorize a bot recording
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Capture the generated Cloudinary Path
    const recordingUrl = req.file.path;

    await pool.execute(
      `UPDATE online_classes SET recording_url = ? WHERE room_id = ?`,
      [recordingUrl, roomId]
    );

    console.log(`[Recording] Successfully saved for room ${roomId}: ${recordingUrl}`);
    res.json({ url: recordingUrl });
  } catch (err) {
    console.error('[OnlineClass] Recording upload error:', err);
    res.status(500).json({ error: 'Failed to save recording' });
  }
});

module.exports = router;
