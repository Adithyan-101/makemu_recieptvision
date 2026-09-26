import { getWasteInfo } from '../utils/wasteIcons';

export default function WasteCard({ category, count, onClick, selected }) {
  const info = getWasteInfo(category);
  const isClickable = typeof onClick === 'function';
  
  return (
    <div 
      onClick={isClickable ? onClick : undefined}
      className={`
        bg-white rounded-xl p-4 shadow-sm border-l-4 transition-all
        ${info.borderClass}
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
        ${selected ? 'ring-2 ring-emerald-500 shadow-md' : 'border border-y-gray-100 border-r-gray-100'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg text-2xl ${info.bgClass}`}>
            {info.emoji}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{category}</h4>
            <p className="text-sm text-gray-500">{count} {count === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
