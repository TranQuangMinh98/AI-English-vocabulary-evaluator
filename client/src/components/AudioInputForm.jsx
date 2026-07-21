import { useState, useRef } from 'react';

function AudioInputForm({ onSubmit, isLoading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (audioBlob && !isLoading) {
      onSubmit(audioBlob);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canSubmit = audioBlob && !isLoading;

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
                <span className="text-red-600 font-semibold">Recording...</span>
              </div>
            )}

            {/* Timer */}
            <div className="text-3xl font-mono font-bold text-gray-700">
              {formatTime(recordingTime)}
            </div>

            {/* Recording Controls */}
            <div className="flex gap-4">
              {!isRecording && !audioBlob && (
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

              {audioBlob && !isRecording && (
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

          {/* Audio Playback */}
          {audioURL && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Preview your recording:</p>
              <audio src={audioURL} controls className="w-full max-w-md mx-auto" />
            </div>
          )}

          {/* Instructions */}
          {!audioBlob && !isRecording && (
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>Click "Start Recording" to begin</p>
              <p>Speak for at least 30 seconds</p>
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
