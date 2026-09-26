import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? 'Location access denied. Please enable location in your browser settings.'
            : 'Unable to retrieve your location. Please try again.'
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, error, loading, requestLocation };
}
