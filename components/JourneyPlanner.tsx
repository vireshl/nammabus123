import React, { useState } from 'react';
import { runQuery } from '../services/geminiService';
import GeminiResponse from './GeminiResponse';
import type { GeminiResponseData } from '../types';
import { JourneyPlannerIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

const JourneyPlanner: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  const [textResponse, setTextResponse] = useState<GeminiResponseData | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser, updateCurrentUser } = useAuth();

  const handlePlanJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setError("Please enter both a starting point and a destination.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTextResponse(null);
    setMapUrl(null);

    // Construct Google Maps Embed URL for live transit data
    const googleMapsUrl = `https://www.google.com/maps?q=bus+directions+from+${encodeURIComponent(from + ", Bengaluru")}+to+${encodeURIComponent(to + ", Bengaluru")}&output=embed`;
    setMapUrl(googleMapsUrl);

    // Prompt for Gemini to provide a text summary with a real-time fare
    const prompt = `Provide a brief summary for a BMTC bus journey from "${from}" to "${to}" in Bengaluru, including possible routes and travel time. As part of the summary, include a line with a single estimated fare in the format: "Estimated Fare: ₹XX". This estimate should be based on the typical distance and complexity of the journey. Do not apologize or mention limitations about real-time or dynamic pricing.`;

    try {
      // Enable grounding to get real-time traffic data for the fare
      const result = await runQuery(prompt, true, null, null); 
      setTextResponse(result);
      
      // Save to search history if user is logged in
      if (currentUser) {
         const newHistory = [{ from, to }, ...(currentUser.searchHistory || [])];
         const uniqueHistory = Array.from(new Map(newHistory.map(item => [`${item.from}-${item.to}`, item])).values()).slice(0, 10);
         await updateCurrentUser({ searchHistory: uniqueHistory });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Journey Planner</h2>
      
      {!mapUrl && (
        <form onSubmit={handlePlanJourney} className="space-y-4 transition-opacity duration-500">
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
            <input
              type="text"
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g., Majestic"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
            <input
              type="text"
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g., Marathahalli"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all"
          >
            <JourneyPlannerIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Finding Best Route...' : 'Find Buses'}
          </button>
        </form>
      )}

      {mapUrl && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Your Route from {from} to {to}</h3>
           <div className="rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-md">
               <div className="relative w-full" style={{ paddingTop: '75%' }}> {/* 4:3 Aspect Ratio */}
                   <iframe
                       className="absolute top-0 left-0 w-full h-full"
                       src={mapUrl}
                       style={{ border: 0 }}
                       allowFullScreen={true}
                       loading="lazy"
                       referrerPolicy="no-referrer-when-downgrade"
                       title={`Google Map directions from ${from} to ${to}`}
                   ></iframe>
               </div>
           </div>
        </div>
      )}

      <GeminiResponse data={textResponse} isLoading={isLoading} error={error} />
    </div>
  );
};

export default JourneyPlanner;