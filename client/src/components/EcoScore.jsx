export default function EcoScore({ score, size = 160 }) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = '#10B981'; // Emerald 500 (Green)
  if (score < 40) color = '#EF4444'; // Red 500
  else if (score < 70) color = '#F59E0B'; // Amber 500

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-100"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-800">{score}</span>
          <span className="text-sm font-medium text-gray-400">/ 100</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-bold text-gray-800">ReceiptVision Eco Score</h3>
        <p className="text-xs text-gray-500 mt-1 italic">Prototype engagement metric</p>
      </div>
    </div>
  );
}
