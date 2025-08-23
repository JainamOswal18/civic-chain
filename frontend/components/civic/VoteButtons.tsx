import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { IssueService, type Issue } from "@/services/IssueService";
import { useIssueActions } from "@/hooks/useIssues";
import { ISSUE_STATUS } from "@/constants";
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface VoteButtonsProps {
  issue: Issue;
  userAddress: string;
  variant: "verification" | "completion";
}

export function VoteButtons({ issue, userAddress, variant }: VoteButtonsProps) {
  const { signAndSubmitTransaction } = useWallet();
  const { invalidateIssues } = useIssueActions();
  const [isVoting, setIsVoting] = useState(false);

  // Check if user has already voted
  const hasVoted = variant === "verification" 
    ? IssueService.hasUserVoted(issue, userAddress)
    : IssueService.hasUserVotedOnCompletion(issue, userAddress);

  // Don't show buttons if user has already voted
  if (hasVoted) {
    return (
      <div className="text-sm text-muted-foreground">
        You have already voted on this issue
      </div>
    );
  }

  // Don't show verification buttons if not in pending verification status
  if (variant === "verification" && issue.status !== ISSUE_STATUS.PENDING_VERIFICATION) {
    return null;
  }

  // Don't show completion buttons if not in pending completion verification status
  if (variant === "completion" && issue.status !== ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION) {
    return null;
  }

  const handleVote = async (isPositive: boolean) => {
    setIsVoting(true);
    try {
      const transaction = variant === "verification"
        ? IssueService.voteOnIssue(issue.id, isPositive)
        : IssueService.voteOnCompletion(issue.id, isPositive);

      const result = await signAndSubmitTransaction(transaction);
      
      const voteType = variant === "verification" 
        ? (isPositive ? "confirmed" : "marked as spam")
        : (isPositive ? "marked as resolved" : "marked as not resolved");

      toast({
        title: "Vote Submitted",
        description: `You have ${voteType} this issue. Transaction: ${result.hash}`,
      });

      // Wait a moment for blockchain to process, then refresh all issue-related data
      setTimeout(() => {
        invalidateIssues(); // This invalidates all queries starting with ["issues"]
      }, 1000);
      
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        variant: "destructive",
        title: "Failed to Submit Vote",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (variant === "verification") {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => handleVote(true)}
          disabled={isVoting}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {isVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
          Confirm ({issue.confirm_votes})
        </Button>
        <Button
          onClick={() => handleVote(false)}
          disabled={isVoting}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {isVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}
          Spam ({issue.spam_votes})
        </Button>
      </div>
    );
  }

  if (variant === "completion") {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => handleVote(true)}
          disabled={isVoting}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {isVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Resolved ({issue.resolved_votes})
        </Button>
        <Button
          onClick={() => handleVote(false)}
          disabled={isVoting}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {isVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Not Resolved ({issue.not_resolved_votes})
        </Button>
      </div>
    );
  }

  return null;
}
