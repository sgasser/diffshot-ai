/**
 * Constants for the formatter module
 */

export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  TodoWrite: 'Update Todos',
  LS: 'List Directory',
} as const;

export const ICONS = {
  bullet: '● ',
  check: '✓ ',
  edit: '✎ ',
  checkboxFilled: '☑',
  checkboxEmpty: '☐',
  treeNode: '└─ ',
  treeContinue: '⎿  ',
  warning: '⚠ ',
  info: 'ℹ ',
  error: '✗ ',
  success: '✓ ',
  arrow: '▶ ',
} as const;

export const FORMAT = {
  minTextLength: 50,
  separatorLength: 40,
  indent: '  ',
  indentContinue: '     ',
} as const;

export const TEXT_PATTERNS = {
  skip: [
    /^(let me|i'll|i will|i can see|i need to|now i|let's|i'm going to|i should|i see|first,)/i,
    /^(analyzing|examine|check|look at|understand|now let me|based on)/i,
    /^(here's what|i've|the)/i,
    /^now let me/i,
  ],
  important: [
    /error|warning|failed|success|complete|created|found|detected/i,
    /^##|^\*\*/,
    /summary|analysis|findings|results/i,
  ],
  readLineCount: /Read \d+ lines/,
  apiError: /API Error|Retrying|attempt/,
} as const;

export const TOOL_CATEGORIES = {
  headerOnly: ['Bash', 'Read', 'LS'],
  fileEdit: ['Write', 'MultiEdit', 'Edit'],
  patternSearch: ['Glob', 'Grep'],
  web: ['WebSearch', 'WebFetch'],
} as const;

export const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] as const;

export const ENV = {
  debug: 'DEBUG',
  terminalWidth: process.stdout.columns || 80,
} as const;
