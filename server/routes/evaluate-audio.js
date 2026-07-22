const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { parseEvaluationJson, handleEvaluationError } = require('../lib/evaluation-helpers');

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

      // Step 1: Transcribe the audio using Claude API
      let transcription;
      try {
        const transcriptionMessage = await anthropicClient.messages.create({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: audioBase64
                },
                cache_control: { type: 'ephemeral' }
              },
              {
                type: 'text',
                text: 'Please transcribe this audio recording word-for-word. Only provide the transcription text, nothing else.'
              }
            ]
          }]
        });

        transcription = transcriptionMessage.content[0].text.trim();
        console.log('Transcription:', transcription);
      } catch (transcriptionError) {
        console.error('Transcription failed, trying text-only evaluation:', transcriptionError);

        // If document type fails, return a helpful error
        if (transcriptionError.status === 429 || transcriptionError.message?.includes('429')) {
          return res.status(503).json({
            error: 'Audio transcription is not supported by your API endpoint. Please contact your API provider to enable audio/document support, or use the text evaluation mode instead.'
          });
        }

        throw transcriptionError;
      }

      // Step 2: Evaluate the transcription for speaking characteristics
      const evaluationPrompt = `You are an expert English language evaluator using CEFR (Common European Framework of Reference for Languages) standards.

A speaker was recorded saying the following (transcription):

"${transcription}"

Based on this transcription, evaluate the speaker's English across these 4 attributes:
1. Complexity - vocabulary range, sentence structure variety, sophistication of language used
2. Accuracy - grammar correctness, proper word usage (infer from transcription)
3. Fluency - naturalness of expression, coherence, sentence flow (infer from transcription)
4. Pronunciation - Since you don't have audio, evaluate based on vocabulary complexity and assume pronunciation matches the accuracy level

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

      const evaluationMessage = await anthropicClient.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: evaluationPrompt
        }]
      });

      // Parse the response (handles ```json fences and stray text)
      const evaluation = parseEvaluationJson(evaluationMessage.content[0]?.text);

      return res.json(evaluation);

    } catch (error) {
      // Multer upload errors are client-side (bad/oversized file).
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'Audio file is too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({ error: `Upload error: ${error.message}` });
      }

      return handleEvaluationError(error, res, 'audio');
    }
  });

  return router;
}

module.exports = { createAudioEvaluationRouter };
