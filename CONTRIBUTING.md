# Contributing to DiffShot

Thank you for your interest in contributing to DiffShot! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A Claude Code API key (get one at [claude.ai](https://claude.ai))

### Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/sgasser/diffshot.git
   cd diffshot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment:
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Run the development version:
   ```bash
   npm run dev -- init
   npm run dev
   ```

## Development Workflow

### Project Structure

```
diffshot/
├── src/                 # TypeScript source files
│   ├── cli.ts          # CLI entry point
│   ├── diffshot.ts     # Main logic
│   ├── init.ts         # Init command implementation
│   └── formatter.ts    # Output formatting
├── dist/               # Compiled JavaScript (generated)
├── diffshot            # CLI executable
└── package.json        # Project configuration
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the CLI in development mode (using tsx)
- `npm run typecheck` - Check TypeScript types without building
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Code Style

We use ESLint and Prettier to maintain consistent code style:

- TypeScript for all source files
- Single quotes for strings
- Semicolons required
- 2 spaces for indentation
- Maximum line length of 100 characters

Run `npm run lint` and `npm run format` before committing.

### Testing

Currently, we're working on adding comprehensive tests. When contributing, please:

1. Test your changes manually with different scenarios
2. Ensure the tool works with various web frameworks (React, Vue, etc.)
3. Test edge cases (no git repo, missing config, etc.)

## Making Changes

### Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Commit your changes with clear, descriptive messages:
   ```bash
   git commit -m "feat: add support for custom viewport sizes"
   ```

4. Push to your fork and create a pull request

5. Ensure all checks pass (linting, type checking)

### Commit Message Format

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

### What Makes a Good Pull Request?

- **Single Purpose**: Each PR should have a single, clear purpose
- **Small Changes**: Smaller PRs are easier to review
- **Tests**: Include tests when adding new features
- **Documentation**: Update README.md if adding new features
- **Clean History**: Squash commits if needed for clarity

## Feature Requests and Bug Reports

### Bug Reports

When reporting bugs, please include:

1. Your environment (OS, Node.js version)
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Error messages or logs
6. Your DIFFSHOT.md configuration (remove sensitive data)

### Feature Requests

When requesting features, please:

1. Check existing issues first
2. Describe the use case
3. Explain why this would benefit other users
4. Provide examples if possible

## Areas for Contribution

We welcome contributions in these areas:

- **Framework Support**: Improve detection and handling of different web frameworks
- **Screenshot Strategies**: Better algorithms for determining what to screenshot
- **Performance**: Optimize screenshot generation for large projects
- **Error Handling**: Improve error messages and recovery
- **Documentation**: Improve README, add examples, create tutorials
- **Testing**: Add unit and integration tests
- **CI/CD**: Improve GitHub Actions workflows

## Questions?

Feel free to open an issue for any questions about contributing. We're here to help!

## License

By contributing to DiffShot, you agree that your contributions will be licensed under the MIT License.