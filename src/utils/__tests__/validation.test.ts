import { describe, it, expect } from 'vitest';
import { validateDiffShotConfig } from '../validation.js';

describe('validateDiffShotConfig', () => {
  it('should pass valid configuration', () => {
    const config = `# DiffShot Configuration

## Development Server
- **Command**: npm run dev
- **URL**: http://localhost:3000

## Screenshot Settings
### Viewports
- Mobile: 375px
- Desktop: 1440px

### Themes
- Light: yes
- Dark: yes
`;
    const result = validateDiffShotConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when missing dev server section', () => {
    const config = `# DiffShot Configuration

## Framework
- Type: React
`;
    const result = validateDiffShotConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing "Development Server" section');
  });

  it('should fail when missing command', () => {
    const config = `# DiffShot Configuration

## Development Server
- **URL**: http://localhost:3000
`;
    const result = validateDiffShotConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing dev server command (e.g., "Command: npm run dev")');
  });

  it('should fail when missing URL', () => {
    const config = `# DiffShot Configuration

## Development Server
- **Command**: npm run dev
`;
    const result = validateDiffShotConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing dev server URL (e.g., "URL: http://localhost:3000")');
  });

  it('should warn about missing viewport configuration', () => {
    const config = `# DiffShot Configuration

## Development Server
- **Command**: npm run dev
- **URL**: http://localhost:3000

## Screenshot Settings
### Themes
- Light: yes
`;
    const result = validateDiffShotConfig(config);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('Missing viewport configuration - using default sizes');
  });

  it('should warn about localhost without port', () => {
    const config = `# DiffShot Configuration

## Development Server
- **Command**: npm run dev
- **URL**: http://localhost:
`;
    const result = validateDiffShotConfig(config);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('Dev server URL might be missing port number');
  });
});
