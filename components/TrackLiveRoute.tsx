import React, { useState, useEffect } from 'react';
import { runQuery } from '../services/geminiService';
import { Type } from "@google/genai";
import type { RouteData } from '../types';
import { StartOverIcon, TrackLiveRouteIcon } from './icons';
import RouteMap from './RouteMap';

const TrackLiveRoute: React.FC = () => {
  const [routeNumber, setRouteNumber] = useState('');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('maps.googleapis.com') && scripts[i].src.includes('YOUR_API_KEY_HERE')) {
            setApiKeyError('A valid Google Maps API key is required for this feature. Please replace "YOUR_API_KEY_HERE" in index.html with your key.');
            break;
        }
    }
  }, []);


  const routeSchema = {
    type: Type.OBJECT,
    properties: {
        routeName: { type: Type.STRING, description: "The official name or number of the bus route." },
        polyline: {
            type: Type.ARRAY,
            description: "An array of {lat, lng} coordinates representing the route path.",
            items: {
                type: Type.OBJECT,
                properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                },
                required: ['lat', 'lng']
            }
        },
        markers: {
            type: Type.ARRAY,
            description: "An array of markers for key points like start, end, or major transfers.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Type of marker: 'start', 'end', or 'transfer'." },
                    position: { 
                        type: Type.OBJECT,
                        properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
                        required: ['lat', 'lng']
                    },
                    label: { type: Type.STRING, description: "The name of the location for the marker (e.g., 'Majestic Bus Stand')." }
                },
                required: ['type', 'position', 'label']
            }
        },
        stops: {
            type: Type.ARRAY,
            description: "An array of 5 to 10 major bus stops along the route.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the bus stop." },
                    position: { 
                        type: Type.OBJECT,
                        properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
                        required: ['lat', 'lng']
                    },
                },
                required: ['name', 'position']
            }
        },
        buses: {
            type: Type.ARRAY,
            description: "An array of 2 to 4 active buses currently on the route.",
            items: {
                type: Type.OBJECT,
                properties: {
                    vehicleId: { type: Type.STRING, description: "A unique vehicle registration number (e.g., KA-01-F-1234)." },
                    position: { type: Type.NUMBER, description: "A placeholder number, not used in the new map visualization." }
                },
                required: ['vehicleId', 'position']
            }
        }
    },
    required: ['routeName', 'polyline', 'markers', 'stops', 'buses']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeNumber) {
      setError("Please enter a route number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRouteData(null);
    setProgress(0);

    const prompt = `You are a BMTC route data provider. For the BMTC route number "${routeNumber}" in Bengaluru, provide data for a live map visualization. Use Google Maps data to generate a realistic route polyline (an array of lat/lng coordinates). Provide markers for the start and end of the route. Also, provide a list of 5-10 major bus stops along the route, each with a name and its lat/lng coordinates. Include between 2 and 4 simulated live buses. The entire output must be a single JSON object conforming to the provided schema. Do not add any commentary before or after the JSON.`;

    try {
      const result = await runQuery(prompt, false, null, routeSchema);
      const data: RouteData = JSON.parse(result.text);
      
      if (data && data.routeName && data.polyline && data.markers) {
        setRouteData(data);
      } else {
        throw new Error("Received incomplete map data from AI. The route may not exist.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setRouteData(null);
    setRouteNumber('');
    setError(null);
    setProgress(0);
  };
  
  if (apiKeyError) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Track A Live Route</h2>
         <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-bold">Configuration Error</p>
            <p>{apiKeyError}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 rounded-lg">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 dark:border-slate-700 h-12 w-12 mb-4 animate-spin border-t-indigo-600"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Generating live route map for {routeNumber}...</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">This may take a moment.</p>
      </div>
    );
  }

  if (routeData) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Live Map: Route {routeData.routeName}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Displaying a real-time simulation of {routeData.buses.length} active buses on an interactive Google Map.</p>
        
        {/* Progress Bar */}
        <div className="mb-6">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-linear" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{Math.round(progress)}% of route covered (average)</p>
        </div>
        
        <RouteMap data={routeData} numberOfBuses={routeData.buses?.length} onProgressUpdate={setProgress}/>
        
        <button
          onClick={handleStartOver}
          className="w-full mt-8 flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
        >
          <StartOverIcon className="h-5 w-5 mr-2"/>
          Track Another Route
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Track A Live Route</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-4">Enter a route number to see a live, animated simulation of all active buses on an interactive Google Map, generated using real-time route path data.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="routeNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Route Number</label>
          <input
            type="text"
            id="routeNumber"
            value={routeNumber}
            onChange={(e) => setRouteNumber(e.target.value.toUpperCase())}
            placeholder="e.g., 500D"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          <TrackLiveRouteIcon className="h-5 w-5 mr-2"/>
          Track Live Route
        </button>
      </form>
      {error && (
        <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TrackLiveRoute;
