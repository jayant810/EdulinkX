// grading.routes.cjs
// Proxy routes for the Autograder microservice
// All routes require JWT authentication (applied in server.cjs)

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const AUTOGRADER_URL = process.env.AUTOGRADER_URL || "http://localhost:8000";
const AUTOGRADER_SECRET_KEY = process.env.AUTOGRADER_SECRET_KEY || "";

// Helper: forward request to Autograder with API key
async function callAutograder(endpoint, options = {}) {
  const url = `${AUTOGRADER_URL}${endpoint}`;
  const headers = {
    "X-API-Key": AUTOGRADER_SECRET_KEY,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Autograder error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// POST /api/teacher/ai-grade/text
// Grade a typed short-answer response (no image needed)
router.post("/ai-grade/text", async (req, res) => {
  try {
    const { student_answer, expected_answer, method, question_context } = req.body;

    if (!student_answer || !expected_answer) {
      return res.status(400).json({ error: "student_answer and expected_answer are required" });
    }

    // Build form data for the Autograder
    const formData = new URLSearchParams();
    formData.append("student_answer", student_answer);
    formData.append("expected_answer", expected_answer);
    formData.append("method", method || "gemini");
    if (question_context) formData.append("question_context", question_context);

    const result = await callAutograder("/grade-text", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    res.json(result);
  } catch (err) {
    console.error("AI text grading error:", err.message);
    res.status(500).json({ error: "AI grading failed", details: err.message });
  }
});

// POST /api/teacher/ai-grade/image
// Grade a handwritten answer image
router.post("/ai-grade/image", upload.single("file"), async (req, res) => {
  try {
    const { exam_id, question_idx, method, gemini_prompt } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Forward multipart form data to Autograder
    const formData = new FormData();
    formData.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    formData.append("exam_id", exam_id || "default");
    formData.append("question_idx", String(question_idx || 0));
    formData.append("method", method || "gemini");
    if (gemini_prompt) formData.append("gemini_prompt", gemini_prompt);

    const result = await callAutograder("/grade-image", {
      method: "POST",
      body: formData,
    });

    res.json(result);
  } catch (err) {
    console.error("AI image grading error:", err.message);
    res.status(500).json({ error: "AI grading failed", details: err.message });
  }
});

// POST /api/teacher/ai-grade/upload-key
// Upload an answer key PDF for an exam
router.post("/ai-grade/upload-key", upload.single("file"), async (req, res) => {
  try {
    const { exam_id } = req.body;
    const file = req.file;

    if (!file || !exam_id) {
      return res.status(400).json({ error: "PDF file and exam_id are required" });
    }

    const formData = new FormData();
    formData.append("file", new Blob([file.buffer], { type: "application/pdf" }), file.originalname);
    formData.append("exam_id", exam_id);

    const result = await callAutograder("/upload-answer-key", {
      method: "POST",
      body: formData,
    });

    res.json(result);
  } catch (err) {
    console.error("Answer key upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// POST /api/teacher/ai-grade/batch-text
// Grade multiple short-answer questions in one batch
router.post("/ai-grade/batch-text", async (req, res) => {
  try {
    const { answers } = req.body;
    // answers = [{ student_answer, expected_answer, question_context, method }]

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers array is required" });
    }

    const results = [];
    for (const item of answers) {
      try {
        const formData = new URLSearchParams();
        formData.append("student_answer", item.student_answer || "");
        formData.append("expected_answer", item.expected_answer || "");
        formData.append("method", item.method || "gemini");
        if (item.question_context) formData.append("question_context", item.question_context);

        const result = await callAutograder("/grade-text", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });
        results.push({ ...result, question_context: item.question_context, success: true });
      } catch (err) {
        results.push({ error: err.message, question_context: item.question_context, success: false });
      }
    }

    res.json({ results, total: answers.length, graded: results.filter(r => r.success).length });
  } catch (err) {
    console.error("Batch grading error:", err.message);
    res.status(500).json({ error: "Batch grading failed", details: err.message });
  }
});

module.exports = router;
