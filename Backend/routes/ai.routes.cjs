const express = require("express");
const router = express.Router();
const { pool } = require("../db.cjs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBmvOCu_n0ytqPrkKHu9b7ME0BO0Ou3-7E");

function getModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
}

// 1. Get previous AI queries for a course
router.get("/:courseId/ai-queries", async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM course_ai_queries WHERE course_id = ? AND student_user_id = ? ORDER BY created_at DESC",
      [courseId, studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("[AI Queries GET] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Ask Gemini about the course
router.post("/:courseId/ask", async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: "Question is required" });

  try {
    // 1. Verify enrollment
    const [[enrolled]] = await pool.execute(
      "SELECT id FROM course_students WHERE course_id = ? AND student_user_id = ?",
      [courseId, studentId]
    );
    if (!enrolled) return res.status(403).json({ error: "Not enrolled in this course" });

    // 2. Fetch course and lecture context (summaries)
    const [lectures] = await pool.execute(
      "SELECT title, ai_summary FROM course_lectures WHERE course_id = ? AND ai_summary IS NOT NULL",
      [courseId]
    );

    const [[course]] = await pool.execute(
      "SELECT course_name, course_description FROM courses WHERE id = ?",
      [courseId]
    );

    let context = `Course Name: ${course.course_name}\nCourse Description: ${course.course_description}\n\n`;
    context += "Lectures and their summaries:\n";
    lectures.forEach(l => {
      context += `- ${l.title}: ${l.ai_summary}\n`;
    });

    // 3. Prompt Gemini
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
    let answer = "";

    for (const modelName of modelsToTry) {
      try {
        const model = getModel(modelName);
        const prompt = `You are an AI teaching assistant for the course: "${course.course_name}".
        
        CONTEXT FROM THE COURSE:
        ${context}
        
        STUDENT QUESTION:
        "${question}"
        
        INSTRUCTIONS:
        1. Use the provided context to answer the student's question accurately.
        2. If the question is NOT related to the course content provided in the context, politely inform the student that you can only answer questions related to this course.
        3. Be encouraging and helpful.
        4. If the context doesn't have enough specific detail to answer a deep technical question, answer based on general knowledge BUT keep it relevant to the course themes.
        5. Keep the answer concise (under 200 words unless detail is necessary).`;

        const result = await model.generateContent(prompt);
        answer = result.response.text();
        break;
      } catch (err) {
        console.warn(`[AI Ask] Model ${modelName} failed:`, err.message);
        continue;
      }
    }

    if (!answer) throw new Error("AI failed to generate a response");

    // 4. Store query
    const { rows } = await pool.query(
      "INSERT INTO course_ai_queries (course_id, student_user_id, question, answer) VALUES ($1, $2, $3, $4) RETURNING *",
      [courseId, studentId, question, answer]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("[AI Ask] Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
