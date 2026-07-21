require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL
});

const testText = 'Today I woke up early and had breakfast. The weather was nice. I went for a walk in the park. I met a friend and we talked. In the afternoon I worked on projects at home. I practiced guitar for an hour. For dinner I cooked pasta. After dinner I watched a movie. Before bed I read a book. It was a great day.';

async function testClaudeAPI() {
  console.log('Testing Claude API...');
  console.log('Base URL:', process.env.ANTHROPIC_BASE_URL);
  console.log('Model:', process.env.ANTHROPIC_MODEL);
  console.log('API Key:', process.env.ANTHROPIC_API_KEY ? 'Set (length: ' + process.env.ANTHROPIC_API_KEY.length + ')' : 'NOT SET');

  try {
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
"${testText}"

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

    console.log('\nSending request to Claude API...');

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    console.log('\n✅ API call successful!');
    console.log('Response:', JSON.stringify(message, null, 2));

    let responseText = message.content[0].text;
    console.log('\nResponse text:', responseText);

    // Remove markdown code blocks if present (```json ... ```)
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    console.log('\nCleaned response text:', responseText);

    const evaluation = JSON.parse(responseText);
    console.log('\n✅ JSON parsed successfully!');
    console.log('Overall level:', evaluation.overall.level);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testClaudeAPI();
