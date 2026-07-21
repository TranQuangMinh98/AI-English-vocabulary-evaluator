const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

function createAudioEvaluationRouter(anthropicClient) {
  const router = express.Router();

  router.post('/evaluate-audio', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      // Convert audio buffer to base64
      const audioBase64 = req.file.buffer.toString('base64');

      // Determine media type
      let mediaType = req.file.mimetype;
      if (!mediaType || mediaType === 'application/octet-stream') {
        // Default to webm if mimetype is not recognized
        mediaType = 'audio/webm';
      }

      // Create the CEFR evaluation prompt for speaking
      const prompt = `You are an expert English language evaluator using CEFR (Common European Framework of Reference for Languages) standards.

Listen to the audio recording and evaluate the speaker's English based on these 4 attributes:
1. Complexity - vocabulary range, sentence structure variety, sophistication of language used
2. Accuracy - grammar correctness, proper word usage, minimal errors
3. Fluency - smoothness of speech, natural pace, coherence, minimal hesitation
4. Pronunciation - clarity of speech sounds, stress patterns, intonation, accent comprehensibility

For each attribute, provide:
- A CEFR level (A1, A2, B1, B2, C1, or C2)
- Brief descriptive feedback (2-3 sentences)

Also provide an overall CEFR level (the lowest of the 4 attributes) with a brief explanation.

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
    "pronunciation": {
      "level": "B1",
      "feedback": "Descriptive feedback here"
    }
  }
}`;

      // Call Claude API with audio
      const message = await anthropicClient.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: audioBase64
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      });

      // Parse the response
      let responseText = message.content[0].text;

      // Remove markdown code blocks if present (```json ... ```)
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

      const evaluation = JSON.parse(responseText);

      return res.json(evaluation);

    } catch (error) {
      console.error('Audio evaluation error:', error);

      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'Audio file is too large. Maximum size is 10MB.'
          });
        }
      }

      return res.status(500).json({
        error: 'Failed to evaluate audio. Please try again.'
      });
    }
  });

  return router;
}

module.exports = { createAudioEvaluationRouter };
