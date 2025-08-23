import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IssueForm } from "./IssueForm";

interface ReportIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportIssueModal({ open, onOpenChange }: ReportIssueModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Report a Civic Issue
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Help improve your community by reporting civic issues. Your report will be verified by the community before being forwarded to local authorities.
          </p>
          
          <IssueForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
