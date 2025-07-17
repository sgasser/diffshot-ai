# DiffShot

[![npm version](https://img.shields.io/npm/v/diffshot-ai.svg)](https://www.npmjs.com/package/diffshot-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/diffshot-ai.svg)](https://nodejs.org)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)

> Screenshot generation for code changes - Let AI decide what UI to capture when your code changes

## 🚀 What is DiffShot?

DiffShot revolutionizes visual regression testing by using Claude AI to automatically understand your code changes and capture relevant screenshots. No more maintaining lists of URLs or manually specifying what to screenshot!

### Key Features

- 🤖 **Smart Analysis** - Claude understands your code changes and identifies affected UI components
- 📸 **Smart Screenshots** - Automatically captures relevant pages across multiple viewports and themes
- 🔧 **Zero Configuration** - Works out of the box with any web framework
- 🎯 **Precise Targeting** - Only screenshots what actually changed, saving time and resources
- 🌓 **Theme Support** - Automatically tests light/dark modes when available
- 🔍 **Dry Run Mode** - Preview what would be captured before generating screenshots
- 🐛 **Verbose Debugging** - Detailed output for troubleshooting
- ⚡ **Progress Indicators** - Real-time feedback during operations

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [Requirements](#-requirements)
- [Configuration](#️-configuration)
- [CLI Reference](#-cli-reference)
- [Examples](#examples)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g diffshot-ai
```

### Local Installation

```bash
npm install --save-dev diffshot-ai
```

Then add to your `package.json`:

```json
{
  "scripts": {
    "screenshots": "diffshot-ai",
    "screenshots:init": "diffshot-ai init"
  }
}
```

### Development Installation

```bash
git clone https://github.com/sgasser/diffshot-ai.git
cd diffshot-ai
npm install
npm run build
npm link
```

## 🏃 Quick Start

### 1. Set up authentication

Choose one of these authentication methods:

**Option 1: Anthropic API Key** (from [console.anthropic.com](https://console.anthropic.com))
```bash
export ANTHROPIC_API_KEY=sk-ant-api...
# Or add to your .env file
echo "ANTHROPIC_API_KEY=sk-ant-api..." >> .env
```

**Option 2: Claude Code OAuth Token**
```bash
export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat...
# Or add to your .env file
echo "CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat..." >> .env
```

### 2. Initialize DiffShot

In your web project directory:

```bash
diffshot-ai init

# Or specify a directory
diffshot-ai init ../my-web-app
```

This will:
- ✅ Detect your framework and dev server
- ✅ Start your dev server and validate it works
- ✅ Take an initial screenshot
- ✅ Create `DIFFSHOT.md` configuration file

### 3. Set Up Authentication (if needed)

If your app requires authentication:

```bash
# Set up authentication with your credentials
diffshot-ai setup-auth "use test@example.com with password123"

# Or use natural language format
diffshot-ai setup-auth "login as admin@test.com password admin123"
diffshot-ai setup-auth "john.doe@company.com / MySecret"
```

### 4. Generate Screenshots

After making code changes:

```bash
# Compare with previous commit
diffshot-ai

# Compare with main branch
diffshot-ai --branch main

# Run in different directory
diffshot-ai ../other-project --branch develop
```

Screenshots are saved to `.diffshot/screenshots/`

## 🔍 How It Works

1. **Git Diff Analysis** - Detects which files have changed
2. **AI Code Understanding** - Claude analyzes changes to understand UI impact
3. **Intelligent Routing** - AI determines which pages/components are affected
4. **Multi-Viewport Capture** - Screenshots across mobile, tablet, and desktop
5. **Theme Variations** - Captures both light and dark modes when available

### Example Workflow

```bash
# You modify a React component
git add src/components/Header.jsx

# DiffShot analyzes the change
diffshot-ai

# AI understands: "Header component changed, it's used on Home and About pages"
# Automatically screenshots:
# - home-mobile-light.png
# - home-mobile-dark.png
# - home-desktop-light.png
# - home-desktop-dark.png
# - about-mobile-light.png
# - ...and more
```

## 💻 Requirements

- **Node.js** 18.0 or higher
- **Git** repository (for detecting changes)
- **Web Application** with a dev server
- **Authentication**: Either an Anthropic API key or Claude Code OAuth token

### Supported Frameworks

DiffShot works with any web framework:

- ✅ **React** - Next.js, Gatsby, Create React App, Vite
- ✅ **Vue** - Nuxt, Vue CLI, Vite
- ✅ **Angular** - Angular CLI
- ✅ **Svelte** - SvelteKit, Vite
- ✅ **Backend** - Laravel, Django, Rails, Express
- ✅ **Static** - Plain HTML/CSS/JS

## ⚙️ Configuration

DiffShot uses a `DIFFSHOT.md` file for configuration:

```markdown
# DiffShot Configuration

## Development Server
- **Command**: `npm run dev`
- **URL**: `http://localhost:3000`

## Framework
- **Type**: React with Next.js
- **Language**: TypeScript

## Screenshot Settings
### Viewports
- Mobile: 375px
- Tablet: 768px  
- Desktop: 1440px

### Themes
- Light: yes
- Dark: yes

## Authentication
[Optional: Add login instructions if your app requires auth]
Use test@example.com / password123
```

### Customizing Viewports

Edit the viewport sizes in `DIFFSHOT.md`:

```markdown
### Viewports
- Mobile: 390px    # iPhone 14
- Tablet: 820px    # iPad Air
- Desktop: 1920px  # Full HD
- Wide: 2560px     # iMac
```

## 📖 CLI Reference

### Commands

```bash
diffshot-ai [path] [options]
```

#### `init`
Initialize DiffShot configuration

```bash
diffshot-ai init [path]
```

Options:
- `path` - Directory to initialize (default: current directory)

#### `setup-auth`
Set up and verify authentication

```bash
diffshot-ai setup-auth "<credentials>" [path]
```

Parameters:
- `credentials` - Natural language credentials (required)
- `path` - Directory to set up (default: current directory)

Examples:
```bash
diffshot-ai setup-auth "use test@example.com with password123"
diffshot-ai setup-auth "login as admin@test.com password admin123"
diffshot-ai setup-auth "john.doe@company.com / MySecret"
```

This command will:
- Parse credentials from natural language
- Create a custom auth script for your app
- Test authentication with provided credentials
- Update DIFFSHOT.md with auth configuration

#### Screenshot Generation

```bash
diffshot-ai [path] [options]
```

Options:
- `path` - Directory to run in (default: current directory)
- `--branch <ref>` - Git reference to compare against (default: HEAD~1)
- `--dry-run` - Preview what would be captured without generating screenshots
- `--verbose, -v` - Enable verbose output for debugging
- `--help, -h` - Show help message

### Examples

```bash
# Initialize in current directory
diffshot-ai init

# Initialize in specific directory
diffshot-ai init ../my-project

# Set up authentication with credentials
diffshot-ai setup-auth "use test@example.com with password123"

# Compare with previous commit
diffshot-ai

# Compare with main branch
diffshot-ai --branch main

# Compare with specific commit
diffshot-ai --branch abc123

# Preview changes without generating screenshots
diffshot-ai --dry-run

# Debug mode with verbose output
diffshot-ai --verbose --branch main

# Combine options
diffshot-ai ../my-project --branch main --dry-run --verbose

# Run in different directory
diffshot-ai /path/to/project --branch develop
```

## 🎯 Use Cases

### Visual Regression Testing

```bash
# In your CI/CD pipeline
npm test
diffshot-ai --branch main
# Upload screenshots to your visual testing service
```

### Pull Request Reviews

```bash
# Before creating PR
diffshot-ai --branch main
# Attach screenshots to PR for reviewers
```

### Documentation

```bash
# Generate screenshots for docs
diffshot-ai --branch main
# Screenshots are in .diffshot/screenshots/
```

## 🐛 Troubleshooting

### Common Issues

**"No authentication found"**
- For API keys: `export ANTHROPIC_API_KEY=sk-ant-api...`
- For OAuth tokens: `export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat...`
- Or create a `.env` file with the appropriate variable

**"Authentication failed"**
- Check that your API key/token is valid and not expired
- Ensure OAuth tokens use `CLAUDE_CODE_OAUTH_TOKEN`, not `ANTHROPIC_API_KEY`

**"DIFFSHOT.md not found"**
- Run `diffshot-ai init` first to create the configuration

**"Failed to get git diff"**
- Ensure you're in a git repository
- Try using `--branch main` or `--branch master`

**Screenshots not capturing correctly**
- Ensure your dev server is running and accessible
- Check the URL in `DIFFSHOT.md` is correct
- Verify your app loads without errors

### Debug Mode

For verbose output:

```bash
NODE_ENV=development diffshot
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/sgasser/diffshot-ai.git
cd diffshot-ai

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests (when available)
npm test
```

## 📄 License

MIT © [Stefan Gasser](https://github.com/sgasser)

---

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/diffshot)
- [GitHub Repository](https://github.com/sgasser/diffshot-ai)
- [Issue Tracker](https://github.com/sgasser/diffshot-ai/issues)
- [Claude AI](https://claude.ai) - Powers the AI analysis

## 🙏 Acknowledgments

Built with:
- [Claude Code SDK](https://www.npmjs.com/package/@anthropic-ai/claude-code) - AI integration
- [Playwright](https://playwright.dev/) - Screenshot generation
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

**Note**: This is an early alpha release (v0.0.1). APIs may change. Please report issues and provide feedback!