const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBmvOCu_n0ytqPrkKHu9b7ME0BO0Ou3-7E");

function getModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
}

async function generateSummary(title, subTitle) {
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-pro"
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Attempting summary with model: ${modelName}`);
      const model = getModel(modelName);
      const prompt = `Generate a concise, professional educational summary for a lecture titled "${title}" with description: "${subTitle || 'No description provided'}". Keep it under 100 words. Focus on core learning objectives.`;
      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      return summary;
    } catch (err) {
      console.warn(`[AI] Model ${modelName} failed:`, err.message);
      if (err.message.includes("401") || err.message.includes("API key")) break;
      continue; 
    }
  }
  return `This lecture on "${title}" covers key concepts and learning objectives. ${subTitle ? subTitle : 'It provides an in-depth exploration of the subject matter.'}`;
}

router.post("/summarize", async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const summary = await generateSummary(title, description);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: "AI summary failed" });
  }
});

module.exports = router;
