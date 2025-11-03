import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';

const CURRENT_USER_KEY = 'nammabus_current_user';
const ALL_USERS_KEY = 'nammabus_all_users';

// Pre-seed an admin account if one doesn't exist
const initializeUsers = () => {
  if (!localStorage.getItem(ALL_USERS_KEY)) {
    const adminUser: User = { 
      username: 'admin', 
      password: 'password123', 
      isAdmin: true,
      favoriteRoutes: [],
      frequentStops: [],
      searchHistory: [],
    };
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify([adminUser]));
  }
};

initializeUsers();

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password_raw: string) => Promise<User>;
  register: (username: string, password_raw: string) => Promise<User>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (username: string, password_raw: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
      const user = allUsers.find(u => u.username === username && u.password === password_raw);

      if (user) {
        // Create a user object without the password for the session
        const { password, ...sessionUser } = user;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
        setCurrentUser(sessionUser);
        resolve(sessionUser);
      } else {
        reject(new Error('Invalid username or password.'));
      }
    });
  };

  const register = (username: string, password_raw: string): Promise<User> => {
     return new Promise((resolve, reject) => {
      const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
      if (allUsers.some(u => u.username === username)) {
        return reject(new Error('Username already exists.'));
      }

      const newUser: User = {
        username,
        password: password_raw,
        isAdmin: false,
        favoriteRoutes: [],
        frequentStops: [],
        searchHistory: [],
      };

      const updatedUsers = [...allUsers, newUser];
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));

      // Log the user in immediately after registration
      const { password, ...sessionUser } = newUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      resolve(sessionUser);
    });
  };
  
  const updateCurrentUser = async (updates: Partial<User>): Promise<void> => {
     return new Promise((resolve, reject) => {
      if (!currentUser) {
        return reject(new Error("No user is currently logged in."));
      }
      
      const allUsers: User[] = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
      const userIndex = allUsers.findIndex(u => u.username === currentUser.username);

      if (userIndex === -1) {
        return reject(new Error("Could not find the current user in the database."));
      }

      // Update the full user object
      const updatedUser = { ...allUsers[userIndex], ...updates };
      allUsers[userIndex] = updatedUser;
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
      
      // Update the session user object (without password)
      const { password, ...sessionUser } = updatedUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      
      resolve();
     });
  };


  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};