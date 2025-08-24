import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IssueService, type Issue } from "@/services/IssueService";
import { ISSUE_STATUS } from "@/constants";
import { useVotedIssues } from "./useVotedIssues";

export function useAllIssues() {
  return useQuery({
    queryKey: ["issues", "all"],
    queryFn: () => IssueService.getAllIssues(),
    refetchInterval: 15000, // More frequent refetch every 15 seconds
    staleTime: 5000, // Consider data stale after 5 seconds (more aggressive)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

export function useIssuesByWard(ward: number | null) {
  return useQuery({
    queryKey: ["issues", "ward", ward],
    queryFn: () => ward !== null ? IssueService.getIssuesByWard(ward) : Promise.resolve([]),
    enabled: ward !== null,
    refetchInterval: 15000, // More frequent refetch
    staleTime: 5000, // More aggressive staleness
    refetchOnWindowFocus: true,
  });
}

export function useIssueActions() {
  const queryClient = useQueryClient();

  const invalidateIssues = () => {
    queryClient.invalidateQueries({ queryKey: ["issues"] });
  };

  const invalidateWardIssues = (ward: number) => {
    queryClient.invalidateQueries({ queryKey: ["issues", "ward", ward] });
  };

  const invalidateAllIssues = () => {
    queryClient.invalidateQueries({ queryKey: ["issues", "all"] });
  };

  return {
    invalidateIssues,
    invalidateWardIssues,
    invalidateAllIssues,
  };
}

// Hook for filtering issues by status with local voting state
export function useFilteredIssues(issues: Issue[] = [], filters: {
  status?: number[];
  ward?: number;
  userAddress?: string;
  excludeUserVoted?: boolean;
}) {
  const { hasVotedLocally } = useVotedIssues();
  
  const filteredIssues = issues.filter(issue => {
    // Debug logging for each issue
    const debugLog = `Issue ${issue.id} (Ward ${issue.ward}, Status ${issue.status})`;
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(issue.status)) {
        console.log(`${debugLog} - FILTERED OUT: Status not in ${filters.status}`);
        return false;
      }
    }

    // Filter by ward
    if (filters.ward !== undefined && issue.ward !== filters.ward) {
      console.log(`${debugLog} - FILTERED OUT: Ward ${issue.ward} !== ${filters.ward}`);
      return false;
    }

    // Exclude issues where user has already voted (either on blockchain or locally)
    if (filters.excludeUserVoted && filters.userAddress) {
      // Check verification voting for pending verification issues
      if (issue.status === ISSUE_STATUS.PENDING_VERIFICATION) {
        const hasVotedOnBlockchain = IssueService.hasUserVoted(issue, filters.userAddress);
        const hasVotedLocal = hasVotedLocally(issue.id, "verification");
        console.log(`${debugLog} - Verification check: blockchain=${hasVotedOnBlockchain}, local=${hasVotedLocal}`);
        if (hasVotedOnBlockchain || hasVotedLocal) {
          console.log(`${debugLog} - FILTERED OUT: Already voted on verification`);
          return false;
        }
      }
      
      // Check completion voting for pending completion verification issues
      if (issue.status === ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION) {
        const hasVotedOnBlockchain = IssueService.hasUserVotedOnCompletion(issue, filters.userAddress);
        const hasVotedLocal = hasVotedLocally(issue.id, "completion");
        console.log(`${debugLog} - Completion check: blockchain=${hasVotedOnBlockchain}, local=${hasVotedLocal}`);
        console.log(`${debugLog} - Completion voters:`, issue.completion_voters);
        console.log(`${debugLog} - User address:`, filters.userAddress);
        if (hasVotedOnBlockchain || hasVotedLocal) {
          console.log(`${debugLog} - FILTERED OUT: Already voted on completion`);
          return false;
        }
      }
    }

    console.log(`${debugLog} - PASSED all filters`);
    return true;
  });

  return filteredIssues;
}
