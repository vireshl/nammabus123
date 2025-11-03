import React from 'react';

export interface Feature {
  title: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  adminOnly?: boolean;
  authRequired?: boolean; // New property for login-required features
}

// Updated User type for self-contained auth and profile features
export interface User {
  username: string;
  password?: string; // Optional for security when handling user objects
  isAdmin: boolean;
  favoriteRoutes?: string[];
  frequentStops?: string[];
  searchHistory?: { from: string; to: string }[];
}


export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            uri: string;
            title: string;
        }[]
    }[]
  }
}

export interface GeminiResponseData {
    text: string;
    groundingChunks: GroundingChunk[] | null;
}

export interface BusLocation {
  vehicleId: string;
  position: number; // 0-100 percentage
}

export interface RouteData {
  routeName: string;
  buses: BusLocation[];
  // Add optional properties for RouteMap visualization.
  polyline?: { lat: number; lng: number; }[];
  markers?: {
    type: 'start' | 'end' | 'transfer';
    position: { lat: number; lng: number; };
    label: string;
  }[];
  stops?: {
    name: string;
    position: { lat: number; lng: number; };
  }[];
}

export interface SingleBusData {
  currentLocation: { lat: number; lng: number; };
  nearestStop: { name: string; position: { lat: number; lng: number; }; };
  upcomingStops: { name: string; position: { lat: number; lng: number; }; etaMinutes?: number; }[];
  routePolyline: { lat: number; lng: number; }[];
  summary: string;
}