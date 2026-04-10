const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts text from various file types (PDF, XLSX, TXT)
 */
async function extractTextFromFile(buffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let text = '';
      workbook.SheetNames.forEach(sheetName => {
        text += xlsx.utils.sheet_to_txt(workbook.Sheets[sheetName]) + '\n';
      });
      return text;
    } else {
      // Assume text/plain or similar
      return buffer.toString('utf-8');
    }
  } catch (err) {
    console.error('[Autograder] Text extraction failed:', err.message);
    return '';
  }
}

/**
 * Calculates a simple similarity score between two strings (fallback)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (s1 === s2) return 100;
  
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  
  return Math.round((intersection.size / Math.max(words1.size, words2.size)) * 100);
}

/**
 * Local implementation of AI Grading using Gemini
 */
async function gradeWithGemini(studentText, expectedText, contextPrompt, questionText = '') {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an expert academic evaluator. Grade the following student's answer based on the expected answer and context provided.
      
      Question: ${questionText}
      Expected Answer/Key: ${expectedText}
      Student's Answer: ${studentText}
      Additional Instructions: ${contextPrompt || 'Provide a fair score and constructive feedback.'}
      
      Respond ONLY in JSON format:
      {
        "score": (number between 0 and 100),
        "feedback": "Concise feedback explanation",
        "raw": "Any additional internal notes"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response if model wraps it in markdown
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Autograder] Gemini grading failed:', err.message);
    return {
      score: calculateSimilarity(studentText, expectedText),
      feedback: "AI Grading temporarily unavailable. Similarity-based score applied.",
      raw: err.message
    };
  }
}

/**
 * Ported: Grades a file submission locally
 */
async function gradeSubmissionFile(fileBuffer, fileName, mimeType, examId, questionIdx = 0, method = "gemini", prompt = null, answerKeyUrl = null) {
  console.log(`[Autograder] Locally grading file: ${fileName} (${mimeType})`);
  
  const studentText = await extractTextFromFile(fileBuffer, mimeType);
  if (!studentText) {
    return { grading_result: { score: 0, feedback: "Could not extract text from file." } };
  }

  let expectedText = "No answer key provided.";
  if (answerKeyUrl) {
    try {
      // In a real local setup, we'd fetch or read the answerKeyUrl
      // For now, we'll try to fetch if it's a URL or log the placeholder
      console.log(`[Autograder] Would fetch answer key from: ${answerKeyUrl}`);
      // Fallback: If it's a Cloudinary URL, we can actually fetch it
      if (answerKeyUrl.startsWith('http')) {
        const res = await fetch(answerKeyUrl);
        const akBuffer = await res.arrayBuffer();
        expectedText = await extractTextFromFile(Buffer.from(akBuffer), 'application/pdf');
      }
    } catch (e) {
      console.warn('[Autograder] Failed to fetch answer key:', e.message);
    }
  }

  if (method === 'similarity') {
    const score = calculateSimilarity(studentText, expectedText);
    return {
      final_marks: score,
      similarity_score: score,
      passed: score > 40
    };
  }

  const result = await gradeWithGemini(studentText, expectedText, prompt);
  return { grading_result: result };
}

/**
 * Ported: Grades a text submission locally
 */
async function gradeSubmissionText(studentAnswer, expectedAnswer, method = "gemini", questionContext = null) {
  console.log('[Autograder] Locally grading text submission');
  
  if (method === 'similarity') {
    const score = calculateSimilarity(studentAnswer, expectedAnswer);
    return {
      passed: score > 40,
      similarity_score: score
    };
  }

  const result = await gradeWithGemini(studentAnswer, expectedAnswer, null, questionContext);
  return { grading_result: result };
}

/**
 * Ported: Parses Answer Key (Placeholder for local storage logic)
 */
async function parseAnswerKeyUpload(fileBuffer, fileName, examId) {
  console.log(`[Autograder] Locally parsing answer key: ${fileName} for Exam ${examId}`);
  // In a full implementation, we might store the parsed text in the DB for later use
  const text = await extractTextFromFile(fileBuffer, 'application/pdf');
  return { success: true, text_preview: text.substring(0, 100) };
}

module.exports = {
  gradeSubmissionFile,
  gradeSubmissionText,
  parseAnswerKeyUpload
};
