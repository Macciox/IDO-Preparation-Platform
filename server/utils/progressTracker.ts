import { ProjectWithData } from '../../shared/schema';
import { calculateProjectProgress } from '../../shared/progressCalculator';
import { PROGRESS_WEIGHTS } from '../../shared/constants';

/**
 * Calculates the completion status for a project
 * @param project The project with all its related data
 * @returns Object containing progress percentages for each section and overall
 */
export function getProjectProgress(project: ProjectWithData) {
  return calculateProjectProgress(project);
}

/**
 * Determines if a specific section is complete (100%)
 * @param project The project with all its related data
 * @param section The section to check ('idoMetrics', 'platformContent', etc.)
 * @returns Boolean indicating if the section is complete
 */
export function isSectionComplete(project: ProjectWithData, section: keyof ReturnType<typeof calculateProjectProgress>): boolean {
  const progress = calculateProjectProgress(project);
  return progress[section] === 100;
}

/**
 * Gets the fields that are still missing values in a specific section
 * @param project The project with all its related data
 * @param section The section to check
 * @returns Array of field names that are missing values
 */
export function getMissingFields(project: ProjectWithData, section: string): string[] {
  const missingFields: string[] = [];
  
  switch(section) {
    case 'idoMetrics':
      if (!project.idoMetrics) return ['All fields are missing'];
      
      // Check important dates
      if (!project.idoMetrics.whitelistingDate) missingFields.push('Whitelisting Date');
      if (!project.idoMetrics.placingIdoDate) missingFields.push('Placing IDO Date');
      if (!project.idoMetrics.claimingDate) missingFields.push('Claiming Date');
      if (!project.idoMetrics.initialDexListingDate) missingFields.push('Initial DEX Listing Date');
      
      // Check token economics
      if (!project.idoMetrics.idoPrice) missingFields.push('IDO Price');
      if (!project.idoMetrics.tokensForSale) missingFields.push('Tokens For Sale');
      if (!project.idoMetrics.tokenPrice) missingFields.push('Token Price');
      if (!project.idoMetrics.vestingPeriod) missingFields.push('Vesting Period');
      
      // Check additional details
      if (!project.idoMetrics.network || project.idoMetrics.network === 'not_selected') 
        missingFields.push('Network');
      if (!project.idoMetrics.tokenTicker) missingFields.push('Token Ticker');
      if (!project.idoMetrics.contractAddress) missingFields.push('Contract Address');
      
      break;
      
    case 'platformContent':
      if (!project.platformContent) return ['All fields are missing'];
      
      if (!project.platformContent.tagline) missingFields.push('Tagline');
      if (!project.platformContent.description) missingFields.push('Description');
      if (!project.platformContent.telegramUrl) missingFields.push('Telegram URL');
      if (!project.platformContent.twitterUrl) missingFields.push('Twitter URL');
      
      break;
      
    case 'faqs':
      if (!project.faqs || project.faqs.length === 0) {
        return ['No FAQs added'];
      }
      
      if (project.faqs.length < 3) {
        missingFields.push(`Need ${3 - project.faqs.length} more FAQ(s)`);
      }
      
      break;
      
    case 'quizQuestions':
      if (!project.quizQuestions || project.quizQuestions.length === 0) {
        return ['No Quiz Questions added'];
      }
      
      if (project.quizQuestions.length < 3) {
        missingFields.push(`Need ${3 - project.quizQuestions.length} more Quiz Question(s)`);
      }
      
      break;
      
    case 'marketingAssets':
      if (!project.marketingAssets) return ['All assets are missing'];
      
      if (!project.marketingAssets.logoUrl) missingFields.push('Logo');
      if (!project.marketingAssets.heroBannerUrl) missingFields.push('Hero Banner');
      if (!project.marketingAssets.driveFolder) missingFields.push('Drive Folder');
      
      break;
  }
  
  return missingFields;
}