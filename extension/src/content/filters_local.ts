/**
 * DEPRECATED: This file is kept for backward compatibility.
 * Use shared/filters.ts instead for the comprehensive, cross-LLM filter system.
 *
 * This local filter is a simplified version and does NOT include all protections.
 */

// Re-export from shared for consistency
export { checkForForbidden, getCategorySeverity, type ForbiddenCategory } from '@shared/filters';
