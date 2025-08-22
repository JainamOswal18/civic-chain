import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IssueCard } from "./IssueCard";
import { StatusControls } from "./StatusControls";
import { useIssuesByWard, useFilteredIssues } from "@/hooks/useIssues";
import { useUserRole } from "@/hooks/useUserRole";
import { ISSUE_STATUS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export function CouncillorView() {
  const { account } = useWallet();
  const { councillorInfo, isLoading: roleLoading } = useUserRole();
  const { data: wardIssues = [], isLoading: issuesLoading } = useIssuesByWard(
    councillorInfo?.ward || null
  );

  const userAddress = account?.address.toString();

  // Filter issues by status for councillor dashboard
  const verifiedIssues = useFilteredIssues(wardIssues, {
    status: [ISSUE_STATUS.VERIFIED],
  });

  const acknowledgedIssues = useFilteredIssues(wardIssues, {
    status: [ISSUE_STATUS.ACKNOWLEDGED],
  });

  const inProgressIssues = useFilteredIssues(wardIssues, {
    status: [ISSUE_STATUS.IN_PROGRESS],
  });

  const completedIssues = useFilteredIssues(wardIssues, {
    status: [ISSUE_STATUS.COMPLETED, ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION, ISSUE_STATUS.FULLY_RESOLVED],
  });

  const pendingVerification = useFilteredIssues(wardIssues, {
    status: [ISSUE_STATUS.PENDING_VERIFICATION],
  });

  if (roleLoading || issuesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!councillorInfo) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You are not registered as a ward councillor.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalIssues = wardIssues.length;
  const resolvedCount = wardIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length;
  const resolutionRate = totalIssues > 0 ? ((resolvedCount / totalIssues) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Councillor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage civic issues in Ward {councillorInfo.ward}
        </p>
        <Badge variant="secondary" className="text-sm">
          Resolution Rate: {resolutionRate}% ({resolvedCount}/{totalIssues})
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Requires Action</h3>
              <p className="text-2xl font-bold">{verifiedIssues.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-semibold">In Progress</h3>
              <p className="text-2xl font-bold">{inProgressIssues.length + acknowledgedIssues.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="font-semibold">Completed</h3>
              <p className="text-2xl font-bold">{completedIssues.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Settings className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="font-semibold">Total Issues</h3>
              <p className="text-2xl font-bold">{totalIssues}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Requiring Action */}
      {verifiedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Issues Requiring Action ({verifiedIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verifiedIssues.map((issue) => (
              <div key={issue.id} className="space-y-3">
                <IssueCard
                  issue={issue}
                  userAddress={userAddress}
                  showVoting={false}
                />
                <div className="flex justify-end">
                  <StatusControls issue={issue} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Acknowledged Issues */}
      {acknowledgedIssues.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              Acknowledged Issues ({acknowledgedIssues.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {acknowledgedIssues.map((issue) => (
              <div key={issue.id} className="space-y-3">
                <IssueCard
                  issue={issue}
                  userAddress={userAddress}
                  showVoting={false}
                />
                <div className="flex justify-end">
                  <StatusControls issue={issue} />
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* In Progress Issues */}
      {inProgressIssues.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              In Progress Issues ({inProgressIssues.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {inProgressIssues.map((issue) => (
              <div key={issue.id} className="space-y-3">
                <IssueCard
                  issue={issue}
                  userAddress={userAddress}
                  showVoting={false}
                />
                <div className="flex justify-end">
                  <StatusControls issue={issue} />
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Completed Issues */}
      {completedIssues.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              Completed Issues ({completedIssues.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {completedIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                userAddress={userAddress}
                showVoting={false}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Pending Community Verification */}
      {pendingVerification.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              Pending Community Verification ({pendingVerification.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              These issues are waiting for community verification before you can take action.
            </p>
            {pendingVerification.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                userAddress={userAddress}
                showVoting={false}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Empty State */}
      {totalIssues === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Issues in Your Ward</h3>
            <p className="text-muted-foreground">
              There are currently no reported issues in Ward {councillorInfo.ward}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
