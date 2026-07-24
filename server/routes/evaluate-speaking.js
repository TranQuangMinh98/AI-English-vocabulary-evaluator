const express = require('express');
const { parseEvaluationJson, handleEvaluationError } = require('../lib/evaluation-helpers');

function createSpeakingEvaluationRouter(anthropicClient) {
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

      // Create the CEFR evaluation prompt for speaking
      const prompt = `You are a warm, encouraging English speaking coach using CEFR (Common European Framework of Reference for Languages) standards.

A speaker was recorded and their speech was transcribed as follows:

"${trimmedTranscript}"

Based on this transcription, evaluate the speaker's English across these 4 attributes:
1. Complexity - vocabulary range, sentence structure variety, sophistication of language used
2. Accuracy - grammar correctness, proper word usage, minimal errors
3. Fluency - naturalness of expression, coherence, sentence flow, logical connections
4. Pronunciation - Since this is a transcript, evaluate based on the speaker's word choice and assume pronunciation quality matches their vocabulary sophistication level

For each attribute, provide:
- A CEFR level (A1, A2, B1, B2, C1, or C2)
- "feedback": Encouraging feedback (2-3 sentences) spoken DIRECTLY to the speaker using "you" and "your". Always start by recognizing a genuine strength, then frame any weakness as an opportunity in a positive, motivating way. Keep the tone friendly and supportive.
- "tip": One actionable "Tip to improve" (2-3 sentences) spoken directly to the speaker. Give a concrete technique AND useful example vocabulary, connectors, or phrases they can immediately use to reach the next level. Be specific and practical.

Also provide an overall CEFR level (the lowest of the 4 attributes) with an encouraging explanation addressed directly to the speaker.

Respond ONLY with valid JSON in this exact format:
{
  "overall": {
    "level": "B1",
    "explanation": "Encouraging summary spoken directly to the speaker"
  },
  "attributes": {
    "complexity": {
      "level": "B2",
      "feedback": "Positive, direct feedback here",
      "tip": "Actionable tip with example vocabulary or phrases here"
    },
    "accuracy": {
      "level": "B1",
      "feedback": "Positive, direct feedback here",
      "tip": "Actionable tip with example vocabulary or phrases here"
    },
    "fluency": {
      "level": "B2",
      "feedback": "Positive, direct feedback here",
      "tip": "Actionable tip with example vocabulary or phrases here"
    },
    "pronunciation": {
      "level": "B1",
      "feedback": "Positive, direct feedback here",
      "tip": "Actionable tip with example vocabulary or phrases here"
    }
  }
}`;

      // Call Claude API
      const message = await anthropicClient.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Parse the response (handles ```json fences and stray text)
      const evaluation = parseEvaluationJson(message.content[0]?.text);

      return res.json(evaluation);

    } catch (error) {
      return handleEvaluationError(error, res, 'speaking');
    }
  });

  return router;
}

module.exports = { createSpeakingEvaluationRouter };
