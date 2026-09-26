export const wasteCategories = {
  'Plastic': { emoji: '♻️', color: '#3B82F6', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-400' },
  'Paper/Cardboard': { emoji: '📦', color: '#F59E0B', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-400' },
  'Glass': { emoji: '🍾', color: '#8B5CF6', bgClass: 'bg-purple-50', textClass: 'text-purple-700', borderClass: 'border-purple-400' },
  'Metal': { emoji: '🥫', color: '#6B7280', bgClass: 'bg-gray-50', textClass: 'text-gray-700', borderClass: 'border-gray-400' },
  'Organic': { emoji: '🥦', color: '#10B981', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', borderClass: 'border-emerald-400' },
  'Battery/Special Waste': { emoji: '🔋', color: '#EF4444', bgClass: 'bg-red-50', textClass: 'text-red-700', borderClass: 'border-red-400' },
  'E-waste': { emoji: '💡', color: '#F97316', bgClass: 'bg-orange-50', textClass: 'text-orange-700', borderClass: 'border-orange-400' },
  'Other': { emoji: '🗑️', color: '#9CA3AF', bgClass: 'bg-gray-50', textClass: 'text-gray-600', borderClass: 'border-gray-300' }
};

export const getWasteInfo = (category) => {
  return wasteCategories[category] || wasteCategories['Other'];
};
