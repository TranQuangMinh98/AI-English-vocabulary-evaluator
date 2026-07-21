function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700 font-medium">Evaluating your text...</p>
    </div>
  );
}

export default LoadingSpinner;
