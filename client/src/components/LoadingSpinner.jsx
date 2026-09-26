import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = "Loading...", fullPage = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`animate-spin text-emerald-600 ${sizeClasses[size]}`} />
      {message && <p className="text-gray-600 font-medium animate-pulse">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="p-8 flex justify-center">
      {content}
    </div>
  );
}
