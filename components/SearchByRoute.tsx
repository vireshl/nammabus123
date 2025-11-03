import React, { useState } from 'react';
import { runQuery } from '../services/geminiService';
import GeminiResponse from './GeminiResponse';
import type { GeminiResponseData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon } from './icons';

const SearchByRoute: React.FC = () => {
  const [routeNumber, setRouteNumber] = useState('');
  const [response, setResponse] = useState<GeminiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, updateCurrentUser } = useAuth();
  
  const isFavorite = currentUser?.favoriteRoutes?.includes(routeNumber) ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeNumber) {
      setError("Please enter a route number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const prompt = `Show the full list of bus stops for BMTC route number "${routeNumber}" in Bengaluru, from start to end.`;

    try {
      const result = await runQuery(prompt);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!currentUser || !routeNumber) return;
    
    const currentFavorites = currentUser.favoriteRoutes || [];
    const newFavorites = isFavorite
      ? currentFavorites.filter(r => r !== routeNumber)
      : [...currentFavorites, routeNumber];
      
    try {
        await updateCurrentUser({ favoriteRoutes: newFavorites });
    } catch(err) {
        console.error("Failed to update favorites", err);
        // Optionally show an error to the user
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Search by Route</h2>
        {currentUser && response && !isLoading && !error && (
            <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                    isFavorite
                        ? 'text-amber-400 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/80'
                        : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <StarIcon className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="routeNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Route Number</label>
          <input
            type="text"
            id="routeNumber"
            value={routeNumber}
            onChange={(e) => setRouteNumber(e.target.value.toUpperCase())}
            placeholder="e.g., 356W"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? 'Searching...' : 'Search Route'}
        </button>
      </form>
      <GeminiResponse data={response} isLoading={isLoading} error={error} />
    </div>
  );
};

export default SearchByRoute;