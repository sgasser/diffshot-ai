# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DiffShot is a screenshot generation tool that analyzes code changes and automatically captures relevant UI screenshots. It's a TypeScript CLI tool that uses Claude AI to understand how code changes impact the UI.

## Development Commands

### Build and Run
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with tsx (no build needed)
- `npm run dev:init` - Run init command in development mode
- `npm run dev:config` - Run config command in development mode

### Code Quality
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run Vitest tests
- `npm run test:coverage` - Generate test coverage report

### Running a Single Test
```bash
npm test -- path/to/test.test.ts
```

## Architecture Overview

The codebase follows a modular architecture with clear separation of concerns:

### Core Flow
1. **CLI Entry** (`src/commands/cli.ts`): Main command handler that orchestrates the process
2. **Git Analysis** (`src/utils/git.ts`): Detects changed files between branches/commits
3. **AI Analysis**: Sends changes to Claude AI to understand UI impact
4. **Screenshot Service** (`src/services/screenshot.ts`): Uses Playwright to capture screenshots
5. **Output**: Saves screenshots to `.diffshot/screenshots/` directory

### Key Components

- **Commands**: CLI command implementations
  - `cli.ts`: Main diffshot-ai command with options handling
  - `init.ts`: Initialization command that creates DIFFSHOT.md

- **Services**: Core business logic
  - `screenshot.ts`: Handles screenshot generation using Playwright

- **Utils**: Reusable utilities
  - `git.ts`: Git operations (diff detection, branch comparison)
  - `errors.ts`: Custom error classes and error handling
  - `formatter.ts`: Message formatting for Claude AI
  - `validation.ts`: Configuration validation

### Important Patterns

1. **Playwright Integration**: Uses a custom screenshot script (`src/scripts/capture-screenshot.js`) for browser automation and screenshot capture.

2. **Async Streaming**: Claude AI responses are handled as async iterators for real-time progress updates.

3. **Configuration**: User configuration is stored in DIFFSHOT.md (created by init command) and includes:
   - Dev server settings
   - Viewport configurations
   - Theme support
   - Authentication workflows

4. **Error Handling**: All errors extend `BaseError` class with proper error codes and user-friendly messages.

## Environment Setup

- Requires Node.js >= 18.0.0
- Must have API key configured via `diffshot config set apiKey`
- Project must be a Git repository for change detection

## Key Files to Understand

1. `src/commands/cli.ts` - Main entry point and command flow
2. `src/services/screenshot.ts` - Screenshot generation logic
3. `src/utils/git.ts` - Git integration for change detection
4. `src/types/index.ts` - TypeScript interfaces and types
5. `src/scripts/capture-screenshot.js` - Enhanced screenshot capture script with route and selector support