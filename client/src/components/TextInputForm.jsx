import { useState } from 'react';

function TextInputForm({ onSubmit, isLoading }) {
  const [text, setText] = useState('');

  const countWords = (str) => {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = countWords(text);
  const isValid = wordCount >= 100 && wordCount <= 1000;
  const canSubmit = isValid && !isLoading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(text);
    }
  };

  const getWordCountColor = () => {
    if (wordCount < 100) return 'text-red-600';
    if (wordCount > 1000) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="text-input" className="block text-left text-lg font-medium text-gray-700">
          Prompt: Write about your day in English
        </label>

        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          placeholder="Start writing about your day..."
        />

        <div className="flex justify-between items-center text-sm">
          <span className={`font-mono font-medium ${getWordCountColor()}`}>
            {wordCount} words
          </span>
          <span className="text-gray-500">
            Required: 100-1000 words
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full md:w-auto"
      >
        {isLoading ? 'Evaluating...' : 'Evaluate'}
      </button>
    </form>
  );
}

export default TextInputForm;
