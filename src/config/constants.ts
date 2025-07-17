export const CONFIG = {
  FILE_NAME: 'DIFFSHOT.md',
  OUTPUT_DIR: '.diffshot/screenshots',
  SCREENSHOT_DIR: '.diffshot/screenshots',
  INIT_SCREENSHOT: 'init.png',
  DEFAULT_BRANCH: 'HEAD~1',
  DEFAULT_VIEWPORTS: {
    mobile: 375,
    tablet: 768,
    desktop: 1440,
  },
  MAX_TURNS: {
    INIT: 20,
    SCREENSHOT: 50,
  },
  TIMEOUTS: {
    SCREENSHOT: '60000',
  },
} as const;

export const ENV_VARS = {
  API_KEY: 'ANTHROPIC_API_KEY',
} as const;

export const MESSAGES = {
  ERRORS: {
    NO_API_KEY: 'API key not configured. Run "diffshot-ai config" first.',
    NO_CONFIG: 'DIFFSHOT.md not found. Run "diffshot-ai init" first.',
    NOT_WEB_APP: 'This does not appear to be a web application',
    GIT_DIFF_FAILED: 'Failed to get git diff',
    DIRECTORY_ACCESS: 'Cannot access directory',
  },
  SUCCESS: {
    INIT_COMPLETE: 'Created DIFFSHOT.md with validated configuration',
    SCREENSHOTS_COMPLETE: 'Screenshot generation complete!',
    AUTH_DETECTED: 'Authentication detected!',
  },
  INFO: {
    ANALYZING: 'Analyzing your project...',
    DETECTING_CHANGES: 'Detecting changed files using git diff...',
    NO_CHANGES: '✅ No files changed',
  },
} as const;

export const ANSI_COLORS = {
  reset: (t: string) => `\x1b[0m${t}\x1b[0m`,
  bold: (t: string) => `\x1b[1m${t}\x1b[0m`,
  dim: (t: string) => `\x1b[2m${t}\x1b[0m`,
  strikethrough: (t: string) => `\x1b[9m${t}\x1b[0m`,
  green: (t: string) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
  blue: (t: string) => `\x1b[34m${t}\x1b[0m`,
  magenta: (t: string) => `\x1b[35m${t}\x1b[0m`,
  cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
  red: (t: string) => `\x1b[31m${t}\x1b[0m`,
  gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
  white: (t: string) => `\x1b[37m${t}\x1b[0m`,
} as const;
