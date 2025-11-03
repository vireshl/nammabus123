import React, { useState } from 'react';
import { runQuery } from '../services/geminiService';
import { GeminiResponseData } from '../types';
import GeminiResponse from './GeminiResponse';
import { LocationMarkerIcon } from './icons';

const AroundBusStation: React.FC = () => {
  const [response, setResponse] = useState<GeminiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const prompt = `Using my current location, find the nearest BMTC bus stations in Bengaluru. For each station, list some of the major bus routes that pass through it. Use Google Maps grounding to provide accurate locations and source links.`;
        
        try {
          const result = await runQuery(prompt, true, { latitude, longitude });
          setResponse(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      },
      (geoError: GeolocationPositionError) => {
        let errorMessage = "An unknown error occurred while trying to get your location.";
        switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
                errorMessage = "Location access denied. Please enable location permissions in your browser settings to find nearby stations.";
                break;
            case geoError.POSITION_UNAVAILABLE:
                errorMessage = "Your location could not be determined at this moment. Please check your device's location settings and try again.";
                break;
            case geoError.TIMEOUT:
                errorMessage = "The request to get your location timed out. Please try again.";
                break;
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Around Bus Station</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-4">Find BMTC bus stations near your current location. This feature requires location access.</p>
      <button
        onClick={handleFindNearby}
        disabled={isLoading}
        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
      >
        <LocationMarkerIcon className="h-5 w-5 mr-2" />
        {isLoading ? 'Finding...' : 'Find Nearby Bus Stations'}
      </button>
      
      <GeminiResponse data={response} isLoading={isLoading} error={error} />
    </div>
  );
};

export default AroundBusStation;