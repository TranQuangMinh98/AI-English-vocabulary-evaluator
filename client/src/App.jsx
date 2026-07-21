import { useState } from 'react';
import TextInputForm from './components/TextInputForm';
import AudioInputForm from './components/AudioInputForm';
import LoadingSpinner from './components/LoadingSpinner';
import EvaluationResult from './components/EvaluationResult';
import ErrorMessage from './components/ErrorMessage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submittedText, setSubmittedText] = useState('');
  const [evaluationMode, setEvaluationMode] = useState('text'); // 'text' or 'speaking'

  const handleSubmit = async (text) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSubmittedText(text);

    try {
      const response = await fetch(`${API_URL}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate text');
      }

      setResult(data);
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(err.message || 'We couldn\'t evaluate your text right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioSubmit = async (transcript) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSubmittedText(transcript);

    try {
      const response = await fetch(`${API_URL}/api/evaluate-speaking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate speaking');
      }

      setResult(data);
    } catch (err) {
      console.error('Speaking evaluation error:', err);
      setError(err.message || 'We couldn\'t evaluate your speaking right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (submittedText) {
      handleSubmit(submittedText);
    } else {
      setError(null);
    }
  };

  const handleEvaluateAnother = () => {
    setResult(null);
    setError(null);
    setSubmittedText('');
  };

  const handleModeChange = (mode) => {
    setEvaluationMode(mode);
    setResult(null);
    setError(null);
    setSubmittedText('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            CEFR English Evaluator
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 text-center">
            {evaluationMode === 'text'
              ? 'Get instant feedback on your English writing across Complexity, Accuracy, Fluency, and Clarity based on CEFR standards (A1-C2)'
              : 'Get instant feedback on your English speaking across Complexity, Accuracy, Fluency, and Pronunciation based on CEFR standards (A1-C2)'
            }
          </p>

          {/* Mode Switcher */}
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={() => handleModeChange('text')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                evaluationMode === 'text'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Text Evaluation
            </button>
            <button
              onClick={() => handleModeChange('speaking')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                evaluationMode === 'speaking'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Speaking Evaluation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!result && !isLoading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            {evaluationMode === 'text' ? (
              <TextInputForm onSubmit={handleSubmit} isLoading={isLoading} />
            ) : (
              <AudioInputForm onSubmit={handleAudioSubmit} isLoading={isLoading} />
            )}
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {result && <EvaluationResult result={result} onEvaluateAnother={handleEvaluateAnother} evaluationMode={evaluationMode} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-600 text-sm">
        Build and Design by Mivaroku
      </footer>
    </div>
  );
}

export default App;
