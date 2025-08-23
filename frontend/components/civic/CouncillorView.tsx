import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IssueCard } from "./IssueCard";
import { StatusControls } from "./StatusControls";
import { useIssuesByWard, useFilteredIssues } from "@/hooks/useIssues";
import { useUserRole } from "@/hooks/useUserRole";
import { ISSUE_STATUS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, FileText, Eye } from "lucide-react";
import { useState } from "react";

export function CouncillorView() {
  const { account } = useWallet();
  const { councillorInfo, isLoading: roleLoading } = useUserRole();
  const { data: wardIssues = [], isLoading: issuesLoading } = useIssuesByWard(
    councillorInfo?.ward || null
  );
  const [activeTab, setActiveTab] = useState("overview");

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 p-4 sm:p-6 lg:p-8">
        <Card className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto mt-16 sm:mt-20 lg:mt-24 border-0 shadow-3xl rounded-3xl bg-gradient-to-br from-white to-red-50">
          <CardContent className="text-center py-12 sm:py-16 lg:py-20 px-6 sm:px-8 lg:px-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-red-100 via-red-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-red-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 text-gray-900">Access Denied</h3>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-600 leading-relaxed max-w-md mx-auto">
              You are not registered as a ward councillor. Please contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalIssues = wardIssues.length;
  const resolvedCount = wardIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length;
  const resolutionRate = totalIssues > 0 ? ((resolvedCount / totalIssues) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 tracking-tight leading-tight">
                Councillor Dashboard
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-2 sm:mt-3 font-medium max-w-2xl">
                Manage civic issues • Ward {councillorInfo.ward} • Drive positive change
              </p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-full shadow-lg border border-emerald-300">
                Ward {councillorInfo.ward}
              </Badge>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 text-center border border-blue-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                {totalIssues}
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Total Issues</div>
            </div>
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 text-center border border-orange-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
                {verifiedIssues.length}
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Need Action</div>
            </div>
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 text-center border border-purple-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                {inProgressIssues.length + acknowledgedIssues.length}
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">In Progress</div>
            </div>
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 text-center border border-emerald-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent mb-2">
                {resolvedCount}
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Resolved</div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl p-2 rounded-3xl">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-lg rounded-2xl transition-all duration-300">
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="action" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-50 data-[state=active]:to-orange-100 data-[state=active]:text-orange-800 data-[state=active]:shadow-lg rounded-2xl transition-all duration-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Action ({verifiedIssues.length})</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-purple-100 data-[state=active]:text-purple-800 data-[state=active]:shadow-lg rounded-2xl transition-all duration-300">
              <Clock className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-50 data-[state=active]:to-emerald-100 data-[state=active]:text-emerald-800 data-[state=active]:shadow-lg rounded-2xl transition-all duration-300">
              <CheckCircle className="h-4 w-4" />
              <span>Completed</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Performance Card */}
              <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-blue-50 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl font-black text-gray-900">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-bold text-gray-700">Resolution Rate</span>
                      <span className="font-black text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        {resolutionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 h-4 rounded-full transition-all duration-1000 shadow-lg" 
                        style={{ width: `${resolutionRate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 p-3 rounded-xl">
                      {resolvedCount} of {totalIssues} issues resolved
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4 sm:space-y-5">
                {verifiedIssues.length > 0 && (
                  <Card className="border-0 shadow-2xl rounded-3xl cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100" onClick={() => setActiveTab("action")}>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-lg">
                          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-base sm:text-lg text-gray-900 truncate">Issues Need Action</div>
                          <div className="text-sm sm:text-base font-semibold text-gray-600 truncate">{verifiedIssues.length} issues require attention</div>
                        </div>
                        <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full shadow-sm border border-orange-300">
                          Action
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {(inProgressIssues.length + acknowledgedIssues.length) > 0 && (
                  <Card className="border-0 shadow-2xl rounded-3xl cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100" onClick={() => setActiveTab("progress")}>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-lg">
                          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-base sm:text-lg text-gray-900 truncate">In Progress</div>
                          <div className="text-sm sm:text-base font-semibold text-gray-600 truncate">{inProgressIssues.length + acknowledgedIssues.length} issues being worked on</div>
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full shadow-sm border border-purple-300">
                          Progress
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {completedIssues.length > 0 && (
                  <Card className="border-0 shadow-2xl rounded-3xl cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100" onClick={() => setActiveTab("completed")}>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl shadow-lg">
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-base sm:text-lg text-gray-900 truncate">Completed</div>
                          <div className="text-sm sm:text-base font-semibold text-gray-600 truncate">{completedIssues.length} issues completed</div>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full shadow-sm border border-emerald-300">
                          View
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Ward Summary */}
              <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-gray-50 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl font-black text-gray-900">
                    <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </div>
                    Ward Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100">
                      <span className="text-sm sm:text-base font-bold text-gray-700">Pending Verification</span>
                      <Badge variant="outline" className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 border-yellow-300 text-yellow-800 bg-yellow-50">
                        {pendingVerification.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
                      <span className="text-sm sm:text-base font-bold text-gray-700">Acknowledged</span>
                      <Badge variant="outline" className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 border-purple-300 text-purple-800 bg-purple-50">
                        {acknowledgedIssues.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                      <span className="text-sm sm:text-base font-bold text-gray-700">In Progress</span>
                      <Badge variant="outline" className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 border-blue-300 text-blue-800 bg-blue-50">
                        {inProgressIssues.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-4 sm:py-5 px-3 sm:px-4 border-t-2 border-gray-200 mt-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <span className="text-sm sm:text-base font-black text-gray-900">Total Active</span>
                      <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs sm:text-sm font-black px-3 sm:px-4 py-2 rounded-full shadow-sm border border-blue-300">
                        {totalIssues - resolvedCount}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Action Required Tab */}
          <TabsContent value="action" className="space-y-4 sm:space-y-6">
            {verifiedIssues.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-red-50 p-4 sm:p-6 lg:p-8 rounded-3xl border-2 border-orange-200 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-lg">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <span className="font-black text-lg sm:text-xl lg:text-2xl text-orange-900">
                        {verifiedIssues.length} issues require attention
                      </span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-orange-800 leading-relaxed">
                    These issues have been verified by the community and are ready for your action.
                  </p>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {verifiedIssues.map((issue) => (
                    <Card key={issue.id} className="border-0 shadow-2xl rounded-3xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
                      <CardContent className="p-4 sm:p-6 lg:p-8">
                        <IssueCard
                          issue={issue}
                          userAddress={userAddress}
                          showVoting={false}
                        />
                        <div className="flex justify-end mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-orange-100">
                          <StatusControls issue={issue} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-2xl rounded-3xl">
                <CardContent className="text-center py-16 sm:py-20 lg:py-24">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                    <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mb-4 text-gray-900">All Caught Up!</h3>
                  <p className="text-base sm:text-lg lg:text-xl font-medium text-gray-600 max-w-md mx-auto">
                    There are no issues requiring your immediate attention. Great work!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-8">
            {/* Acknowledged Issues */}
            {acknowledgedIssues.length > 0 && (
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <FileText className="h-6 w-6 text-purple-600" />
                    Acknowledged Issues ({acknowledgedIssues.length})
                  </CardTitle>
                  <p className="text-base font-medium text-gray-600 mt-2">Issues you've acknowledged and can mark as in progress</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {acknowledgedIssues.map((issue) => (
                    <div key={issue.id} className="p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-purple-100">
                      <IssueCard
                        issue={issue}
                        userAddress={userAddress}
                        showVoting={false}
                      />
                      <div className="flex justify-end mt-6 pt-4 border-t border-purple-200">
                        <StatusControls issue={issue} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* In Progress Issues */}
            {inProgressIssues.length > 0 && (
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <Clock className="h-6 w-6 text-blue-600" />
                    In Progress Issues ({inProgressIssues.length})
                  </CardTitle>
                  <p className="text-base font-medium text-gray-600 mt-2">Issues currently being worked on</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {inProgressIssues.map((issue) => (
                    <div key={issue.id} className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <IssueCard
                        issue={issue}
                        userAddress={userAddress}
                        showVoting={false}
                      />
                      <div className="flex justify-end mt-6 pt-4 border-t border-blue-200">
                        <StatusControls issue={issue} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Pending Community Verification */}
            {pendingVerification.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-gray-600" />
                    Pending Community Verification ({pendingVerification.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    These issues are waiting for community verification before you can take action
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingVerification.map((issue) => (
                    <div key={issue.id} className="p-4 bg-gray-50 rounded-lg opacity-75">
                      <IssueCard
                        issue={issue}
                        userAddress={userAddress}
                        showVoting={false}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {acknowledgedIssues.length === 0 && inProgressIssues.length === 0 && pendingVerification.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No Issues in Progress</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    All issues are either completed or waiting for action.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-6">
            {completedIssues.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                    <span className="font-bold text-xl text-emerald-900">
                      {completedIssues.length} issues have been completed
                    </span>
                  </div>
                  <p className="text-base font-medium text-emerald-800">
                    These issues have been marked as completed and may be undergoing final verification.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {completedIssues.map((issue) => (
                    <Card key={issue.id} className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow duration-300">
                      <CardContent className="p-8">
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
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardContent className="text-center py-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900">No Completed Issues</h3>
                  <p className="text-lg font-medium text-gray-600 max-w-md mx-auto">
                    Completed issues will appear here once you mark them as done.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Empty State for No Issues */}
        {totalIssues === 0 && (
          <Card className="border-0 shadow-2xl mt-12 rounded-3xl">
            <CardContent className="text-center py-24">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <Users className="h-14 w-14 text-blue-600" />
              </div>
              <h3 className="text-3xl font-black mb-4 text-gray-900">No Issues in Your Ward</h3>
              <p className="text-xl font-medium text-gray-600 max-w-lg mx-auto mb-6 leading-relaxed">
                There are currently no reported issues in Ward {councillorInfo.ward}. 
                Your community is doing great!
              </p>
              <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 px-8 py-3 text-lg font-bold rounded-full shadow-sm">
                All Clear ✓
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
