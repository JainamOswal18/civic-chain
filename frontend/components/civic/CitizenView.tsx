import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IssueForm } from "./IssueForm";
import { IssueCard } from "./IssueCard";
import { IssuesMap } from "./IssuesMap";
import { useAllIssues, useFilteredIssues } from "@/hooks/useIssues";
import { useNearestWard } from "@/hooks/useWards";
import { ISSUE_STATUS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Vote, Plus, Eye, MapPin, TrendingUp, Users, CheckCircle, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CitizenView() {
  const { account } = useWallet();
  const { data: allIssues = [], isLoading } = useAllIssues();
  const { nearestWard, locationLoading, location, locationError, getCurrentLocation } = useNearestWard();
  
  // View states - replacing modals with inline views
  const [activeTab, setActiveTab] = useState("overview");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header Section with Location & Quick Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Civic Dashboard</h1>
                {locationLoading && (
                  <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Locating...
                  </div>
                )}
                {nearestWard && !locationLoading && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    <MapPin className="h-3 w-3 mr-1" />
                    Ward {nearestWard}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">
                Engage with your community • Report issues • Drive positive change
              </p>
            </div>
            
            <Button 
              onClick={() => setShowReportForm(!showReportForm)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{allIssues.length}</div>
                  <div className="text-xs text-gray-500">Total Issues</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Vote className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{votingIssues.length}</div>
                  <div className="text-xs text-gray-500">Need Votes</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{userIssues.length}</div>
                  <div className="text-xs text-gray-500">My Reports</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {allIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length}
                  </div>
                  <div className="text-xs text-gray-500">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Form - Inline when activated */}
        {showReportForm && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-900">Report New Issue</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowReportForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <IssueForm onSuccess={() => setShowReportForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white shadow-sm border border-gray-100">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="vote" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Vote ({votingIssues.length})
            </TabsTrigger>
            <TabsTrigger value="my-reports" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              My Reports
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {allIssues.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Welcome to CivicChain!</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start making a difference in your community by reporting your first civic issue.
                  </p>
                  <Button 
                    onClick={() => setShowReportForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Report First Issue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Community Progress */}
                <Card className="lg:col-span-2 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Community Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{allIssues.length}</div>
                        <div className="text-sm text-blue-700">Total Issues</div>
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
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {allIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length}
                        </div>
                        <div className="text-sm text-green-700">Resolved</div>
                      </div>
                    </div>
                    
                    {nearestWard && wardIssues.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">Your Ward ({nearestWard})</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {wardIssues.length} issues reported • {wardIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length} resolved
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab("map")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <MapIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Explore Map</div>
                          <div className="text-sm text-gray-600">View issues in your area</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">Explore</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {votingIssues.length > 0 && (
                    <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab("vote")}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Vote className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Votes Needed</div>
                            <div className="text-sm text-gray-600">{votingIssues.length} issues await your vote</div>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700">Action</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {userIssues.length > 0 && (
                    <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab("my-reports")}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Eye className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">My Reports</div>
                            <div className="text-sm text-gray-600">{userIssues.length} issues reported</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapIcon className="h-5 w-5 text-blue-600" />
                      Issues Map
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Explore civic issues in your area on an interactive map
                    </p>
                  </div>
                  
                  {/* Location Controls */}
                  <div className="flex items-center gap-2">
                    {!location && !locationLoading && (
                      <Button
                        onClick={() => {
                          console.log("Manual location request triggered");
                          getCurrentLocation();
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Enable Location
                      </Button>
                    )}
                    
                    {locationLoading && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Getting location...</span>
                      </div>
                    )}
                    
                    {location && (
                      <div className="flex items-center gap-2 text-green-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Location detected</span>
                      </div>
                    )}
                    
                    {locationError && (
                      <div className="flex items-center gap-2 text-red-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{locationError}</span>
                        <Button
                          onClick={getCurrentLocation}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 h-auto p-1"
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Location Error Alert */}
                {locationError && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">Location Access Required</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          {locationError}. Please allow location access to see your position on the map and get better ward detection.
                        </p>
                        <Button
                          onClick={getCurrentLocation}
                          variant="outline"
                          size="sm"
                          className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] w-full">
                  <IssuesMap
                    issues={allIssues}
                    center={location ? [location.latitude, location.longitude] : [40.7128, -74.0060]} // Default to NYC if no location
                    userLocation={location ? [location.latitude, location.longitude] : undefined}
                    hasNewData={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vote Tab */}
          <TabsContent value="vote" className="space-y-4">
            {votingIssues.length > 0 ? (
              <>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Vote className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800">
                      {votingIssues.length} issues need your vote
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Your votes help verify legitimate issues and confirm when they're resolved. Each issue needs 3 community votes to proceed.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {votingIssues.map((issue) => (
                    <Card key={issue.id} className="border-0 shadow-lg">
                      <CardContent className="p-4">
                        <IssueCard
                          issue={issue}
                          userAddress={userAddress}
                          showVoting={true}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">All Caught Up!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    There are no issues requiring your vote at the moment. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Reports Tab */}
          <TabsContent value="my-reports" className="space-y-4">
            {userIssues.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userIssues.length}</div>
                    <div className="text-sm text-blue-700">Total Reports</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length}
                    </div>
                    <div className="text-sm text-green-700">Resolved</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {userIssues.filter(i => 
                        i.status === ISSUE_STATUS.IN_PROGRESS || 
                        i.status === ISSUE_STATUS.ACKNOWLEDGED
                      ).length}
                    </div>
                    <div className="text-sm text-orange-700">In Progress</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {userIssues.filter(i => 
                        i.status === ISSUE_STATUS.PENDING_VERIFICATION ||
                        i.status === ISSUE_STATUS.VERIFIED
                      ).length}
                    </div>
                    <div className="text-sm text-yellow-700">Pending</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {userIssues
                    .sort((a, b) => b.created_at - a.created_at)
                    .map((issue) => (
                    <Card key={issue.id} className="border-0 shadow-lg">
                      <CardContent className="p-4">
                        <IssueCard
                          issue={issue}
                          userAddress={userAddress}
                          showVoting={false}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No Reports Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    Start contributing to your community by reporting your first civic issue.
                  </p>
                  <Button 
                    onClick={() => setShowReportForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Report First Issue
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4">
            {wardIssues.length > 0 ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Issues in Ward {nearestWard}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {wardIssues.length} issues reported in your area • {wardIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length} resolved
                  </p>
                </div>
                
                <div className="space-y-4">
                  {wardIssues.slice(0, 10).map((issue) => (
                    <Card key={issue.id} className="border-0 shadow-lg">
                      <CardContent className="p-4">
                        <IssueCard
                          issue={issue}
                          userAddress={userAddress}
                          showVoting={false}
                        />
                      </CardContent>
                    </Card>
                  ))}
                  {wardIssues.length > 10 && (
                    <div className="text-center py-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">
                        And {wardIssues.length - 10} more issues in this ward
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No Community Issues</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {nearestWard ? `No issues reported in Ward ${nearestWard} yet.` : 'Enable location to see community issues in your area.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
