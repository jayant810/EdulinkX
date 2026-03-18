const fs = require('fs');

const AUTOGRADER_URL = process.env.AUTOGRADER_URL || "http://localhost:8000";
const AUTOGRADER_SECRET_KEY = process.env.AUTOGRADER_SECRET_KEY || "";

/**
 * Wrapper for calling the Autograder Microservice
 */
async function callAutograder(endpoint, options = {}) {
  const url = `${AUTOGRADER_URL}${endpoint}`;
  const headers = {
    "X-API-Key": AUTOGRADER_SECRET_KEY,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch {
      errorText = "Unknown formatting error";
    }
    throw new Error(`Autograder error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Grades an image or file using the Autograder Microservice
 * @param {Buffer|Blob|File} fileBuffer - The file content
 * @param {string} fileName - Original filename
 * @param {string} mimeType - e.g. 'image/jpeg' or 'application/pdf'
 * @param {string} examId - ID of the exam/assignment in the answer keys
 * @param {number} questionIdx - Index of question in answer key (default: 0)
 * @param {string} method - 'similarity' or 'gemini'
 * @param {string} prompt - Optional context prompt
 * @returns {Promise<Object>} The grading result (score, feedback)
 */
async function gradeSubmissionFile(fileBuffer, fileName, mimeType, examId, questionIdx = 0, method = "gemini", prompt = null, answerKeyUrl = null) {
  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer], { type: mimeType }), fileName);
  formData.append("exam_id", String(examId));
  formData.append("question_idx", String(questionIdx));
  formData.append("method", method);
  
  if (prompt) {
    formData.append("gemini_prompt", prompt);
  }
  if (answerKeyUrl) {
    formData.append("answer_key_url", answerKeyUrl);
  }

  return callAutograder("/grade-image", {
    method: "POST",
    body: formData,
  });
}

/**
 * Grades a text string using the Autograder Microservice
 */
async function gradeSubmissionText(studentAnswer, expectedAnswer, method = "gemini", questionContext = null) {
  const formData = new URLSearchParams();
  formData.append("student_answer", studentAnswer);
  formData.append("expected_answer", expectedAnswer);
  formData.append("method", method);
  
  if (questionContext) {
    formData.append("question_context", questionContext);
  }

  return callAutograder("/grade-text", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
}

/**
 * Tells the Autograder to fetch and parse the uploaded Answer Key
 */
async function parseAnswerKeyUpload(fileBuffer, fileName, examId) {
  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer], { type: "application/pdf" }), fileName);
  formData.append("exam_id", String(examId));

  return callAutograder("/upload-answer-key", {
    method: "POST",
    body: formData,
  });
}

module.exports = {
  callAutograder,
  gradeSubmissionFile,
  gradeSubmissionText,
  parseAnswerKeyUpload
};
