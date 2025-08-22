export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "devnet";
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS;
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;

// Civic Chain Contract Configuration
export const CIVIC_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? "0x21f260bc482287686cd584a9a7e28f0b2df146497fa6a9dfa706c8a39cb1df41";

// Issue Status Constants (matching the Move contract)
export const ISSUE_STATUS = {
  PENDING_VERIFICATION: 0,
  VERIFIED: 1,
  ACKNOWLEDGED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  PENDING_COMPLETION_VERIFICATION: 5,
  FULLY_RESOLVED: 6,
  SPAM: 7,
} as const;

// Status Labels for UI
export const STATUS_LABELS = {
  [ISSUE_STATUS.PENDING_VERIFICATION]: "Pending Verification",
  [ISSUE_STATUS.VERIFIED]: "Verified",
  [ISSUE_STATUS.ACKNOWLEDGED]: "Acknowledged",
  [ISSUE_STATUS.IN_PROGRESS]: "In Progress",
  [ISSUE_STATUS.COMPLETED]: "Completed",
  [ISSUE_STATUS.PENDING_COMPLETION_VERIFICATION]: "Pending Completion Verification",
  [ISSUE_STATUS.FULLY_RESOLVED]: "Fully Resolved",
  [ISSUE_STATUS.SPAM]: "Spam",
} as const;

// Voting Thresholds (matching the Move contract)
export const VOTING_THRESHOLDS = {
  CONFIRM_THRESHOLD: 3,
  SPAM_THRESHOLD: 3,
  RESOLVED_THRESHOLD: 3,
  NOT_RESOLVED_THRESHOLD: 3,
} as const;
