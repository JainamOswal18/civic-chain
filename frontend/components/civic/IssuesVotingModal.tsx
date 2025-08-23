import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IssueCard } from "./IssueCard";
import { Vote, CheckCircle, Loader2 } from "lucide-react";
import { useAllIssues, useFilteredIssues } from "@/hooks/useIssues";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ISSUE_STATUS } from "@/constants";

interface IssuesVotingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssuesVotingModal({ open, onOpenChange }: IssuesVotingModalProps) {
  const { account } = useWallet();
  const { data: allIssues = [], isLoading } = useAllIssues();
  const userAddress = account?.address.toString();

  // Filter issues for voting (pending verification or completion verification)
  const votingIssues = useFilteredIssues(allIssues, {
    status: [ISSUE_STATUS.PENDING_VERIFICATION, ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION],
    excludeUserVoted: true,
    userAddress,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Vote className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Issues Requiring Your Vote
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Help verify community reports and completion status
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading issues...</span>
            </div>
          ) : votingIssues.length > 0 ? (
            <>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">
                    {votingIssues.length} issues need your vote
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  Your votes help verify legitimate issues and confirm when they're resolved. 
                  Each issue needs 3 community votes to proceed.
                </p>
              </div>
              
              <div className="space-y-4">
                {votingIssues.map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <IssueCard
                      issue={issue}
                      userAddress={userAddress}
                      showVoting={true}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">All Caught Up!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are no issues requiring your vote at the moment. 
                Check back later or encourage others to report civic issues.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
