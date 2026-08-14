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

Learners can type or use browser speech recognition. The complete Conversation receives one four-attribute CEFR evaluation after it ends. An unrelated response redirects once; a second consecutive unrelated response skips to the next question. Browser refresh and **Start Again** clear all history.

## Setup

Requires Node.js 18+ and npm.

```bash
npm run install:all
```

Copy `server/.env.example` to `server/.env`, then set `OPENAI_API_KEY`. `OPENAI_MODEL` defaults to `gpt-5-nano`. Set `OPENAI_BASE_URL` only when using an OpenAI-compatible proxy; otherwise leave it unset.

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
  "acknowledgment": "Nice to meet you, Minh."
}
```

Unrelated response:

```json
{ "aligned": false }
```

### `POST /api/conversation-feedback`

Send the collected learner responses after the Conversation ends. The endpoint returns one CEFR evaluation covering all responses.

```json
{
  "responses": [
    { "questionId": "intro-name", "response": "My name is Minh.", "inputMode": "text" },
    { "questionId": "intro-origin", "response": "I am from Vietnam.", "inputMode": "voice" }
  ]
}
```

Existing `POST /api/evaluate` and `POST /api/evaluate-speaking` contracts remain available, now backed by OpenAI. `POST /api/evaluate-audio` remains Claude-backed.

## Stack

- React 19, Vite, Tailwind CSS
- Node.js, Express
- OpenAI Responses API with Structured Outputs
- Anthropic SDK only for dormant audio-upload route

## License

MIT
