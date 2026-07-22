require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const { createEvaluationRouter } = require('./routes/evaluate');
const { createAudioEvaluationRouter } = require('./routes/evaluate-audio');
const { createSpeakingEvaluationRouter } = require('./routes/evaluate-speaking');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Normalize the base URL: the Anthropic SDK appends "/v1/messages" itself, so a
// configured trailing "/v1" (or trailing slash) would produce "/v1/v1/messages"
// and a 404. Strip it defensively so either form works.
function normalizeBaseUrl(url) {
  if (!url) return undefined;
  return url.trim().replace(/\/+$/, '').replace(/\/v1$/i, '');
}

const baseURL = normalizeBaseUrl(process.env.ANTHROPIC_BASE_URL);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  ...(baseURL ? { baseURL } : {})
});

// Surface config at startup to make deployment misconfig obvious in logs.
console.log('[config] ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING');
console.log('[config] ANTHROPIC_BASE_URL:', baseURL || '(default: api.anthropic.com)');
console.log('[config] ANTHROPIC_MODEL:', process.env.ANTHROPIC_MODEL || '(default)');

// Routes
app.use('/api', createEvaluationRouter(anthropic));
app.use('/api', createAudioEvaluationRouter(anthropic));
app.use('/api', createSpeakingEvaluationRouter(anthropic));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
