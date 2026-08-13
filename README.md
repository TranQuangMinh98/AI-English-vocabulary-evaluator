# English Conversation Coach

A small React and Express demo for guided English conversation with CEFR feedback.

## Demo

Conversation follows six fixed questions:

1. What is your name?
2. Where are you from?
3. What do you do?
4. What is your favorite hobby?
5. Why do you enjoy it?
6. How often do you do it?

Learners can type or use browser speech recognition. Each topic-aligned response receives four-attribute CEFR feedback. An unrelated response redirects once; a second consecutive unrelated response skips to the next question. Browser refresh and **Start Again** clear all history.

## Setup

Requires Node.js 18+ and npm.

```bash
npm run install:all
```

Copy `server/.env.example` to `server/.env`, then set `OPENAI_API_KEY`. `OPENAI_MODEL` defaults to `gpt-5-nano`.

`ANTHROPIC_API_KEY` remains optional and is used only by dormant `POST /api/evaluate-audio`. Without it, that route returns `503` while the server and Conversation continue normally.

Client configuration is optional. Copy `client/.env.example` to `client/.env` only when the API runs on another origin.

## Run

Start server and client in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`.

## Verify

```bash
npm run test:server
cd client && npm run lint && npm run build
```

## API

### `POST /api/conversation-turn`

```json
{
  "questionId": "intro-name",
  "response": "My name is Minh.",
  "inputMode": "text"
}
```

`inputMode` accepts `text` or `voice`. `response` is trimmed and must contain 1–2,000 characters.

Aligned response:

```json
{
  "aligned": true,
  "acknowledgment": "Nice to meet you, Minh.",
  "evaluation": {
    "overall": { "level": "A2", "explanation": "..." },
    "attributes": {
      "complexity": { "level": "A2", "feedback": "...", "tip": "..." },
      "accuracy": { "level": "A2", "feedback": "...", "tip": "..." },
      "fluency": { "level": "A2", "feedback": "...", "tip": "..." },
      "clarity": { "level": "A2", "feedback": "...", "tip": "..." }
    }
  }
}
```

Unrelated response:

```json
{ "aligned": false }
```

Existing `POST /api/evaluate` and `POST /api/evaluate-speaking` contracts remain available, now backed by OpenAI. `POST /api/evaluate-audio` remains Claude-backed.

## Stack

- React 19, Vite, Tailwind CSS
- Node.js, Express
- OpenAI Responses API with Structured Outputs
- Anthropic SDK only for dormant audio-upload route

## License

MIT
