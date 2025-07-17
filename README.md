# DiffShot

[![npm version](https://img.shields.io/npm/v/diffshot-ai.svg)](https://www.npmjs.com/package/diffshot-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> AI-powered screenshot generation for code changes

## What it does

DiffShot uses Claude AI to analyze your code changes and automatically capture screenshots showing how your UI looks across different viewports, themes, and languages. See the visual impact of every code change instantly.

```bash
# You change a component
git add src/components/Header.tsx

# DiffShot captures all variations
diffshot-ai

# Output: Screenshots across all dimensions
# → home-mobile-light.png
# → home-mobile-dark.png
# → home-desktop-light.png
# → home-desktop-dark.png
# → home-tablet-light.png
# (+ same for every affected page)
```

## Installation

```bash
npm install -g diffshot-ai
```

## Quick Start

### 1. Set your API key

```bash
# Interactive configuration (recommended)
diffshot-ai config

# Or set directly (for automation)
diffshot-ai config apiKey sk-ant-api...
```

### 2. Initialize (one-time setup)

```bash
cd your-web-project
diffshot-ai init
```

This detects your framework, starts your dev server, and creates a config file.

### 3. Generate screenshots

```bash
# After making changes
diffshot-ai

# Compare with main branch
diffshot-ai --branch main

# Preview what would be captured
diffshot-ai --dry-run
```

Screenshots save to `.diffshot/screenshots/`

## Configuration

DiffShot creates a `DIFFSHOT.md` file:

```markdown
# DiffShot Configuration

## Development Server
- **Command**: `npm run dev`
- **URL**: `http://localhost:3000`

## Screenshot Settings
### Viewports
- Mobile: 375px
- Tablet: 768px
- Desktop: 1440px

### Themes
- Light: yes
- Dark: yes

### Languages (optional)
- en: /
- de: /de
- fr: /fr
```

## Authentication

If your app requires login:

```bash
diffshot-ai setup-auth "test@example.com / password123"
```

This creates a custom auth script that runs before each screenshot.

## CLI Reference

```bash
# Configure API key
diffshot-ai config              # Interactive mode (recommended)
diffshot-ai config apiKey <key> # Set API key directly (for CI/CD)
diffshot-ai config --clear      # Clear all configuration

# Initialize project
diffshot-ai init [path]

# Set up app authentication
diffshot-ai setup-auth "<credentials>" [path]

# Generate screenshots
diffshot-ai [path] [options]
  --branch <ref>    Compare with branch/commit (default: HEAD~1)
  --dry-run         Preview without generating screenshots
  --verbose         Debug output
```

## How it works

1. **Detects changes** - Git diff between commits/branches
2. **AI analysis** - Claude understands which UI is affected
3. **Matrix capture** - Screenshots across all viewports × themes × languages

## Examples

```bash
# Standard workflow
git checkout -b feature/update-header
# make changes
diffshot-ai --branch main --dry-run  # preview
diffshot-ai --branch main             # capture

# CI/CD integration
npm test && diffshot-ai --branch $BASE_BRANCH

# Different project
diffshot-ai ../other-project --branch develop
```

## Requirements

- Node.js ≥ 18
- Git repository
- Web app with dev server
- Anthropic API key or Claude Code OAuth token (configured via `diffshot-ai config`)

## Troubleshooting

**"No authentication found"**
```bash
# Run interactive configuration
diffshot-ai config
```

**"DIFFSHOT.md not found"**
```bash
diffshot-ai init
```

**Screenshots missing elements**
- Ensure your dev server is running
- Check if authentication is needed
- Use `--verbose` for debug output

## Contributing

```bash
git clone https://github.com/sgasser/diffshot-ai.git
cd diffshot-ai
npm install
npm run dev
```

## License

MIT © [Stefan Gasser](https://github.com/sgasser)

---

[NPM](https://www.npmjs.com/package/diffshot-ai) · [GitHub](https://github.com/sgasser/diffshot-ai) · [Issues](https://github.com/sgasser/diffshot-ai/issues)