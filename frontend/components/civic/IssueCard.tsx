import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "./VoteButtons";
import { type Issue } from "@/services/IssueService";
import { STATUS_LABELS, ISSUE_STATUS } from "@/constants";
import { MapPin, Calendar, User } from "lucide-react";

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
