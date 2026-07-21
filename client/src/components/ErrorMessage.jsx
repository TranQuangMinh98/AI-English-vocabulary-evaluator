function ErrorMessage({ message, onRetry }) {
  return (
    <div className="mt-8 bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <svg
          className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-1">Error</h3>
          <p className="text-red-700 mb-4">{message}</p>
          <button onClick={onRetry} className="btn-primary bg-red-600 hover:bg-red-700">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
