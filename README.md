# CEFR English Writing Evaluator

A demo web application that evaluates English text based on CEFR (Common European Framework of Reference for Languages) standards across four attributes: Complexity, Accuracy, Fluency, and Clarity.

## Features

- **CEFR Evaluation**: Evaluate text across all 6 CEFR levels (A1-C2)
- **Four Attributes**: Get detailed feedback on Complexity, Accuracy, Fluency, and Clarity
- **Visual Progress Bars**: See your level with color-coded segmented progress bars
- **Overall Score**: Conservative overall level assessment (lowest of 4 attributes)
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **AI-Powered**: Uses Claude AI for intelligent evaluation

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- Claude API (Anthropic)

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

1. Open the application in your browser
2. Read the prompt: "Write about your day in English"
3. Enter your text (100-1000 words)
4. Click "Evaluate" to get your CEFR assessment
5. View your overall level and detailed feedback for each attribute
6. Click "Evaluate Another" to try again with different text

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

## License

MIT

## Powered By

Claude AI by Anthropic
