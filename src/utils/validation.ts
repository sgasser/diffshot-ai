import { logger } from './logger.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDiffShotConfig(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content.includes('## Development Server')) {
    errors.push('Missing "Development Server" section');
  }

  if (!content.includes('Command:') && !content.includes('**Command**:')) {
    errors.push('Missing dev server command (e.g., "Command: npm run dev")');
  }

  if (!content.includes('URL:') && !content.includes('**URL**:')) {
    errors.push('Missing dev server URL (e.g., "URL: http://localhost:3000")');
  }

  if (!content.includes('## Screenshot Settings')) {
    warnings.push('Missing "Screenshot Settings" section - using defaults');
  }

  if (!content.includes('### Viewports')) {
    warnings.push('Missing viewport configuration - using default sizes');
  }

  if (!content.includes('### Themes')) {
    warnings.push('Missing theme configuration - will try to detect');
  }

  if (content.includes('localhost:') && !content.match(/localhost:\d{4}/)) {
    warnings.push('Dev server URL might be missing port number');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function displayValidationResult(result: ValidationResult): void {
  if (!result.valid) {
    logger.error('Configuration validation failed:');
    result.errors.forEach((error) => logger.error(`  ✗ ${error}`));
  }

  if (result.warnings.length > 0) {
    logger.warning('Configuration warnings:');
    result.warnings.forEach((warning) => logger.warning(`  ⚠ ${warning}`));
  }
}
