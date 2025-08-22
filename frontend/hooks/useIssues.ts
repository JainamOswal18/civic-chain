import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IssueService, type Issue } from "@/services/IssueService";

export function useAllIssues() {
  return useQuery({
    queryKey: ["issues", "all"],
    queryFn: () => IssueService.getAllIssues(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useIssuesByWard(ward: number | null) {
  return useQuery({
    queryKey: ["issues", "ward", ward],
    queryFn: () => ward !== null ? IssueService.getIssuesByWard(ward) : Promise.resolve([]),
    enabled: ward !== null,
    refetchInterval: 30000,
    staleTime: 10000,
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

// Hook for filtering issues by status
export function useFilteredIssues(issues: Issue[] = [], filters: {
  status?: number[];
  ward?: number;
  userAddress?: string;
  excludeUserVoted?: boolean;
}) {
  const filteredIssues = issues.filter(issue => {
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(issue.status)) return false;
    }

    // Filter by ward
    if (filters.ward !== undefined && issue.ward !== filters.ward) {
      return false;
    }

    // Exclude issues where user has already voted
    if (filters.excludeUserVoted && filters.userAddress) {
      if (IssueService.hasUserVoted(issue, filters.userAddress)) {
        return false;
      }
    }

    return true;
  });

  return filteredIssues;
}
