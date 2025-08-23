import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Clock, User, Map as MapIcon } from 'lucide-react';
import { ISSUE_STATUS, STATUS_LABELS } from '@/constants';
import { type Issue } from '@/services/IssueService';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



interface IssuesMapProps {
  issues: Issue[];
  center: [number, number];
  userLocation?: [number, number];
  hasNewData?: boolean;
  className?: string;
}

// Status colors based on your ISSUE_STATUS constants
const statusColors: Record<number, string> = {
  [ISSUE_STATUS.PENDING_VERIFICATION]: '#ef4444', // Red
  [ISSUE_STATUS.VERIFIED]: '#f59e0b', // Amber  
  [ISSUE_STATUS.ACKNOWLEDGED]: '#3b82f6', // Blue
  [ISSUE_STATUS.IN_PROGRESS]: '#8b5cf6', // Purple
  [ISSUE_STATUS.COMPLETED]: '#10b981', // Emerald
  [ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION]: '#06b6d4', // Cyan
  [ISSUE_STATUS.FULLY_RESOLVED]: '#22c55e', // Green
  [ISSUE_STATUS.SPAM]: '#6b7280', // Gray
};

// Category colors
const categoryColors: Record<string, string> = {
  'roads': '#ef4444',
  'lighting': '#f59e0b',
  'water': '#0ea5e9',
  'cleanliness': '#22c55e',
  'safety': '#a855f7',
  'infrastructure': '#f97316',
  'transport': '#8b5cf6',
  'environment': '#10b981',
  'other': '#6b7280',
};

export function IssuesMap({ issues, center, userLocation, hasNewData = false, className = "" }: IssuesMapProps) {
  const mapRef = useRef<L.Map>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("IssuesMap - userLocation:", userLocation);
    console.log("IssuesMap - center:", center);
    console.log("IssuesMap - issues count:", issues.length);
  }, [userLocation, center, issues.length]);

  // Memoize the center position to prevent unnecessary re-renders
  const mapCenter = useMemo(() => center, [center[0], center[1]]);

  // Create custom markers for each issue
  const createCustomMarker = (issue: Issue) => {
    const statusColor = statusColors[issue.status] || '#6b7280';
    const categoryColor = categoryColors[issue.category.toLowerCase()] || '#6b7280';
    
    // Create a custom icon with status color as fill and category color as border
    const markerHtml = `
      <div class="relative">
        <div class="w-6 h-6 rounded-full border-2 shadow-lg" 
             style="background-color: ${statusColor}; border-color: ${categoryColor};">
        </div>
        ${issue.status === ISSUE_STATUS.FULLY_RESOLVED ? 
          '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>' : 
          ''}
      </div>
    `;

    return L.divIcon({
      html: markerHtml,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Create user location marker with higher z-index
  const createUserLocationMarker = () => {
    const markerHtml = `
      <div class="relative z-50" style="z-index: 1000;">
        <div class="w-5 h-5 bg-blue-600 rounded-full border-3 border-white shadow-xl animate-pulse"></div>
        <div class="absolute inset-0 w-5 h-5 bg-blue-400 rounded-full animate-ping opacity-60"></div>
        <div class="absolute inset-0 w-8 h-8 -m-1.5 bg-blue-200 rounded-full animate-ping opacity-30"></div>
      </div>
    `;

    return L.divIcon({
      html: markerHtml,
      className: 'user-location-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case ISSUE_STATUS.PENDING_VERIFICATION:
        return "bg-red-100 text-red-800 border-red-200";
      case ISSUE_STATUS.VERIFIED:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case ISSUE_STATUS.ACKNOWLEDGED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case ISSUE_STATUS.IN_PROGRESS:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case ISSUE_STATUS.COMPLETED:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION:
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case ISSUE_STATUS.FULLY_RESOLVED:
        return "bg-green-100 text-green-800 border-green-200";
      case ISSUE_STATUS.SPAM:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Convert string coordinates to numbers
  const parseCoordinate = (coord: string): number => {
    const num = parseFloat(coord);
    return isNaN(num) ? 0 : num;
  };

  // Pan to center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(mapCenter, {
        animate: true,
        duration: 0.5
      });
    }
  }, [mapCenter]);

  // Error boundary for map rendering
  if (mapError) {
    return (
      <div className={`relative h-full w-full rounded-lg overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-gray-600 mb-4">Unable to load the interactive map.</p>
          <Button onClick={() => setMapError(null)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full rounded-lg overflow-hidden shadow-lg ${className}`}>
      <AnimatePresence>
        {hasNewData && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute top-4 right-4 z-[1000] bg-blue-500 text-white px-3 py-1 rounded-full text-sm shadow-lg"
          >
            New Issues Found!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[200px]">
        <h4 className="text-sm font-semibold mb-2">Issue Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Resolved</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 text-xs pt-1 border-t">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span>Your Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Issues count */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="text-xs text-gray-600">
          <span className="font-semibold text-blue-600">{issues.length}</span> issues found
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={mapRef}
        preferCanvas={true}
        minZoom={3}
        maxZoom={18}
        whenReady={() => {
          try {
            // Map is ready
            console.log('Map initialized successfully');
          } catch (error) {
            console.error('Map creation error:', error);
            setMapError('Failed to initialize map');
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          updateWhenZooming={false}
          updateWhenIdle={true}
          keepBuffer={2}
          maxZoom={18}
          minZoom={3}
        />

        {/* Render markers for all issues first */}
        {issues.map((issue) => {
          const lat = parseCoordinate(issue.latitude);
          const lng = parseCoordinate(issue.longitude);
          
          // Skip issues with invalid coordinates
          if (lat === 0 && lng === 0) return null;
          
          const distance = userLocation ? 
            calculateDistance(userLocation[0], userLocation[1], lat, lng) : 0;

          return (
            <Marker
              key={issue.id}
              position={[lat, lng]}
              icon={createCustomMarker(issue)}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-3 min-w-[280px]">
                  {/* Issue Header */}
                  <h4 className="font-semibold text-base mb-2">Issue #{issue.id}</h4>

                  {/* Issue Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {issue.description}
                  </p>

                  {/* Status and Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                      {STATUS_LABELS[issue.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {issue.category}
                    </Badge>
                  </div>

                  {/* Meta Information */}
                  <div className="space-y-2 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Ward {issue.ward}</span>
                      {userLocation && (
                        <span className="ml-2">• {distance.toFixed(1)} km away</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(issue.created_at * 1000)}</span>
                    </div>
                  </div>

                  {/* Voting Information */}
                  {(issue.confirm_votes > 0 || issue.spam_votes > 0) && (
                    <div className="flex items-center gap-3 text-xs mb-3 p-2 bg-gray-50 rounded">
                      <span className="text-green-600">✓ {issue.confirm_votes}</span>
                      <span className="text-red-600">⚠ {issue.spam_votes}</span>
                    </div>
                  )}

                  {/* Reporter (truncated) */}
                  <div className="text-xs text-gray-500 mb-3">
                    <User className="w-3 h-3 inline mr-1" />
                    Reported by: {issue.reporter.slice(0, 8)}...{issue.reporter.slice(-6)}
                  </div>

                  {/* View Details Button */}
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // You can add navigation logic here if needed
                      console.log(`View details for issue ${issue.id}`);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* User location marker - rendered last to appear on top */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationMarker()}
            zIndexOffset={1000}
            eventHandlers={{
              add: () => console.log("User location marker added to map"),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-sm">Your Location</span>
                </div>
                <p className="text-xs text-gray-600">
                  Current position detected
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
