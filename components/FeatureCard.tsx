import React from 'react';
import type { Feature } from '../types';

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => {
  const { title, description, Icon } = feature;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-indigo-700/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <div className="mb-3 p-4 bg-indigo-100 dark:bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-colors duration-300">
        <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </button>
  );
};

export default FeatureCard;