# CEFR English Evaluator

A demo web application that evaluates English **writing** and **speaking** based on CEFR (Common European Framework of Reference for Languages) standards with AI-powered feedback.

## Features

### Text Evaluation Mode
- **CEFR Evaluation**: Evaluate written text (100-1000 words) across all 6 CEFR levels (A1-C2)
- **Four Attributes**: Get detailed feedback on Complexity, Accuracy, Fluency, and Clarity

### Speaking Evaluation Mode (NEW)
- **Audio Recording**: Record your speech directly in the browser
- **CEFR Speaking Assessment**: Evaluate spoken English across all 6 CEFR levels (A1-C2)
- **Four Attributes**: Get detailed feedback on Complexity, Accuracy, Fluency, and Pronunciation
- **Audio Playback**: Preview your recording before submission

### General Features
- **Dual Mode**: Switch between Text and Speaking evaluation modes
- **Visual Progress Bars**: See your level with color-coded segmented progress bars
- **Overall Score**: Conservative overall level assessment (lowest of 4 attributes)
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **AI-Powered**: Uses Claude AI for intelligent evaluation with audio processing capabilities

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- Multer (file upload handling)
- Claude API (Anthropic) with audio support

## Project Structure

```
/project-root
  /client          # React frontend (Vite)
  /server          # Express backend API
  README.md        # This file
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Claude API access (via custom endpoint)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-learning-app
```

### 2. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the `/server` directory with your API configuration:

```env
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_BASE_URL=your_custom_endpoint_url
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 3. Client Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the `/client` directory (optional, defaults to localhost:3001):

```env
VITE_API_URL=http://localhost:3001
```

## Running the Application

### Development Mode

You need to run both the server and client:

**Terminal 1 - Start the backend:**
```bash
cd server
npm start
```

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173` (or the port Vite assigns)
- Backend API: `http://localhost:3001`

## Running Tests

### Backend Tests

```bash
cd server
npm test
```

## Usage

### Text Evaluation
1. Open the application in your browser
2. Select **"Text Evaluation"** mode (default)
3. Read the prompt: "Write about your day in English"
4. Enter your text (100-1000 words)
5. Click "Evaluate" to get your CEFR assessment
6. View your overall level and detailed feedback for each attribute

### Speaking Evaluation
1. Open the application in your browser
2. Select **"Speaking Evaluation"** mode
3. Click "Start Recording" and speak about your day in English
4. Click "Stop Recording" when finished
5. Preview your recording (optional)
6. Click "Evaluate Speaking" to get your CEFR assessment
7. View your overall level and detailed feedback for Complexity, Accuracy, Fluency, and Pronunciation

Click "Evaluate Another" to try again in either mode.

## CEFR Levels

- **A1**: Beginner
- **A2**: Elementary
- **B1**: Intermediate
- **B2**: Upper Intermediate
- **C1**: Advanced
- **C2**: Proficient

## API Endpoints

### POST /api/evaluate

Evaluates the provided text and returns CEFR assessment.

**Request Body:**
```json
{
  "text": "Your text here..."
}
```

**Response:**
```json
{
  "overall": {
    "level": "B1",
    "explanation": "Overall level is determined by the lowest attribute score"
  },
  "attributes": {
    "complexity": {
      "level": "B2",
      "feedback": "Descriptive feedback..."
    },
    "accuracy": {
      "level": "B1",
      "feedback": "Descriptive feedback..."
    },
    "fluency": {
      "level": "B2",
      "feedback": "Descriptive feedback..."
    },
    "clarity": {
      "level": "C1",
      "feedback": "Descriptive feedback..."
    }
  }
}
```

### POST /api/evaluate-audio (NEW)

Evaluates the provided audio recording and returns CEFR speaking assessment.

**Request Body:**
- FormData with audio file (field name: `audio`)
- Supported formats: WebM, WAV, MP3, OGG
- Maximum file size: 10MB

**Response:**
```json
{
  "overall": {
    "level": "B1",
    "explanation": "Overall level is determined by the lowest attribute score"
  },
  "attributes": {
    "complexity": {
      "level": "B2",
      "feedback": "Descriptive feedback..."
    },
    "accuracy": {
      "level": "B1",
      "feedback": "Descriptive feedback..."
    },
    "fluency": {
      "level": "B2",
      "feedback": "Descriptive feedback..."
    },
    "pronunciation": {
      "level": "B1",
      "feedback": "Descriptive feedback..."
    }
  }
}
```

## License

MIT

## Powered By

Claude AI by Anthropic
