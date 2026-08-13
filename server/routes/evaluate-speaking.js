const express = require('express');
const { handleEvaluationError } = require('../lib/evaluation-helpers');
const { evaluateWithOpenAI } = require('../lib/openai-evaluation');

function createSpeakingEvaluationRouter(openai) {
  const router = express.Router();

  router.post('/evaluate-speaking', async (req, res) => {
    try {
      const { transcript } = req.body;

      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ error: 'Transcript is required' });
      }

      const trimmedTranscript = transcript.trim();

      if (trimmedTranscript.length < 10) {
        return res.status(400).json({
          error: 'Transcript is too short. Please speak for at least a few seconds.'
        });
      }

      if (!openai) {
        return res.status(503).json({ error: 'OpenAI is not configured' });
      }

      return res.json(await evaluateWithOpenAI(openai, trimmedTranscript, 'voice'));

    } catch (error) {
      return handleEvaluationError(error, res, 'speaking');
    }
  });

  return router;
}

module.exports = { createSpeakingEvaluationRouter };
