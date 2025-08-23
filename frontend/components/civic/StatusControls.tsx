import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { IssueService, type Issue } from "@/services/IssueService";
import { useIssueActions } from "@/hooks/useIssues";
import { ISSUE_STATUS, STATUS_LABELS } from "@/constants";
import { Loader2 } from "lucide-react";

interface StatusControlsProps {
  issue: Issue;
}

export function StatusControls({ issue }: StatusControlsProps) {
  const { signAndSubmitTransaction } = useWallet();
  const { invalidateIssues } = useIssueActions();
  const [isUpdating, setIsUpdating] = useState(false);

  // Available status transitions for councillors
  const getAvailableStatusTransitions = (currentStatus: number) => {
    switch (currentStatus) {
      case ISSUE_STATUS.VERIFIED:
        return [
          { status: ISSUE_STATUS.ACKNOWLEDGED, label: "Acknowledge" },
        ];
      case ISSUE_STATUS.ACKNOWLEDGED:
        return [
          { status: ISSUE_STATUS.IN_PROGRESS, label: "Mark In Progress" },
        ];
      case ISSUE_STATUS.IN_PROGRESS:
        return [
          { status: ISSUE_STATUS.COMPLETED, label: "Mark Completed" },
        ];
      default:
        return [];
    }
  };

  const availableTransitions = getAvailableStatusTransitions(issue.status);

  const handleStatusUpdate = async (newStatus: number) => {
    setIsUpdating(true);
    try {
      const transaction = IssueService.updateIssueStatus(issue.id, newStatus);
      const result = await signAndSubmitTransaction(transaction);
      
      toast({
        title: "Status Updated",
        description: `Issue status updated to ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS]}. Transaction: ${result.hash}`,
      });

      // Wait a moment for blockchain to process, then refresh all issue-related data
      setTimeout(() => {
        invalidateIssues(); // This invalidates all queries starting with ["issues"]
      }, 1000);
      
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Failed to Update Status",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't show controls if no transitions are available
  if (availableTransitions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableTransitions.map((transition) => (
        <Button
          key={transition.status}
          onClick={() => handleStatusUpdate(transition.status)}
          disabled={isUpdating}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {transition.label}
        </Button>
      ))}
    </div>
  );
}
