import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <div>
          <h3 className="text-lg font-medium text-rose-800 mb-2">Something went wrong</h3>
          <p className="text-rose-600">{message || "An unexpected error occurred."}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
