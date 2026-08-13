const request = require('supertest');
const express = require('express');
const { createConversationRouter } = require('./routes/conversation-turn');

const evaluation = {
  overall: { level: 'A2', explanation: 'You communicate your main idea clearly.' },
  attributes: {
    complexity: { level: 'A2', feedback: 'You use useful words.', tip: 'Add one detail.' },
    accuracy: { level: 'B1', feedback: 'Your grammar is clear.', tip: 'Check verb forms.' },
    fluency: { level: 'A2', feedback: 'Your answer flows well.', tip: 'Use because.' },
    clarity: { level: 'B1', feedback: 'Your meaning is clear.', tip: 'Add an example.' }
  }
};

function appWith(openaiClient) {
  const app = express();
  app.use(express.json());
  app.use('/api', createConversationRouter(openaiClient));
  return app;
}

function modelResponse(body) {
  return {
    responses: {
      create: jest.fn().mockResolvedValue({ output_text: JSON.stringify(body) })
    }
  };
}

describe('POST /api/conversation-turn', () => {
  it('returns an evaluation for a topic-aligned response', async () => {
    const response = await request(appWith(modelResponse({
      aligned: true,
      acknowledgment: 'Nice to meet you, Minh.',
      evaluation
    })))
      .post('/api/conversation-turn')
      .send({ questionId: 'intro-name', response: 'Minh', inputMode: 'text' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      aligned: true,
      acknowledgment: 'Nice to meet you, Minh.',
      evaluation
    });
  });

  it('returns only alignment for an unrelated response', async () => {
    const response = await request(appWith(modelResponse({
      aligned: false,
      acknowledgment: null,
      evaluation: null
    })))
      .post('/api/conversation-turn')
      .send({ questionId: 'intro-origin', response: 'I like football.', inputMode: 'text' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ aligned: false });
  });

  it.each([
    [undefined],
    [{ questionId: 'missing', response: 'Minh', inputMode: 'text' }],
    [{ questionId: 'toString', response: 'Minh', inputMode: 'text' }],
    [{ questionId: 'intro-name', response: ' ', inputMode: 'text' }],
    [{ questionId: 'intro-name', response: 'x'.repeat(2001), inputMode: 'text' }],
    [{ questionId: 'intro-name', response: 'Minh', inputMode: 'audio' }]
  ])('rejects invalid input without calling the model', async (body) => {
    const client = modelResponse({ aligned: false, acknowledgment: null, evaluation: null });
    const response = await request(appWith(client)).post('/api/conversation-turn').send(body);

    expect(response.status).toBe(400);
    expect(client.responses.create).not.toHaveBeenCalled();
  });

  it('returns 503 when OpenAI is not configured', async () => {
    const response = await request(appWith(null))
      .post('/api/conversation-turn')
      .send({ questionId: 'intro-name', response: 'Minh', inputMode: 'text' });

    expect(response.status).toBe(503);
  });

  it('returns 502 when model output is incomplete', async () => {
    const response = await request(appWith(modelResponse({
      aligned: true,
      acknowledgment: '',
      evaluation
    })))
      .post('/api/conversation-turn')
      .send({ questionId: 'intro-name', response: 'Minh', inputMode: 'text' });

    expect(response.status).toBe(502);
  });

  it('returns 502 when overall level is not the lowest attribute level', async () => {
    const invalidEvaluation = {
      ...evaluation,
      overall: { ...evaluation.overall, level: 'C2' }
    };
    const response = await request(appWith(modelResponse({
      aligned: true,
      acknowledgment: 'Nice to meet you, Minh.',
      evaluation: invalidEvaluation
    })))
      .post('/api/conversation-turn')
      .send({ questionId: 'intro-name', response: 'Minh', inputMode: 'text' });

    expect(response.status).toBe(502);
  });
});
