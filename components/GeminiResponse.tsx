import React from 'react';
import { GeminiResponseData, GroundingChunk } from '../types';
import { LinkIcon } from './icons';

interface GeminiResponseProps {
  data: GeminiResponseData | null;
  isLoading: boolean;
  error: string | null;
}

const GeminiResponse: React.FC<GeminiResponseProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 dark:border-slate-700 h-12 w-12 mb-4 animate-spin border-t-indigo-600"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Fetching information from BMTC network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!data || !data.text) {
    return null;
  }
  
  const renderFormattedText = () => {
    return data.text.split('\n').map((line, index) => {
      const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      if (isListItem) {
        const content = boldedLine.trim().substring(2);
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="text-indigo-500 dark:text-indigo-400 mr-2 mt-1">&#8226;</span>
            <p dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      }
      
      return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: boldedLine }} />;
    });
  };

  const allChunks: GroundingChunk[] = data.groundingChunks ?? [];

  return (
    <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="prose prose-indigo max-w-none text-slate-700 dark:text-slate-300">
        {renderFormattedText()}
      </div>
      {allChunks && allChunks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Sources (from Google Maps):</h4>
          <ul className="space-y-2">
            {allChunks.map((chunk, index) => {
              if (chunk.maps?.uri) {
                return (
                  <li key={`map-${index}`}>
                    <a
                      href={chunk.maps.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                    >
                      <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{chunk.maps.title || 'View on Google Maps'}</span>
                    </a>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GeminiResponse;