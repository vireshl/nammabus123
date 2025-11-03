import React, { useEffect, useRef, FC } from 'react';
import type { SingleBusData } from '../types';

declare const google: any;

interface SingleBusMapProps {
  data: SingleBusData;
}

const mapStyles: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
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

const SingleBusMap: FC<SingleBusMapProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any | null>(null);
  const objectsOnMap = useRef<any[]>([]);
  const pulseInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (!google || !google.maps) {
        console.error("Google Maps API not loaded.");
        return;
    }

    if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
            center: data.currentLocation,
            zoom: 15,
            styles: mapStyles,
            disableDefaultUI: true,
            zoomControl: true,
        });
    }
  }, [data.currentLocation]);

  useEffect(() => {
    if (!mapInstance.current || !data) return;
    
    const map = mapInstance.current;

    // --- Cleanup previous objects ---
    objectsOnMap.current.forEach(obj => obj.setMap(null));
    objectsOnMap.current = [];
    if (pulseInterval.current) {
        clearInterval(pulseInterval.current);
    }
    
    // --- Create new objects ---
    let heading = 0;

    // 1. Route Polyline
    if (data.routePolyline && data.routePolyline.length > 1) {
        const routePath = data.routePolyline.map(p => new google.maps.LatLng(p.lat, p.lng));
        const routePolyline = new google.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: '#4f46e5', // indigo-600
            strokeOpacity: 0.7,
            strokeWeight: 6,
        });
        routePolyline.setMap(map);
        objectsOnMap.current.push(routePolyline);

        // Calculate heading for bus icon rotation
        heading = google.maps.geometry.spherical.computeHeading(routePath[0], routePath[routePath.length - 1]);
    }

    // 2. Bus Marker (with pulse animation and rotation)
    const busIcon = {
        path: 'M18.5,4H5.5C4.67,4,4,4.67,4,5.5v10c0,0.83,0.67,1.5,1.5,1.5H6c0,1.66,1.34,3,3,3s3-1.34,3-3h3c0,1.66,1.34,3,3,3s3-1.34,3-3h0.5c0.83,0,1.5-0.67,1.5-1.5V5.5C20,4.67,19.33,4,18.5,4z M9,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S9.83,18.5,9,18.5z M15,18.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S15.83,18.5,15,18.5z M18.5,13H5.5V5.5h13V13z',
        fillColor: '#4f46e5', // indigo-600
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: 'white',
        rotation: heading,
        scale: 1.2,
        anchor: new google.maps.Point(12, 12),
    };
    const busMarker = new google.maps.Marker({
        position: data.currentLocation,
        map: map,
        icon: busIcon,
        title: 'Bus Location',
        zIndex: 100
    });
    objectsOnMap.current.push(busMarker);
    pulseInterval.current = window.setInterval(() => {
        const currentIcon = busMarker.getIcon();
        if (currentIcon) {
            const currentScale = currentIcon.scale;
            busMarker.setIcon({
                ...busIcon,
                scale: currentScale === 1.2 ? 1.4 : 1.2
            });
        }
    }, 700);

    // 3. Nearest Stop Marker
    const nearestStopMarker = new google.maps.Marker({
        position: data.nearestStop.position,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#f59e0b', // amber-500
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'white',
        },
        title: `Nearest: ${data.nearestStop.name}`,
        zIndex: 99
    });
    objectsOnMap.current.push(nearestStopMarker);
    
    // 4. Upcoming Stops Markers
    const upcomingStopIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: '#6b7280', // gray-500
        fillOpacity: 1,
        strokeWeight: 1.5,
        strokeColor: 'white',
    };
    data.upcomingStops.forEach(stop => {
        const stopMarker = new google.maps.Marker({
            position: stop.position,
            map: map,
            icon: upcomingStopIcon,
            title: `Upcoming: ${stop.name}`
        });
        objectsOnMap.current.push(stopMarker);
    });

    // --- Adjust map bounds ---
    const bounds = new google.maps.LatLngBounds();
    objectsOnMap.current.forEach(obj => {
        if (obj instanceof google.maps.Marker) {
            bounds.extend(obj.getPosition());
        } else if (obj instanceof google.maps.Polyline) {
            obj.getPath().forEach((pt: any) => bounds.extend(pt));
        }
    });

    if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    }

    return () => {
        if (pulseInterval.current) {
            clearInterval(pulseInterval.current);
        }
    }

  }, [data]);

  return <div ref={mapRef} className="w-full h-80 md:h-96 rounded-lg border border-slate-300 dark:border-slate-700 shadow-md" />;
};

export default SingleBusMap;