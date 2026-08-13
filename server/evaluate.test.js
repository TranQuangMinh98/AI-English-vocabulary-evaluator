const request = require('supertest');
const express = require('express');
const { createEvaluationRouter } = require('./routes/evaluate');

describe('CEFR Evaluation API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('POST /api/evaluate', () => {
    it('should return 400 if text is missing', async () => {
      const mockAnthropicClient = {};
      app.use('/api', createEvaluationRouter(mockAnthropicClient));

      const response = await request(app)
        .post('/api/evaluate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if text is too short (< 100 words)', async () => {
      const mockAnthropicClient = {};
      app.use('/api', createEvaluationRouter(mockAnthropicClient));

      const response = await request(app)
        .post('/api/evaluate')
        .send({ text: 'This is too short.' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('100 words');
    });

    it('should return 400 if text is too long (> 1000 words)', async () => {
      const mockAnthropicClient = {};
      app.use('/api', createEvaluationRouter(mockAnthropicClient));

      const longText = 'word '.repeat(1001);
      const response = await request(app)
        .post('/api/evaluate')
        .send({ text: longText });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('1000 words');
    });

    it('should return CEFR evaluation with all attributes', async () => {
      const mockResponse = {
        overall: {
          level: 'B1',
          explanation: 'Overall level is B1 (lowest of all attributes)'
        },
        attributes: {
          complexity: {
            level: 'B2',
            feedback: 'Good range of vocabulary and sentence structures',
            tip: 'Add a precise example.'
          },
          accuracy: {
            level: 'B1',
            feedback: 'Some grammatical errors present',
            tip: 'Check each verb form.'
          },
          fluency: {
            level: 'B2',
            feedback: 'Text flows well with good cohesion',
            tip: 'Use another connector.'
          },
          clarity: {
            level: 'C1',
            feedback: 'Ideas are expressed very clearly',
            tip: 'Add one supporting detail.'
          }
        }
      };

      const mockOpenAIClient = {
        responses: {
          create: jest.fn().mockResolvedValue({
            output_text: JSON.stringify(mockResponse)
          })
        }
      };

      app.use('/api', createEvaluationRouter(mockOpenAIClient));

      const validText = 'word '.repeat(150);
      const response = await request(app)
        .post('/api/evaluate')
        .send({ text: validText });

      expect(response.status).toBe(200);
      expect(response.body.overall).toBeDefined();
      expect(response.body.overall.level).toBe('B1');
      expect(response.body.attributes).toBeDefined();
      expect(response.body.attributes.complexity).toBeDefined();
      expect(response.body.attributes.accuracy).toBeDefined();
      expect(response.body.attributes.fluency).toBeDefined();
      expect(response.body.attributes.clarity).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      const mockOpenAIClient = {
        responses: {
          create: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      };

      app.use('/api', createEvaluationRouter(mockOpenAIClient));

      const validText = 'word '.repeat(150);
      const response = await request(app)
        .post('/api/evaluate')
        .send({ text: validText });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });
});
