const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");

module.exports = function(io) {

  // Search users to start a message with based on access control rules
  router.get("/messages/search-users", async (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) return res.json({ users: [] });

    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    const searchQuery = `%${query}%`;

    try {
      let users = [];

      if (currentUserRole === 'student') {
        // Students can message:
        // 1. Teachers of their courses
        // 2. Students in their courses
        [users] = await pool.execute(`
          SELECT DISTINCT u.id, u.name, u.role, u.student_id, u.employee_code 
          FROM users u
          WHERE u.id != ? AND (u.name ILIKE ? OR u.student_id ILIKE ? OR u.employee_code ILIKE ?) AND (
            -- Teachers of their courses
            EXISTS (
              SELECT 1 FROM course_students cs
              JOIN course_teachers ct ON cs.course_id = ct.course_id
              WHERE cs.student_user_id = ? AND ct.teacher_user_id = u.id
            )
            OR
            -- Students in their courses
            EXISTS (
              SELECT 1 FROM course_students cs1
              JOIN course_students cs2 ON cs1.course_id = cs2.course_id
              WHERE cs1.student_user_id = ? AND cs2.student_user_id = u.id
            )
            OR
            -- Admins who already have a conversation with them
            (u.role = 'admin' AND EXISTS (
               SELECT 1 FROM conversation_participants cp1
               JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
               WHERE cp1.user_id = ? AND cp2.user_id = u.id
            ))
          )
          LIMIT 20
        `, [currentUserId, searchQuery, searchQuery, searchQuery, currentUserId, currentUserId, currentUserId]);

      } else if (currentUserRole === 'teacher') {
        // Teachers can message:
        // 1. All teachers
        // 2. Students in their courses
        [users] = await pool.execute(`
          SELECT DISTINCT u.id, u.name, u.role, u.student_id, u.employee_code
          FROM users u
          WHERE u.id != ? AND (u.name ILIKE ? OR u.student_id ILIKE ? OR u.employee_code ILIKE ?) AND (
            u.role = 'teacher'
            OR
            (u.role = 'student' AND EXISTS (
              SELECT 1 FROM course_teachers ct
              JOIN course_students cs ON ct.course_id = cs.course_id
              WHERE ct.teacher_user_id = ? AND cs.student_user_id = u.id
            ))
            OR
            u.role = 'admin'
          )
          LIMIT 20
        `, [currentUserId, searchQuery, searchQuery, searchQuery, currentUserId]);

      } else if (currentUserRole === 'admin') {
        // Admins can message anyone
        [users] = await pool.execute(`
          SELECT id, name, role, student_id, employee_code
          FROM users
          WHERE id != ? AND (name ILIKE ? OR student_id ILIKE ? OR employee_code ILIKE ?)
          LIMIT 20
        `, [currentUserId, searchQuery, searchQuery, searchQuery]);
      }

      res.json({ users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Get or create a conversation with another user
  router.post("/messages/conversation/get-or-create", async (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    try {
      // Check if conversation exists (assuming 1-on-1 for now)
      const [existing] = await pool.execute(`
        SELECT cp1.conversation_id 
        FROM conversation_participants cp1
        JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        WHERE cp1.user_id = ? AND cp2.user_id = ?
        LIMIT 1
      `, [currentUserId, targetUserId]);

      if (existing.length > 0) {
        return res.json({ conversationId: existing[0].conversation_id });
      }

      // Create new conversation
      const [newConv] = await pool.execute("INSERT INTO conversations DEFAULT VALUES RETURNING id");
      const conversationId = newConv[0].id;

      await pool.execute("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
        [conversationId, currentUserId, conversationId, targetUserId]);

      res.status(201).json({ conversationId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // List user's conversations
  router.get("/messages/conversations", async (req, res) => {
    const currentUserId = req.user.id;
    try {
      const [rows] = await pool.execute(`
        SELECT 
          c.id, 
          c.last_message_at, 
          c.is_disconnected_by_admin,
          u.id as other_user_id,
          u.name as other_user_name,
          u.role as other_user_role,
          u.student_id,
          u.employee_code,
          (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) as unread_count
        FROM conversations c
        JOIN conversation_participants cp1 ON cp1.conversation_id = c.id
        JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
        JOIN users u ON u.id = cp2.user_id
        WHERE cp1.user_id = ? AND cp2.user_id != ?
        ORDER BY c.last_message_at DESC
      `, [currentUserId, currentUserId, currentUserId]);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  // Get messages for a conversation
  router.get("/messages/conversations/:id", async (req, res) => {
    const conversationId = req.params.id;
    const currentUserId = req.user.id;

    try {
      // Security check: is user participant?
      const [participant] = await pool.execute(
        "SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
        [conversationId, currentUserId]
      );
      if (participant.length === 0) return res.status(403).json({ error: "Forbidden" });

      const [messages] = await pool.execute(`
        SELECT m.*, u.name as sender_name 
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE conversation_id = ?
        ORDER BY created_at ASC
      `, [conversationId]);

      // Mark as read
      await pool.execute(
        "UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE",
        [conversationId, currentUserId]
      );

      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  // Send a message
  router.post("/messages/send", async (req, res) => {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;

    try {
      // Check if conversation is disconnected by admin
      const [conv] = await pool.execute("SELECT is_disconnected_by_admin FROM conversations WHERE id = ?", [conversationId]);
      if (conv.length > 0 && conv[0].is_disconnected_by_admin && req.user.role === 'student') {
        return res.status(403).json({ error: "This conversation has been closed by the administrator." });
      }

      const [newMsg] = await pool.execute(
        "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?) RETURNING *",
        [conversationId, senderId, content]
      );

      const message = newMsg[0];

      // Update last_message_at
      await pool.execute("UPDATE conversations SET last_message_at = NOW() WHERE id = ?", [conversationId]);

      // WebSocket: notify participants
      const [participants] = await pool.execute(
        "SELECT user_id FROM conversation_participants WHERE conversation_id = ?",
        [conversationId]
      );

      participants.forEach(p => {
        io.to(`user_${p.user_id}`).emit("new_message", {
          conversationId,
          message
        });
      });

      res.status(201).json(message);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Send failed" });
    }
  });

  // Admin disconnect chat
  router.post("/messages/admin/disconnect", async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { conversationId } = req.body;

    try {
      await pool.execute("UPDATE conversations SET is_disconnected_by_admin = TRUE WHERE id = ?", [conversationId]);
      
      // Notify participants via socket
      const [participants] = await pool.execute(
        "SELECT user_id FROM conversation_participants WHERE conversation_id = ?",
        [conversationId]
      );
      participants.forEach(p => {
        io.to(`user_${p.user_id}`).emit("chat_disconnected", { conversationId });
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Disconnect failed" });
    }
  });

  return router;
};
