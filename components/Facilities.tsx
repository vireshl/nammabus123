import React, { useState, useEffect } from 'react';
import { runQuery } from '../services/geminiService';
import GeminiResponse from './GeminiResponse';
import type { GeminiResponseData } from '../types';

const Facilities: React.FC = () => {
  const [response, setResponse] = useState<GeminiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const prompt = `Describe the major facilities provided by BMTC at bus stations and on buses in Bengaluru. Include information about digital display boards, accessibility features for disabled passengers, ticketing options (like passes and digital payments), and any other notable amenities.`;
    
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
    fetchFacilities();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">BMTC Facilities</h2>
      <GeminiResponse data={response} isLoading={isLoading} error={error} />
    </div>
  );
};

export default Facilities;