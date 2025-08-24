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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative">
        {/* Header Section */}
        <div className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 tracking-tight leading-tight">
                CivicChain Councillor
              </h1>
              <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-2xl">
                Managing Ward {councillorInfo.ward} • Driving civic progress • Building stronger communities
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 px-6 py-3 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Ward {councillorInfo.ward}
                </div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 lg:space-y-10">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="action" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Action</span>
              {verifiedIssues.length > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                  {verifiedIssues.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
                     <TabsContent value="overview" className="space-y-8">
             {/* Performance Overview Section */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Left: Performance Metrics */}
               <Card className="border-0 shadow-xl rounded-2xl bg-white">
                 <CardHeader className="pb-6">
                   <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                     <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                       <TrendingUp className="h-6 w-6 text-blue-600" />
                     </div>
                     Performance Overview
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   {/* Resolution Rate */}
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="text-lg font-bold text-gray-700">Resolution Rate</span>
                       <span className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                         {resolutionRate}%
                       </span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-4">
                       <div 
                         className="bg-gradient-to-r from-emerald-500 to-green-600 h-4 rounded-full transition-all duration-1000" 
                         style={{ width: `${resolutionRate}%` }}
                       ></div>
                     </div>
                     <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                       <strong>{resolvedCount}</strong> of <strong>{totalIssues}</strong> issues successfully resolved
                     </div>
                   </div>

                   {/* Issue Status Breakdown */}
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                     <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                       <div className="text-2xl font-bold text-red-600">{pendingVerification.length}</div>
                       <div className="text-sm font-medium text-red-700">Pending Review</div>
                     </div>
                     <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                       <div className="text-2xl font-bold text-orange-600">{verifiedIssues.length}</div>
                       <div className="text-sm font-medium text-orange-700">Need Action</div>
                     </div>
                     <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                       <div className="text-2xl font-bold text-purple-600">{inProgressIssues.length + acknowledgedIssues.length}</div>
                       <div className="text-sm font-medium text-purple-700">In Progress</div>
                     </div>
                     <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                       <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
                       <div className="text-sm font-medium text-emerald-700">Resolved</div>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Right: Quick Actions */}
               <Card className="border-0 shadow-xl rounded-2xl bg-white">
                 <CardHeader className="pb-6">
                   <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                     <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                       <AlertTriangle className="h-6 w-6 text-purple-600" />
                     </div>
                     Quick Actions
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {verifiedIssues.length > 0 && (
                     <div 
                       className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-all duration-300"
                       onClick={() => setActiveTab("action")}
                     >
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-lg font-bold text-orange-800">Issues Need Action</div>
                           <div className="text-sm text-orange-600">{verifiedIssues.length} verified issues requiring attention</div>
                         </div>
                         <div className="text-3xl font-black text-orange-600">{verifiedIssues.length}</div>
                       </div>
                     </div>
                   )}
                   
                   {(inProgressIssues.length + acknowledgedIssues.length) > 0 && (
                     <div 
                       className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-all duration-300"
                       onClick={() => setActiveTab("progress")}
                     >
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-lg font-bold text-purple-800">In Progress</div>
                           <div className="text-sm text-purple-600">{inProgressIssues.length + acknowledgedIssues.length} issues being worked on</div>
                         </div>
                         <div className="text-3xl font-black text-purple-600">{inProgressIssues.length + acknowledgedIssues.length}</div>
                       </div>
                     </div>
                   )}
                   
                   {completedIssues.length > 0 && (
                     <div 
                       className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-l-4 border-emerald-500 cursor-pointer hover:shadow-lg transition-all duration-300"
                       onClick={() => setActiveTab("completed")}
                     >
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-lg font-bold text-emerald-800">Completed Issues</div>
                           <div className="text-sm text-emerald-600">{completedIssues.length} issues awaiting verification</div>
                         </div>
                         <div className="text-3xl font-black text-emerald-600">{completedIssues.length}</div>
                       </div>
                     </div>
                   )}

                   {verifiedIssues.length === 0 && (inProgressIssues.length + acknowledgedIssues.length) === 0 && completedIssues.length === 0 && (
                     <div className="text-center py-12">
                       <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                       <div className="text-xl font-bold text-gray-700 mb-2">All Caught Up!</div>
                       <div className="text-gray-500">No immediate actions required</div>
                     </div>
                   )}
                 </CardContent>
               </Card>
             </div>

             {/* Ward Statistics */}
             <Card className="border-0 shadow-xl rounded-2xl bg-white">
               <CardHeader className="pb-6">
                 <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                   <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                     <Users className="h-6 w-6 text-gray-600" />
                   </div>
                   Ward {councillorInfo.ward} Statistics
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                     <div className="text-3xl font-black text-yellow-600 mb-2">{pendingVerification.length}</div>
                     <div className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Pending Verification</div>
                   </div>
                   <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                     <div className="text-3xl font-black text-blue-600 mb-2">{acknowledgedIssues.length}</div>
                     <div className="text-sm font-bold text-blue-700 uppercase tracking-wide">Acknowledged</div>
                   </div>
                   <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                     <div className="text-3xl font-black text-purple-600 mb-2">{inProgressIssues.length}</div>
                     <div className="text-sm font-bold text-purple-700 uppercase tracking-wide">In Progress</div>
                   </div>
                   <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                     <div className="text-3xl font-black text-gray-600 mb-2">{totalIssues - resolvedCount}</div>
                     <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Total Active</div>
                   </div>
                 </div>
               </CardContent>
             </Card>
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
