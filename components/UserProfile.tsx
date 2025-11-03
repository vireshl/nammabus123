import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { features } from '../constants';
import { Feature } from '../types';
import { StarIcon, BusStopIcon, JourneyPlannerIcon, TrashIcon, SunIcon, MoonIcon } from './icons';

interface UserProfileProps {
    setActiveFeature: (feature: Feature | null) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ setActiveFeature }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [newStop, setNewStop] = useState('');

  const handleRemoveRoute = async (routeToRemove: string) => {
    const newFavorites = (currentUser?.favoriteRoutes || []).filter(r => r !== routeToRemove);
    await updateCurrentUser({ favoriteRoutes: newFavorites });
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStop.trim() || (currentUser?.frequentStops || []).includes(newStop.trim())) {
      setNewStop('');
      return;
    }
    const newStops = [...(currentUser?.frequentStops || []), newStop.trim()];
    await updateCurrentUser({ frequentStops: newStops });
    setNewStop('');
  };

  const handleRemoveStop = async (stopToRemove: string) => {
    const newStops = (currentUser?.frequentStops || []).filter(s => s !== stopToRemove);
    await updateCurrentUser({ frequentStops: newStops });
  };
  
  const handleRemoveHistoryItem = async (indexToRemove: number) => {
      const newHistory = (currentUser?.searchHistory || []).filter((_, index) => index !== indexToRemove);
      await updateCurrentUser({ searchHistory: newHistory });
  };
  
  const handleSearchAgain = (from: string, to: string) => {
      const journeyPlannerFeature = features.find(f => f.title === 'Journey Planner');
      if (journeyPlannerFeature) {
        alert(`To search again for "${from}" to "${to}", please go to the Journey Planner. This functionality will be improved in a future update!`);
        setActiveFeature(journeyPlannerFeature);
      }
  };

  if (!currentUser) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">My Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">My Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Favorite Routes */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
            <StarIcon className="h-6 w-6 mr-2 text-amber-500" />
            Favorite Routes
          </h3>
          <ul className="space-y-2">
            {(currentUser.favoriteRoutes || []).length > 0 ? (
              currentUser.favoriteRoutes?.map(route => (
                <li key={route} className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-md shadow-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{route}</span>
                  <button onClick={() => handleRemoveRoute(route)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">You haven't added any favorite routes yet.</p>
            )}
          </ul>
        </div>
        
        {/* Frequent Stops */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
            <BusStopIcon className="h-6 w-6 mr-2 text-indigo-500" />
            Frequent Stops
          </h3>
          <ul className="space-y-2 mb-4">
             {(currentUser.frequentStops || []).length > 0 ? (
              currentUser.frequentStops?.map(stop => (
                <li key={stop} className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-md shadow-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{stop}</span>
                  <button onClick={() => handleRemoveStop(stop)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Add some stops you use often!</p>
            )}
          </ul>
          <form onSubmit={handleAddStop} className="flex gap-2">
            <input 
              type="text" 
              value={newStop}
              onChange={(e) => setNewStop(e.target.value)}
              placeholder="Add a new stop"
              className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-600 dark:text-slate-100 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300" disabled={!newStop.trim()}>Add</button>
          </form>
        </div>
        
        {/* Journey History */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
            <JourneyPlannerIcon className="h-6 w-6 mr-2 text-green-500" />
            Journey History
          </h3>
           <ul className="space-y-2">
            {(currentUser.searchHistory || []).length > 0 ? (
              currentUser.searchHistory?.map((search, index) => (
                <li key={index} className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-md shadow-sm gap-2">
                  <div className="text-sm overflow-hidden">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">From: {search.from}</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">To: {search.to}</p>
                  </div>
                  <button onClick={() => handleRemoveHistoryItem(index)} className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Your planned journeys will appear here.</p>
            )}
          </ul>
        </div>
        
        {/* Theme Switcher */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">Appearance</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose how NammaBus looks to you. Select a theme below.</p>
            <div className="flex gap-4">
                <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                        theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                >
                    <SunIcon className="h-6 w-6 mb-2 text-slate-700 dark:text-slate-200"/>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Light</span>
                </button>
                <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                        theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                >
                    <MoonIcon className="h-6 w-6 mb-2 text-slate-700 dark:text-slate-200"/>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Dark</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;