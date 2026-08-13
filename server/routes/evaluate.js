const express = require('express');
const { handleEvaluationError } = require('../lib/evaluation-helpers');
const { evaluateWithOpenAI } = require('../lib/openai-evaluation');

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function createEvaluationRouter(openai) {
  const router = express.Router();

  router.post('/evaluate', async (req, res) => {
    try {
      const { text } = req.body;

      // Validate text presence
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
      }

      // Count words
      const wordCount = countWords(text);

      // Validate word count
      if (wordCount < 100) {
        return res.status(400).json({
          error: 'Text must be at least 100 words. Current: ' + wordCount
        });
      }

      if (wordCount > 1000) {
        return res.status(400).json({
          error: 'Text must not exceed 1000 words. Current: ' + wordCount
        });
      }

      if (!openai) {
        return res.status(503).json({ error: 'OpenAI is not configured' });
      }

      return res.json(await evaluateWithOpenAI(openai, text, 'text'));

    } catch (error) {
      return handleEvaluationError(error, res, 'text');
    }
  });

  return router;
}

module.exports = { createEvaluationRouter, countWords };
