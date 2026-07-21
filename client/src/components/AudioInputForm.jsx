import { useState, useRef, useEffect } from 'react';

function AudioInputForm({ onSubmit, isLoading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      console.warn('Speech Recognition not supported in this browser');
    }
  }, []);

  const startRecording = async () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event) => {
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            setTranscript(finalTranscript);
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected');
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          // Restart if still recording (handles auto-stop)
          recognition.start();
        }
      };

      recognition.start();
      recognitionRef.current = recognition;

      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      setInterimTranscript('');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Could not start speech recognition. Please grant microphone permission and try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      setInterimTranscript('');

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim() && !isLoading) {
      // Submit the transcript for evaluation
      onSubmit(transcript.trim());
    }
  };

  const handleReset = () => {
    setTranscript('');
    setInterimTranscript('');
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canSubmit = transcript.trim().length > 0 && !isLoading;

  if (!speechSupported) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-semibold">
          Speech recognition is not supported in your browser.
        </p>
        <p className="text-yellow-700 mt-2">
          Please use Chrome, Edge, or Safari for the speaking evaluation feature.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-left text-lg font-medium text-gray-700">
          Prompt: Speak about your day in English
        </label>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center space-y-4">
          {/* Recording Status */}
          <div className="flex flex-col items-center space-y-4">
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-semibold">Recording & Transcribing...</span>
              </div>
            )}

            {/* Timer */}
            <div className="text-3xl font-mono font-bold text-gray-700">
              {formatTime(recordingTime)}
            </div>

            {/* Recording Controls */}
            <div className="flex gap-4">
              {!isRecording && !transcript && (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Start Recording
                </button>
              )}

              {isRecording && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  Stop Recording
                </button>
              )}

              {transcript && !isRecording && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Transcript Display */}
          {(transcript || interimTranscript) && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2 font-semibold">Transcription:</p>
              <div className="bg-white border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto text-left">
                <p className="text-gray-800">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-gray-400 italic">{interimTranscript}</span>
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Word count: {transcript.trim().split(/\s+/).filter(w => w.length > 0).length}
              </p>
            </div>
          )}

          {/* Instructions */}
          {!transcript && !isRecording && (
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>Click "Start Recording" to begin</p>
              <p>Speak clearly about your day in English</p>
              <p>Your speech will be transcribed in real-time</p>
              <p>Click "Stop Recording" when finished</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full md:w-auto"
      >
        {isLoading ? 'Evaluating...' : 'Evaluate Speaking'}
      </button>
    </form>
  );
}

export default AudioInputForm;
