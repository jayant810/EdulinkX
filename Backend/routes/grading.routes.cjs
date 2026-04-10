// grading.routes.cjs
// Local Autograder Routes
// All routes require JWT authentication (applied in server.cjs)

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { gradeSubmissionFile, gradeSubmissionText, parseAnswerKeyUpload } = require("../utils/autograder.cjs");

// POST /api/teacher/ai-grade/text
// Grade a typed short-answer response
router.post("/ai-grade/text", async (req, res) => {
  try {
    const { student_answer, expected_answer, method, question_context } = req.body;

    if (!student_answer || !expected_answer) {
      return res.status(400).json({ error: "student_answer and expected_answer are required" });
    }

    const result = await gradeSubmissionText(
      student_answer,
      expected_answer,
      method || "gemini",
      question_context
    );

    res.json(result);
  } catch (err) {
    console.error("AI text grading error:", err.message);
    res.status(500).json({ error: "AI grading failed", details: err.message });
  }
});

// POST /api/teacher/ai-grade/image
// Grade a handwritten answer image or PDF
router.post("/ai-grade/image", upload.single("file"), async (req, res) => {
  try {
    const { exam_id, question_idx, method, gemini_prompt } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    const result = await gradeSubmissionFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      exam_id || "default",
      question_idx || 0,
      method || "gemini",
      gemini_prompt
    );

    res.json(result);
  } catch (err) {
    console.error("AI file grading error:", err.message);
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

    const result = await parseAnswerKeyUpload(file.buffer, file.originalname, exam_id);
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
        const result = await gradeSubmissionText(
          item.student_answer || "",
          item.expected_answer || "",
          item.method || "gemini",
          item.question_context
        );
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
