import { useState, useCallback, useEffect } from "react";

interface VotedIssue {
  issueId: number;
  voteType: "verification" | "completion";
  timestamp: number;
}

// Keep track of locally voted issues until blockchain updates
export function useVotedIssues() {
  const [votedIssues, setVotedIssues] = useState<VotedIssue[]>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('civic-voted-issues');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Add a vote to local tracking
  const addVotedIssue = useCallback((issueId: number, voteType: "verification" | "completion") => {
    setVotedIssues(prev => {
      const updated = [
        ...prev.filter(v => !(v.issueId === issueId && v.voteType === voteType)), // Remove duplicate if exists
        {
          issueId,
          voteType,
          timestamp: Date.now(),
        }
      ];
      // Persist to localStorage
      localStorage.setItem('civic-voted-issues', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Check if user has voted locally
  const hasVotedLocally = useCallback((issueId: number, voteType: "verification" | "completion") => {
    return votedIssues.some(v => v.issueId === issueId && v.voteType === voteType);
  }, [votedIssues]);

  // Clean up old local votes (older than 10 minutes) to prevent memory issues
  useEffect(() => {
    const cleanup = () => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000; // Extended to 10 minutes
      setVotedIssues(prev => {
        const filtered = prev.filter(v => v.timestamp > tenMinutesAgo);
        // Update localStorage with cleaned data
        localStorage.setItem('civic-voted-issues', JSON.stringify(filtered));
        return filtered;
      });
    };

    const interval = setInterval(cleanup, 60000); // Clean up every minute
    return () => clearInterval(interval);
  }, []);

  // Remove a specific vote (useful when transaction fails)
  const removeVotedIssue = useCallback((issueId: number, voteType: "verification" | "completion") => {
    setVotedIssues(prev => {
      const filtered = prev.filter(v => !(v.issueId === issueId && v.voteType === voteType));
      // Update localStorage
      localStorage.setItem('civic-voted-issues', JSON.stringify(filtered));
      return filtered;
    });
  }, []);

  return {
    addVotedIssue,
    hasVotedLocally,
    removeVotedIssue,
    votedIssues,
  };
}
