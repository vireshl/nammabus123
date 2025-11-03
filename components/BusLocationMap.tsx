import React from 'react';
import { GeminiResponseData } from '../types';
import { BusMapIcon, BusStopIcon } from './icons';

interface BusLocationMapProps {
  data: GeminiResponseData;
}

// Helper to capitalize words in a string, e.g., "majestic bus stand" -> "Majestic Bus Stand"
const capitalize = (str: string) => str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

const BusLocationMap: React.FC<BusLocationMapProps> = ({ data }) => {
  const { text, groundingChunks } = data;

  let startOfRoute = 'Start';
  let endOfRoute = 'End';

  // Simple parsing for route start/end from the text response.
  // This makes the visualization more contextual.
  const fromMatch = text.match(/from\s+([\w\s]+?)(?:\s+to|,|\.)/i);
  const toMatch = text.match(/(?:to|towards)\s+([\w\s]+?)(?:,|$|\.)/i);

  if (fromMatch && fromMatch[1]) {
    startOfRoute = capitalize(fromMatch[1].trim());
  }
  if (toMatch && toMatch[1]) {
    endOfRoute = capitalize(toMatch[1].trim());
  }
  
  const nearestStop = groundingChunks?.find(chunk => chunk.maps?.title)?.maps;

  // A plausible, static position for the bus. The animation will progress TO this point.
  const busPositionPercent = 60;
  const stopPositionPercent = 75;
  const animationDuration = '2s';

  return (
    <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
      <style>
        {`
          @keyframes bus-progression {
            from { left: 10%; }
            to { left: ${busPositionPercent}%; }
          }
          @keyframes stop-fade-in {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          .bus-animation {
            animation: bus-progression ${animationDuration} cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          }
          .stop-animation {
            animation: stop-fade-in 0.5s ease-out forwards;
            animation-delay: ${animationDuration};
            opacity: 0;
          }
        `}
      </style>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Current Estimated Position</h3>
      <p className="text-sm text-slate-500 mb-8 text-center font-medium">{startOfRoute} → {endOfRoute}</p>
      
      <div className="relative w-full h-16">
        {/* Route Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-300 rounded-full" />
        
        {/* Start Marker */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
            <div className="w-3 h-3 bg-slate-400 border-2 border-white rounded-full" />
        </div>
         {/* End Marker */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
            <div className="w-3 h-3 bg-slate-400 border-2 border-white rounded-full" />
        </div>

        {/* Bus Position (Animated to show progression) */}
        <div className="absolute top-1/2 bus-animation" style={{ transform: 'translate(-50%, -50%)' }}>
            <BusMapIcon className="w-10 h-10 text-indigo-600 -mt-2 transform -translate-y-1/2" />
        </div>

        {/* Nearest Stop (Fades in after bus moves) */}
        <div 
            className="absolute top-1/2 flex flex-col items-center stop-animation" 
            style={{ left: `${stopPositionPercent}%` }}
        >
          <div 
            className={`w-4 h-4 rounded-full border-2 ${nearestStop ? 'bg-white border-slate-500' : 'bg-slate-300 border-slate-400'}`}
          />
          <div className="absolute top-full mt-2 w-max text-center">
            <div className="flex items-center justify-center gap-1 text-slate-600 text-xs">
                <BusStopIcon className="w-3 h-3 flex-shrink-0"/>
                <span className="truncate max-w-[120px] font-semibold">{nearestStop ? nearestStop.title : 'Nearest Bus Stop'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusLocationMap;
