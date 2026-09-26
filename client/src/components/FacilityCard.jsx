import { MapPin, Navigation, Star } from 'lucide-react';

export default function FacilityCard({ facility }) {
  const { name, address, distance, isOpen, rating, lat, lng } = facility;

  const handleDirections = () => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else if (address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 text-lg leading-tight pr-4">{name}</h4>
          {distance && (
            <span className="inline-flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
              {distance}
            </span>
          )}
        </div>
        
        <div className="flex items-start text-gray-500 text-sm mb-4 gap-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{address}</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${isOpen ? 'text-green-700' : 'text-red-700'}`}>
              {isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
          
          {rating && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-700">{rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50 space-y-3">
        <p className="text-xs text-gray-400 italic text-center">
          * Acceptance not verified. Call ahead to confirm.
        </p>
        <button
          onClick={handleDirections}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 px-4 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-gray-200"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </button>
      </div>
    </div>
  );
}
