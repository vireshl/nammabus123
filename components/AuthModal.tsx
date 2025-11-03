import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from './icons';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${
              activeTab === 'login' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${
              activeTab === 'register' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Register
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-full">
                <UserIcon className="h-6 w-6 text-indigo-600"/>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">to continue to NammaBus</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full input-style"
                placeholder="e.g., admin"
              />
            </div>
            <div>
              <label htmlFor="password_raw" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                id="password_raw"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full input-style"
                placeholder={username === 'admin' ? "password123" : "••••••••"}
              />
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Processing...' : (activeTab === 'login' ? 'Login' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
       <style>{`.input-style { @apply px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }`}</style>
    </div>
  );
};

export default AuthModal;