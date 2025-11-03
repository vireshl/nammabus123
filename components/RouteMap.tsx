import React, { useEffect, useRef, FC } from 'react';
import type { RouteData } from '../types';

// FIX: Add a declaration for the 'google' object to resolve TypeScript errors.
// The Google Maps API is loaded via a script tag, so its types are not available at compile time without this.
declare const google: any;

interface RouteMapProps {
  data: RouteData;
  numberOfBuses?: number;
  onProgressUpdate?: (progress: number) => void;
}

// FIX: Cannot find namespace 'google'. Changed to any[].
const mapStyles: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];

const RouteMap: FC<RouteMapProps> = ({ data, numberOfBuses = 3, onProgressUpdate }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // FIX: Cannot find namespace 'google'. Changed to any.
  const mapInstance = useRef<any | null>(null);
  // FIX: Cannot find namespace 'google'. Changed to any[].
  const objectsOnMap = useRef<any[]>([]);
  const animationInterval = useRef<number | null>(null);
  const stopMarkersRef = useRef<{ marker: any; percent: number; }[]>([]);


  useEffect(() => {
    if (!mapRef.current) return;
    
    // FIX: Property 'google' does not exist on type 'Window & typeof globalThis'. Using declared global 'google' object.
    if (!google || !google.maps) {
        console.error("Google Maps API not loaded.");
        return;
    }

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 12.9716, lng: 77.5946 }, // Default center for Bengaluru
      zoom: 12,
      styles: mapStyles,
      disableDefaultUI: true,
      zoomControl: true,
    });
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !data.polyline || data.polyline.length === 0) return;
    
    const map = mapInstance.current;
    
    // --- Cleanup previous data ---
    // FIX: The right-hand side of an 'instanceof' expression must be of type 'any' or a function type.
    objectsOnMap.current.forEach(obj => {
      if (obj && typeof obj.setMap === 'function') {
        obj.setMap(null);
      }
    });
    objectsOnMap.current = [];
    stopMarkersRef.current = [];
    if (animationInterval.current) {
        clearInterval(animationInterval.current);
        animationInterval.current = null;
    }

    // --- Draw new data ---
    const routePath = data.polyline.map(p => new google.maps.LatLng(p.lat, p.lng));
    const bounds = new google.maps.LatLngBounds();
    routePath.forEach(point => bounds.extend(point));
    map.fitBounds(bounds);

    // Visible route polyline
    const routePolyline = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: '#a8a29e', // stone-400
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    routePolyline.setMap(map);
    objectsOnMap.current.push(routePolyline);

    // Markers for start, end
    data.markers?.forEach(markerInfo => {
      const marker = new google.maps.Marker({
        position: markerInfo.position,
        map,
        label: {
            text: markerInfo.type === 'start' ? 'A' : 'B',
            color: 'white',
            fontWeight: 'bold',
        },
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: markerInfo.type === 'start' ? '#16a34a' : '#dc2626', // green-600, red-600
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'white',
        },
        title: markerInfo.label
      });
      objectsOnMap.current.push(marker);
    });
    
    const totalLength = google.maps.geometry.spherical.computeLength(routePath);
    const stopIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        fillColor: '#78716c', // stone-500
        fillOpacity: 1,
        strokeWeight: 0,
    };
     const highlightedStopIcon = {
        ...stopIcon,
        scale: 8,
        fillColor: '#f59e0b', // amber-500
        strokeColor: 'white',
        strokeWeight: 2,
    };

    data.stops?.forEach(stopInfo => {
       const stopMarker = new google.maps.Marker({
        position: stopInfo.position,
        map,
        icon: stopIcon,
        title: stopInfo.name
      });
      objectsOnMap.current.push(stopMarker);

      // --- Calculate stop percentage along route ---
      let minDistance = Number.MAX_VALUE;
      let closestVertexIndex = -1;
      routePath.forEach((vertex, index) => {
          const distance = google.maps.geometry.spherical.computeDistanceBetween(vertex, stopMarker.getPosition());
          if (distance < minDistance) {
              minDistance = distance;
              closestVertexIndex = index;
          }
      });
      
      if (closestVertexIndex !== -1) {
          const pathLengthToStop = google.maps.geometry.spherical.computeLength(routePath.slice(0, closestVertexIndex + 1));
          const stopPercent = (pathLengthToStop / totalLength) * 100;
          stopMarkersRef.current.push({ marker: stopMarker, percent: stopPercent });
      }
    });
    // Sort stops by their percentage to make finding the "next" one easier
    stopMarkersRef.current.sort((a, b) => a.percent - b.percent);


    // --- Bus Animation Setup ---
    const busIcon = {
        path: 'M18.5,4H5.5C4.67,4,4,4.67,4,5.5v10c0,0.83,0.67,1.5,1.5,1.5H6c0,1.66,1.34,3,3,3s3-1.34,3-3h3c0,1.66,1.34,3,3,3s3-1.34,3-3h0.5c0.83,0,1.5-0.67,1.5-1.5V5.5C20,4.67,19.33,4,18.5,4z M9,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S9.83,18.5,9,18.5z M15,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S15.83,18.5,15,18.5z M18.5,13H5.5V5.5h13V13z',
        fillColor: '#4f46e5', // indigo-600
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: 'white',
        rotation: 0,
        scale: 1,
        anchor: new google.maps.Point(12, 12),
    };

    const busStates = Array.from({ length: numberOfBuses }, (_, i) => ({
      offset: (100 / numberOfBuses) * i + Math.random() * 10,
      speed: 0.05 + Math.random() * 0.05,
    }));
    
    const animationPolyline = new google.maps.Polyline({
        path: routePath,
        map: map,
        strokeOpacity: 0, // Invisible
    });
    objectsOnMap.current.push(animationPolyline);

    const animateBuses = () => {
      let totalProgress = 0;
      busStates.forEach(bus => {
        bus.offset = (bus.offset + bus.speed) % 100;
        totalProgress += bus.offset;
      });
      
      const avgProgress = totalProgress / busStates.length;
      onProgressUpdate?.(avgProgress);

      // Highlight upcoming stops
      stopMarkersRef.current.forEach(sm => sm.marker.setIcon(stopIcon)); // Reset all first
      
      busStates.forEach(bus => {
          // Find the next stop for this bus
          const nextStop = stopMarkersRef.current.find(sm => sm.percent > bus.offset);
          if (nextStop) {
              const distanceToStop = nextStop.percent - bus.offset;
              // Highlight if within 5% of the route distance
              if (distanceToStop > 0 && distanceToStop < 5) {
                  nextStop.marker.setIcon(highlightedStopIcon);
              }
          }
      });


      const icons = busStates.map(bus => ({
        icon: busIcon,
        offset: `${bus.offset}%`,
      }));

      animationPolyline.setOptions({ icons: icons });
    };

    animationInterval.current = window.setInterval(animateBuses, 50);

    return () => {
        if (animationInterval.current) {
            clearInterval(animationInterval.current);
        }
        // FIX: The right-hand side of an 'instanceof' expression must be of type 'any' or a function type.
         objectsOnMap.current.forEach(obj => {
          if (obj && typeof obj.setMap === 'function') {
            obj.setMap(null);
          }
        });
        objectsOnMap.current = [];
    };

  }, [data, numberOfBuses, onProgressUpdate]);

  return <div ref={mapRef} className="w-full h-96 md:h-[500px] rounded-lg border border-slate-300 shadow-md" />;
};

export default RouteMap;
