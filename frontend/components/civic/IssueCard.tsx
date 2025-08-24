import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "./VoteButtons";
import { type Issue } from "@/services/IssueService";
import { ImageService } from "@/services/ImageService";
import { STATUS_LABELS, ISSUE_STATUS } from "@/constants";
import { MapPin, Calendar, User, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useState } from "react";

interface IssueCardProps {
  issue: Issue;
  userAddress?: string;
  showVoting?: boolean;
  showLocation?: boolean;
}

export function IssueCard({ 
  issue, 
  userAddress, 
  showVoting = false, 
  showLocation = true 
}: IssueCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case ISSUE_STATUS.PENDING_VERIFICATION:
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-200 shadow-lg";
      case ISSUE_STATUS.VERIFIED:
        return "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border-amber-200 shadow-lg";
      case ISSUE_STATUS.ACKNOWLEDGED:
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-200 shadow-lg";
      case ISSUE_STATUS.IN_PROGRESS:
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-200 shadow-lg";
      case ISSUE_STATUS.COMPLETED:
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-200 shadow-lg";
      case ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION:
        return "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border-cyan-200 shadow-lg";
      case ISSUE_STATUS.FULLY_RESOLVED:
        return "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-200 shadow-lg";
      case ISSUE_STATUS.SPAM:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-200 shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-200 shadow-lg";
    }
  };

  const shouldShowVerificationVoting = 
    showVoting && 
    userAddress && 
    issue.status === ISSUE_STATUS.PENDING_VERIFICATION;

  const shouldShowCompletionVoting = 
    showVoting && 
    userAddress && 
    issue.status === ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION;

  return (
    <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100/50">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-black text-gray-900 leading-tight flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {issue.category}
          </CardTitle>
          <Badge className={`${getStatusColor(issue.status)} border font-bold px-3 py-1.5 text-sm rounded-full`}>
            {STATUS_LABELS[issue.status as keyof typeof STATUS_LABELS]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {issue.description}
        </p>

        {/* Image Gallery */}
        {issue.image_cid && issue.image_filenames && issue.image_filenames.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {issue.image_filenames.length} image{issue.image_filenames.length > 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {issue.image_filenames.map((filename, index) => {
                const imageUrl = ImageService.getImageUrl(issue.image_cid, filename);
                return (
                  <div 
                    key={index} 
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group relative"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Issue image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Image Modal/Lightbox */}
        {selectedImageIndex !== null && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={ImageService.getImageUrl(issue.image_cid, issue.image_filenames[selectedImageIndex])}
                alt={`Issue image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Navigation */}
              {issue.image_filenames.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(
                        selectedImageIndex > 0 ? selectedImageIndex - 1 : issue.image_filenames.length - 1
                      );
                    }}
                    className="px-3 py-1 bg-white bg-opacity-20 text-white rounded hover:bg-opacity-30 transition-all"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-white bg-opacity-20 text-white rounded">
                    {selectedImageIndex + 1} / {issue.image_filenames.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(
                        selectedImageIndex < issue.image_filenames.length - 1 ? selectedImageIndex + 1 : 0
                      );
                    }}
                    className="px-3 py-1 bg-white bg-opacity-20 text-white rounded hover:bg-opacity-30 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Close button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-all flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Issue Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Reporter</div>
              <div className="font-mono text-sm font-bold text-gray-800">{formatAddress(issue.reporter)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Reported</div>
              <div className="text-sm font-bold text-gray-800">{formatDate(issue.created_at)}</div>
            </div>
          </div>

          {showLocation && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Location</div>
                <div className="text-sm font-bold text-gray-800">Ward {issue.ward}</div>
              </div>
            </div>
          )}

          {issue.completed_at > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Completed: {formatDate(issue.completed_at)}</span>
            </div>
          )}
        </div>

        {/* Location Coordinates */}
        {showLocation && (
          <div className="text-xs text-muted-foreground">
            Location: {parseFloat(issue.latitude).toFixed(6)}, {parseFloat(issue.longitude).toFixed(6)}
          </div>
        )}

        {/* Voting Section */}
        {(shouldShowVerificationVoting || shouldShowCompletionVoting) && (
          <div className="pt-3 border-t">
            {shouldShowVerificationVoting && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Verify this issue:</h4>
                <VoteButtons 
                  issue={issue} 
                  userAddress={userAddress!} 
                  variant="verification" 
                />
              </div>
            )}
            
            {shouldShowCompletionVoting && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Is this issue resolved?</h4>
                <VoteButtons 
                  issue={issue} 
                  userAddress={userAddress!} 
                  variant="completion" 
                />
              </div>
            )}
          </div>
        )}

        {/* Vote Counts Display */}
        {(issue.status === ISSUE_STATUS.PENDING_VERIFICATION || 
          issue.status === ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION) && (
          <div className="pt-2 border-t">
            <div className="flex gap-4 text-xs text-muted-foreground">
              {issue.status === ISSUE_STATUS.PENDING_VERIFICATION ? (
                <>
                  <span>Confirms: {issue.confirm_votes}</span>
                  <span>Spam reports: {issue.spam_votes}</span>
                </>
              ) : (
                <>
                  <span>Resolved votes: {issue.resolved_votes}</span>
                  <span>Not resolved votes: {issue.not_resolved_votes}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
