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

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL
});

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
