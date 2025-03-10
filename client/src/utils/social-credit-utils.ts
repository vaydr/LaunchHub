/**
 * Utility functions for handling social credit scores
 */

/**
 * Get the rating category for a social credit score
 * @param score - The social credit score (0-1000)
 * @returns A rating category from -3 to 3
 */
export const getSocialCreditCategory = (score: number): number => {
  const maxScore = 1000;
  const normalizedValue = score / maxScore;
  
  if (normalizedValue < 0.1) return -3; // Triple negative
  if (normalizedValue < 0.25) return -2; // Double negative
  if (normalizedValue < 0.4) return -1; // Single negative
  if (normalizedValue < 0.6) return 0;  // Neutral
  if (normalizedValue < 0.75) return 1;  // Single positive
  if (normalizedValue < 0.9) return 2;  // Double positive
  return 3; // Triple positive
};

/**
 * Get the RGB color string for a social credit score
 * @param score - The social credit score (0-1000)
 * @returns An RGB color string in the format "R, G, B"
 */
export const getSocialCreditColorRGB = (score: number): string => {
  const category = getSocialCreditCategory(score);
  switch (category) {
    case 3: return "75, 180, 80"; // Green for triple positive
    case 2: return "95, 200, 100"; // Light green for double positive
    case 1: return "150, 210, 120"; // Pale green for single positive
    case 0: return "150, 150, 150"; // Gray for neutral
    case -1: return "240, 150, 120"; // Pale red for single negative
    case -2: return "240, 120, 90"; // Light red for double negative
    case -3: return "240, 80, 70"; // Red for triple negative
    default: return "150, 150, 150"; // Default gray
  }
};

/**
 * Get a description for a social credit score
 * @param score - The social credit score (0-1000)
 * @returns A descriptive string for the score
 */
export const getSocialCreditDescription = (score: number): string => {
  const category = getSocialCreditCategory(score);
  switch (category) {
    case 3: return "Exemplary citizen! You're a pillar of our community.";
    case 2: return "Outstanding social standing! Keep up the good work.";
    case 1: return "Good standing in the community. Room for improvement.";
    case 0: return "Average community member. Neither outstanding nor concerning.";
    case -1: return "Some concerning patterns. Please review community guidelines.";
    case -2: return "Significant issues detected. Improvement strongly advised.";
    case -3: return "Critical standing. Immediate corrective action required.";
    default: return "Score under evaluation.";
  }
}; 