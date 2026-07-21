# Quick Start Guide

## Prerequisites
- Node.js v18 or higher
- npm

## Setup (First Time Only)

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure the server:**
   - The `.env` file in `/server` is already configured with your custom Claude endpoint
   - Verify these values in `/server/.env`:
     ```
     ANTHROPIC_API_KEY=your_key
     ANTHROPIC_BASE_URL=your_endpoint
     ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
     ```

## Running the Application

You need **two terminal windows**:

### Terminal 1 - Backend Server
```bash
npm run dev:server
```
Server will start at `http://localhost:3001`

### Terminal 2 - Frontend Client
```bash
npm run dev:client
```
Frontend will start at `http://localhost:5173` (or the port Vite assigns)

## Testing

Run backend tests:
```bash
npm run test:server
```

## Build for Production

Build the frontend:
```bash
npm run build:client
```

The production files will be in `client/dist/`

## Usage

1. Open `http://localhost:5173` in your browser
2. Read the prompt: "Write about your day in English"
3. Enter 100-1000 words of English text
4. Click "Evaluate" 
5. View your CEFR level assessment with detailed feedback
6. Click "Evaluate Another" to try again

## Troubleshooting

**Server won't start:**
- Check that port 3001 is available
- Verify your `.env` file has all required variables

**Frontend can't connect to backend:**
- Ensure the backend is running on port 3001
- Check CORS is enabled (it is by default)

**Build fails:**
- Clear node_modules and reinstall: `npm run install:all`
- Ensure you have the correct Node.js version

## Project Structure

```
/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.jsx      # Main app component
│   │   └── index.css    # Tailwind styles
│   └── package.json
├── server/              # Express backend
│   ├── routes/          # API routes
│   ├── index.js         # Server entry point
│   └── package.json
└── README.md            # Full documentation
```
