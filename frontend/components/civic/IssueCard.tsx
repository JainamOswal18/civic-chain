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
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case ISSUE_STATUS.VERIFIED:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case ISSUE_STATUS.ACKNOWLEDGED:
        return "bg-purple-100 text-purple-800 border-purple-300";
      case ISSUE_STATUS.IN_PROGRESS:
        return "bg-orange-100 text-orange-800 border-orange-300";
      case ISSUE_STATUS.COMPLETED:
        return "bg-green-100 text-green-800 border-green-300";
      case ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION:
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case ISSUE_STATUS.FULLY_RESOLVED:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case ISSUE_STATUS.SPAM:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">
            {issue.category}
          </CardTitle>
          <Badge className={`${getStatusColor(issue.status)} border`}>
            {STATUS_LABELS[issue.status as keyof typeof STATUS_LABELS]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Reporter: {formatAddress(issue.reporter)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Reported: {formatDate(issue.created_at)}</span>
          </div>

          {showLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Ward: {issue.ward}</span>
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
