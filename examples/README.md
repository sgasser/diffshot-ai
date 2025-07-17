# DiffShot Examples

This directory contains example configurations and usage patterns for DiffShot.

## Available Examples

### 1. Next.js Application
- **Directory**: `nextjs-app/`
- **Features**: Server-side rendering, dynamic routes, authentication
- **Configuration**: Shows viewport and theme configuration

### 2. Vite + React SPA
- **Directory**: `vite-react/`
- **Features**: Client-side routing, component testing
- **Configuration**: Custom viewports for responsive design

### 3. E-commerce Site
- **Directory**: `ecommerce/`
- **Features**: Product pages, checkout flow, user accounts
- **Configuration**: Authentication setup, critical user flows

## Quick Start

Each example includes:
- `DIFFSHOT.md` - Configuration file
- `README.md` - Specific instructions
- Sample screenshots output

To try an example:

```bash
# Copy the DIFFSHOT.md to your project
cp examples/nextjs-app/DIFFSHOT.md ./

# Run DiffShot
diffshot-ai --branch main
```

## Common Patterns

### Testing Component Changes
```bash
# After modifying a shared component
diffshot-ai --branch main --verbose
```

### PR Review Screenshots
```bash
# Generate screenshots for PR
diffshot-ai --branch develop
# Screenshots will be in .diffshot/screenshots/
```

### CI/CD Integration
```yaml
# In your GitHub Actions workflow
- name: Generate Screenshots
  run: |
    npm install -g diffshot-ai
    diffshot-ai --branch ${{ github.base_ref }}
```