import React, { useState, useRef, useEffect } from 'react';
import { runQuery } from '../services/geminiService';
import { Type } from "@google/genai";
import GeminiResponse from './GeminiResponse';
import type { GeminiResponseData, SingleBusData } from '../types';
import { BellIcon, BusStopIcon, RefreshIcon, TrackBusIcon } from './icons';
import SingleBusMap from './SingleBusMap';

const TrackBus: React.FC = () => {
  const [busNumber, setBusNumber] = useState('');
  const [summaryResponse, setSummaryResponse] = useState<GeminiResponseData | null>(null);
  const [busData, setBusData] = useState<SingleBusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for alerts
  const [alertStop, setAlertStop] = useState('');
  const [isAlertSet, setIsAlertSet] = useState(false);

  // New state for auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshInterval = useRef<number | null>(null);

  const busLocationSchema = {
    type: Type.OBJECT,
    properties: {
      currentLocation: {
        type: Type.OBJECT,
        description: "The bus's current estimated latitude and longitude.",
        properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
        required: ['lat', 'lng']
      },
      nearestStop: {
        type: Type.OBJECT,
        description: "The name and coordinates of the closest bus stop the bus has just passed or is at.",
        properties: {
          name: { type: Type.STRING },
          position: {
            type: Type.OBJECT,
            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
            required: ['lat', 'lng']
          }
        },
        required: ['name', 'position']
      },
       upcomingStops: {
        type: Type.ARRAY,
        description: "An array of the next 2-3 upcoming bus stops, each with its name, coordinates, and ETA.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                position: {
                    type: Type.OBJECT,
                    properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
                    required: ['lat', 'lng']
                },
                etaMinutes: {
                  type: Type.NUMBER,
                  description: "Estimated time of arrival to this stop in minutes from the bus's current location."
                }
            },
            required: ['name', 'position', 'etaMinutes']
        }
      },
      routePolyline: {
        type: Type.ARRAY,
        description: "A small segment of the route's polyline (an array of {lat, lng} coordinates) around the bus's current position to show its path.",
        items: {
            type: Type.OBJECT,
            properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
            },
            required: ['lat', 'lng']
        }
      },
      summary: {
        type: Type.STRING,
        description: "A text summary of the bus's location, its route, and its direction (e.g., towards Majestic), suitable for display to the user."
      }
    },
    required: ['currentLocation', 'nearestStop', 'upcomingStops', 'routePolyline', 'summary']
  };
  
  const trackBusAction = async (currentBusNumber: string) => {
     if (!currentBusNumber) {
      setError("Please enter a bus number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummaryResponse(null);
    
    // Don't clear bus data immediately, so the map stays visible during refresh
    if (!busData) {
      setBusData(null);
    }
    setIsAlertSet(false);

    const prompt = `You are a BMTC bus tracking data provider. For the BMTC bus number "${currentBusNumber}" in Bengaluru, provide its live tracking data. Use Google Maps data for accuracy. The response must be a single JSON object conforming to the provided schema. It should include:
1. The bus's current live coordinates.
2. The name and coordinates of its nearest bus stop (the one it just passed or is at).
3. A list of the next 2-3 upcoming stops with their names, coordinates, and estimated time of arrival (ETA) in minutes for each.
4. A short polyline representing the bus route segment around its current location to indicate its direction.
5. A brief text summary of the bus's status, including its direction (e.g., "towards Majestic").
Do not add any commentary before or after the JSON.`;

    try {
      const result = await runQuery(prompt, false, null, busLocationSchema);
      const data: SingleBusData = JSON.parse(result.text);
      setBusData(data);
      setSummaryResponse({ text: data.summary, groundingChunks: result.groundingChunks });
      
      if (data.upcomingStops && data.upcomingStops.length > 0) {
        setAlertStop(data.upcomingStops[0].name);
      } else {
        setAlertStop(data.nearestStop.name);
      }

    } catch (err) {
      if (!autoRefresh) { // Don't clear data or show prominent error on auto-refresh failure
          setBusData(null);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } else {
          console.error("Auto-refresh failed:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusData(null); // Clear old data for a new search
    trackBusAction(busNumber);
  };

  const handleSetAlert = async () => {
    if (!alertStop.trim()) {
      return;
    }

    const showNotification = () => {
      setTimeout(() => {
        new Notification('BMTC Bus Alert', {
          body: `Reminder: Bus ${busNumber} is approaching ${alertStop}.`,
          icon: '/vite.svg'
        });
      }, 5000); 
      setIsAlertSet(true);
    };

    if ('Notification' in window) {
      if (Notification.permission === "granted") {
        showNotification();
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          showNotification();
        }
      }
    } else {
        alert("This browser does not support desktop notification. We'll simulate with an alert box.");
        setTimeout(() => {
            alert(`Reminder: Bus ${busNumber} is approaching ${alertStop}.`);
        }, 5000);
        setIsAlertSet(true);
    }
  };
  
  useEffect(() => {
    if (autoRefresh && busNumber) {
        refreshInterval.current = window.setInterval(() => {
            trackBusAction(busNumber);
        }, 15000); // Refresh every 15 seconds
    } else {
        if (refreshInterval.current) {
            clearInterval(refreshInterval.current);
            refreshInterval.current = null;
        }
    }

    return () => {
        if (refreshInterval.current) {
            clearInterval(refreshInterval.current);
        }
    };
  }, [autoRefresh, busNumber]);

  return (
    <div>
       <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Track a Bus</h2>
        {busData && (
          <div className="flex items-center space-x-4">
              {/* Auto-refresh toggle */}
              <div className="flex items-center space-x-2">
                <label htmlFor="auto-refresh-toggle" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Auto-Refresh
                </label>
                <button
                  id="auto-refresh-toggle"
                  role="switch"
                  aria-checked={autoRefresh}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    autoRefresh ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Manual refresh button */}
              <button
                onClick={() => trackBusAction(busNumber)}
                disabled={isLoading}
                className="flex items-center space-x-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-wait transition-colors"
              >
                <RefreshIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh Now'}</span>
              </button>
          </div>
        )}
      </div>

      {!busData && (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="busNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bus Number</label>
            <input
                type="text"
                id="busNumber"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g., 500D, VJ-1234"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            </div>
            <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all"
            >
             <TrackBusIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Tracking...' : 'Track Bus'}
            </button>
        </form>
      )}

      {busData && !error && (
        <div className="mt-6 animate-fade-in">
          <SingleBusMap data={busData} />
        </div>
      )}
      
      <GeminiResponse data={summaryResponse} isLoading={isLoading && !busData} error={error} />
      
      {busData && busData.upcomingStops.length > 0 && !error && (
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Upcoming Stops</h3>
            <ul className="space-y-3">
              {busData.upcomingStops.map((stop, index) => (
                <li key={index} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center">
                    <BusStopIcon className="h-5 w-5 mr-3 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    <span className="font-medium">{stop.name}</span>
                  </div>
                  {stop.etaMinutes !== undefined && (
                     <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 py-1 px-2 rounded-full">
                      {stop.etaMinutes} min
                    </span>
                  )}
                </li>
              ))}
            </ul>
        </div>
      )}
      
      {busData && !error && (
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Set Proximity Alert</h3>
            {isAlertSet ? (
                <div className="p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg">
                    <p className="font-bold">Alert is active!</p>
                    <p>You will be notified when bus {busNumber} nears {alertStop}.</p>
                </div>
            ) : (
                <div className="space-y-4">
                     <p className="text-sm text-slate-600 dark:text-slate-400">Get a notification for an upcoming stop. This requires notification permissions.</p>
                    <div>
                        <label htmlFor="alertStop" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stop Name</label>
                        <input
                            type="text"
                            id="alertStop"
                            value={alertStop}
                            onChange={(e) => setAlertStop(e.target.value)}
                            placeholder="e.g., Koramangala Water Tank"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        onClick={handleSetAlert}
                        disabled={!alertStop.trim()}
                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <BellIcon className="h-5 w-5 mr-2" />
                        Set Alert
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TrackBus;