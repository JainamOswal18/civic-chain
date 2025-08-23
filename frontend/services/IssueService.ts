import { aptosClient } from "@/utils/aptosClient";
import { CIVIC_CONTRACT_ADDRESS, ISSUE_STATUS } from "@/constants";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export interface Issue {
  id: number;
  reporter: string;
  ward: number;
  category: string;
  description: string;
  latitude: string;
  longitude: string;
  status: number;
  confirm_votes: number;
  spam_votes: number;
  initial_voters: string[];
  resolved_votes: number;
  not_resolved_votes: number;
  completion_voters: string[];
  created_at: number;
  updated_at: number;
  completed_at: number;
  image_cid: string;
  image_filenames: string[];
}

export class IssueService {
  /**
   * Get all issues from the contract
   */
  static async getAllIssues(): Promise<Issue[]> {
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::get_all_issues`,
          typeArguments: [],
          functionArguments: [],
        },
      });

      return result[0] as Issue[];
    } catch (error) {
      console.error("Error fetching all issues:", error);
      return [];
    }
  }

  /**
   * Get issues by ward number
   */
  static async getIssuesByWard(ward: number): Promise<Issue[]> {
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::get_issues_by_ward`,
          typeArguments: [],
          functionArguments: [ward],
        },
      });

      return result[0] as Issue[];
    } catch (error) {
      console.error("Error fetching issues by ward:", error);
      return [];
    }
  }

  /**
   * Report a new issue
   */
  static reportIssue(
    ward: number,
    category: string,
    description: string,
    latitude: string,
    longitude: string,
    imageCid: string = "",
    imageFilenames: string[] = []
  ): InputTransactionData {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::report_issue`,
        functionArguments: [ward, category, description, latitude, longitude, imageCid, imageFilenames],
        typeArguments: [],
      },
    };
  }

  /**
   * Vote on an issue (confirm or spam)
   */
  static voteOnIssue(issueId: number, isConfirm: boolean): InputTransactionData {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::vote_on_issue`,
        functionArguments: [issueId, isConfirm],
        typeArguments: [],
      },
    };
  }

  /**
   * Vote on issue completion (resolved or not resolved)
   */
  static voteOnCompletion(issueId: number, isResolved: boolean): InputTransactionData {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::vote_on_completion`,
        functionArguments: [issueId, isResolved],
        typeArguments: [],
      },
    };
  }

  /**
   * Update issue status (councillor only)
   */
  static updateIssueStatus(issueId: number, newStatus: number): InputTransactionData {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::update_issue_status`,
        functionArguments: [issueId, newStatus],
        typeArguments: [],
      },
    };
  }

  /**
   * Check if user has already voted on an issue
   */
  static hasUserVoted(issue: Issue, userAddress: string): boolean {
    return issue.initial_voters.includes(userAddress);
  }

  /**
   * Check if user has already voted on completion
   */
  static hasUserVotedOnCompletion(issue: Issue, userAddress: string): boolean {
    return issue.completion_voters.includes(userAddress);
  }

  /**
   * Filter issues by status
   */
  static filterIssuesByStatus(issues: Issue[], status: number): Issue[] {
    return issues.filter(issue => issue.status === status);
  }

  /**
   * Get issues that need verification (for community voting)
   */
  static getPendingVerificationIssues(issues: Issue[]): Issue[] {
    return this.filterIssuesByStatus(issues, ISSUE_STATUS.PENDING_VERIFICATION);
  }

  /**
   * Get verified issues (for councillor action)
   */
  static getVerifiedIssues(issues: Issue[]): Issue[] {
    return this.filterIssuesByStatus(issues, ISSUE_STATUS.VERIFIED);
  }

  /**
   * Get issues pending completion verification
   */
  static getPendingCompletionIssues(issues: Issue[]): Issue[] {
    return this.filterIssuesByStatus(issues, ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION);
  }

  /**
   * Calculate issue metrics for a ward
   */
  static calculateWardMetrics(issues: Issue[]) {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length;
    const inProgress = issues.filter(i => 
      i.status === ISSUE_STATUS.IN_PROGRESS || 
      i.status === ISSUE_STATUS.ACKNOWLEDGED
    ).length;
    const pending = issues.filter(i => 
      i.status === ISSUE_STATUS.PENDING_VERIFICATION ||
      i.status === ISSUE_STATUS.VERIFIED
    ).length;

    return {
      total,
      resolved,
      inProgress,
      pending,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
    };
  }
}
