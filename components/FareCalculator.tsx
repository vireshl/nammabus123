import React, { useState } from 'react';
import { runQuery } from '../services/geminiService';
import GeminiResponse from './GeminiResponse';
import type { GeminiResponseData } from '../types';
import { SwapIcon, FareCalculatorIcon } from './icons';

const FareCalculator: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [response, setResponse] = useState<GeminiResponseData | null>(null);
  const [parsedFare, setParsedFare] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setError("Please enter both starting and destination stops.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setParsedFare(null);

    const prompt = `Act as a helpful BMTC fare estimation assistant for Bengaluru. For a journey from "${from}" to "${to}", provide a single estimated bus fare for an adult. Present the answer in the format: "Estimated Fare: ₹XX. Justification: [Your brief, one-sentence justification based on distance or route complexity]." Do not apologize, refuse, or mention limitations about real-time data or dynamic pricing.`;

    try {
      // Enable grounding to get real-time traffic data
      const result = await runQuery(prompt, true);
      
      const fareMatch = result.text.match(/(?:₹|Rs\.?)\s*(\d+(\.\d+)?)/);
      if (fareMatch && fareMatch[1]) {
        setParsedFare(`₹${fareMatch[1]}`);
      }
      
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Fare Calculator</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Get dynamic, real-time fare estimates based on current traffic conditions.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="w-full">
            <label htmlFor="from-fare" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
            <input
              type="text"
              id="from-fare"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g., Silk Board"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex-shrink-0 pt-1 md:pt-6">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors transform md:rotate-0 rotate-90"
              aria-label="Swap from and to locations"
            >
              <SwapIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full">
            <label htmlFor="to-fare" className="block text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
            <input
              type="text"
              id="to-fare"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g., Marathahalli"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all"
        >
          <FareCalculatorIcon className="h-5 w-5 mr-2"/>
          {isLoading ? 'Calculating...' : 'Calculate Fare'}
        </button>
      </form>

      {parsedFare && !isLoading && !error && (
        <div className="mt-8 p-6 bg-indigo-600 text-white rounded-lg text-center shadow-lg animate-fade-in">
          <p className="text-sm uppercase tracking-wider text-indigo-200">Estimated Live Fare</p>
          <p className="text-4xl font-bold">{parsedFare}</p>
        </div>
      )}

      <GeminiResponse data={response} isLoading={isLoading} error={error} />
    </div>
  );
};

export default FareCalculator;