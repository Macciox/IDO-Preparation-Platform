/**
 * Application constants
 */

// Status options for form fields
export const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "not_confirmed", label: "Not Confirmed" },
  { value: "might_change", label: "Might Change" },
];

// Network options
export const NETWORK_OPTIONS = [
  { value: "not_selected", label: "Not Selected" },
  { value: "ETH", label: "Ethereum" },
  { value: "Base", label: "Base" },
  { value: "Polygon", label: "Polygon" },
  { value: "BSC", label: "BNB Chain" },
  { value: "Arbitrum", label: "Arbitrum" },
];

// Tier options
export const TIER_OPTIONS = [
  { value: "not_selected", label: "Not Selected" },
  { value: "Base", label: "Base" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
  { value: "Diamond", label: "Diamond" },
];

// Form field limits
export const FORM_LIMITS = {
  MAX_FAQS: 5,
  MAX_QUIZ_QUESTIONS: 5,
  MAX_TAGLINE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
};

// Default values
export const DEFAULT_PROJECT_ID = 1;

// Progress calculation weights
export const PROGRESS_WEIGHTS = {
  IDO_METRICS: 0.35,      // 35% of overall progress
  PLATFORM_CONTENT: 0.25, // 25% of overall progress
  FAQS: 0.15,             // 15% of overall progress
  QUIZ_QUESTIONS: 0.10,   // 10% of overall progress
  MARKETING_ASSETS: 0.15  // 15% of overall progress
};