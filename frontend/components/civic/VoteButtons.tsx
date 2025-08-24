import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { IssueService, type Issue } from "@/services/IssueService";
import { useIssueActions } from "@/hooks/useIssues";
import { useVotedIssues } from "@/hooks/useVotedIssues";
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
  const { hasVotedLocally, addVotedIssue, removeVotedIssue } = useVotedIssues();
  const [isVoting, setIsVoting] = useState(false);

  // Check if user has already voted (either on blockchain or locally)
  const hasVotedOnBlockchain = variant === "verification" 
    ? IssueService.hasUserVoted(issue, userAddress)
    : IssueService.hasUserVotedOnCompletion(issue, userAddress);
    
  const hasVotedLocal = hasVotedLocally(issue.id, variant);
  const hasVoted = hasVotedOnBlockchain || hasVotedLocal;

  // Debug logging
  console.log(`=== VOTE BUTTONS DEBUG (Issue ${issue.id}) ===`);
  console.log("Variant:", variant);
  console.log("Issue Status:", issue.status);
  console.log("User Address:", userAddress);
  console.log("Has Voted on Blockchain:", hasVotedOnBlockchain);
  console.log("Has Voted Locally:", hasVotedLocal);
  console.log("Has Voted (Combined):", hasVoted);
  if (variant === "verification") {
    console.log("Initial Voters:", issue.initial_voters);
  } else {
    console.log("Completion Voters:", issue.completion_voters);
  }
  console.log("===========================================");

  // Create a unique key for this voting session to maintain state across re-renders
  const votingKey = `${issue.id}-${variant}-${userAddress}`;
  
  // Use localStorage to persist voting state across component re-renders
  const isCurrentlyVoting = isVoting || localStorage.getItem(`voting-${votingKey}`) === 'true';

  // Don't show buttons if user has already voted or is currently voting
  if (hasVoted || isCurrentlyVoting) {
    return (
      <div className="text-sm text-muted-foreground">
        {isCurrentlyVoting ? "Processing your vote..." : "You have already voted on this issue"}
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
    // Prevent multiple simultaneous voting attempts
    if (isCurrentlyVoting) {
      return;
    }

    setIsVoting(true);
    localStorage.setItem(`voting-${votingKey}`, 'true'); // Persist voting state
    addVotedIssue(issue.id, variant); // Immediately mark as voted locally for UI feedback
    
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

      // Immediately invalidate to trigger refetch
      invalidateIssues();
      
      // Set up delayed refetches with increasing intervals for better reliability
      setTimeout(() => invalidateIssues(), 2000);  // 2 seconds
      setTimeout(() => invalidateIssues(), 5000);  // 5 seconds  
      setTimeout(() => invalidateIssues(), 10000); // 10 seconds
      
    } catch (error) {
      console.error("Error voting:", error);
      removeVotedIssue(issue.id, variant); // Revert local state on error
      localStorage.removeItem(`voting-${votingKey}`); // Clear voting state on error
      toast({
        variant: "destructive",
        title: "Failed to Submit Vote",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsVoting(false);
      // Clear voting state after a delay to ensure blockchain has processed
      setTimeout(() => {
        localStorage.removeItem(`voting-${votingKey}`);
      }, 15000); // Clear after 15 seconds
    }
  };

  if (variant === "verification") {
    return (
      <div className="flex gap-3">
        <Button
          onClick={() => handleVote(true)}
          disabled={isCurrentlyVoting}
          size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 font-bold"
        >
          {isCurrentlyVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
          <span>Confirm</span>
          <span className="bg-white/20 text-white text-xs font-black px-2 py-1 rounded-full">
            {issue.confirm_votes}
          </span>
        </Button>
        <Button
          onClick={() => handleVote(false)}
          disabled={isCurrentlyVoting}
          size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 font-bold"
        >
          {isCurrentlyVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}
          <span>Spam</span>
          <span className="bg-white/20 text-white text-xs font-black px-2 py-1 rounded-full">
            {issue.spam_votes}
          </span>
        </Button>
      </div>
    );
  }

  if (variant === "completion") {
    return (
      <div className="flex gap-3">
        <Button
          onClick={() => handleVote(true)}
          disabled={isCurrentlyVoting}
          size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 font-bold"
        >
          {isCurrentlyVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span>Resolved</span>
          <span className="bg-white/20 text-white text-xs font-black px-2 py-1 rounded-full">
            {issue.resolved_votes}
          </span>
        </Button>
        <Button
          onClick={() => handleVote(false)}
          disabled={isCurrentlyVoting}
          size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 font-bold"
        >
          {isCurrentlyVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span>Not Resolved</span>
          <span className="bg-white/20 text-white text-xs font-black px-2 py-1 rounded-full">
            {issue.not_resolved_votes}
          </span>
        </Button>
      </div>
    );
  }

  return null;
}
