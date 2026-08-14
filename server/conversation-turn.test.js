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
  it('returns alignment and acknowledgment without evaluating an aligned response', async () => {
    const client = modelResponse({
      aligned: true,
      acknowledgment: 'Nice to meet you, Minh.'
    });
    const response = await request(appWith(client))
      .post('/api/conversation-turn')
      .send({ questionId: 'intro-name', response: 'Minh', inputMode: 'text' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      aligned: true,
      acknowledgment: 'Nice to meet you, Minh.'
    });
    expect(client.responses.create.mock.calls[0][0].text.format.schema.properties).not.toHaveProperty('evaluation');
  });

  it('returns only alignment for an unrelated response', async () => {
    const response = await request(appWith(modelResponse({
      aligned: false,
      acknowledgment: null
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
    [{ questionId: '__proto__', response: 'Minh', inputMode: 'text' }],
    [{ questionId: 'intro-name', response: ' ', inputMode: 'text' }],
    [{ questionId: 'intro-name', response: 'x'.repeat(2001), inputMode: 'text' }],
    [{ questionId: 'intro-name', response: 'Minh', inputMode: 'audio' }]
  ])('rejects invalid input without calling the model', async (body) => {
    const client = modelResponse({ aligned: false, acknowledgment: null });
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
      acknowledgment: ''
    })))
      .post('/api/conversation-turn')
      .send({ questionId: 'intro-name', response: 'Minh', inputMode: 'text' });

    expect(response.status).toBe(502);
  });

});

describe('POST /api/conversation-feedback', () => {
  const conversation = [
    { questionId: 'intro-name', response: 'Minh', inputMode: 'text' },
    { questionId: 'intro-origin', response: 'I am from Vietnam.', inputMode: 'voice' }
  ];

  it('returns one evaluation for the complete conversation', async () => {
    const client = modelResponse(evaluation);
    const response = await request(appWith(client))
      .post('/api/conversation-feedback')
      .send({ responses: conversation });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ evaluation });
    const prompt = client.responses.create.mock.calls[0][0].input.find(message => message.role === 'user').content;
    expect(prompt).toContain('Learner response: Minh');
    expect(prompt).toContain('Learner response: I am from Vietnam.');
  });

  it.each([
    [undefined],
    [{ responses: [] }],
    [{ responses: [{ questionId: 'missing', response: 'Minh', inputMode: 'text' }] }],
    [{ responses: [{ questionId: 'intro-name', response: ' ', inputMode: 'text' }] }],
    [{ responses: [{ questionId: 'intro-name', response: 'x'.repeat(2001), inputMode: 'text' }] }],
    [{ responses: [{ questionId: 'intro-name', response: 'Minh', inputMode: 'audio' }] }]
  ])('rejects invalid conversation without calling the model', async (body) => {
    const client = modelResponse(evaluation);
    const response = await request(appWith(client)).post('/api/conversation-feedback').send(body);

    expect(response.status).toBe(400);
    expect(client.responses.create).not.toHaveBeenCalled();
  });

  it('returns 503 when OpenAI is not configured', async () => {
    const response = await request(appWith(null))
      .post('/api/conversation-feedback')
      .send({ responses: conversation });

    expect(response.status).toBe(503);
  });

  it('returns 502 when overall level is not the lowest attribute level', async () => {
    const invalidEvaluation = {
      ...evaluation,
      overall: { ...evaluation.overall, level: 'C2' }
    };
    const response = await request(appWith(modelResponse(invalidEvaluation)))
      .post('/api/conversation-feedback')
      .send({ responses: conversation });

    expect(response.status).toBe(502);
  });
});
