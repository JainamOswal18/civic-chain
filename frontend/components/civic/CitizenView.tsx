import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ReportIssueModal } from "./ReportIssueModal";
import { IssuesVotingModal } from "./IssuesVotingModal";
import { MyReportsModal } from "./MyReportsModal";
import { useAllIssues, useFilteredIssues } from "@/hooks/useIssues";
import { useNearestWard } from "@/hooks/useWards";
import { ISSUE_STATUS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Vote, Plus, Eye, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CitizenView() {
  const { account } = useWallet();
  const { data: allIssues = [], isLoading } = useAllIssues();
  const { nearestWard, locationLoading, locationError, getCurrentLocation } = useNearestWard();
  
  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" />
            Civic Engagement Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Make Your Community
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Better Together
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Report civic issues, participate in community decisions, and track progress in your neighborhood
          </p>
          
          {/* Location Status */}
          {locationLoading && (
            <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-flex">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">Detecting your ward...</span>
            </div>
          )}
          
          {nearestWard && !locationLoading && (
            <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full inline-flex">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Your ward: Ward {nearestWard}</span>
            </div>
          )}
          
          {locationError && !locationLoading && (
            <div className="flex items-center justify-center gap-2 text-orange-700 bg-orange-50 px-4 py-3 rounded-lg inline-flex">
              <AlertCircle className="h-4 w-4" />
              <span>Unable to detect ward.</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={getCurrentLocation}
                className="h-auto p-1 text-xs underline text-orange-700 hover:text-orange-800"
              >
                Try again
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
            onClick={() => setShowReportModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Report Issue</h3>
                  <p className="text-blue-100 text-sm">Report a new civic issue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg"
            onClick={() => setShowVotingModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Vote className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Issues to Vote</h3>
                  <p className="text-gray-600 text-sm">
                    {votingIssues.length === 0 ? 'No pending votes' : `${votingIssues.length} pending votes`}
                  </p>
                </div>
              </div>
              {votingIssues.length > 0 && (
                <div className="mt-3 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full inline-block group-hover:bg-purple-100 transition-colors">
                  Action needed
                </div>
              )}
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg"
            onClick={() => setShowReportsModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">My Reports</h3>
                  <p className="text-gray-600 text-sm">
                    {userIssues.length === 0 ? 'No reports yet' : `${userIssues.length} issues reported`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Overview */}
        {allIssues.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Community Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{allIssues.length}</div>
                  <div className="text-sm text-blue-700">Total Issues</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {allIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length}
                  </div>
                  <div className="text-sm text-green-700">Resolved</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {allIssues.filter(i => 
                      i.status === ISSUE_STATUS.IN_PROGRESS || 
                      i.status === ISSUE_STATUS.ACKNOWLEDGED
                    ).length}
                  </div>
                  <div className="text-sm text-orange-700">In Progress</div>
                </div>
              </div>
              
              {nearestWard && wardIssues.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Your Ward ({nearestWard})</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {wardIssues.length} issues reported in your area. 
                    {wardIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length} have been resolved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {allIssues.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No Issues Yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Be the first to report a civic issue in your area and help make your community better
              </p>
              <Button 
                onClick={() => setShowReportModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Report First Issue
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ReportIssueModal 
        open={showReportModal} 
        onOpenChange={setShowReportModal} 
      />
      
      <IssuesVotingModal 
        open={showVotingModal} 
        onOpenChange={setShowVotingModal} 
      />
      
      <MyReportsModal 
        open={showReportsModal} 
        onOpenChange={setShowReportsModal}
        onReportNew={() => setShowReportModal(true)}
      />
    </div>
  );
}
