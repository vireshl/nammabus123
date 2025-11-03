import React, { useState, FC, useMemo } from 'react';
import { Feature } from './types';
import { features as allFeatures } from './constants';
import FeatureCard from './components/FeatureCard';
import JourneyPlanner from './components/JourneyPlanner';
import TrackBus from './components/TrackBus';
import SearchByRoute from './components/SearchByRoute';
import TrackLiveRoute from './components/TrackLiveRoute';
import TimeTable from './components/TimeTable';
import AroundBusStation from './components/AroundBusStation';
import Facilities from './components/Facilities';
import FareCalculator from './components/FareCalculator';
import Feedback from './components/Feedback';
import UserGuide from './components/UserGuide';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile'; // New
import AuthModal from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { ArrowLeftIcon, LogoutIcon, UserIcon } from './components/icons';

const App: FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const features = useMemo(() => {
    return allFeatures.filter(feature => {
      if (feature.adminOnly) return currentUser?.isAdmin;
      if (feature.authRequired) return !!currentUser;
      return true;
    });
  }, [currentUser]);

  const renderFeatureComponent = () => {
    if (!activeFeature) return null;

    const components: { [key: string]: React.ReactElement } = {
      'Journey Planner': <JourneyPlanner />,
      'Track a Bus': <TrackBus />,
      'Search by Route': <SearchByRoute />,
      'Track A Live Route': <TrackLiveRoute />,
      'My Profile': <UserProfile setActiveFeature={setActiveFeature} />, // New
      'Time Table': <TimeTable />,
      'Around Bus Station': <AroundBusStation />,
      'Facilities': <Facilities />,
      'Fare Calculator': <FareCalculator />,
      'Feedback': <Feedback />,
      'User Guide': <UserGuide />,
      'Admin Panel': <AdminPanel />,
    };

    return components[activeFeature.title] || null;
  };
  
  const handleBack = () => {
    setActiveFeature(null);
  };
  
  const handleLogout = () => {
    if (activeFeature?.adminOnly || activeFeature?.authRequired) {
      setActiveFeature(null);
    }
    logout();
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             {activeFeature && (
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Back"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">NammaBus</h1>
              <p className="text-sm sm:text-base text-indigo-200">{activeFeature ? activeFeature.title : 'Your Bengaluru Bus Guide'}</p>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white"/>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Welcome, {currentUser.username}!</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Logout"
                >
                  <LogoutIcon className="h-6 w-6" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full transition-colors"
              >
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {activeFeature ? (
          activeFeature.title === 'Admin Panel' ? (
            <div className="animate-fade-in">
              {renderFeatureComponent()}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg animate-fade-in">
              {renderFeatureComponent()}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} onClick={() => setActiveFeature(feature)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;