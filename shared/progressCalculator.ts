import { IdoMetrics, PlatformContent, Faq, QuizQuestion, MarketingAssets, ProjectWithData } from './schema';

// Define field groups for each section to track in progress calculations
export const PROGRESS_FIELDS = {
  idoMetrics: {
    // Important Dates
    dates: [
      'whitelistingDate',
      'placingIdoDate',
      'claimingDate',
      'initialDexListingDate',
    ],
    // Token Economics
    tokenEconomics: [
      'idoPrice',
      'tokensForSale',
      'totalAllocationDollars',
      'tokenPrice',
      'vestingPeriod',
      'cliffPeriod',
      'tgePercentage',
      'totalAllocationNativeToken',
    ],
    // Additional Details
    details: [
      'network',
      'minimumTier',
      'gracePeriod',
      'tokenTicker',
      'contractAddress',
    ],
    // Token Info
    tokenInfo: [
      'initialMarketCap',
      'fullyDilutedMarketCap',
      'circulatingSupplyTge',
      'totalSupply',
    ],
  },
  platformContent: {
    // Basic Info
    basicInfo: [
      'tagline',
      'description',
    ],
    // Social Links
    socialLinks: [
      'telegramUrl',
      'discordUrl',
      'twitterUrl',
      'youtubeUrl',
      'linkedinUrl',
    ],
    // Additional Links
    additionalLinks: [
      'roadmapUrl',
      'teamPageUrl',
      'tokenomicsUrl',
    ],
  },
  marketingAssets: [
    'logoUrl',
    'heroBannerUrl',
    'driveFolder',
  ],
  // FAQs and Quiz Questions are counted by their existence, not by fields
};

// Calculate progress for a specific section
export function calculateSectionProgress(
  data: any,
  fields: string[] | Record<string, string[]>,
  requiredCount: number = 0
): number {
  if (!data) return 0;
  
  // If it's an array of fields
  if (Array.isArray(fields)) {
    let filledFields = 0;
    
    for (const field of fields) {
      // Check if the field exists and has a value
      if (data[field] && data[field] !== 'not_selected') {
        filledFields++;
      }
    }
    
    return Math.min(100, Math.round((filledFields / Math.max(fields.length, 1)) * 100));
  }
  
  // If it's a record of field groups
  let totalFields = 0;
  let filledFields = 0;
  
  for (const group in fields) {
    const groupFields = fields[group];
    totalFields += groupFields.length;
    
    for (const field of groupFields) {
      if (data[field] && data[field] !== 'not_selected') {
        filledFields++;
      }
    }
  }
  
  return Math.min(100, Math.round((filledFields / Math.max(totalFields, 1)) * 100));
}

// Calculate progress for FAQs and Quiz Questions
export function calculateArrayProgress(items: any[] | undefined, maxItems: number): number {
  if (!items || items.length === 0) return 0;
  
  // Count items with filled required fields
  const filledItems = items.filter(item => 
    item.question && 
    (item.answer || (item.optionA && item.optionB && item.optionC && item.optionD))
  ).length;
  
  // Calculate progress based on the minimum of actual items or maxItems
  return Math.min(100, Math.round((filledItems / maxItems) * 100));
}

// Calculate overall project progress
export function calculateProjectProgress(project: ProjectWithData): {
  overall: number;
  idoMetrics: number;
  platformContent: number;
  faqs: number;
  quizQuestions: number;
  marketingAssets: number;
} {
  // Calculate individual section progress
  const idoMetricsProgress = project.idoMetrics 
    ? calculateSectionProgress(project.idoMetrics, PROGRESS_FIELDS.idoMetrics)
    : 0;
    
  const platformContentProgress = project.platformContent
    ? calculateSectionProgress(project.platformContent, PROGRESS_FIELDS.platformContent)
    : 0;
    
  const faqsProgress = calculateArrayProgress(project.faqs, 5);
  
  const quizQuestionsProgress = calculateArrayProgress(project.quizQuestions, 5);
  
  const marketingAssetsProgress = project.marketingAssets
    ? calculateSectionProgress(project.marketingAssets, PROGRESS_FIELDS.marketingAssets)
    : 0;
  
  // Calculate overall progress (weighted average)
  const weights = {
    idoMetrics: 0.35,      // 35% weight
    platformContent: 0.25,  // 25% weight
    faqs: 0.15,            // 15% weight
    quizQuestions: 0.10,    // 10% weight
    marketingAssets: 0.15   // 15% weight
  };
  
  const overall = Math.round(
    idoMetricsProgress * weights.idoMetrics +
    platformContentProgress * weights.platformContent +
    faqsProgress * weights.faqs +
    quizQuestionsProgress * weights.quizQuestions +
    marketingAssetsProgress * weights.marketingAssets
  );
  
  return {
    overall,
    idoMetrics: idoMetricsProgress,
    platformContent: platformContentProgress,
    faqs: faqsProgress,
    quizQuestions: quizQuestionsProgress,
    marketingAssets: marketingAssetsProgress
  };
}