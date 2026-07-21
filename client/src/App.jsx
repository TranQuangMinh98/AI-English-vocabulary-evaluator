import { useState } from 'react';
import TextInputForm from './components/TextInputForm';
import LoadingSpinner from './components/LoadingSpinner';
import EvaluationResult from './components/EvaluationResult';
import ErrorMessage from './components/ErrorMessage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submittedText, setSubmittedText] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            CEFR English Writing Evaluator
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 text-center">
            Get instant feedback on your English writing across Complexity, Accuracy, Fluency,
            and Clarity based on CEFR standards (A1-C2)
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!result && !isLoading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <TextInputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {result && <EvaluationResult result={result} onEvaluateAnother={handleEvaluateAnother} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-600 text-sm">
        Powered by Claude AI
      </footer>
    </div>
  );
}

export default App;
