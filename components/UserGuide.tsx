import React, { useState, useEffect } from 'react';
import { runQuery } from '../services/geminiService';
import GeminiResponse from './GeminiResponse';
import type { GeminiResponseData } from '../types';

const UserGuide: React.FC = () => {
  const [response, setResponse] = useState<GeminiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserGuide = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const prompt = `Provide a simple and helpful user guide for using the BMTC bus service in Bengaluru. Structure it with clear headings. Include tips on:
- How to read bus route boards (destination, route number, and 'via' points).
- Different types of buses (Ordinary, Vayu Vajra, etc.).
- Information on bus passes (daily, monthly) and where to get them.
- General etiquette for traveling on BMTC buses.`;
    
    try {
      const result = await runQuery(prompt);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">User Guide</h2>
      <GeminiResponse data={response} isLoading={isLoading} error={error} />
    </div>
  );
};

export default UserGuide;