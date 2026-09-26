import { Package } from 'lucide-react';
import { getWasteInfo } from '../utils/wasteIcons';
import ConfidenceBadge from './ConfidenceBadge';

export default function ProductCard({ product }) {
  const { name, packaging, wasteCategory, confidence, quantity } = product;
  const wasteInfo = getWasteInfo(wasteCategory);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-lg text-gray-900 pr-2">{name}</h4>
        {quantity > 1 && (
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
            x{quantity}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="truncate">Packaging: <span className="font-medium text-gray-800">{packaging || 'Unknown'}</span></span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${wasteInfo.bgClass} ${wasteInfo.textClass}`}>
            <span>{wasteInfo.emoji}</span>
            {wasteCategory}
          </span>
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>
    </div>
  );
}
