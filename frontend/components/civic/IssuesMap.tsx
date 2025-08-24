import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, MapPin, Clock, User, Map as MapIcon, X, ExternalLink, Calendar, Vote as VoteIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ISSUE_STATUS, STATUS_LABELS } from '@/constants';
import { type Issue } from '@/services/IssueService';
import { ImageService } from '@/services/ImageService';
import { VoteButtons } from './VoteButtons';
import { useWallet } from "@aptos-labs/wallet-adapter-react";

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
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { account } = useWallet();

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
      <div class="relative z-50 flex items-center justify-center" style="z-index: 1000;">
        <!-- Outer pulsing ring -->
        <div class="absolute w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
        <div class="absolute w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-40 animation-delay-300"></div>
        
        <!-- Main marker body -->
        <div class="relative w-6 h-6 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full border-2 border-white shadow-2xl">
          <!-- Inner glow -->
          <div class="absolute inset-0.5 bg-gradient-to-br from-white to-blue-100 rounded-full opacity-30"></div>
          
          <!-- Center dot -->
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-inner"></div>
          
          <!-- Directional indicator (small arrow pointing up) -->
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div class="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-white drop-shadow-sm"></div>
          </div>
        </div>
        
        <!-- Accuracy circle -->
        <div class="absolute w-16 h-16 border border-blue-300 rounded-full opacity-25 animate-pulse"></div>
      </div>
      
      <style>
        @keyframes delayed-ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      </style>
    `;

    return L.divIcon({
      html: markerHtml,
      className: 'user-location-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
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

  // Open issue details modal
  const openIssueDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailsModalOpen(true);
  };

  // Close issue details modal
  const closeIssueDetails = () => {
    setSelectedIssue(null);
    setIsDetailsModalOpen(false);
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

      {/* Legend - Dynamic based on issues present */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[220px]">
        <h4 className="text-sm font-semibold mb-2">Issue Status</h4>
        <div className="space-y-1.5">
          {/* Show only statuses that exist in current issues */}
          {[
            { status: ISSUE_STATUS.PENDING_VERIFICATION, color: '#ef4444', label: 'Pending Verification' },
            { status: ISSUE_STATUS.VERIFIED, color: '#f59e0b', label: 'Verified' },
            { status: ISSUE_STATUS.ACKNOWLEDGED, color: '#3b82f6', label: 'Acknowledged' },
            { status: ISSUE_STATUS.IN_PROGRESS, color: '#8b5cf6', label: 'In Progress' },
            { status: ISSUE_STATUS.COMPLETED, color: '#10b981', label: 'Completed' },
            { status: ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION, color: '#06b6d4', label: 'Pending Completion' },
            { status: ISSUE_STATUS.FULLY_RESOLVED, color: '#22c55e', label: 'Fully Resolved' },
            { status: ISSUE_STATUS.SPAM, color: '#6b7280', label: 'Spam' }
          ]
            .filter(statusInfo => issues.some(issue => issue.status === statusInfo.status))
            .map(statusInfo => (
              <div key={statusInfo.status} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-200" 
                  style={{ backgroundColor: statusInfo.color }}
                ></div>
                <span>{statusInfo.label}</span>
                <span className="text-gray-400 ml-auto">
                  ({issues.filter(issue => issue.status === statusInfo.status).length})
                </span>
              </div>
            ))}
          
          {/* Show all statuses if no issues are present */}
          {issues.length === 0 && [
            { color: '#ef4444', label: 'Pending Verification' },
            { color: '#f59e0b', label: 'Verified' },
            { color: '#3b82f6', label: 'Acknowledged' },
            { color: '#8b5cf6', label: 'In Progress' },
            { color: '#10b981', label: 'Completed' },
            { color: '#06b6d4', label: 'Pending Completion' },
            { color: '#22c55e', label: 'Fully Resolved' },
            { color: '#6b7280', label: 'Spam' }
          ].map((statusInfo, index) => (
            <div key={index} className="flex items-center gap-2 text-xs opacity-60">
              <div 
                className="w-3 h-3 rounded-full border border-gray-200" 
                style={{ backgroundColor: statusInfo.color }}
              ></div>
              <span>{statusInfo.label}</span>
            </div>
          ))}
          
          {userLocation && (
            <div className="flex items-center gap-2 text-xs pt-2 border-t mt-2">
              <div className="relative w-4 h-4 flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border border-white shadow-sm"></div>
                <div className="absolute w-4 h-4 border border-blue-300 rounded-full opacity-30"></div>
              </div>
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
                    onClick={() => openIssueDetails(issue)}
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
            <Popup className="custom-popup" maxWidth={250}>
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-base text-gray-900">Your Location</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  📍 Current position detected
                </p>
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Coordinates: {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Issue Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={closeIssueDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedIssue && (
            <>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Issue #{selectedIssue.id}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(selectedIssue.status)}`}>
                    {STATUS_LABELS[selectedIssue.status as keyof typeof STATUS_LABELS]}
                  </Badge>
                  <Badge variant="outline">
                    {selectedIssue.category}
                  </Badge>
                  <Badge variant="outline">
                    Ward {selectedIssue.ward}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 py-4">
                {/* Left Column - Main Information */}
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedIssue.description}
                    </p>
                  </div>

                  {/* Location & Meta Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>Ward {selectedIssue.ward}</span>
                        {userLocation && (
                          <span className="text-gray-500">
                            • {calculateDistance(
                              userLocation[0], 
                              userLocation[1], 
                              parseCoordinate(selectedIssue.latitude), 
                              parseCoordinate(selectedIssue.longitude)
                            ).toFixed(1)} km away
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Reported {formatTimeAgo(selectedIssue.created_at * 1000)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Reporter: {selectedIssue.reporter.slice(0, 12)}...{selectedIssue.reporter.slice(-8)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Voting Section */}
                  {(selectedIssue.status === ISSUE_STATUS.PENDING_VERIFICATION || 
                    selectedIssue.status === ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION) && account && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <VoteIcon className="w-5 h-5" />
                        Community Voting
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        {selectedIssue.status === ISSUE_STATUS.PENDING_VERIFICATION && (
                          <div>
                            <p className="text-sm text-gray-600 mb-3">
                              Help verify if this is a legitimate civic issue:
                            </p>
                            <VoteButtons 
                              issue={selectedIssue} 
                              userAddress={account.address.toString()} 
                              variant="verification" 
                            />
                          </div>
                        )}
                        {selectedIssue.status === ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION && (
                          <div>
                            <p className="text-sm text-gray-600 mb-3">
                              Has this issue been resolved?
                            </p>
                            <VoteButtons 
                              issue={selectedIssue} 
                              userAddress={account.address.toString()} 
                              variant="completion" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vote Counts */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Vote Summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedIssue.status >= ISSUE_STATUS.PENDING_VERIFICATION && (
                        <>
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-semibold text-green-800">{selectedIssue.confirm_votes}</div>
                              <div className="text-xs text-green-600">Confirmed</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                              <div className="font-semibold text-red-800">{selectedIssue.spam_votes}</div>
                              <div className="text-xs text-red-600">Spam Reports</div>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedIssue.status >= ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION && (
                        <>
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <div>
                              <div className="font-semibold text-emerald-800">{selectedIssue.resolved_votes}</div>
                              <div className="text-xs text-emerald-600">Resolved</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            <div>
                              <div className="font-semibold text-orange-800">{selectedIssue.not_resolved_votes}</div>
                              <div className="text-xs text-orange-600">Not Resolved</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Images */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Visual Evidence</h3>
                  {selectedIssue.image_filenames && selectedIssue.image_filenames.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedIssue.image_filenames.map((filename, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={ImageService.getImageUrl(selectedIssue.image_cid, filename)}
                            alt={`Issue evidence ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Open image in new tab
                              window.open(ImageService.getImageUrl(selectedIssue.image_cid, filename), '_blank');
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-gray-400" />
                      </div>
                      <p>No visual evidence provided</p>
                    </div>
                  )}

                  {/* Coordinates */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Location Coordinates</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Latitude: {selectedIssue.latitude}</div>
                      <div>Longitude: {selectedIssue.longitude}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => {
                        const lat = parseCoordinate(selectedIssue.latitude);
                        const lng = parseCoordinate(selectedIssue.longitude);
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
