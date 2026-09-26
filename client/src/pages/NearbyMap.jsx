import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, AlertCircle, Phone, Clock, Search, Map as MapIcon } from 'lucide-react';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC fallback

const wasteCategories = [
  'Plastic', 'Paper/Cardboard', 'Glass', 'Metal', 
  'Battery/Special Waste', 'E-waste', 'General Recycling'
];

export default function NearbyMap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'General Recycling';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          console.error("Error getting location", error);
          setLocationError('Location access is required to find nearby facilities. Please enable location access in your browser settings.');
          setUserLocation(defaultCenter); // Fallback
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setUserLocation(defaultCenter);
    }
  }, []);

  // Search places when location or category changes
  useEffect(() => {
    if (!isLoaded || !userLocation || !apiKey) return;
    if (locationError && userLocation === defaultCenter) return; // Don't search if we don't have real location

    const searchPlaces = () => {
      setIsSearching(true);
      if (!window.google) return;
      
      const map = mapRef.current;
      if (!map) {
        setIsSearching(false);
        return;
      }

      const service = new window.google.maps.places.PlacesService(map);
      
      let request;
      
      if (selectedCategory === 'E-waste') {
        request = {
          location: userLocation,
          radius: '10000',
          query: 'e-waste recycling center'
        };
        service.textSearch(request, handleResults);
      } else if (selectedCategory === 'Battery/Special Waste') {
        request = {
          location: userLocation,
          radius: '10000',
          query: 'battery recycling center'
        };
        service.textSearch(request, handleResults);
      } else {
        request = {
          location: userLocation,
          radius: '10000',
          keyword: 'recycling center'
        };
        service.nearbySearch(request, handleResults);
      }
    };

    const handleResults = (results, status) => {
      setIsSearching(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Calculate distance mock (straight line)
        const parsedResults = results.map(place => {
          return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            rating: place.rating,
            isOpen: place.opening_hours?.isOpen(),
            distance: calculateDistance(
              userLocation.lat, userLocation.lng,
              place.geometry.location.lat(), place.geometry.location.lng()
            )
          };
        }).sort((a, b) => a.distance - b.distance);
        
        setFacilities(parsedResults);
      } else {
        setFacilities([]);
      }
    };

    searchPlaces();
  }, [isLoaded, userLocation, selectedCategory, apiKey, locationError]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Haversine formula for rough distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const openDirections = (facility) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.location.lat},${facility.location.lng}`, '_blank');
  };

  // Render Fallback if no API key
  if (!apiKey || loadError) {
    const demoFacilities = [
      { id: '1', name: 'City Recycling Center', address: '123 Green Ave, Eco City', distance: 2.4, isOpen: true, rating: 4.5 },
      { id: '2', name: 'Metro E-Waste Dropoff', address: '456 Tech Blvd, Eco City', distance: 3.8, isOpen: false, rating: 4.0 },
      { id: '3', name: 'Community Compost & Glass', address: '789 Earth St, Eco City', distance: 5.1, isOpen: true, rating: 4.8 }
    ];

    return (
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
        <Sidebar 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory}
          facilities={demoFacilities}
          isSearching={false}
          openDirections={() => alert('Demo mode: Directions unavailable without API key')}
          setSelectedFacility={setSelectedFacility}
          locationError="Map unavailable. Configure GOOGLE_MAPS_API_KEY to enable live map."
        />
        <div className="flex-1 bg-gray-200 flex flex-col items-center justify-center p-8 text-center">
          <MapIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Map Unavailable</h2>
          <p className="text-gray-500 max-w-md">
            Please configure your VITE_GOOGLE_MAPS_API_KEY in the environment variables to enable the interactive map and live place search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-white overflow-hidden relative">
      <Sidebar 
        selectedCategory={selectedCategory} 
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchParams({ category: cat });
          setSelectedFacility(null);
        }}
        facilities={facilities}
        isSearching={isSearching}
        openDirections={openDirections}
        setSelectedFacility={setSelectedFacility}
        locationError={locationError}
      />
      
      <div className="flex-1 relative h-[50vh] lg:h-auto">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={userLocation || defaultCenter}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              styles: [
                { featureType: "poi.business", stylers: [{ visibility: "off" }] },
                { featureType: "poi.medical", stylers: [{ visibility: "off" }] }
              ]
            }}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#3B82F6',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#ffffff'
                }}
              />
            )}

            {facilities.map((facility) => (
              <Marker
                key={facility.id}
                position={facility.location}
                onClick={() => setSelectedFacility(facility)}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                }}
              />
            ))}

            {selectedFacility && (
              <InfoWindow
                position={selectedFacility.location}
                onCloseClick={() => setSelectedFacility(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-bold text-gray-900 mb-1">{selectedFacility.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedFacility.address}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedFacility.rating && (
                      <span className="text-sm bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                        ★ {selectedFacility.rating}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openDirections(selectedFacility)}
                    className="w-full bg-emerald-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" /> Get Directions
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}

function Sidebar({ selectedCategory, setSelectedCategory, facilities, isSearching, openDirections, setSelectedFacility, locationError }) {
  return (
    <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col h-[50vh] lg:h-full border-b lg:border-b-0 lg:border-r border-gray-200 bg-white shadow-lg z-10">
      <div className="p-4 border-b border-gray-100 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Find Facilities</h2>
        
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{locationError}</p>
          </div>
        )}

        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar gap-2">
          {wasteCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors snap-start ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
          <span>Results for <strong>{selectedCategory}</strong></span>
          <span>{facilities.length} found</span>
        </div>

        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
            <p>Searching nearby...</p>
          </div>
        ) : facilities.length > 0 ? (
          <div className="space-y-4">
            {facilities.map((facility) => (
              <div 
                key={facility.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedFacility(facility)}
              >
                <h3 className="font-bold text-gray-900 pr-8">{facility.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{facility.address}</p>
                
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Navigation className="w-4 h-4" />
                    {facility.distance} km
                  </span>
                  {facility.isOpen !== undefined && (
                    <span className={`flex items-center gap-1 ${facility.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                      <Clock className="w-4 h-4" />
                      {facility.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded flex gap-1.5 items-start">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    Acceptance not verified. Contact the facility before visiting.
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); openDirections(facility); }}
                  className="mt-3 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  View / Get Directions
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100 border-dashed">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No facilities found nearby</p>
            <p className="text-sm text-gray-400 mt-1">Try expanding your search or selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
