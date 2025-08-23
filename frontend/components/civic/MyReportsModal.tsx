import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IssueCard } from "./IssueCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, TrendingUp, Loader2 } from "lucide-react";
import { useAllIssues } from "@/hooks/useIssues";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ISSUE_STATUS, STATUS_LABELS } from "@/constants";

interface MyReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportNew: () => void;
}

export function MyReportsModal({ open, onOpenChange, onReportNew }: MyReportsModalProps) {
  const { account } = useWallet();
  const { data: allIssues = [], isLoading } = useAllIssues();
  const userAddress = account?.address.toString();

  // Filter user's reported issues
  const userIssues = allIssues.filter(issue => 
    userAddress && issue.reporter === userAddress
  );

  // Calculate stats
  const stats = {
    total: userIssues.length,
    resolved: userIssues.filter(i => i.status === ISSUE_STATUS.FULLY_RESOLVED).length,
    inProgress: userIssues.filter(i => 
      i.status === ISSUE_STATUS.IN_PROGRESS || 
      i.status === ISSUE_STATUS.ACKNOWLEDGED ||
      i.status === ISSUE_STATUS.COMPLETED ||
      i.status === ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION
    ).length,
    pending: userIssues.filter(i => 
      i.status === ISSUE_STATUS.PENDING_VERIFICATION ||
      i.status === ISSUE_STATUS.VERIFIED
    ).length,
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case ISSUE_STATUS.PENDING_VERIFICATION:
        return "bg-yellow-100 text-yellow-800";
      case ISSUE_STATUS.VERIFIED:
        return "bg-blue-100 text-blue-800";
      case ISSUE_STATUS.ACKNOWLEDGED:
        return "bg-purple-100 text-purple-800";
      case ISSUE_STATUS.IN_PROGRESS:
        return "bg-orange-100 text-orange-800";
      case ISSUE_STATUS.COMPLETED:
      case ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION:
        return "bg-green-100 text-green-800";
      case ISSUE_STATUS.FULLY_RESOLVED:
        return "bg-emerald-100 text-emerald-800";
      case ISSUE_STATUS.SPAM:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                My Reported Issues
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Track the status and progress of your civic reports
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading your reports...</span>
            </div>
          ) : userIssues.length > 0 ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-700">Total Reports</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                  <div className="text-sm text-green-700">Resolved</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                  <div className="text-sm text-orange-700">In Progress</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
              </div>

              {/* Progress Message */}
              {stats.total > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Impact Summary
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    You've reported {stats.total} civic issues, with {stats.resolved} fully resolved 
                    ({Math.round((stats.resolved / stats.total) * 100)}% resolution rate). 
                    Thank you for helping improve your community!
                  </p>
                </div>
              )}
              
              {/* Issues List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Your Reports</h3>
                {userIssues
                  .sort((a, b) => b.created_at - a.created_at) // Sort by newest first
                  .map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={getStatusColor(issue.status)}>
                        {STATUS_LABELS[issue.status]}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        Reported {new Date(issue.created_at * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <IssueCard
                      issue={issue}
                      userAddress={userAddress}
                      showVoting={false}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No Reports Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                You haven't reported any civic issues yet. Be the first to help improve your community!
              </p>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  onReportNew();
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Report Your First Issue
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
