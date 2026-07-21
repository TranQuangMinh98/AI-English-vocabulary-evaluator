const express = require('express');

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function createEvaluationRouter(anthropicClient) {
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

      // Create the CEFR evaluation prompt
      const prompt = `You are an expert English language evaluator using CEFR (Common European Framework of Reference for Languages) standards.

Evaluate the following text based on these 4 attributes:
1. Complexity - vocabulary range, sentence structure variety, sophistication
2. Accuracy - grammar, spelling, proper word usage
3. Fluency - cohesion, coherence, natural flow
4. Clarity - how clearly ideas are expressed

For each attribute, provide:
- A CEFR level (A1, A2, B1, B2, C1, or C2)
- Brief descriptive feedback (2-3 sentences)

Also provide an overall CEFR level (the lowest of the 4 attributes) with a brief explanation.

Text to evaluate:
"${text}"

Respond ONLY with valid JSON in this exact format:
{
  "overall": {
    "level": "B1",
    "explanation": "Overall level is determined by the lowest attribute score"
  },
  "attributes": {
    "complexity": {
      "level": "B2",
      "feedback": "Descriptive feedback here"
    },
    "accuracy": {
      "level": "B1",
      "feedback": "Descriptive feedback here"
    },
    "fluency": {
      "level": "B2",
      "feedback": "Descriptive feedback here"
    },
    "clarity": {
      "level": "C1",
      "feedback": "Descriptive feedback here"
    }
  }
}`;

      // Call Claude API
      const message = await anthropicClient.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Parse the response
      let responseText = message.content[0].text;

      // Remove markdown code blocks if present (```json ... ```)
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

      const evaluation = JSON.parse(responseText);

      return res.json(evaluation);

    } catch (error) {
      console.error('Evaluation error:', error);
      return res.status(500).json({
        error: 'Failed to evaluate text. Please try again.'
      });
    }
  });

  return router;
}

module.exports = { createEvaluationRouter, countWords };
