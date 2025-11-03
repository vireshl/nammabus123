import React, { useState } from 'react';
import { runQuery } from '../services/geminiService';
import GeminiResponse from './GeminiResponse';
import type { GeminiResponseData } from '../types';

const TimeTable: React.FC = () => {
  const [routeNumber, setRouteNumber] = useState('');
  const [response, setResponse] = useState<GeminiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeNumber) {
      setError("Please enter a route number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const prompt = `Provide the official timetable for BMTC bus route number "${routeNumber}" in Bengaluru. Include the timings for the first and last bus from the starting point, and the general frequency of buses on weekdays and weekends.`;

    try {
      const result = await runQuery(prompt);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Time Table</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="routeNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Route Number</label>
          <input
            type="text"
            id="routeNumber"
            value={routeNumber}
            onChange={(e) => setRouteNumber(e.target.value)}
            placeholder="e.g., 201"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? 'Fetching...' : 'Get Time Table'}
        </button>
      </form>
      <GeminiResponse data={response} isLoading={isLoading} error={error} />
    </div>
  );
};

export default TimeTable;