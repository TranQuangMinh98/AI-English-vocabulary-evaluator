const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('=== Environment Check ===');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'SET (length: ' + process.env.ANTHROPIC_API_KEY.length + ')' : 'NOT SET');
console.log('ANTHROPIC_BASE_URL:', process.env.ANTHROPIC_BASE_URL);
console.log('ANTHROPIC_MODEL:', process.env.ANTHROPIC_MODEL);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL
});

app.post('/api/evaluate', async (req, res) => {
  console.log('\n=== New Evaluation Request ===');
  const { text } = req.body;

  if (!text) {
    console.log('ERROR: No text provided');
    return res.status(400).json({ error: 'Text is required' });
  }

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  console.log('Word count:', wordCount);

  if (wordCount < 100) {
    console.log('ERROR: Too few words');
    return res.status(400).json({ error: 'Text must be at least 100 words. Current: ' + wordCount });
  }

  if (wordCount > 1000) {
    console.log('ERROR: Too many words');
    return res.status(400).json({ error: 'Text must not exceed 1000 words. Current: ' + wordCount });
  }

  try {
    console.log('Calling Claude API...');

    const prompt = `You are an expert English language evaluator using CEFR standards.

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

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    console.log('API call successful!');

    let responseText = message.content[0].text;
    console.log('Raw response length:', responseText.length);
    console.log('Raw response preview:', responseText.substring(0, 100));

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    console.log('Cleaned response length:', responseText.length);

    const evaluation = JSON.parse(responseText);
    console.log('JSON parsed successfully!');
    console.log('Overall level:', evaluation.overall.level);

    return res.json(evaluation);

  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    return res.status(500).json({
      error: 'Failed to evaluate text. Please try again.'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Ready to accept requests...\n');
});
