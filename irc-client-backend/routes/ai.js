const express = require("express");
const router = express.Router();
const axios = require("axios");

// This endpoint will be hit by your frontend
router.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Call the local Ollama API server[1]
    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt: prompt,
        stream: false, // Set to false to get the full response at once[4]
      }
    );

    res.json({ reply: ollamaResponse.data.response });
  } catch (error) {
    console.error("Error calling Ollama API:", error.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;
