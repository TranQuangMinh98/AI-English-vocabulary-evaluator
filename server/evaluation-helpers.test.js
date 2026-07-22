const { parseEvaluationJson, handleEvaluationError } = require('./lib/evaluation-helpers');

describe('parseEvaluationJson', () => {
  it('parses plain JSON', () => {
    expect(parseEvaluationJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips ```json fences', () => {
    const input = '```json\n{"level":"B1"}\n```';
    expect(parseEvaluationJson(input)).toEqual({ level: 'B1' });
  });

  it('strips bare ``` fences', () => {
    expect(parseEvaluationJson('```\n{"x":true}\n```')).toEqual({ x: true });
  });

  it('extracts JSON when surrounded by prose', () => {
    const input = 'Here is your result:\n{"score":5}\nHope that helps!';
    expect(parseEvaluationJson(input)).toEqual({ score: 5 });
  });

  it('throws a SyntaxError with rawResponse on garbage', () => {
    expect.assertions(2);
    try {
      parseEvaluationJson('not json at all');
    } catch (err) {
      expect(err).toBeInstanceOf(SyntaxError);
      expect(err.rawResponse).toBe('not json at all');
    }
  });

  it('throws when text is missing', () => {
    expect(() => parseEvaluationJson(undefined)).toThrow(SyntaxError);
  });
});

describe('handleEvaluationError', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  let originalEnv;
  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.error.mockRestore();
  });

  it('maps SyntaxError to 502', () => {
    const res = mockRes();
    handleEvaluationError(new SyntaxError('bad'), res, 'text');
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('maps 429 to 429', () => {
    const res = mockRes();
    const err = new Error('rate limit');
    err.status = 429;
    handleEvaluationError(err, res, 'text');
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('maps 401 to 502', () => {
    const res = mockRes();
    const err = new Error('unauthorized');
    err.status = 401;
    handleEvaluationError(err, res, 'text');
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('maps upstream 5xx to 502', () => {
    const res = mockRes();
    const err = new Error('upstream down');
    err.status = 503;
    handleEvaluationError(err, res, 'audio');
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('maps unknown errors to 500', () => {
    const res = mockRes();
    handleEvaluationError(new Error('mystery'), res, 'speaking');
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('includes details outside production', () => {
    const res = mockRes();
    handleEvaluationError(new Error('leaky detail'), res, 'text');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ details: 'leaky detail' })
    );
  });

  it('omits details in production', () => {
    process.env.NODE_ENV = 'production';
    const res = mockRes();
    handleEvaluationError(new Error('leaky detail'), res, 'text');
    const body = res.json.mock.calls[0][0];
    expect(body.details).toBeUndefined();
    expect(body.error).toBeDefined();
  });
});
