/**
 * Utility functions for mapping between display category names and database enum values
 */

// Display format: "T-SHIRTS", "POLO SHIRTS", etc.
// Database enum format: T_SHIRTS, POLO_SHIRTS, etc.

export const CATEGORY_DISPLAY_NAMES = [
  'T-SHIRTS',
  'POLO SHIRTS',
  'SHORTS',
  'JACKETS',
  'JEANS',
  'SWEATERS',
  'SHOES',
  'ACCESSORIES',
] as const;

export type CategoryDisplayName = typeof CATEGORY_DISPLAY_NAMES[number];

/**
 * Convert display name to database enum value
 * "T-SHIRTS" -> "T_SHIRTS"
 * "POLO SHIRTS" -> "POLO_SHIRTS"
 */
export function categoryDisplayToEnum(display: string): string {
  return display.replace(/-/g, '_').replace(/ /g, '_');
}

/**
 * Convert database enum value to display name
 * "T_SHIRTS" -> "T-SHIRTS"
 * "POLO_SHIRTS" -> "POLO SHIRTS"
 */
export function categoryEnumToDisplay(enumValue: string): string {
  // Handle special cases where we want spaces instead of hyphens
  const spacedCategories = ['POLO_SHIRTS'];
  if (spacedCategories.includes(enumValue)) {
    return enumValue.replace(/_/g, ' ');
  }
  // For others, use hyphens
  return enumValue.replace(/_/g, '-');
}

/**
 * Get display name for a category (handles both formats)
 */
export function getCategoryDisplayName(category: string | null | undefined): string {
  if (!category) return '';
  
  // If it contains underscores, it's the enum format
  if (category.includes('_')) {
    return categoryEnumToDisplay(category);
  }
  
  // Otherwise, it's already in display format
  return category;
}
