import CEFRProgressBar from './CEFRProgressBar';

function EvaluationResult({ result, onEvaluateAnother, evaluationMode = 'text' }) {
  const textAttributes = [
    { key: 'complexity', label: 'Complexity' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'fluency', label: 'Fluency' },
    { key: 'clarity', label: 'Clarity' }
  ];

  const speakingAttributes = [
    { key: 'complexity', label: 'Complexity' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'fluency', label: 'Fluency' },
    { key: 'pronunciation', label: 'Pronunciation' }
  ];

  const attributes = evaluationMode === 'speaking' ? speakingAttributes : textAttributes;

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Overall CEFR Level: {result.overall.level}
        </h2>
        <p className="text-gray-700">{result.overall.explanation}</p>
      </div>

      {/* Attribute Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attributes.map(({ key, label }) => {
          const attr = result.attributes[key];
          return (
            <div key={key} className="bg-white rounded-lg shadow-md p-6">
              <CEFRProgressBar level={attr.level} attribute={label} />
              <p className="mt-4 text-sm text-gray-600">{attr.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Evaluate Another Button */}
      <div className="flex justify-center">
        <button
          onClick={onEvaluateAnother}
          className="btn-secondary"
        >
          Evaluate Another
        </button>
      </div>
    </div>
  );
}

export default EvaluationResult;
