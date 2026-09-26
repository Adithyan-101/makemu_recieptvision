export default function ConfidenceBadge({ confidence }) {
  // Handle undefined or null
  if (confidence === undefined || confidence === null) return null;
  
  const percentage = Math.round(confidence * 100);
  
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = 'Unknown';
  
  if (confidence >= 0.8) {
    colorClass = 'bg-green-50 text-green-700 border-green-200';
    label = 'High confidence';
  } else if (confidence >= 0.5) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Medium confidence';
  } else {
    colorClass = 'bg-red-50 text-red-700 border-red-200';
    label = 'Low confidence';
  }

  return (
    <div 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      title={label}
    >
      {percentage}%
    </div>
  );
}
