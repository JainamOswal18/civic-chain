import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IssueForm } from "./IssueForm";
import { IssueCard } from "./IssueCard";
import { useAllIssues, useFilteredIssues } from "@/hooks/useIssues";
import { useNearestWard } from "@/hooks/useWards";
import { ISSUE_STATUS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Vote, Plus, Eye, MapPin, AlertCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CitizenView() {
  const { account } = useWallet();
  const { data: allIssues = [], isLoading } = useAllIssues();
  const { nearestWard, locationLoading, locationError, getCurrentLocation } = useNearestWard();
  const [showReportForm, setShowReportForm] = useState(false);

  const userAddress = account?.address.toString();

  // Filter issues for voting (pending verification or completion verification)
  const votingIssues = useFilteredIssues(allIssues, {
    status: [ISSUE_STATUS.PENDING_VERIFICATION, ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION],
    excludeUserVoted: true,
    userAddress,
  });

  // Filter user's reported issues
  const userIssues = allIssues.filter(issue => 
    userAddress && issue.reporter === userAddress
  );

  // Filter issues in user's ward
  const wardIssues = useFilteredIssues(allIssues, {
    ward: nearestWard || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Civic Issues Platform</h1>
        <p className="text-muted-foreground">
          Report issues, vote on community reports, and track progress in your area
        </p>
        
        {/* Location Status */}
        {locationLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Detecting your ward...
          </div>
        )}
        
        {nearestWard && !locationLoading && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            Your ward: <span className="font-medium">Ward {nearestWard}</span>
          </p>
        )}
        
        {locationError && !locationLoading && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">Unable to detect ward.</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={getCurrentLocation}
              className="h-auto p-1 text-xs underline"
            >
              Try again
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setShowReportForm(!showReportForm)}>
          <CardContent className="flex items-center gap-3 p-4">
            <Plus className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Report Issue</h3>
              <p className="text-sm text-muted-foreground">Report a new civic issue</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Vote className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="font-semibold">Issues to Vote</h3>
              <p className="text-sm text-muted-foreground">{votingIssues.length} pending votes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Eye className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="font-semibold">My Reports</h3>
              <p className="text-sm text-muted-foreground">{userIssues.length} issues reported</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Issue Form */}
      <Collapsible open={showReportForm} onOpenChange={setShowReportForm}>
        <CollapsibleContent className="space-y-4">
          <IssueForm />
        </CollapsibleContent>
      </Collapsible>

      {/* Issues Requiring Votes */}
      {votingIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Issues Requiring Your Vote ({votingIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {votingIssues.slice(0, 5).map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                userAddress={userAddress}
                showVoting={true}
              />
            ))}
            {votingIssues.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                And {votingIssues.length - 5} more issues...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* User's Reported Issues */}
      {userIssues.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              My Reported Issues ({userIssues.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {userIssues.map((issue) => (
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

      {/* Ward Issues */}
      {wardIssues.length > 0 && nearestWard && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              Issues in Ward {nearestWard} ({wardIssues.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {wardIssues.slice(0, 10).map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                userAddress={userAddress}
                showVoting={false}
              />
            ))}
            {wardIssues.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                And {wardIssues.length - 10} more issues in this ward...
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Empty State */}
      {allIssues.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Issues Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to report a civic issue in your area
            </p>
            <Button onClick={() => setShowReportForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Report First Issue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
