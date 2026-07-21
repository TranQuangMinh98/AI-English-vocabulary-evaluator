# Audio Evaluation Feature

## Overview

The application now supports **two evaluation modes**:
1. **Text Evaluation** - Original functionality for written English
2. **Speaking Evaluation** - NEW audio-based evaluation for spoken English

## Features

### Text Evaluation Mode
Evaluates written English text (100-1000 words) across:
- **Complexity** - vocabulary range, sentence structure variety
- **Accuracy** - grammar, spelling, proper word usage
- **Fluency** - cohesion, coherence, natural flow
- **Clarity** - how clearly ideas are expressed

### Speaking Evaluation Mode (NEW)
Evaluates spoken English audio recordings across:
- **Complexity** - vocabulary range, sentence structure variety, sophistication
- **Accuracy** - grammar correctness, proper word usage
- **Fluency** - smoothness of speech, natural pace, minimal hesitation
- **Pronunciation** - clarity of speech sounds, stress patterns, intonation

## How to Use

### Switching Modes
1. Open the application
2. Click either **"Text Evaluation"** or **"Speaking Evaluation"** button in the header
3. The interface will switch accordingly

### Recording Audio
1. Switch to "Speaking Evaluation" mode
2. Click **"Start Recording"** button
3. Speak about your day in English (recommended: at least 30 seconds)
4. Click **"Stop Recording"** when finished
5. Preview your recording using the audio player
6. Click **"Evaluate Speaking"** to get your CEFR assessment
7. Use **"Reset"** to record again if needed

## Technical Implementation

### Frontend Changes
- **App.jsx**: Added mode switcher and audio submission handler
- **AudioInputForm.jsx**: New component for audio recording using Web Audio API
- **EvaluationResult.jsx**: Updated to display different attributes based on mode

### Backend Changes
- **evaluate-audio.js**: New route handling audio file uploads and Claude API integration
- **server/index.js**: Added audio evaluation route
- **Dependencies**: Added `multer` for file upload handling

### Audio Processing
- Records audio using browser's MediaRecorder API
- Supports multiple audio formats (WebM, WAV, MP3, etc.)
- Maximum file size: 10MB
- Audio is converted to base64 and sent to Claude API
- Claude processes the audio and provides CEFR-level feedback

## API Endpoints

### POST `/api/evaluate`
Evaluates text input (existing)
- **Body**: `{ "text": "your text here" }`
- **Response**: JSON with CEFR evaluation

### POST `/api/evaluate-audio` (NEW)
Evaluates audio input
- **Body**: FormData with audio file
- **Response**: JSON with CEFR evaluation (Complexity, Accuracy, Fluency, Pronunciation)

## Browser Requirements

For audio recording to work, you need:
- Modern browser with Web Audio API support (Chrome, Firefox, Edge, Safari)
- Microphone access permission
- HTTPS connection (for production) or localhost (for development)

## CEFR Levels

Both modes evaluate using the same CEFR scale:
- **A1** - Beginner
- **A2** - Elementary
- **B1** - Intermediate
- **B2** - Upper Intermediate
- **C1** - Advanced
- **C2** - Proficient

The overall level is determined by the **lowest** of the 4 attribute scores.

## Future Enhancements

Potential improvements:
- Set minimum recording duration
- Real-time audio level indicator
- Support for file upload (in addition to recording)
- Detailed pronunciation breakdown
- Audio waveform visualization
- Transcription display
