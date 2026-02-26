const express = require("express");
const router = express.Router();
const pool = require("../db.cjs");
const { v4: uuidv4 } = require("uuid");

// Middleware to verify token is already applied in server.cjs
// but we'll assume req.user is available.

module.exports = function(io) {

  // Get all questions
  router.get("/community/questions", async (req, res) => {
    try {
      const [questions] = await pool.execute(`
        SELECT q.*, u.name as author_name,
        (SELECT COUNT(*) FROM community_answers WHERE question_id = q.id) as answersCount
        FROM community_questions q
        JOIN users u ON u.id = q.author_id
        ORDER BY q.created_at DESC
      `);
      res.json(questions);
    } catch (err) {
      console.error(err);
      if (err.code === 'ER_NO_SUCH_TABLE') {
        res.status(500).json({ error: "Community tables missing. Please run Backend/student-master-schema.sql" });
      } else {
        res.status(500).json({ error: "Server error" });
      }
    }
  });

  // Create a question
  router.post("/community/questions", async (req, res) => {
    const { title, body, tags } = req.body;
    const author_id = req.user.id;
    const id = uuidv4();
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    try {
      await pool.execute(
        "INSERT INTO community_questions (id, slug, title, body, tags, author_id) VALUES (?, ?, ?, ?, ?, ?)",
        [id, slug, title, body, JSON.stringify(tags), author_id]
      );

      const [newQuestion] = await pool.execute(
        "SELECT q.*, u.name as author_name FROM community_questions q JOIN users u ON u.id = q.author_id WHERE q.id = ?",
        [id]
      );

      // Notify all clients via WebSocket
      io.emit("new_question", newQuestion[0]);

      res.status(201).json(newQuestion[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get question by slug
  router.get("/community/questions/:slug", async (req, res) => {
    try {
      const [questions] = await pool.execute(
        "SELECT q.*, u.name as author_name FROM community_questions q JOIN users u ON u.id = q.author_id WHERE q.slug = ?",
        [req.params.slug]
      );

      if (questions.length === 0) return res.status(404).json({ error: "Not found" });

      const question = questions[0];
      const [answers] = await pool.execute(
        "SELECT a.*, u.name as author_name FROM community_answers a JOIN users u ON u.id = a.author_id WHERE a.question_id = ? ORDER BY a.created_at ASC",
        [question.id]
      );

      res.json({ ...question, answers });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Like/Unlike question
  router.post("/community/questions/:id/like", async (req, res) => {
    try {
      const question_id = req.params.id;
      // In a real app, you'd track who liked what. 
      // For now, we'll just increment the count.
      await pool.execute("UPDATE community_questions SET likes = likes + 1 WHERE id = ?", [question_id]);
      
      const [rows] = await pool.execute("SELECT likes FROM community_questions WHERE id = ?", [question_id]);
      const newLikes = rows[0].likes;

      io.emit(`question_liked_${question_id}`, { likes: newLikes });
      res.json({ likes: newLikes });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Increment views
  router.post("/community/questions/:id/view", async (req, res) => {
    try {
      const question_id = req.params.id;
      await pool.execute("UPDATE community_questions SET views = views + 1 WHERE id = ?", [question_id]);
      
      const [rows] = await pool.execute("SELECT views FROM community_questions WHERE id = ?", [question_id]);
      const newViews = rows[0].views;

      io.emit(`question_viewed_${question_id}`, { views: newViews });
      res.json({ views: newViews });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Add answer
  router.post("/community/questions/:id/answers", async (req, res) => {
    const { body } = req.body;
    const author_id = req.user.id;
    const question_id = req.params.id;
    const id = uuidv4();

    try {
      await pool.execute(
        "INSERT INTO community_answers (id, question_id, author_id, body) VALUES (?, ?, ?, ?)",
        [id, question_id, author_id, body]
      );

      const [newAnswer] = await pool.execute(
        "SELECT a.*, u.name as author_name FROM community_answers a JOIN users u ON u.id = a.author_id WHERE a.id = ?",
        [id]
      );

      // Notify clients watching this question
      io.emit(`new_answer_${question_id}`, newAnswer[0]);

      res.status(201).json(newAnswer[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
};
